var app = angular.module('app', [ 'ngRoute', 'ngMessages',
		'pascalprecht.translate', 'ui.bootstrap', 'mwl.calendar', 'UserRegister',
		'Authentication', 'Api', 'Parameter', 'ApiCrud' ]);

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

	.when('/calendar', {
		templateUrl : 'pages/calendar.html',
		controller : 'CalendarController'
	}).when('/courses', {
		templateUrl : 'pages/courses.html',
		controller : 'CourseController'
	}).when('/students', {
		templateUrl : 'pages/students.html',
		controller : 'StudentController'
	})

	;

} ]);

app.config(function(calendarConfig) {
	calendarConfig.dateFormatter = 'moment'; // use moment to format dates
	moment.locale('pt');

	calendarConfig.i18nStrings.weekNumber = 'Semana {week}';
});

app.factory('CourseService', [ 'ApiService', function(ApiService) {
	return ApiService.build('courses');
} ]);

app.factory('SubjectService', [ 'ApiService', function(ApiService) {
	return ApiService.build('subjects');
} ]);

app.factory('ModuleService', [ 'ApiService', function(ApiService) {
	return ApiService.build('modules');
} ]);

app.factory('ClassSchedulementService', [ 'ApiService', function(ApiService) {
	return ApiService.build('classschedulements');
} ]);

app.factory('StudentService', [ 'ApiService', function(ApiService) {
	return ApiService.build('students');
} ]);

app.controller('NavigationController', [ '$scope', '$rootScope',
		'AuthenticationService',
		function($scope, $rootScope, AuthenticationService) {
			$rootScope.$watch('authenticatedUser', function(newValue) {
				$scope.authenticatedUser = newValue;
			})

			$scope.logout = function() {
				AuthenticationService.logout();
			};

			$rootScope.$watch('authenticated', function(newValue) {
				$scope.isAuthenticated = newValue;
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
		'$rootScope',
		'$scope',
		'$location',
		'$routeParams',
		'AuthenticationService',
		'$location',
		'ParameterService',
		function($rootScope, $scope, $location, $routeParams,
				AuthenticationService, $location, ParameterService) {
			$scope.form = {};

			if ($routeParams.username) {
				$scope.username = $routeParams.username;
			}

			$scope.login = function() {
				AuthenticationService.authenticate($scope.form.inputEmail,
						$scope.form.inputPassword, function(error, isAuthenticated) {
							if (isAuthenticated) {
								if ($rootScope.nextLoadedTemplateUrl) {
									$location.path($rootScope.nextLoadedTemplateUrl);
									$rootScope.nextLoadedTemplateUrl = null;
								} else
									$location.url('dashboard');
							} else {
								$scope.errorMessage = error;
							}
						});
			};

		} ]);

app.filter('concatif', function() {
	return function(first, second) {
		if (first) {
			if (second) {
				return first + ' - ' + second;
			} else {
				return first;
			}
		} else if (second) {
			return second;
		} else {
			return "";
		}
	};
});

app.controller('StudentController', [
		'$scope',
		'StudentService',
		'ApiCrudController',
		function($scope, StudentService, ApiCrudController) {
			ApiCrudController.build($scope);
			StudentService.setSort([ "nome" ]);
			$scope.setApiService(StudentService);
			$scope.setPageLength(10);
			$scope.goPage(0);
			
			$scope.$watch('form', function(newValue) {
				if (newValue.datanascimento)
					newValue.datanascimento = new Date(newValue.datanascimento);
			});

			$scope.estadoscivis = [ "Solteiro (a)", "Casado (a)", "Viúvo (a)",
					"Separado (a)" ];

		} ]);

app.run([ "$rootScope", "$location", function($rootScope, $location) {
	$rootScope.$on("$routeChangeError", function(event, next, previous, error) {
		// We can catch the error thrown when the $requireAuth promise is
		// rejected
		// and redirect the user back to the home page
		if (error.toString().indexOf('401 Unauthorized') > -1) {
			$location.path("/login");
			$rootScope.authenticated = false;

			if (next.$$route.originalPath) {
				$rootScope.nextLoadedTemplateUrl = next.$$route.originalPath;
			}
		}
	});

} ]);