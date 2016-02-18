package br.com.sovi.classroom.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import br.com.sovi.classroom.entity.User;
import br.com.sovi.classroom.exception.ValidationException;
import br.com.sovi.classroom.service.UserService;
import br.com.sovi.classroom.util.JsonUtils;

/**
 * @author Joao Eduardo Galli <joaogalli@gmail.com>
 */
@RestController
public class RegisterUserController extends AbstractController {

	@Autowired
	private UserService userService;

	@RequestMapping(value = "/registernewuser", method = RequestMethod.POST)
	@ResponseBody
	private ResponseEntity<String> registerNewUser(@RequestBody String requestBody) {
		logger.info(requestBody);

		try {
			User user = (User) JsonUtils.fromJson(requestBody, User.class);
			user = userService.registerNewUser(user);
			return responseBuilder.success(JsonUtils.toJson(user));
		}
		catch (ValidationException vex) {
			return responseBuilder.validation(vex);
		}
	}

}
