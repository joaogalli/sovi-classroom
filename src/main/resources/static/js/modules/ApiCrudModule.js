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
			var self = this;

			this.apiService.getNumberOfPages(function(error, data) {
				if (error) {
					console.error(error);
				} else {
					self.numberOfPages = new Array(data.numberOfPages);

					self.hasPreviousPage = !(self.page > 0);
					self.hasNextPage = !(self.page + 1 < self.numberOfPages.length);
				}
			}, {
				pageLength : this.pageLength
			});

			this.apiService.findAll(function(error, data) {
				if (error) {
					console.error("Não foi possível findAll.");
					self.beans = [];
				} else {
					self.beans = data;
				}
			}, {
				page : this.page,
				pageLength : this.pageLength
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

		var goPage = function(page) {
			if (page >= 0 && page <= this.pageLength) {
				this.page = page;
				this.update();
			}
		}

		var nextPage = function() {
			this.goPage(this.page + 1);
		}

		var previousPage = function() {
			this.goPage(this.page - 1);
		}

		var setPageLength = function(pageLength) {
			this.pageLength = pageLength;
		}

		this.numberOfPages = [];
		this.isConsult = true;

		var self = {
			isConsult : this.isConsult,
			form : this.form,
			beans : this.beans,
			page : this.page,
			numberOfPages : this.numberOfPages,
			hasNextPage : this.hasNextPage,
			hasPreviousPage : this.hasPreviousPage,
			getApiService : getApiService,
			setApiService : setApiService,
			showConsult : showConsult,
			showForm : showForm,
			update : update,
			createOrEditBean : createOrEditBean,
			saveForm : saveForm,
			cancelForm : cancelForm,
			goPage : goPage,
			nextPage : nextPage,
			previousPage : previousPage,
			setPageLength : setPageLength
		};

		return {
			build : function(service) {
				angular.extend(service, self);
			}
		};

	} ]);
}());