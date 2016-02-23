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

						var findAll = function(callback, parameters) {
							var headers = {};
							if (this.sortString)
								headers['sort'] = this.sortString;

							if (parameters && (parameters.page || parameters.page === 0)
									&& parameters.pageLength) {
								headers['page'] = parameters.page;
								headers['page-length'] = parameters.pageLength;
							}

							$http.get('/api/' + this.collection, {
								headers : headers
							}).then(function(response) {
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

						var getNumberOfPages = function(callback, parameters) {
							var headers = {};

							if (parameters && parameters.pageLength) {
								headers['page-length'] = parameters.pageLength;
							} else {
								callback('Cannot get number of pages without the pageLength parameter.');
								return;
							}

							$http.get('/api/' + this.collection + '/numberofpages', {
								headers : headers
							}).then(function(response) {
								callback(null, response.data);
							}, function(data) {
								console.error(data);
							});
						}

						// Especificar o Service aqui, para ser copiado no build()
						var self = {
							collection : null,
							save : save,
							findAll : findAll,
							findById : findById,
							setSort : setSort,
							getNumberOfPages : getNumberOfPages
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