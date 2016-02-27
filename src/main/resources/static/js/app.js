var app = angular.module('app', [ 'ngRoute', 'ngMessages',
		'pascalprecht.translate', 'ui.bootstrap', 'UserRegister', 'Authentication',
		'Api', 'Parameter', 'ApiCrud' ]);

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

app.factory('SubjectService', [ 'ApiService', function(ApiService) {
	return ApiService.build('subjects');
} ]);

app.factory('ModuleService', [ 'ApiService', function(ApiService) {
	return ApiService.build('modules');
} ]);

app.factory('StudentService', [ 'ApiService', function(ApiService) {
	return ApiService.build('students');
} ]);

app.filter('FindSubjectById', [ 'SubjectService', function(SubjectService) {
	return function(subjectId, field) {
		var self = this;
		SubjectService.findById(subjectId, function(error, data) {
			if (error) {
				self.result = "---";
			} else {
				self.result = data[field];
			}
		});

		return self.result;
	};
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

app.controller('CourseController', [
		'$scope',
		'CourseService',
		'SubjectService',
		'ModuleService',
		'StudentService',
		'ApiCrudController',
		function($scope, CourseService, SubjectService, ModuleService,
				StudentService, ApiCrudController) {
			ApiCrudController.build($scope);
			CourseService.setSort([ "name" ]);
			$scope.setApiService(CourseService);
			$scope.setPageLength(10);
			$scope.goPage(0);
			$scope['afterSaveForm'] = function(savedBean) {
				if ($scope.form.id) {
					$scope.form = {};
					$scope.showConsult(true);
				} else {
					$scope.form = savedBean;
				}
			}

			$scope.subject = {};
			ApiCrudController.build($scope.subject);
			SubjectService.setSort([ "name" ]);
			$scope.subject.setApiService(SubjectService);
			$scope.subject.setPageLength(10);
			$scope.subject.goPage(0);
			$scope.subject['preSaveForm'] = function(bean) {
				if (bean) {
					bean['courseId'] = $scope.form.id;
				}
			};

			$scope.module = {};
			ApiCrudController.build($scope.module);
			SubjectService.setSort([ "name" ]);
			$scope.module.setApiService(ModuleService);
			$scope.module.setPageLength(10);
			$scope.module.goPage(0);
			$scope.module['preSaveForm'] = function(bean) {
				if (bean) {
					bean['courseId'] = $scope.form.id;
				}
			};

			$scope.$watch('module.form', function(newValue) {
				if (newValue) {
					if (newValue.referenceDate) {
						newValue.referenceDate = new Date(newValue.referenceDate);
					} else {
						newValue.referenceDate = new Date();
					}

					SubjectService.findQuery({
						"courseId" : $scope.form.id
					}, function(error, data) {
						if (error) {
							console.error('Error', error);
						} else {
							$scope.module.subjects = data;
						}
					});
				}
			});

			$scope.$watch('form', function(newValue) {
				if (newValue && newValue.id) {
					$scope.subject.query = {
						"courseId" : newValue.id
					};
					$scope.subject.goPage(0);

					$scope.module.query = {
						"courseId" : newValue.id
					};
					$scope.module.goPage(0);
				}
			});

		} ]);

app.controller('StudentController', [ '$scope', 'StudentService',
		'ApiCrudController', function($scope, StudentService, ApiCrudController) {
			ApiCrudController.build($scope);
			StudentService.setSort([ "name" ]);
			$scope.setApiService(StudentService);
			$scope.setPageLength(10);
			$scope.goPage(0);
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