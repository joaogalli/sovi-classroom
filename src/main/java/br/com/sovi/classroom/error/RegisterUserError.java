package br.com.sovi.classroom.error;

/**
 * @author Joao Eduardo Galli <joaogalli@gmail.com>
 */
public enum RegisterUserError implements br.com.sovi.classroom.error.Error {
	USERNAME_MISSING,
	USERNAME_EXISTS,
	EMAIL_MISSING,
	PASSWORD_MISSING;

	@Override
	public String getI18n() {
		return "error.registeruser." + name().toLowerCase();
	}

}
