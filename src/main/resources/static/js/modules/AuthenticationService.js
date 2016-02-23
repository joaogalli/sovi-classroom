(function() {
	angular
			.module('Authentication', [])
			.config(
					[
							'$httpProvider',
							function($httpProvider) {
								$httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
							} ])
			.service(
					'AuthenticationService',
					[
							'$http',
							'$rootScope',
							'$location',
							function($http, $rootScope, $location) {

								// Authenticate
								var authenticate = function(username, password,
										callback) {
									var headers = username ? {
										authorization : "Basic "
												+ btoa(username + ":"
														+ password)
									} : {};

									$http
											.get('/authenticate', {
												headers : headers
											})
											.success(
													function(data, status) {
														console.info(
																'Logged in',
																status);

														if (data.username) {
															$rootScope.authenticated = true;
															$rootScope.authenticatedUser = data;
															callback
																	&& callback(
																			null,
																			true);
														} else {
															$rootScope.authenticated = false;
															$rootScope.authenticatedUser = null;
															callback
																	&& callback(
																			'Ocorreu um erro no login, tente novamente.',
																			false);
														}
													})
											.error(
													function(data, status) {
														$rootScope.authenticated = false;
														$rootScope.authenticatedUser = null;
														callback
																&& callback(
																		'Login ou senha incorretos.',
																		false);
													});
								};

								// TODO colocar no app.js?
								authenticate(null, null, function(error, isAuthenticated) {
									if (error || !isAuthenticated) {
										$location.path('/login');
									}
								});

								// Logout
								var logout = function() {
									$http.post('/logout', {}).then(function() {
										console.info('Logged out.');
										$rootScope.authenticated = false;
									});
								};

								return {
									authenticate : authenticate,
									logout : logout
								};

							} ]);
}());