app
		.controller(
				'ModuleController',
				[
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
								ClassSchedulementService, StudentService, $routeParams,
								$uibModal, $location) {

							$scope.classSchedulementId = $routeParams.classSchedulementId;

							var update = function(error, data) {
								if (error) {
									console.error(error);
									// TODO fazer algo, pois sem módulo não dá para continuar.
									// Retornar para a página anterior ou mandar para uma página
									// com
									// módulos.
								} else {
									$scope.module = data;

									var ids = [];
									ids.push({
										id : data.courseId,
										collection : 'courses'
									});
									ids.push({
										id : data.subjectId,
										collection : 'subjects'
									});

									if (data.students) {
										data.students.forEach(function(el) {
											ids.push({
												id : el,
												collection : 'students'
											});
										});
									}

									ModuleService
											.bulkFindById(
													ids,
													function(error, dataIds) {
														if (error)
															console.error(error);
														else {
															$scope.course = dataIds.entries.courses[data.courseId];
															$scope.subject = dataIds.entries.subjects[data.subjectId];
															$scope.students = [];
															for ( var key in dataIds.entries.students) {
																$scope.students
																		.push(dataIds.entries.students[key]);
															}
														}
													});

									ClassSchedulementService.findQuery({
										"moduleId" : data.id
									}, function(error, data) {
										if (error)
											console.error(error);
										else {
											$scope.classSchedulements = data;
											$scope.classSchedulements.forEach(function(el) {
												if (!el.presences)
													el.presences = {};
											})
										}
									});

								}
							};

							ModuleService.findById($routeParams.moduleId, update);

							$scope.changePresence = function(classSchedulement, student) {
								ClassSchedulementService
										.save(
												classSchedulement,
												function(error, data) {
													if (error) {
														console.error(error);
														classSchedulement.presences[student.id] = !classSchedulement.presences[student.id];
													} else {
														console.info('ok');
													}
												});
							}

							// Abre o modal de alunos por módulo
							$scope.openStudents = function(module) {
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

								modalInstance.result.then(function(newModule) {
									ModuleService.findById($routeParams.moduleId, update);
								});
							}

						} ]);