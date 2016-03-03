app.controller('CourseController', [
		'$scope',
		'CourseService',
		'SubjectService',
		'ModuleService',
		'StudentService',
		'ApiCrudController',
		'ClassSchedulementService',
		function($scope, CourseService, SubjectService, ModuleService,
				StudentService, ApiCrudController, ClassSchedulementService) {
			// Propriedades do timepicker
			$scope.hstep = 1;
			$scope.mstep = 15;
			
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

								ModuleService.findById(bean.moduleId, function(error, data) {
									if (error) {
										console.error(error);
									} else {
										bean.module = data;
									}
								});
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
