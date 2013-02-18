(function ($) {
	$.sm = {};
	$.viewmodel = {};
	$.view = {};
	$.templates = {};

	$.extend($.viewmodel, {
		version : null
	});
	$.extend($.view, {
		$document: null
	});

	$.sm.loader = {};
	$.extend($.sm.loader, {
		templates: ['osmPopupTemplate', 'stopPopupTemplate', 'stopPopupInfoTemplate'],

		init: function () {
			try {
				this.setDomOptions();
				this.compileTemplates();
				$.sm.common.init();
				$.sm.map.init();
				$.sm.searcher.init();
				$.sm.editor.init();
				$.sm.osm.init();
				$.sm.user.init();
				$.sm.stops.init();
			} catch (e) {
				alert(e);
			}
		},

		bindEvents: function () {
		},

		showErrorPopup: function () {
		},

		setPopups: function () {

		},

		setDomOptions: function () {
			$.view.$document = $(document);
		},

		compileTemplates: function () {
			var context = this, deferreds = [], templates = [], htmlTemplates = [], templateIndex,
				templatesCount = this.templates.length;
			for (templateIndex = 0; templateIndex < templatesCount; templateIndex++) {
				deferreds.push($.get(document['url_root'] + 'static/js/templates/' + this.templates[templateIndex] + '.htm', function (doc, state, response) {
					htmlTemplates.push({
						'name' : this.url.substr((this.url.lastIndexOf("/") + 1)).replace('.htm', ''),
						'html' : response.responseText });
				}));
			}
			$.when.apply(null, deferreds).done(function () {
				for (templateIndex = 0; templateIndex < templatesCount; templateIndex++) {
					var name = htmlTemplates[templateIndex].name;
					$.templates[name] = Mustache.compile(htmlTemplates[templateIndex].html);
				}
			});
		}
	});
	$(document).ready(function () {
		$.sm.loader.init();
	});
})(jQuery);
