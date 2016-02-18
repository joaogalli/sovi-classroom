package br.com.sovi.classroom.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import br.com.sovi.classroom.util.ResponseBuilder;

/**
 * @author Joao Eduardo Galli <joaogalli@gmail.com>
 * @version 0.16.0
 */
public abstract class AbstractController {

	protected Logger logger = LoggerFactory.getLogger(getClass());

	protected ResponseBuilder responseBuilder = new ResponseBuilder();
	
}
