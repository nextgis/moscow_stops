(function ($) {
	$.extend($.viewmodel, {
		searcherCollapsed: false,
		filter: {'id' : '', 'name' : ''}
	});
	$.extend($.view, {
		$searchContainer: null,
		$filterName: null,
		$filterId: null,
		$searchButton: null,
		$searchResults: null
	});
	$.sm.searcher = {};
	$.extend($.sm.searcher, {
		min_characters_name: 3,

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
			$.view.$filterName.off('keyup').on('keyup', function () {
				var isValid = context.validateSearch($.view.$filterId.val(), $(this).val());
				context.updateUI(isValid);
				context.updateFilter(isValid);
			});
			$.view.$filterId.off('keyup').on('keyup', function () {
				var isValid = context.validateSearch($(this).val(), $.view.$filterName.val());
				context.updateUI(isValid);
				context.updateFilter(isValid);
			});
			$('#filter_name, #filter_id').off('focus').on('focus', function () {
				$.view.$searchResults.removeClass('active');
			});
			$('#searchResults p.description').off('click').on('click', function () {
				$.view.$searchResults.addClass('active');
			});
			$.view.$searchButton.off('click').on('click', function () {
				if ($(this).hasClass('active')) {
					context.search();
				}
			});
			$.view.$document.on('/sm/searcher/update', function () {
				context.updateSearch();
			});
		},

		setDomOptions: function () {
			$.view.$searchContainer = $('#searchContainer');
			$.view.$filterName = $('#filter_name');
			$.view.$filterId = $('#filter_id');
			$.view.$searchButton = $('#search');
			$.view.$searchResults = $('#searchResults');

		},

		validateSearch: function (id, name) {
			var intRegex = /^\d+$/,
				min_characters_name = this.min_characters_name,
				$v = $.view,
				id = id || $v.$filterId.val(),
				name = name || $v.$filterName.val();
			if ((name.length > min_characters_name && id == '') ||
				((name == '' || name.length <= min_characters_name)  && intRegex.test(id)) ||
				(name.length > min_characters_name && intRegex.test(id))) {
				return true;
			} else {
				return false;
			}
		},

		updateUI: function (isValid) {
			$.view.$searchButton.toggleClass('active', isValid);
		},

		search: function () {
			this.updateFilter(this.validateSearch());
			$.view.$document.trigger('/sm/stops/updateStops');
			$.view.$searchResults.addClass('active');
		},

		updateFilter: function (isValid) {
			var $v = $.view,
				vm = $.viewmodel;
			if (isValid) {
				vm.filter.name = $v.$filterName.val(),
				vm.filter.id = $v.$filterId.val();
			} else {
				vm.filter = {'id' : '', 'name' : ''};
			}

		},

		updateSearch: function () {
			var stops = $.viewmodel.stops,
				$divSearchResults = $.view.$searchResults.find('div'),
				html;
			html = this.getHtmlForSearchResults('non_check', stops.non_block.non_check.elements)
			html += this.getHtmlForSearchResults('check', stops.non_block.check.elements)
			html += this.getHtmlForSearchResults('block', stops.block.elements)
			$divSearchResults.empty().append(html);
			$divSearchResults.find('a').on('click', function () {
				var $li = $(this).parent();
				$.viewmodel.map.setView(new L.LatLng($li.data('lat'), $li.data('lon')), 18);
				$('#target').show().delay(1000).fadeOut(1000);
			})
		},

		getHtmlForSearchResults: function (cssClass, stops) {
			return $.templates.searchResultsTemplate({
				cssClass: cssClass,
				stops: stops
			});
		}
	});
})(jQuery);

