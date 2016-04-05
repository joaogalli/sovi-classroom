package br.com.sovi.classroom.controller;

import java.security.Principal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.mongodb.MongoClient;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import com.mongodb.client.result.UpdateResult;

import br.com.sovi.classroom.SystemConstants;
import br.com.sovi.classroom.controller.bean.BulkFindByIdRequest;
import br.com.sovi.classroom.controller.bean.BulkFindByIdRequest.Entry;
import br.com.sovi.classroom.entity.User;
import br.com.sovi.classroom.service.UserService;
import br.com.sovi.classroom.util.JsonUtils;

/**
 * @author Joao Eduardo Galli <joaogalli@gmail.com>
 * @version 0.0.1
 */
@RestController
@RequestMapping("/api")
public class ApiController extends AbstractController {

	private MongoDatabase db;

	@PostConstruct
	private void init() {
		// Criar service para abstrair o mongodb
		MongoClient mongoClient = new MongoClient();
		db = mongoClient.getDatabase(SystemConstants.MONGODB_SCHEMA);
	}

	@RequestMapping(value = "/bulkFindById", method = RequestMethod.POST)
	@ResponseBody
	public ResponseEntity<String> bulkFindById(@RequestBody String requestBody) {
		BulkFindByIdRequest bulkFindById = (BulkFindByIdRequest) JsonUtils.fromJson(requestBody,
				BulkFindByIdRequest.class);
		List<Entry> entries = bulkFindById.getEntries();

		Document entriesDocument = new Document();
		Document response = new Document("entries", entriesDocument);

		for (Entry entry : entries) {
			if (!StringUtils.hasText(entry.getId()))
				continue;

			MongoCollection<Document> collection = db.getCollection(entry.getCollection());
			if (collection != null) {
				FindIterable<Document> iterable = collection.find(Filters.eq("_id", new ObjectId(entry.getId())));
				Document document = iterable.first();
				if (document != null) {
					String id = document.get("_id").toString();

					prepareToGoOut(document);

					Document collectionDocument = (Document) entriesDocument.get(entry.getCollection());
					if (collectionDocument == null) {
						collectionDocument = new Document();
						entriesDocument.append(entry.getCollection(), collectionDocument);
					}

					collectionDocument.append(id, document);
				}
			}
		}

		return responseBuilder.success(JsonUtils.toJson(response));
	}

	@RequestMapping(value = "/*", method = RequestMethod.GET)
	@ResponseBody
	public ResponseEntity<String> findAll(HttpServletRequest request,
			@RequestHeader(value = "sort", required = false) String sort,
			@RequestHeader(value = "page", required = false) Integer page,
			@RequestHeader(value = "page-length", required = false) Integer pageLength) {
		logger.debug("Find All");

		return find(null, request, sort, page, pageLength);
	}

	@RequestMapping(value = "/*/query", method = RequestMethod.POST)
	@ResponseBody
	public ResponseEntity<String> findQuery(HttpServletRequest request, @RequestBody String requestBody,
			@RequestHeader(value = "sort", required = false) String sort,
			@RequestHeader(value = "page", required = false) Integer page,
			@RequestHeader(value = "page-length", required = false) Integer pageLength) {
		logger.debug("Find query");

		return find(Document.parse(requestBody), request, sort, page, pageLength);
	}

	/**
	 * @author Joao Eduardo Galli <joaogalli@gmail.com>
	 */
	private class EagerLoad {

		private String fk, collection, name;

		public String getFk() {
			return fk;
		}

		public void setFk(String fk) {
			this.fk = fk;
		}

		public String getName() {
			return name;
		}

		public void setName(String name) {
			this.name = name;
		}

		public String getCollection() {
			return collection;
		}

		public void setCollection(String collection) {
			this.collection = collection;
		}

	}

