package br.com.sovi.classroom.service;

import br.com.sovi.classroom.entity.User;
import br.com.sovi.classroom.exception.ValidationException;

/**
 * @author Joao Eduardo Galli <joaogalli@gmail.com>
 */
public interface UserService {

	User findUserByUsername(String username);

	String getUserPassword(String id);
	
	User registerNewUser(User user) throws ValidationException;
	
}
