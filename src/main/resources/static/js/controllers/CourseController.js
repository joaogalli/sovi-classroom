app.controller('CourseController', [
		'$scope',
		'$uibModal',
		'CourseService',
		'SubjectService',
		'ModuleService',
		'StudentService',
		'ApiCrudController',
		'ClassSchedulementService',
		function($scope, $uibModal, CourseService, SubjectService, ModuleService,
				StudentService, ApiCrudController, ClassSchedulementService) {
			// Course Crud config
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

			// Subject Crud Config
			$scope.subject = {};
			ApiCrudController.build($scope.subject);
			SubjectService.setSort([ "name" ]);
			$scope.subject.setApiService(SubjectService);
			$scope.subject.setPageLength(10);
			$scope.subjectTabSelected = function() {
				$scope.subject.goPage(0);
			}
			$scope.subject['preSaveForm'] = function(bean) {
				if (bean) {
					bean['courseId'] = $scope.form.id;
				}
			};

			// Module Crud Config
			$scope.module = {};
			ApiCrudController.build($scope.module);
			SubjectService.setSort([ "name" ]);
			$scope.module.setApiService(ModuleService);
			$scope.module.setPageLength(10);
			$scope.moduleTabSelected = function() {
				$scope.module.goPage(0);
			}
			$scope.module['preSaveForm'] = function(bean) {
				if (bean) {
					bean['courseId'] = $scope.form.id;
				}
			};
			$scope.$watch('module.beans', function(newValue) {
				if (newValue) {
					var bean = {};
					for (var i = 0; i <= newValue.length; i++) {
						bean = newValue[i];
						if (bean) {
							bean.subject = {};
							(function(bean) {
								SubjectService.findById(bean.subjectId, function(error, data) {
									if (error) {
										console.error(error);
									} else {
										bean.subject = data;
									}
								});
							}(bean));
						}
					}
				}
			});

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

			// Abre o modal de alunos por módulo
			$scope.module.openStudents = function(module) {
				var modalInstance = $uibModal.open({
					animation : true,
					templateUrl : 'templates/studentsByModule.html',
					controller : 'StudentsByModuleController',
					size : 'lg',
					closeable : true,
					resolve : {
						module : function() {
							return module;
						}
					}
				});

				modalInstance.result.then(function(selectedItem) {
					// Quando fecha?
				});

			}

			// Class Schedulement Crud Config
			$scope.classschedulement = {};
			ApiCrudController.build($scope.classschedulement);
			SubjectService.setSort([ "startDate" ]);
			$scope.classschedulement.setApiService(ClassSchedulementService);
			$scope.classschedulement.setPageLength(10);
			$scope.classschedulementTabSelected = function() {
				$scope.classschedulement.goPage(0);
			}
			$scope.classschedulement['preSaveForm'] = function(bean) {
				if (bean) {
					bean.courseId = $scope.form.id;
					if (bean.startDate)
						bean.startDate.setSeconds(0);
				}
			};

			$scope.$watch('classschedulement.beans', function(newValue) {
				if (newValue) {
					for (var i = 0; i <= newValue.length; i++) {
						var bean = newValue[i];
						if (bean) {
							bean.startDate = new Date(bean.startDate);
							bean.subject = {};
							bean.module = {};

							(function(bean) {
								SubjectService.findById(bean.subjectId, function(error, data) {
									if (error) {
										console.error(error);
									} else {
										bean.subject = data;
									}
								});

								if (bean.moduleId) {
									ModuleService.findById(bean.moduleId, function(error, data) {
										if (error) {
											console.error(error);
										} else {
											bean.module = data;
										}
									});
								}
							}(bean));
						}
					}
				}
			});

			$scope.$watch('classschedulement.form', function(newValue) {
				if (newValue) {
					if (newValue.startDate) {
						newValue.startDate = new Date(newValue.startDate);
					} else {
						newValue.startDate = new Date();
					}

					SubjectService.findQuery({
						"courseId" : $scope.form.id
					}, function(error, data) {
						if (error) {
							console.error('Error', error);
						} else {
							$scope.classschedulement.subjects = data;
						}
					});
				}
			});

			// Quando o subject é escolhido, busca os módulos disponíveis
			$scope.$watch('classschedulement.form.subjectId', function(newValue) {
				if (newValue) {
					ModuleService.findQuery({
						"courseId" : $scope.form.id,
						"subjectId" : $scope.classschedulement.form.subjectId
					}, function(error, data) {
						if (error) {
							console.error('Error', error);
						} else {
							$scope.classschedulement.modules = data;
						}
					});
				} else {
					$scope.classschedulement.modules = [];
				}
			});

			// Quando o curso selecionado muda, seta o id na query das abas.
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

					$scope.classschedulement.query = {
						"courseId" : newValue.id
					};
					$scope.classschedulement.goPage(0);
				}
			});

		} ]);

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
				$uibModalInstance.close();
			}

		} ]);
