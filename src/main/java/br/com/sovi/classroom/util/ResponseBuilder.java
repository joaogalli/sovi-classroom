package br.com.sovi.classroom.util;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import br.com.sovi.classroom.exception.ValidationException;

/**
 * @author Joao Eduardo Galli <joaogalli@gmail.com>
 * @version 0.16.0
 */
public class ResponseBuilder {

	/**
	 * @return HttpStatus OK
	 */
	public ResponseEntity<String> success() {
		return new ResponseEntity<String>(HttpStatus.OK);
	}

	/**
	 * @param content
	 * @return HttpStatus.OK with a String content.
	 */
	public ResponseEntity<String> success(String content) {
		return new ResponseEntity<String>(content, HttpStatus.OK);
	}

	/**
	 * @param validationException
	 * @return HttpStatus.BAD_REQUEST with message com exception
	 */
	public ResponseEntity<String> validation(ValidationException validationException) {
		String json = JsonUtils.toJson(validationException.getMessage());
		return new ResponseEntity<String>(json, HttpStatus.BAD_REQUEST);
	}

	/**
	 * @return HttpStatus.NOT_FOUND [404] with no content.
	 */
	public ResponseEntity<String> notFound() {
		return new ResponseEntity<String>(HttpStatus.NOT_FOUND);
	}

}
