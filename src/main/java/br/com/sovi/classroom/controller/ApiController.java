package br.com.sovi.classroom.controller;

import java.util.ArrayList;
import java.util.List;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;

import org.bson.Document;
import org.bson.types.ObjectId;
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
		db = mongoClient.getDatabase("test");
	}

	@RequestMapping(value = "/*", method = RequestMethod.GET)
	@ResponseBody
	public ResponseEntity<String> findAll(HttpServletRequest request,
			@RequestHeader(value = "sort", required = false) String sort) {
		logger.debug("Find All");

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

		FindIterable<Document> iterable = collection.find().sort(sortDocument);

		List<Document> documents = new ArrayList<Document>();
		for (Document document : iterable) {
			document.append("id", document.get("_id").toString());
			documents.add(document);
		}

		return new ResponseEntity<String>(JsonUtils.toJson(documents), HttpStatus.OK);
	}

	@RequestMapping(value = "/*/{id}", method = RequestMethod.GET)
	@ResponseBody
	public ResponseEntity<String> get(@PathVariable("id") String id, HttpServletRequest request) {
		String collectionName = getCollectionName(request);
		MongoCollection<Document> collection = db.getCollection(collectionName);
		FindIterable<Document> iterable = collection.find(Filters.eq("_id", new ObjectId(id)));
		Document document = iterable.first();

		if (document != null) {
			document.append("id", document.get("_id").toString());
			return new ResponseEntity<String>(document.toJson(), HttpStatus.OK);
		}
		else
			return new ResponseEntity<String>(HttpStatus.NOT_FOUND);
	}

	@RequestMapping(value = "/*", method = RequestMethod.POST)
	@ResponseBody
	public ResponseEntity<String> save(HttpServletRequest request, @RequestBody String requestBody) {
		String collectionName = getCollectionName(request);
		MongoCollection<Document> collection = db.getCollection(collectionName);
		Document document = Document.parse(requestBody);

		// The key id is always removed
		if (document.containsKey("id"))
			document.remove("id");

		if (document.containsKey("_id"))
			collection.replaceOne(new Document("_id", document.get("_id")), document);
		else
			collection.insertOne(document);

		return new ResponseEntity<String>(JsonUtils.toJson(document), HttpStatus.OK);
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
