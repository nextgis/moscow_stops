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
				$.viewmodel.isAuth = context.authorize();
				context.updateUserUI();
			});
			$.view.$signOutForm.find('button').off('click').on('click', function () {
				context.signOut();
				$.viewmodel.isAuth = false;
			});
		},

		setDomOptions: function () {
			$.view.$userContainer = $('#userContainer');
			$.view.$signInForm = $('#signInForm');
			$.view.$signOutForm = $('#signOutForm');
			if ($.view.$userContainer.hasClass('inner')) { $.viewmodel.isAuth = true; }
		},

		updateUserUI: function () {
			$.view.$userContainer.toggleClass('inner', $.viewmodel.isAuth);
		},

		authorize: function () {
			$.post(document['url_root'] + 'user/login', {'em': $('#em').val(), 'p': $('#p').val() }, null, 'json')
				.done(function (data) {
					$('#display-name').text(data.name);
				})
				.fail( function(xhr, textStatus, errorThrown) {
					alert(xhr.status);
				});
			return true;
		},

		signOut: function () {
			var context = this;
			$.post(document['url_root'] + 'user/logout')
				.done(function () {
					context.updateUserUI();
					$('#display-name').text('');
				});
		}
	});
})(jQuery);

