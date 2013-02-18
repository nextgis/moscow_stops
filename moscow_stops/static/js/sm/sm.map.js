(function ($) {
	$.extend($.viewmodel, {
		map: null,
		mapLayers: {},
		isPopupOpened: false
	});
	$.extend($.view, {

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
				$.when($.view.$document.trigger('/sm/osm/updateOsmLayer'),
					$.view.$document.trigger('/sm/stops/updateStops')).then(function () {
						var s = $.viewmodel.mapLayers.select._layers,
							smarker = s[Object.keys(s)[0]];
						if (smarker && !$.viewmodel.isPopupOpened) {
							smarker.openPopup();
							$.viewmodel.isPopupOpened = true;
							$.view.$document.trigger('/sm/map/openPopupEnd');
						}
					});
			});
			$.view.$document.on('/sm/map/openPopup', function (e, markerPopuped) {
				var vm = $.viewmodel,
					s = vm.mapLayers.select,
					m = $.extend(true, {}, markerPopuped);
				s.clearLayers();
				s.addLayer(m);
				vm.map.panTo(markerPopuped._latlng);
			});
			$.view.$document.on('/sm/map/MarkerClick', function (e) {
				$.viewmodel.mapLayers.select.clearLayers();
				$.viewmodel.map.closePopup();
			});
			$.viewmodel.map.on('popupclose', function () {
				$.viewmodel.isPopupOpened = false;
			});
		},

		setDomOptions: function () {

		},

		getBbox: function () {
			return this.map.getBounds();
		},

		buildMap: function () {
			var context = this,
				osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
				osmAttr = 'Map data © OpenStreetMap contributors',
				osm = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 20, attribution: osmAttr}),
				selectLayer = L.layerGroup();
			$.viewmodel.map = new L.Map('map');
			$.viewmodel.map.setView(new L.LatLng(55.742, 37.658), 15);
			$.viewmodel.map.addLayer(osm);
			$.viewmodel.mapLayers['osm'] = osm;
			$.viewmodel.get_bbox = context.getBbox;

			$.viewmodel.map.addLayer(selectLayer);
			$.viewmodel.mapLayers['select'] = selectLayer;
		}
	});
})(jQuery);

