(function() {
	angular
			.module('UserRegister', [])
			.factory(
					'RegisterService',
					[
							'$http',
							'$translate',
							function($http, $translate) {
								var registerNewUser = function(registerBean,
										callback) {
									$http
											.post(
													'/registernewuser',
													JSON
															.stringify(registerBean))
											.then(
													function(response) {
														callback(null, true);
													},
													function(response) {
														console.info(response);

														if (response.data) {
															$translate(
																	response.data)
																	.then(
																			function(
																					translation) {
																				callback(
																						translation,
																						false);
																			});
														} else {
															callback(
																	"Erro ao tentar fazer o registro: "
																			+ response.status
																			+ " - "
																			+ response.statusText,
																	false);
														}
													});
								};

								return {
									registerNewUser : registerNewUser
								};
							} ]);
}());