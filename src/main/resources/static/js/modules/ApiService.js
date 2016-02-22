(function() {
	angular.module('Api', []).factory(
			'ApiService',
			[
					'$http',
					function($http) {

						var save = function(document, callback) {
							$http.post('/api/' + this.collection, JSON.stringify(document))
									.then(function(response) {
										callback(null, response.data);
									}, function(data) {
										callback(data);
									});
						};

						var findAll = function(callback) {
							var headers = {};
							if (this.sortString)
								headers['sort'] = this.sortString;
							
							$http.get('/api/' + this.collection, { headers: headers }).then(
									function(response) {
										callback(null, response.data);
									}, function(data) {
										console.error(data);
									});
						};

						var findById = function(id, callback) {
							$http.get('/api/' + this.collection + "/" + id).then(
									function(response) {
										callback(null, response.data);
									}, function(data) {
										console.error(data);
									});
						};

						var setSort = function(propertiesArray) {
							this.sortString = propertiesArray.join();
						};

						// Especificar o Service aqui, para ser copiado no build()
						var self = {
							collection : null,
							save : save,
							findAll : findAll,
							findById : findById,
							setSort : setSort
						};

						return {
							build : function(collection) {
								var service = {};
								angular.extend(service, self);
								service.collection = collection;
								return service;
							}
						};
					} ]);
}());