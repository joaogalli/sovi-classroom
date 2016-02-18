package br.com.sovi.classroom.controller;

import java.util.ArrayList;
import java.util.List;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.google.gson.Gson;
import com.mongodb.MongoClient;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;

/**
 * @author Joao Eduardo Galli <joaogalli@gmail.com>
 * @version 0.0.1
 */
@RestController
@RequestMapping("/api")
public class ApiController {

	private MongoDatabase db;

	private Gson gson;

	@PostConstruct
	private void init() {
		// Criar service para abstrair o mongodb
		MongoClient mongoClient = new MongoClient();
		db = mongoClient.getDatabase("test");

		// Criar Parser para abstrair GSON
		gson = new Gson();
		// gson = new GsonBuilder().registerTypeHierarchyAdapter(Bson.class,
		// adapter).create();
	}

	@RequestMapping(value = "/*", method = RequestMethod.GET)
	@ResponseBody
	public ResponseEntity<String> findAll(HttpServletRequest request) {
		System.out.println("ApiController.findAll()");

		String collectionName = getCollectionName(request);
		System.out.println("Collection: " + collectionName);
		MongoCollection<Document> collection = db.getCollection(collectionName);
		FindIterable<Document> iterable = collection.find();
		List<Document> documents = new ArrayList<Document>();
		for (Document document : iterable) {
			documents.add(document);
		}

		// TODO usar parser
//		StringBuilder sb = new StringBuilder();
//		sb.append("[");
//		for (Document document : iterable) {
//			sb.append(document.toJson()).append(", ");
//		}
//		sb.delete(sb.length()-2, sb.length());
//		sb.append("]");
//		
//		return new ResponseEntity<String>(sb.toString(), HttpStatus.OK);
		
		return new ResponseEntity<String>(gson.toJson(documents), HttpStatus.OK);
	}

	@RequestMapping(value = "/*/{id}", method = RequestMethod.GET)
	@ResponseBody
	public ResponseEntity<String> get(@PathVariable("id") String id, HttpServletRequest request) {
		System.out.println("ApiController.get()");

		String collectionName = getCollectionName(request);
		MongoCollection<Document> collection = db.getCollection(collectionName);
		FindIterable<Document> iterable = collection.find(Filters.eq("_id", new ObjectId(id)));
		Document document = iterable.first();

		if (document != null)
			return new ResponseEntity<String>(document.toJson(), HttpStatus.OK);
		else
			return new ResponseEntity<String>(HttpStatus.NOT_FOUND);
	}

	@RequestMapping(value = "/*", method = RequestMethod.POST)
	@ResponseBody
	public ResponseEntity<String> save(HttpServletRequest request, @RequestBody String requestBody) {
		System.out.println("ApiController.save()");

		String collectionName = getCollectionName(request);
		MongoCollection<Document> collection = db.getCollection(collectionName);
		Document document = Document.parse(requestBody);
		// Está inserindo Id
		collection.insertOne(document);

		return new ResponseEntity<String>(gson.toJson(document), HttpStatus.OK);
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
