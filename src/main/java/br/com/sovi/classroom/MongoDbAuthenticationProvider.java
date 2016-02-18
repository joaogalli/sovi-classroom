package br.com.sovi.classroom;

import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;

/**
 * @author Joao Eduardo Galli <joaogalli@gmail.com>
 * @version 0.16.0
 */
public class MongoDbAuthenticationProvider implements AuthenticationProvider {

	@Override
	public Authentication authenticate(Authentication authentication) throws AuthenticationException {
		System.out.println();
		System.out.println("MongoDbAuthenticationProvider.authenticate()");
		System.out.println("Name: " + authentication.getName());
		System.out.println("Authorities: " + authentication.getAuthorities());
		System.out.println("Credentials: " + authentication.getCredentials());
		System.out.println("Details: " + authentication.getDetails());
		System.out.println("Principal: " + authentication.getPrincipal());

		authentication.setAuthenticated(false);

		return authentication;
	}

	@Override
	public boolean supports(Class<?> arg0) {
		System.out.println("MongoDbAuthenticationProvider.supports(): " + arg0);
		return false;
	}

}
