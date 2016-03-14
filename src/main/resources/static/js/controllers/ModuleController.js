app.controller('ModuleController', [
		'$scope',
		'CourseService',
		'SubjectService',
		'ModuleService',
		'ClassSchedulementService',
		'StudentService',
		'$routeParams',
		function($scope, CourseService, SubjectService, ModuleService,
				ClassSchedulementService, StudentService, $routeParams) {

			ModuleService.findById($routeParams.moduleId, function(error, data) {
				if (error) {
					console.error(error);
					// TODO fazer algo, pois sem módulo não dá para continuar.
					// Retornar para a página anterior ou mandar para uma página com
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

					data.students.forEach(function(el) {
						ids.push({
							id : el,
							collection : 'students'
						});
					});

					ModuleService.bulkFindById(ids, function(error, dataIds) {
						if (error)
							console.error(error);
						else {
							console.info('bulk', dataIds);

							$scope.course = dataIds.entries.courses[data.courseId];
							$scope.subject = dataIds.entries.subjects[data.subjectId];
							$scope.students = [];
							for ( var key in dataIds.entries.students) {
								$scope.students.push(dataIds.entries.students[key]);
							}
						}
					});

					ClassSchedulementService.findQuery({
						"moduleId" : data.id
					}, function(error, data) {
						if (error)
							console.error(error);
						else {
							console.info(data);
							$scope.classSchedulements = data;
							$scope.classSchedulements.forEach(function(el) {
								if (!el.presences)
									el.presences = {};
							})
						}
					});

				}
			});

			$scope.changePresence = function(classSchedulement, student) {
				console.info('Presenças', classSchedulement.presences);

				ClassSchedulementService.save(classSchedulement, function(error, data) {
					if (error)
						console.error(error);
					else
						console.info('ok');
				});
			}

		} ]);