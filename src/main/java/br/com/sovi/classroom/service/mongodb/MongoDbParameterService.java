package br.com.sovi.classroom.service.mongodb;

import javax.annotation.PostConstruct;

import org.bson.Document;
import org.springframework.stereotype.Component;

import com.mongodb.MongoClient;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Filters;

import br.com.sovi.classroom.SystemConstants;
import br.com.sovi.classroom.service.ParameterService;

/**
 * @author Joao Eduardo Galli <joaogalli@gmail.com>
 */
@Component
public class MongoDbParameterService implements ParameterService {

	private MongoCollection<Document> collection;

	@PostConstruct
	private void init() {
		// Criar service para abstrair o mongodb
		collection = new MongoClient().getDatabase(SystemConstants.MONGODB_SCHEMA).getCollection("parameters");
	}

	@Override
	public Object getUserParam(String userId, String paramName) {
		paramName = paramName.replace('.', '\uff0E');
		
		FindIterable<Document> find = collection.find(Filters.eq("userId", userId));
		Document document = find.first();

		if (document != null) {
			return document.get(paramName);
		}

		return null;
	}

	@Override
	public Object setUserParam(String userId, String paramName, Object paramValue) {
		paramName = paramName.replace('.', '\uff0E');
		
		FindIterable<Document> find = collection.find(Filters.eq("userId", userId));
		Document document = find.first();

		if (document == null) {
			document = new Document("userId", userId);
			collection.insertOne(document);
		}
		
		collection.updateOne(document, new Document("$set", new Document(paramName, paramValue)));

		return collection.find(Filters.eq("userId", userId)).first().get(paramName);
	}

	@Override
	public Object getSystemParam(String paramName) {
		paramName = paramName.replace('.', '\uff0E');
		
		FindIterable<Document> find = collection.find(Filters.eq("system", "system"));
		Document document = find.first();

		if (document != null) {
			return document.get(paramName);
		}

		return null;
	}

	@Override
	public Object setSystemParam(String paramName, Object paramValue) {
		paramName = paramName.replace('.', '\uff0E');
		
		FindIterable<Document> find = collection.find(Filters.eq("system", "system"));
		Document document = find.first();

		if (document == null) {
			document = new Document("system", "system");
			collection.insertOne(document);
		}
		
		collection.updateOne(document, new Document("$set", new Document(paramName, paramValue)));

		return collection.find(Filters.eq("system", "system")).first().get(paramName);
	}

}
