package br.com.sovi.classroom.security;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import br.com.sovi.classroom.service.UserService;

/**
 * @author Joao Eduardo Galli <joaogalli@gmail.com>
 */
@Component
public class MongoDbUserDetailsService implements UserDetailsService {

	@Autowired
	private UserService userService;

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		br.com.sovi.classroom.entity.User user = userService.findUserByUsername(username);

		if (user != null) {
			String password = userService.getUserPassword(user.getId());
			return new User(user.getUsername(), password, Arrays.asList(new SimpleGrantedAuthority("USER")));
		}
		else
			return null;
	}

}
