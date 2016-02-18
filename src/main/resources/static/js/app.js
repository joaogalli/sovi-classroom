var app = angular.module('app', [ 'ngRoute', 'ngMessages',
		'pascalprecht.translate', 'UserRegister', 'Authentication', 'Api',
		'Parameter' ]);

app.config([
		'$translateProvider',
		function($translateProvider) {
			$translateProvider.useStaticFilesLoader({
				prefix : 'locales/',
				suffix : '.json'
			}).registerAvailableLanguageKeys([ 'en', 'pt' ], {
				'en' : 'en',
				'en_GB' : 'en',
				'en_US' : 'en',
				'pt' : 'pt',
				'pt_BR' : 'pt'
			}).preferredLanguage('pt').fallbackLanguage('pt')
					.determinePreferredLanguage().useSanitizeValueStrategy(
							'escapeParameters');
		} ]);

app.config([ '$routeProvider', function($routeProvider) {
	$routeProvider

	.when('/', {
		templateUrl : 'pages/home.html',
		controller : 'HomeController'
	})

	.when('/login', {
		templateUrl : 'pages/login.html',
		controller : 'LoginController'
	})

	.when('/login/:username', {
		templateUrl : 'pages/login.html',
		controller : 'LoginController'
	})

	.when('/register', {
		templateUrl : 'pages/register.html',
		controller : 'RegisterController'
	});

} ]);

app.factory('PessoaService', [ 'ApiService', function(ApiService) {
	ApiService.setCollection('pessoas');
	return ApiService;
} ]);

app.controller('NavigationController', [ '$scope', '$rootScope',
		'AuthenticationService',
		function($scope, $rootScope, AuthenticationService) {
			$scope.logout = function() {
				AuthenticationService.logout();
			};

			$rootScope.$watch('authenticated', function(newValue) {
				$scope.isAuthenticated = newValue;
			});
		} ]);

app.controller('HomeController', [ '$scope', 'PessoaService',
		function($scope, PessoaService) {
			PessoaService.findAll(function(error, data) {
				console.log('findAll callback');
				$scope.pessoas = data;
			});

			PessoaService.findById('56c12e3f18083c24b3664d02', function(error, data) {
				console.log('findById callback');
				if (error) {
					console.error(error);
				} else {
					console.log(data.name);
				}
			});

		} ]);

app.controller('RegisterController', [ '$scope', 'RegisterService',
		'$location', function($scope, RegisterService, $location) {
			$scope.form = {};
			$scope.showPassword = false;

			$scope.register = function(isValid) {
				$scope.errorMessage = null;

				if (isValid) {
					RegisterService.registerNewUser({
						name : $scope.form.inputName,
						username : $scope.form.inputEmail,
						email : $scope.form.inputEmail,
						password : $scope.form.inputPassword
					}, function(error, data) {
						if (error)
							$scope.errorMessage = error;
						else {

							$location.path('login/' + $scope.form.inputEmail);
						}
					});
				} else {
					$scope.errorMessage = 'O formulário está inválido.';
				}
			}

		} ]);

app.controller('LoginController', [
		'$scope',
		'$location',
		'$routeParams',
		'AuthenticationService',
		'$location',
		'ParameterService',
		function($scope, $location, $routeParams, AuthenticationService, $location,
				ParameterService) {
			$scope.form = {};

			if ($routeParams.username) {
				$scope.username = $routeParams.username;
			}

			$scope.login = function() {
				AuthenticationService.authenticate($scope.form.inputEmail,
						$scope.form.inputPassword, function(error, isAuthenticated) {
							console.log('isAuthenticated: ', isAuthenticated);
							if (isAuthenticated) {
								$location.url('dashboard');
							} else {
								$scope.errorMessage = error;
							}
						});
			};

		} ]);