	private ResponseEntity<String> find(Document query, HttpServletRequest request, String sort, Integer page,
			Integer pageLength) {
		if (query == null)
			query = new Document();

		Document sortDocument = new Document();
		if (StringUtils.hasText(sort)) {
			String[] split = sort.split(",");
			for (String string : split) {
				if (StringUtils.hasText(string)) {
					// Caso o header de sort tenha - na frente, é descendente.
					if (string.charAt(0) == '-') {
						sortDocument.append(string.substring(1), -1);
					}
					else {
						sortDocument.append(string, 1);
					}
				}
			}
		}

		String collectionName = getCollectionName(request);
		MongoCollection<Document> collection = db.getCollection(collectionName);

		FindIterable<Document> iterable = collection.find(query).sort(sortDocument);

		if (page != null && pageLength != null) {
			iterable = iterable.skip(page * pageLength).limit(pageLength);
		}

		List<Document> documents = new ArrayList<Document>();
		for (Document document : iterable) {
			prepareToGoOut(document);
			documents.add(document);
		}

		String eagerLoadHeader = request.getHeader("eagerLoad");
		if (StringUtils.hasText(eagerLoadHeader)) {
			try {
				EagerLoad[] eagerLoads = JsonUtils.fromJson(eagerLoadHeader, EagerLoad[].class);
				for (EagerLoad eagerLoad : eagerLoads) {
					for (Document document : documents) {
						if (document.containsKey(eagerLoad.getFk())) {
							Document documentFromEagerLoad = findDocumentFromEagerLoad(
									document.getString(eagerLoad.getFk()), eagerLoad.getCollection());
							if (documentFromEagerLoad != null) {
								document.put(eagerLoad.getName(), documentFromEagerLoad);
							}
						}
					}
				}
			}
			catch (Throwable t) {
				logger.error("Error eagerLoading", t);
			}
		}

		String json = JsonUtils.toJson(documents);
		return new ResponseEntity<String>(json, HttpStatus.OK);
	}

	private Document findDocumentFromEagerLoad(String id, String collectionName) {
		MongoCollection<Document> collection = db.getCollection(collectionName);
		FindIterable<Document> iterable = collection.find(Filters.eq("_id", new ObjectId(id)));
		return iterable.first();
	}

	private void prepareToGoOut(Document document) {
		String id = document.get("_id").toString();
		document.append("id", id);
		document.remove("_id");
		document.append("_id", new Document("$oid", id));
	}

	/**
	 * Find All
	 * @param request
	 * @param requestBody
	 * @param pageLength
	 * @return
	 */
	@RequestMapping(value = "/*/numberofpages", method = RequestMethod.POST)
	@ResponseBody
	public ResponseEntity<String> findAll(HttpServletRequest request, @RequestBody String requestBody,
			@RequestHeader(value = "page-length", required = false) Integer pageLength) {
		logger.debug("Find All");

		String collectionName = getCollectionName(request);
		MongoCollection<Document> collection = db.getCollection(collectionName);

		int numberOfPages = 1;

		if (pageLength > 0) {
			Document query = Document.parse(requestBody);

			long count = collection.count(query);
			numberOfPages = (int) Math.ceil(((double) count) / pageLength);
		}

		if (numberOfPages <= 0)
			numberOfPages = 1;

		return responseBuilder.success("{ \"numberOfPages\": " + numberOfPages + " }");
	}

	/**
	 * FIND BY ID
	 * @param id
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/*/{id}", method = RequestMethod.GET)
	@ResponseBody
	public ResponseEntity<String> findById(@PathVariable("id") String id, HttpServletRequest request) {
		String collectionName = getCollectionName(request);
		MongoCollection<Document> collection = db.getCollection(collectionName);
		FindIterable<Document> iterable = collection.find(Filters.eq("_id", new ObjectId(id)));
		Document document = iterable.first();

		if (document != null) {
			prepareToGoOut(document);
			return responseBuilder.success(JsonUtils.toJson(document));
		}
		else
			return responseBuilder.notFound();
	}

