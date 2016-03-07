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
				showClassschedulementDetails(event);
			};

			$scope.vm.eventEdited = function(event) {
				showClassschedulementDetails(event, true);
			};

			function showClassschedulementDetails(event, isEdition) {
				var modalInstance = $uibModal.open({
					animation : true,
					templateUrl : 'templates/classSchedulementDetails.html',
					controller : 'ClassSchedulementDetailsController',
					size : 'md',
					resolve : {
						classSchedulement : function() {
							return event.data;
						},
						isEdition : function() {
							return isEdition
						}
					}
				});

				modalInstance.result.then(function(selectedItem) {
					update();
				});
			}

			function update() {
				$scope.vm.events = [];
				ClassSchedulementService.findAll(function(error, list) {
					if (error) {
						console.error(error);
					} else {
						list.forEach(function(element, index, array) {
							SubjectService.findById(element.subjectId).then(
									function(response) {
										var subject = response.data;

										$scope.vm.events.push({
											title : subject.name,
											startsAt : new Date(element.startDate),
											data : element,
											editable : true,
											draggable : false,
											deletable : false
										})
									});
						});
					}
				});
			}

			update();

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
		'isEdition',
		function($scope, $uibModalInstance, CourseService, SubjectService,
				ModuleService, ClassSchedulementService, classSchedulement, isEdition) {
			classSchedulement.startDate = new Date(classSchedulement.startDate);

			$scope.form = classSchedulement;
			$scope.isEditing = false;

			// Atualiza a view
			var updateView = function() {
				var json = [ {
					id : $scope.form.courseId,
					collection : "courses"
				}, {
					id : $scope.form.subjectId,
					collection : "subjects"
				}, {
					id : $scope.form.moduleId,
					collection : "modules"
				} ];

				ClassSchedulementService.bulkFindById(json, function(error, data) {
					if (error) {
						console.error(error);
					} else {
						var bean = $scope.form;

						if (bean.courseId)
							bean.course = data.entries['courses'][bean.courseId];
						if (bean.subjectId)
							bean.subject = data.entries['subjects'][bean.subjectId];
						if (bean.moduleId)
							bean.module = data.entries['modules'][bean.moduleId];
					}
				});
			}

			// Inicializando para visualização de detalhes apenas.
			if ($scope.form) {
				updateView();
			}

			// Edit Form Watches
			$scope.$watch('form.courseId', function(newValue) {
				// Atualiza as matérias
				// Atualiza os módulos
				if ($scope.isEditing) {
					updateSubjects();
					updateModules();
				}
			});
			$scope.$watch('form.subjectId', function(newValue) {
				// Atualiza os módulos
				if ($scope.isEditing) {
					updateModules();
				}
			});

			// Atualiza as matérias
			var updateSubjects = function() {
				if ($scope.form.courseId) {
					SubjectService.findQuery({
						'courseId' : $scope.form.courseId
					}, function(error, data) {
						if (error) {
							console.error(error);
						} else {
							$scope.subjects = data;
						}
					});
				} else {
					$scope.subjects = [];
				}
			}

			// Atualiza os módulos
			var updateModules = function() {
				if ($scope.form.courseId) {
					var query = {
						'courseId' : $scope.form.courseId
					};
					if ($scope.form.subjectId)
						query['subjectId'] = $scope.form.subjectId;

					ModuleService.findQuery(query, function(error, data) {
						if (error)
							console.error(error);
						else
							$scope.modules = data;
					});
				} else {
					$scope.modules = [];
				}
			}

			// Edit
			$scope.edit = function() {
				this.isEditing = true;
				this.formClone = angular.copy(this.form, this.formClone);

				CourseService.findAll(function(error, data) {
					if (error)
						console.error(error);
					else
						$scope.courses = data;
				});

				updateSubjects();
				updateModules();
			}

			// SAVE
			$scope.save = function() {
				delete $scope.form.course;
				delete $scope.form.subject;
				delete $scope.form.module;

				ClassSchedulementService.save($scope.form, function(error, data) {
					if (error)
						console.error(error);
					else {
						$scope.form = data;
						updateView();
					}
				});

				$scope.formClone = {};
				this.isEditing = false;
			}

			$scope.cancel = function() {
				this.isEditing = false;
				this.form = angular.copy(this.formClone, this.form);
				$scope.formClone = {};
			}

			$scope.close = function() {
				$uibModalInstance.close();
			}

			// Se é para editar já ativa a edição
			if (isEdition) {
				$scope.edit();
			}

		} ]);
