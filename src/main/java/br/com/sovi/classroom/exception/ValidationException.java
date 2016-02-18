package br.com.sovi.classroom.exception;

/**
 * @author Joao Eduardo Galli <joaogalli@gmail.com>
 * @version 0.16.0
 */
public class ValidationException extends RuntimeException {
	private static final long serialVersionUID = 6206937533844488506L;

	public ValidationException() {
		super();
	}

	public ValidationException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
		super(message, cause, enableSuppression, writableStackTrace);
	}

	public ValidationException(String message, Throwable cause) {
		super(message, cause);
	}

	public ValidationException(String message) {
		super(message);
	}

	public ValidationException(Throwable cause) {
		super(cause);
	}
	
	public ValidationException(br.com.sovi.classroom.error.Error error) {
		this(error.getI18n());
	}
	
}
