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

app.controller('StudentController', [ '$scope', 'StudentService',
		'ApiCrudController', function($scope, StudentService, ApiCrudController) {
			ApiCrudController.build($scope);
			StudentService.setSort([ "name" ]);
			$scope.setApiService(StudentService);
			$scope.setPageLength(10);
			$scope.goPage(0);
		} ]);

app.controller('CalendarController', [
		'$scope',
		'$uibModal',
		'CourseService',
		'SubjectService',
		'ModuleService',
		'ClassSchedulementService',
		function($scope, $uibModal, CourseService, SubjectService, ModuleService,
				ClassSchedulementService) {

			$scope.vm = {};
			$scope.vm.calendarView = 'month';
			$scope.vm.viewDate = new Date();
			$scope.vm.events = [];

			$scope.vm.eventClicked = function(event) {
				console.log('Event clicked:', event);

				var modalInstance = $uibModal.open({
					animation : true,
					templateUrl : 'templates/classSchedulementDetails.html',
					controller : 'ClassSchedulementDetailsController',
					size : 'md',
					resolve : {
						classSchedulement : function() {
							return event.data;
						}
					}
				});

			};

			ClassSchedulementService.findAll(function(error, list) {
				if (error) {
					console.error(error);
				} else {
					list.forEach(function(element, index, array) {
						SubjectService.findById(element.subjectId).then(function(response) {
							var subject = response.data;

							$scope.vm.events.push({
								title : subject.name,
								startsAt : new Date(element.startDate),
								data : element
							})
						});
					});
				}
			});

			$scope.timespanClick = function(event) {
				console.info('on-timespan-click');
			};

		} ]);

app.controller('ClassSchedulementDetailsController', [
		'$scope',
		'$uibModalInstance',
		'CourseService',
		'SubjectService',
		'ModuleService',
		'ClassSchedulementService',
		'classSchedulement',
		function($scope, $uibModalInstance, CourseService, SubjectService,
				ModuleService, ClassSchedulementService, classSchedulement) {
			console.log('classSchedulement', classSchedulement);

			$scope.form = classSchedulement;
			$scope.isEditing = false;

			if (classSchedulement) {
				var json = [ {
					id : classSchedulement.courseId,
					collection : "courses"
				}, {
					id : classSchedulement.subjectId,
					collection : "subjects"
				}, {
					id : classSchedulement.moduleId,
					collection : "modules"
				} ];

				ClassSchedulementService.bulkFindById(json, function(error, data) {
					if (error) {
						console.error(error);
					} else {
						var bean = $scope.form;

						bean.course = data.entries['courses'][bean.courseId];
						bean.subject = data.entries['subjects'][bean.subjectId];
						bean.module = data.entries['modules'][bean.moduleId];

						console.log('bean', bean);
					}
				});
			}

			$scope.edit = function() {
				this.isEditing = true;

				CourseService.findAll(function(error, data) {
					if (error)
						console.error(error);
					else
						$scope.courses = data;
				});

				SubjectService.findQuery({
					'courseId' : $scope.form.courseId
				}, function(error, data) {
					if (error) {
						console.error(error);
					} else {
						$scope.subjects = data;
					}
				});
			}

			$scope.close = function() {
				$uibModalInstance.close();
			}

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