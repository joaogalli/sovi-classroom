(function() {
	angular.module('Api', []).service('ApiService', [ '$http', function($http) {

		var save = function(document, callback) {
			$http.post('/api/' + this.collection).then(function(response) {
				callback(null, response.data);
			}, function(data) {
				callback(null, data);
			});
		};

		var findAll = function(callback) {
			$http.get('/api/' + this.collection).then(function(response) {
				callback(null, response.data);
			}, function(data) {
				console.error(data);
			});
		};

		var findById = function(id, callback) {
			$http.get('/api/' + this.collection + "/" + id).then(function(response) {
				callback(null, response.data);
			}, function(data) {
				console.error(data);
			});
		};

		return {
			setCollection : function(collection) {
				this.collection = collection
			},
			getCollection : function() {
				return this.collection;
			},
			save : save,
			findAll : findAll,
			findById : findById
		};
	} ]);
}());