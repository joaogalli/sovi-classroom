package br.com.sovi.classroom.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import br.com.sovi.classroom.entity.User;
import br.com.sovi.classroom.service.UserService;
import br.com.sovi.classroom.util.JsonUtils;

/**
 * @author Joao Eduardo Galli <joaogalli@gmail.com>
 * @version 0.16.0
 */
@RestController
public class AuthenticationController extends AbstractController {

	@Autowired
	private UserService userService;

	@RequestMapping("/authenticate")
	@ResponseBody
	private ResponseEntity<String> authenticate(Principal principal) {
		logger.info("Authenticated: " + principal.getName());
		User user = userService.findUserByUsername(principal.getName());
		return responseBuilder.success(JsonUtils.toJson(user));
	}

}
