(function ($) {
	$.extend($.viewmodel, {
		map: null,
		mapLayers: {},
		isPopupOpened: false
	});
	$.extend($.view, {
		$map: null
	});

	$.sm.map = {};
	$.extend($.sm.map, {
		init: function () {
			this.setDomOptions();
			this.buildMap();
			this.buildLayerManager();
			this.bindEvents();
		},

		bindEvents: function () {
			$.viewmodel.map.on('moveend', function (e) {
				$.view.$document.trigger('/sm/map/updateAllLayers');
			});
			$.view.$document.on('/sm/map/updateAllLayers', function () {
				$.view.$document.trigger('/sm/stops/updateStops');
				$.view.$document.trigger('/sm/osm/updateOsmLayer');
			});
			$.view.$document.on('/sm/map/openPopup', function (e, latlng, html) {
				var vm = $.viewmodel,
					selectLayer = vm.mapLayers.select,
					map = vm.map;
				map.panTo(latlng);
				map.openPopup(L.popup().setLatLng(latlng).setContent(html));

			});
			$.viewmodel.map.on('popupclose', function () {
				var vm = $.viewmodel;
				vm.isPopupOpened = false;
				vm.mapLayers.select.clearLayers();
			});
		},

		setDomOptions: function () {

		},

		getBbox: function () {
			return this.map.getBounds();
		},

		buildMap: function () {
			var context = this,
				vm = $.viewmodel,
				selectLayer = L.layerGroup();
			$.view.$map = $('#map');
			vm.map = new L.Map('map');
			L.control.scale().addTo(vm.map);
			vm.map.setView(new L.LatLng(55.742, 37.658), 15);
			vm.get_bbox = context.getBbox;

			vm.map.addLayer(selectLayer);
			vm.mapLayers['select'] = selectLayer;
		}
	});
})(jQuery);

