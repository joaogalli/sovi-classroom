var app = angular.module('app', [ 'ngRoute', 'ngMessages',
		'pascalprecht.translate', 'UserRegister', 'Authentication', 'Api',
		'Parameter', 'ApiCrud' ]);

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
	}).when('/students', {
		templateUrl : 'pages/students.html',
		controller : 'StudentController'
	})

	;

} ]);

app.factory('CourseService', [ 'ApiService', function(ApiService) {
	return ApiService.build('courses');
} ]);

app.factory('StudentService', [ 'ApiService', function(ApiService) {
	return ApiService.build('students');
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

app.controller('HomeController', [ '$scope', function($scope) {
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
		'StudentService', 'ApiCrudController',
		function($scope, CourseService, StudentService, ApiCrudController) {
			ApiCrudController.build($scope);
			CourseService.setSort(["name"]);
			$scope.setApiService(CourseService);
			$scope.setPageLength(10);
			$scope.goPage(0);
		} ]);

app.controller('StudentController', [ '$scope', 'StudentService',
		'ApiCrudController', function($scope, StudentService, ApiCrudController) {
			ApiCrudController.build($scope);
			StudentService.setSort(["name"]);
			$scope.setApiService(StudentService);
			$scope.setPageLength(10);
			$scope.goPage(0);
		} ]);
