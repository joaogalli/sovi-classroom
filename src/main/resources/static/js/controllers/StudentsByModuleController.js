app.controller('StudentsByModuleController', [
		'$scope',
		'$uibModalInstance',
		'module',
		'ModuleService',
		'StudentService',
		'ApiConsultController',
		function($scope, $uibModalInstance, module, ModuleService, StudentService,
				ApiConsultController) {
			if (!module.students)
				module.students = [];

			ApiConsultController.build($scope);
			StudentService.setSort([ "nome" ]);
			$scope.isConsult = true;
			$scope.setApiService(StudentService);
			$scope.setPageLength(10);
			$scope.goPage(0);

			$scope.showOnlyFromModuleChanged = false;

			$scope.addStudent = function(student) {
				if (module.students.indexOf(student.id) < 0) {
					module.students.push(student.id);
					ModuleService.save(module, function(error, data) {
						if (error)
							console.error(error);
						else {
							module = data;
							student.studentIsFromModule = true;
						}
					});
				}
			};

			$scope.removeStudent = function(student) {
				if (module.students.indexOf(student.id) >= 0) {
					var indexOf = module.students.indexOf(student.id);
					module.students.splice(indexOf, 1);
					ModuleService.save(module, function(error, data) {
						if (error)
							console.error(error);
						else {
							module = data;
							student.studentIsFromModule = false;
						}
					});
				}
			};

			$scope.showOnlyFromModuleChanged = function() {
				if ($scope.showOnlyFromModule) {
					if (angular.isArray(module.students)) {
						var ids = [];
						module.students.forEach(function(el) {
							ids.push({
								id : el,
								collection : "students"
							});
						});

						StudentService.bulkFindById(ids, function(error, data) {
							if (error)
								console.error(error);
							else {
								var ins = [];
								for ( var key in data.entries.students) {
									ins.push(data.entries.students[key]);
								}
								$scope.beans = ins;
							}
						});
					}
				} else {
					$scope.goPage(0);
				}
			};

			$scope.$watch('beans', function(newValue) {
				if (angular.isArray(newValue)) {
					for (var i = 0; i < newValue.length; i++) {
						if (module.students.indexOf(newValue[i].id) >= 0) {
							newValue[i].studentIsFromModule = true;
						}
					}
				}
			});

			function searchStudent(id, myArray) {
				for (var i = 0; i < myArray.length; i++) {
					if (myArray[i] === id) {
						return myArray[i];
					}
				}
				return null;
			}

			$scope.close = function() {
				$uibModalInstance.close(module);
			}

		} ]);
