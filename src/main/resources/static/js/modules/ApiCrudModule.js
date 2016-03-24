(function() {
	var app = angular.module('ApiCrud', []);

	// CrudController
	app.factory('ApiCrudController', [ function() {

		this.constants = {
			CONSULT_VISIBLE : 'consult-visible',
			FORM_VISIBLE : 'form-visible'
		};

		var setApiService = function(apiService) {
			this.apiService = apiService;
		};

		var getApiService = function() {
			return this.apiService;
		}

		var showConsult = function(update) {
			this.isConsult = true;
			update && this.update();
			this.broadcast(this.constants.CONSULT_VISIBLE);
		}

		var showForm = function() {
			this.isConsult = false;
			this.onFormVisible();
			this.broadcast(this.constants.FORM_VISIBLE);
		}

		var onFormVisible = function() {
		};

		var update = function() {
			var self = this;

			this.apiService.getNumberOfPages(this.query, function(error, data) {
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

			var callback = function(error, data) {
				if (error) {
					console.error("Não foi possível findAll.", error);
					self.beans = [];
				} else {
					self.beans = data;
				}
			};

			var parameters = {
				page : this.page,
				pageLength : this.pageLength
			};

			if (this.query)
				this.apiService.findQuery(this.query, callback, parameters);
			else
				this.apiService.findAll(callback, parameters);
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
			this.preSaveForm(this.form);
			this.apiService.save(this.form, function(error, data) {
				if (error) {
					console.error(error);
				} else {
					self.afterSaveForm(data);
				}
			});
		};

		var preSaveForm = function(bean) {
		};

		var afterSaveForm = function(savedBean) {
			this.form = {};
			this.showConsult(true);
		}

		var cancelForm = function() {
			this.form = {};
			this.showConsult(true);
		}

		var goPage = function(page) {
			if (page >= 0 && page < this.numberOfPages.length) {
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

		this.numberOfPages = new Array(1);
		this.isConsult = true;

		this.eventListeners = {};

		var broadcast = function(eventName, attrs) {
			if (this.eventListeners[eventName]) {
				this.eventListeners[eventName].forEach(function(el) {
					el();
				});
			}
		};

		// Listener must be a function
		var registerEventListener = function(eventName, listener) {
			if (!this.eventListeners[eventName])
				this.eventListeners[eventName] = [];
			this.eventListeners[eventName].push(listener);
		}

		var self = {
			constants : this.constants,
			eventListeners : this.eventListeners,
			broadcast : broadcast,
			registerEventListener : registerEventListener,
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
			onFormVisible : onFormVisible,
			update : update,
			createOrEditBean : createOrEditBean,
			preSaveForm : preSaveForm,
			saveForm : saveForm,
			afterSaveForm : afterSaveForm,
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

	// FormController
	app.factory('ApiFormController', [ '$location', function($location) {

		var setApiService = function(apiService) {
			this.apiService = apiService;
		};

		var getApiService = function() {
			return this.apiService;
		}

		var showConsult = function() {
			$location.path(this.consultPath);
		}

		var createOrEditBean = function(beanId) {
			if (beanId) {
				var self = this;

				this.apiService.findById(beanId, function(error, data) {
					if (error) {
						self.showFormError();
					} else {
						self.form = data;
					}
				});
			} else {
				this.form = {};
			}
		}

		var saveForm = function(isValid) {
			var self = this;
			this.preSaveForm(this.form);
			this.apiService.save(this.form, function(error, data) {
				if (error) {
					console.error(error);
				} else {
					self.afterSaveForm(data);
				}
			});
		};

		var preSaveForm = function(bean) {
		};

		var afterSaveForm = function(savedBean) {
			this.form = {};
			this.showConsult(true);
		}

		var cancelForm = function() {
			this.form = {};
			this.showConsult(true);
		}

		this.consultPath = null;

		var self = {
			consultPath : this.consultPath,
			form : this.form,
			createOrEditBean : createOrEditBean,
			getApiService : getApiService,
			setApiService : setApiService,
			showConsult : showConsult,
			preSaveForm : preSaveForm,
			saveForm : saveForm,
			afterSaveForm : afterSaveForm,
			cancelForm : cancelForm,
		};

		return {
			build : function(service) {
				angular.extend(service, self);
			}
		};

	} ]);

	// CrudController
	app.factory('ApiConsultController', [ '$location', function($location) {

		var setApiService = function(apiService) {
			this.apiService = apiService;
		};

		var getApiService = function() {
			return this.apiService;
		}

		var showForm = function(beanId) {
			// TODO colocar numa function a parte para poder sobrescrever
			if (!beanId) {
				beanId = 'new';
			}

			$location.path(this.formPath + '/' + beanId);
		}

		var update = function() {
			var self = this;

			this.apiService.getNumberOfPages(this.query, function(error, data) {
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

			var callback = function(error, data) {
				if (error) {
					console.error("Não foi possível findAll.", error);
					self.beans = [];
				} else {
					self.beans = data;
				}
			};

			var parameters = {
				page : this.page,
				pageLength : this.pageLength
			};

			if (this.query)
				this.apiService.findQuery(this.query, callback, parameters);
			else
				this.apiService.findAll(callback, parameters);
		};

		var createOrEditBean = function(beanId) {
			this.showForm(beanId);
		}

		var goPage = function(page) {
			if (page >= 0 && page < this.numberOfPages.length) {
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

		this.numberOfPages = new Array(1);
		this.formPath = null;

		var self = {
			formPath : this.formPath,
			beans : this.beans,
			page : this.page,
			numberOfPages : this.numberOfPages,
			hasNextPage : this.hasNextPage,
			hasPreviousPage : this.hasPreviousPage,
			getApiService : getApiService,
			setApiService : setApiService,
			showForm : showForm,
			update : update,
			createOrEditBean : createOrEditBean,
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