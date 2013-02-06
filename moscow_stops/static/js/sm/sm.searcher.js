(function ($) {
	$.extend($.viewmodel, {
		searcherCollapsed: false
	});
	$.extend($.view, {
		$searchContainer: null
	});
	$.sm.searcher = {};
	$.extend($.sm.searcher, {
		init: function () {
			this.setDomOptions();
			this.bindEvents();
		},

		bindEvents: function () {
			var context = this;
			$.view.$searchContainer.find('span.icon-collapse, div.title').off('click').on('click', function () {
				$.viewmodel.searcherCollapsed = !$.viewmodel.searcherCollapsed;
				$.view.$body.toggleClass('searcher-collapsed', context.searcherCollapsed);
			});
		},

		setDomOptions: function () {
			$.view.$searchContainer = $('#searchContainer');
		},

		search: function (name, id) {

		}
	});
})(jQuery);

