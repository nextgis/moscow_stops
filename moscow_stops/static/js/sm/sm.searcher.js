(function ($) {
	$.extend($.viewmodel, {
		searcherCollapsed: false,
		filter: {'id' : '', 'name' : ''},
		isFilterValidated: false
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
			$.view.$filterName.off('keyup').on('keyup', function (e) {
				context.keyUpHandler(e);
			});
			$.view.$filterId.off('keyup').on('keyup', function (e) {
				context.keyUpHandler(e);
			});
			$('#filter_name, #filter_id').off('focus').on('focus', function () {
				$.view.$searchResults.removeClass('active');
			});
			$('#searchResults p.description').off('click').on('click', function () {
				$.view.$searchResults.addClass('active');
			});
			$.view.$searchButton.off('click').on('click', function () {
				if ($.viewmodel.isFilterValidated) {
					context.applyFilter();
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

		validateSearch: function () {
			var intRegex = /^\d+$/,
				min_characters_name = this.min_characters_name,
				v = $.view,
				vm = $.viewmodel,
				id = v.$filterId.val(),
				name = v.$filterName.val();

			if (name.length <= min_characters_name && name != '') {
				v.$filterName.addClass('invalid');
			} else {
				v.$filterName.removeClass('invalid');
			}

			if (!intRegex.test(id) && id != '') {
				v.$filterId.addClass('invalid');
			} else {
				v.$filterId.removeClass('invalid')
			}

			if ((name.length > min_characters_name && id == '') ||
				((name == '' || name.length <= min_characters_name)  && intRegex.test(id)) ||
				(name.length > min_characters_name && intRegex.test(id)) ||
				(name == '' && id == '' )) {
				vm.isFilterValidated = true;
			} else {
				vm.isFilterValidated = false;
			}
		},

		updateUI: function () {
			$.view.$searchButton.toggleClass('active', $.viewmodel.isFilterValidated);
		},

		search: function () {
			$.view.$document.trigger('/sm/stops/updateStops');
		},

		applyFilter: function () {
			if ($.viewmodel.isFilterValidated) {
				this.updateFilter();
				this.search();
			}
		},

		keyUpHandler: function (e) {
			this.validateSearch();
			this.updateUI();
			if(e.keyCode == 13) {
				this.applyFilter();
			}
		},

		updateFilter: function () {
			var $v = $.view,
				vm = $.viewmodel;
				vm.filter.name = $v.$filterName.val();
				vm.filter.id = $v.$filterId.val();
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
			});
			$.view.$searchResults.addClass('active');
		},

		getHtmlForSearchResults: function (cssClass, stops) {
			return $.templates.searchResultsTemplate({
				cssClass: cssClass,
				stops: stops
			});
		}
	});
})(jQuery);

