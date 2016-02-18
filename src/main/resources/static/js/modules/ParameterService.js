(function() {
	angular.module('Parameter', []).service('ParameterService',
			[ '$http', function($http) {

				var setUserParam = function(userId, paramName, paramValue, callback) {
					if (!userId || !paramName)
						callback(null);

					var url = '/param/user/' + userId + '/' + paramName;

					if (paramValue)
						url = url + '/' + paramValue;

					$http.get(url).then(function(response) {
						callback(response.data);
					}, function(response) {
						callback(null);
					});
				};

				var getUserParam = function(userId, paramName, callback) {
					setUserParam(userId, paramName, null, callback);
				};

				var setSystemParam = function(paramName, paramValue, callback) {
					if (!paramName)
						callback(null);

					var url = '/param/system/' + paramName;

					if (paramValue)
						url = url + '/' + paramValue;

					$http.get(url).then(function(response) {
						callback(response.data);
					}, function(response) {
						callback(null);
					});
				};

				var getSystemParam = function(paramName, callback) {
					setSystemParam(paramName, null, callback);
				};

				return {
					getUserParam : getUserParam,
					setUserParam : setUserParam,
					getSystemParam : getSystemParam,
					setSystemParam : setSystemParam
				};

			} ]);

}());