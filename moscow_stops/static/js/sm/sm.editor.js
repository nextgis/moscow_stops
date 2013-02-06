(function ($) {
	$.extend($.viewmodel, {
		editorCollapsed: false
	});

	$.extend($.view, {
		$editorContainer: null
	});

	$.sm.editor = {};
	$.extend($.sm.editor, {
		regex: { url : new RegExp("(https?)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]*[-A-Za-z0-9+&@#/%=~_|]") },

		init: function () {
			this.setDomOptions();
			this.buildTags();
			this.bindEvents();
		},

		bindEvents: function () {
			var context = this;
			$.view.$editorContainer.find('span.icon-collapse, div.title').off('click').on('click', function () {
				$.viewmodel.editorCollapsed = !$.viewmodel.editorCollapsed;
				$.view.$body.toggleClass('editor-collapsed', context.editorCollapsed);
			});
			$('#pan_link').off('input').on('input', function (e) {
				var pan_link_a = document.getElementById('pan_link_a');
				if (context.regex.url.test(e.target.value)) {
					pan_link_a.className = 'active';
					pan_link_a.href = e.target.value;
				} else {
					pan_link_a.className = '';
					pan_link_a.href = '';
				}
			});
		},

		setDomOptions: function () {
			$.view.$editorContainer = $('#editorContainer');
		},

		buildTags: function () {
			$('#routes').tagsInput({
				'defaultText': '+',
				'width': '185px',
				'maxChars' : 5
			});
		}
	});
})(jQuery);

