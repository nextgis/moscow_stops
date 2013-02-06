(function ($) {
	$.extend($.viewmodel, {
		bodyPanelsVisible: [true, true, true, true]
	});

	$.extend($.view, {
		$body: null
	});

	$.sm.common = {};
	$.extend($.sm.common, {
		init: function () {
			this.setDomOptions();
			this.bindEvents();
		},

		bindEvents: function () {
			// TODO add disappearance panels while windows will resize
		},

		showErrorPopup: function () {
		},

		setPopups: function () {

		},

		setDomOptions: function () {
			$.view.$body = $('body');
		}
	});
})(jQuery);
