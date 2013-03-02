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

		setDomOptions: function () {
			$.view.$userContainer = $('#userContainer');
			$.view.$signInForm = $('#signInForm');
			$.view.$signOutForm = $('#signOutForm');
			if ($.view.$userContainer.hasClass('inner')) { $.viewmodel.isAuth = true; }
		},

		bindEvents: function () {
			var context = this;
			$('#signOutForm div.log').off('click').on('click', function () {
				context.renderLogs();
			});
		},

		renderLogs: function () {
			var url = document['url_root'] + 'logs';
			$.view.$document.trigger('/sm/common/setMainLoad');
			$.ajax({
				type: "GET",
				url: url,
				dataType: 'json',
				success: function(data) {
					var html = $.templates.userLogsTemplate({ user_logs: data });
					$.view.$body.removeClass('loader');
					$.view.$document.trigger('/sm/common/openPopup', ['Статистика пользователей', html]);
				}
			});
		}
	});
})(jQuery);

