(function ($) {
	$.extend($.viewmodel, {
		isAuth: false
	});
	$.extend($.view, {
		$userContainer: null,
		$signInForm: null,
		$signOutForm: null
	});
	$.sm.user = {};
	$.extend($.sm.user, {
		init: function () {
			this.setDomOptions();
			this.bindEvents();
		},

		bindEvents: function () {
			var context = this;
			$.view.$signInForm.find('button').off('click').on('click', function () {
				$.viewmodel.isAuth = context.authenticate();
				context.updateUserUI();
			});
			$.view.$signOutForm.find('button').off('click').on('click', function () {
				$.viewmodel.isAuth = false;
				context.updateUserUI();
			});
		},

		setDomOptions: function () {
			$.view.$userContainer = $('#userContainer');
			$.view.$signInForm = $('#signInForm');
			$.view.$signOutForm = $('#signOutForm');
		},

		updateUserUI: function () {
			$.view.$userContainer.toggleClass('inner', $.viewmodel.isAuth);
		},

		authenticate: function () {
			return true;
			//TODO: add implementation
		},

		isAuth: function () {
			//TODO: add implementation
		}
	});
})(jQuery);

