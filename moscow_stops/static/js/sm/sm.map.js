(function ($) {
	$.extend($.viewmodel, {
		map: null,
		mapLayers: {},
		isPopupClosed: true
	});
	$.extend($.view, {
//		$map: null
	});
	$.sm.map = {};
	$.extend($.sm.map, {
		init: function () {
			this.setDomOptions();
			this.buildMap();
			this.bindEvents();
		},

		bindEvents: function () {
			$.viewmodel.map.on('moveend', function (e) {
				$.view.$document.trigger('/sm/osm/updateOsmLayer', $.viewmodel.isPopupClosed);
			});
			$.viewmodel.map.on('popupopen', function (e) {
				$.viewmodel.isPopupClosed = false;
			});
			$.viewmodel.map.on('popupclose', function (e) {
				$.viewmodel.isPopupClosed = true;
			});
		},

		setDomOptions: function () {
//			$.view.$map = $('#map');
		},

		buildMap: function () {
			$.viewmodel.map = new L.Map('map');
			var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
				osmAttr = 'Map data © OpenStreetMap contributors',
				osm = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 20, attribution: osmAttr});
			$.viewmodel.map.setView(new L.LatLng(55.742, 37.658), 15);
			$.viewmodel.map.addLayer(osm);
			$.viewmodel.mapLayers['osm'] = osm;
		}
	});
})(jQuery);

