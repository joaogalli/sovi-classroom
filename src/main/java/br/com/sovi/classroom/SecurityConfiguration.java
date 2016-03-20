package br.com.sovi.classroom;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.SecurityProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.logout.LogoutHandler;

import br.com.sovi.classroom.security.MongoDbUserDetailsService;

/**
 * @author Joao Eduardo Galli <joaogalli@gmail.com>
 * @version 0.1.0
 */
@Configuration
@Order(SecurityProperties.ACCESS_OVERRIDE_ORDER)
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http.httpBasic()

		.and().authorizeRequests()

		.antMatchers("/", "/index.html", "/locales/**", "/bootstrap/**", "/js/**", "/bower_components/**", "/css/**",
				"/fonts/**").permitAll()

		.antMatchers("/pages/login.html", "/pages/home.html", "/pages/register.html").permitAll()

		.antMatchers("/registernewuser", "/param/**").permitAll()

		.anyRequest().authenticated()

		.and().logout().logoutUrl("/logout").logoutSuccessUrl("/")

		.and().csrf().disable();
		// .addFilterAfter(new CsrfHeaderFilter(), CsrfFilter.class)
		// .csrf().csrfTokenRepository(csrfTokenRepository());
	}

	@Autowired
	private MongoDbUserDetailsService userDetailsService;

	@Autowired
	public void configAuthBuilder(AuthenticationManagerBuilder builder) throws Exception {
		builder.userDetailsService(userDetailsService);
		builder.authenticationProvider(authenticationProvider());
	}

	@Bean(name = "securityPasswordEncoder")
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	private AuthenticationProvider authenticationProvider() {
		DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
		provider.setUserDetailsService(userDetailsService);
		provider.setPasswordEncoder(passwordEncoder());
		return provider;
	}

}
