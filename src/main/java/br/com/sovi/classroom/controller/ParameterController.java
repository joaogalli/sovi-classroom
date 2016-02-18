package br.com.sovi.classroom.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import br.com.sovi.classroom.service.ParameterService;
import br.com.sovi.classroom.util.JsonUtils;

/**
 * @author Joao Eduardo Galli <joaogalli@gmail.com>
 */
@RestController
@RequestMapping("/param")
public class ParameterController extends AbstractController {

	@Autowired
	private ParameterService parameterService;

	@RequestMapping(value = "/user/{userId}/{param:.+}")
	@ResponseBody
	private ResponseEntity<String> getUserParam(@PathVariable("userId") String userId,
			@PathVariable("param") String paramName) {
		if (!StringUtils.hasText(userId) || !StringUtils.hasText(paramName)) {
			return responseBuilder.notFound();
		}

		// Getting
		Object value = parameterService.getUserParam(userId, paramName);
		if (value != null)
			return responseBuilder.success(JsonUtils.toJson(value));
		else
			return responseBuilder.notFound();
	}

	@RequestMapping(value = "/user/{userId}/{param:.+}/{value}")
	@ResponseBody
	private ResponseEntity<String> setUserParam(@PathVariable("userId") String userId,
			@PathVariable("param") String paramName, @PathVariable("value") String paramValue) {
		if (!StringUtils.hasText(userId) || !StringUtils.hasText(paramName)) {
			return responseBuilder.notFound();
		}

		// Is Setter?
		if (StringUtils.hasText(paramValue)) {
			if ("null".equals(paramValue)) {
				paramValue = null;
			}

			Object value = parameterService.setUserParam(userId, paramName, paramValue);
			return responseBuilder.success(JsonUtils.toJson(value));
		}
		else {
			// Getting
			Object value = parameterService.getUserParam(userId, paramName);
			if (value != null)
				return responseBuilder.success(JsonUtils.toJson(value));
			else
				return responseBuilder.notFound();
		}
	}

	@RequestMapping(value = "/system/{param:.+}")
	@ResponseBody
	private ResponseEntity<String> getSystemParam(@PathVariable("param") String paramName) {
		if (!StringUtils.hasText(paramName)) {
			return responseBuilder.notFound();
		}

		// Getting
		Object value = parameterService.getSystemParam(paramName);
		if (value != null)
			return responseBuilder.success(JsonUtils.toJson(value));
		else
			return responseBuilder.notFound();
	}

	@RequestMapping(value = "/system/{param:.+}/{value}")
	@ResponseBody
	private ResponseEntity<String> setSystemParam(@PathVariable("param") String paramName,
			@PathVariable("value") String paramValue) {
		if (!StringUtils.hasText(paramName)) {
			return responseBuilder.notFound();
		}

		// Is setting?
		if (StringUtils.hasText(paramValue)) {
			if ("null".equals(paramValue)) {
				paramValue = null;
			}

			Object value = parameterService.setSystemParam(paramName, paramValue);
			return responseBuilder.success(JsonUtils.toJson(value));
		}
		else {
			// Getting
			Object value = parameterService.getSystemParam(paramName);
			if (value != null)
				return responseBuilder.success(JsonUtils.toJson(value));
			else
				return responseBuilder.notFound();
		}
	}

}
