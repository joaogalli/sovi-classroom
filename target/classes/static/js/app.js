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
	}).when('/login', {
		templateUrl : 'pages/login.html',
		controller : 'LoginController'
	}).when('/login/:username', {
		templateUrl : 'pages/login.html',
		controller : 'LoginController'
	}).when('/register', {
		templateUrl : 'pages/register.html',
		controller : 'RegisterController'
	})

	.when('/courses', {
		templateUrl : 'pages/courses.html',
		controller : 'CourseController'
	})

	;

} ]);

app.factory('PessoaService', [ 'ApiService', function(ApiService) {
	ApiService.setCollection('pessoas');
	return ApiService;
} ]);

app.factory('CourseService', [ 'ApiService', function(ApiService) {
	ApiService.setCollection('courses');
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

app.controller('MenuController', [ '$scope', '$rootScope', '$location',
		function($scope, $rootScope, $location) {
			$scope.pills = [ {
				name : "Dashboard",
				url : "/dashboard"
			}, {
				name : "Cursos",
				url : "/courses"
			}, {
				name : "Calendário",
				url : "/calendar"
			}, {
				name : "Alunos",
				url : "/students"
			}, {
				name : "Professores",
				url : "/teachers"
			} ];

			$rootScope.$watch('authenticated', function(newValue) {
				$scope.isAuthenticated = newValue;
			});

			$rootScope.$on('$locationChangeSuccess', function(a) {
				$scope.location = $location.url();
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
							if (isAuthenticated) {
								$location.url('dashboard');
							} else {
								$scope.errorMessage = error;
							}
						});
			};

		} ]);

app.controller('CourseController', [ '$scope', 'CourseService',
		function($scope, CourseService) {
			$scope.isConsult = true;
			$scope.beanForm = {};
			$scope.beans = [];

			function showConsult(update) {
				$scope.isConsult = true;
				update && $scope.update();
			}

			function showForm() {
				$scope.isConsult = false;
			}

			$scope.update = function() {
				$scope.beans = [];
				CourseService.findAll(function(error, data) {
					if (error) {
						console.error("Não foi possível recuperar.");
					} else
						$scope.beans = data;
				});
				showConsult();
			};

			$scope.update();

			$scope.showForm = function(beanId) {
				if (beanId) {
					CourseService.findById(beanId, function(error, data) {
						if (error) {
							showFormError();
						} else {
							$scope.form = data;
							showForm();
						}
					});
				} else {
					$scope.beanForm = {};
					showForm();
				}
			}

			$scope.saveForm = function(isValid) {
				CourseService.save($scope.form, function(error, data) {
					if (error) {
						console.log(error);
					} else {
						$scope.form = {};
						showConsult(true);
					}
				});
			};

			$scope.cancelForm = function() {
				$scope.form = {};
				showConsult();
			}

		} ]);
