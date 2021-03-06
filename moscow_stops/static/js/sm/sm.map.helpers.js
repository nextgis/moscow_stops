(function ($) {
	$.extend($.sm.map, {
		getIcon: function (cssClass, iconSize, innerHtml) {
			return L.divIcon({
				className: cssClass,
				iconSize: [iconSize, iconSize],
				iconAnchor: [iconSize / 2, iconSize / 2],
				popupAnchor: [0, 2 - (iconSize / 2)],
				html: innerHtml
			});
		}
	});
})(jQuery);