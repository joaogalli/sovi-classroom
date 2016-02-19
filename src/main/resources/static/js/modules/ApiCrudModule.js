(function() {
	var app = angular.module('ApiCrud', []);
	
	// CrudController
	app.factory('ApiCrudController', [ function() {

		var setApiService = function(apiService) {
			this.apiService = apiService;
		};

		var getApiService = function() {
			return this.apiService;
		}

		var showConsult = function(update) {
			this.isConsult = true;
			update && this.update();
		}

		var showForm = function() {
			this.isConsult = false;
		}

		var update = function() {
			this.beans = [];
			var self = this;
			this.apiService.findAll(function(error, data) {
				if (error) {
					console.error("Não foi possível recuperar.");
				} else
					self.beans = data;
			});
			this.showConsult();
		};

		var createOrEditBean = function(beanId) {
			if (beanId) {
				var self = this;

				this.apiService.findById(beanId, function(error, data) {
					if (error) {
						self.showFormError();
					} else {
						self.form = data;
						self.showForm(self);
					}
				});
			} else {
				this.form = {};
				this.showForm();
			}
		}

		var saveForm = function(isValid) {
			var self = this;
			this.apiService.save(this.form, function(error, data) {
				if (error) {
					console.error(error);
				} else {
					self.form = {};
					self.showConsult(true);
				}
			});
		};

		var cancelForm = function() {
			this.form = {};
			this.showConsult();
		}

		this.isConsult = true;

		return {
			isConsult : this.isConsult,
			form : this.form,
			beans : this.beans,
			getApiService : getApiService,
			setApiService : setApiService,
			showConsult : showConsult,
			showForm : showForm,
			update : update,
			createOrEditBean : createOrEditBean,
			saveForm : saveForm,
			cancelForm : cancelForm
		};
	} ]);
}());