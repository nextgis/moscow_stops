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
		},

		setDomOptions: function () {
			$.view.$userContainer = $('#userContainer');
			$.view.$signInForm = $('#signInForm');
			$.view.$signOutForm = $('#signOutForm');
			if ($.view.$userContainer.hasClass('inner')) { $.viewmodel.isAuth = true; }
		}
	});
})(jQuery);