	@RequestMapping(value = "/*/{id}/add/{path}", method = RequestMethod.POST)
	@ResponseBody
	public ResponseEntity<String> add(@PathVariable("id") String id, @PathVariable("path") String path,
			HttpServletRequest request, @RequestBody String requestBody) {
		String collectionName = getCollectionName(request);
		MongoCollection<Document> collection = db.getCollection(collectionName);
		FindIterable<Document> iterable = collection.find(Filters.eq("_id", new ObjectId(id)));
		Document document = iterable.first();

		if (document != null) {
			Document newDocument = Document.parse(requestBody);
			Object pathObject = document.get(path);

			// Por padrão ele cria um array para novos objetos
			if (pathObject == null) {
				ArrayList arrayList = new ArrayList();
				arrayList.add(newDocument);
				document.append(path, arrayList);
			}
			else if (pathObject instanceof ArrayList) {
				((ArrayList) pathObject).add(newDocument);
			}
			else {
				document.append(path, newDocument);
			}

			collection.replaceOne(new Document("_id", document.get("_id")), document);

			document.append("id", document.get("_id").toString());
			return new ResponseEntity<String>(document.toJson(), HttpStatus.OK);
		}
		else
			return new ResponseEntity<String>(HttpStatus.NOT_FOUND);
	}

	@Autowired
	private UserService userService;

	/**
	 * SAVE
	 * @param request
	 * @param requestBody
	 * @return
	 */
	@RequestMapping(value = "/*", method = RequestMethod.POST)
	@ResponseBody
	public ResponseEntity<String> save(HttpServletRequest request, Principal principal,
			@RequestBody String requestBody) {
		logger.debug("Saving api document");

		String collectionName = getCollectionName(request);
		MongoCollection<Document> collection = db.getCollection(collectionName);
		Document document = Document.parse(requestBody);

		// The key id is always removed
		if (document.containsKey("id"))
			document.remove("id");

		// Create/update metadata
		createMetadata(collection, document, principal);

		if (document.containsKey("_id")) {
			UpdateResult updateResult = collection.replaceOne(new Document("_id", document.get("_id")), document);
			if (updateResult.getMatchedCount() <= 0) {
				return responseBuilder.internal_server_error("Could not update document.");
			}
		}
		else {
			collection.insertOne(document);
		}

		prepareToGoOut(document);
		return responseBuilder.success(JsonUtils.toJson(document));
	}

	/**
	 * @param document
	 * @param principal
	 */
	private void createMetadata(MongoCollection<Document> collection, Document document, Principal principal) {
		boolean isNew = (document.get("_id") == null);

		ObjectId id = null;
		Document documentFindById = null;
		if (!isNew) {
			id = document.getObjectId("_id");
			FindIterable<Document> iterable = collection.find(Filters.eq("_id", id));
			documentFindById = iterable.first();
		}

		// If there is an old version of this document in the database,
		// the old metadata must be grabbed to keep creation data.
		// WARNING: Cannot trust on data coming from client, all metadata must
		// be from server.
		Document metadata = null;

		if (documentFindById == null) {
			metadata = (Document) document.get("metadata");
		}
		else {
			metadata = (Document) documentFindById.get("metadata");
		}

		if (metadata == null) {
			logger.info("metadata is null, creating new");
			metadata = new Document();
		}

		// Search for user
		User user = userService.findUserByUsername(principal.getName());
		String userId = principal.getName();
		if (user != null) {
			userId = user.getId();
		}

		// Create or update metadata
		if (metadata.getString("author") == null)
			metadata.append("author", userId);

		metadata.remove("lastModifier");
		metadata.append("lastModifier", userId);

		if (metadata.get("creationDate") == null)
			metadata.append("creationDate", new Date());

		metadata.remove("modificationDate");
		metadata.append("modificationDate", new Date());

		// Replace
		document.remove("metadata");
		document.put("metadata", metadata);
	}

	private String getCollectionName(HttpServletRequest request) {
		try {
			String uri = request.getRequestURI();
			uri = uri.substring(5);
			if (uri.indexOf('/') > -1)
				return uri.substring(0, uri.indexOf('/'));
			else
				return uri;
		}
		catch (Throwable t) {
			throw new RuntimeException("Could not get database name from: " + request.getRequestURI());
		}
	}

}
