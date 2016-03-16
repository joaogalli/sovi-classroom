app.controller('StudentController', [
		'$scope',
		'CourseService',
		'SubjectService',
		'ModuleService',
		'ClassSchedulementService',
		'StudentService',
		'$routeParams',
		'$uibModal',
		'$location',
		function($scope, CourseService, SubjectService, ModuleService,
				ClassSchedulementService, StudentService, $routeParams, $uibModal,
				$location) {

			StudentService.findById($routeParams.studentId, function(error, data) {
				if (error)
					console.error(error);
				else {
					$scope.student = data;
					updateCourses();
				}
			});

			$scope.expandingCourse = function(course) {
				course.modules = [];
				$scope.modules.forEach(function(module) {
					if (module.courseId === course.id) {
						course.modules.push(module);
						$scope.isCollapsed[module.id] = true;
					}
				});
			}

			$scope.expandingModule = function(module) {
				ClassSchedulementService.findQuery({
					'moduleId' : module.id
				}, function(error, data) {
					module.classSchedulements = data;
				});
			}

			$scope.hasPresence = function(classSchedulement) {
				return (classSchedulement.presences && classSchedulement.presences[$scope.student.id]);
			}

			$scope.presenceClick = function(classSchedulement) {
				return (classSchedulement.presences && classSchedulement.presences[$scope.student.id]);
			}

			$scope.isCollapsed = {};

			function updateCourses() {
				var query = {
					"students" : $scope.student.id
				};

				ModuleService.findQuery(query, function(error, data) {
					if (error)
						console.error(error);
					else {
						$scope.modules = data;

						var courseIds = [];

						$scope.modules.forEach(function(el) {
							courseIds.push({
								id : el.courseId,
								collection : "courses"
							});
						});

						CourseService.bulkFindById(courseIds, function(error, data) {
							if (error)
								console.error(error);
							else {
								console.log(data);
								$scope.courses = [];
								for ( var key in data.entries.courses) {
									var course = data.entries.courses[key];
									$scope.courses.push(course);
									$scope.isCollapsed[key] = false;
									$scope.expandingCourse(course);
								}
							}
						});
					}
				});
			}

		} ]);