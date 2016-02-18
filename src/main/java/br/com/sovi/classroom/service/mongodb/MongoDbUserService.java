package br.com.sovi.classroom.service.mongodb;

import javax.annotation.PostConstruct;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.mongodb.BasicDBObject;
import com.mongodb.MongoClient;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Filters;

import br.com.sovi.classroom.entity.User;
import br.com.sovi.classroom.error.RegisterUserError;
import br.com.sovi.classroom.exception.ValidationException;
import br.com.sovi.classroom.service.UserService;

/**
 * @author Joao Eduardo Galli <joaogalli@gmail.com>
 */
@Service
public class MongoDbUserService implements UserService {

	private MongoCollection<Document> collection;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@PostConstruct
	private void init() {
		// Criar service para abstrair o mongodb
		collection = new MongoClient().getDatabase("test").getCollection("users");
	}

	public User findUserById(String id) {
		Document document = findUserDocumentById(id);
		return (document != null) ? convertDocument(document) : null;
	}

	protected Document findUserDocumentById(String id) {
		if (id != null) {
			BasicDBObject query = new BasicDBObject();
			query.put("_id", new ObjectId(id));

			FindIterable<Document> find = collection.find(query);
			Document first = find.first();
			if (first != null)
				return first;
		}

		return null;
	}

	@Override
	public String getUserPassword(String id) {
		Document document = findUserDocumentById(id);
		if (document != null)
			return document.getString("password");
		else
			return null;
	}

	@Override
	public User findUserByUsername(String username) {
		FindIterable<Document> find = collection.find(Filters.eq("username", username));
		Document first = find.first();
		if (first != null) {
			return convertDocument(first);
		}
		else
			return null;
	}

	public User registerNewUser(User user) throws ValidationException {
		if (!StringUtils.hasText(user.getUsername())) {
			throw new ValidationException(RegisterUserError.USERNAME_MISSING);
		}
		if (!StringUtils.hasText(user.getEmail())) {
			throw new ValidationException(RegisterUserError.EMAIL_MISSING);
		}
		if (!StringUtils.hasText(user.getPassword())) {
			throw new ValidationException(RegisterUserError.PASSWORD_MISSING);
		}
		if (findUserByUsername(user.getUsername()) != null) {
			throw new ValidationException(RegisterUserError.USERNAME_EXISTS);
		}

		Document document = new Document();

		document.put("name", user.getName());
		document.put("username", user.getUsername());
		document.put("email", user.getEmail());
		document.put("password", passwordEncoder.encode(user.getPassword()));

		collection.insertOne(document);

		return convertDocument(document);
	}

	public User convertDocument(Document document) {
		User user = new User();

		user.setId(document.getObjectId("_id").toString());
		user.setName((String) document.get("name"));
		user.setUsername((String) document.get("username"));
		user.setEmail((String) document.get("email"));
		return user;
	}

}
