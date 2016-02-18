package br.com.sovi.classroom.service;

/**
 * @author Joao Eduardo Galli <joaogalli@gmail.com>
 */
public interface ParameterService {

	Object getUserParam(String userId, String paramName);

	Object setUserParam(String userId, String paramName, Object paramValue);

	Object getSystemParam(String paramName);

	Object setSystemParam(String paramName, Object paramValue);

}
