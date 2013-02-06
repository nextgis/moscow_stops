(function ($) {
	$.extend($.viewmodel, {
		nodesId: {}
	});
	$.extend($.view, {

	});
	$.sm.osm = {};
	$.extend($.sm.osm, {
		osmMaxClusterRadius: 80,

		init: function () {
			this.setDomOptions();
			this.buildOsmStopsLayer();
			this.updateStopsFromXapi();
			this.bindEvents();
		},

		bindEvents: function () {
			var context = this;
			$.view.$document.on('/sm/osm/updateOsmLayer', function (e, isCleared) {
				context.updateOsmLayer(isCleared);
			});
		},

		setDomOptions: function () {

		},

		buildOsmStopsLayer: function () {
			var osmStopsLayerGroup  = new L.layerGroup();
			$.viewmodel.map.addLayer(osmStopsLayerGroup);
			$.viewmodel.mapLayers['osmStops'] = osmStopsLayerGroup;
		},

		updateOsmLayer: function (isCleared) {
			var validateZoom = this.validateZoom();
			if (isCleared || !validateZoom) { $.viewmodel.mapLayers.osmStops.clearLayers(); }
			if (!validateZoom) { return; }

			this.updateStopsFromXapi();
		},

		offOsmLayer: function () {
			$.viewmodel.mapLayers.osmStops.clearLayers();
		},

		onOsmLayer: function () {
			this.updateOsmLayer(false);
		},

		getIcon: function (cssClass, iconSize) {
			return L.divIcon({
				className: cssClass,
				iconSize: [iconSize, iconSize],
				iconAnchor: [iconSize / 2, iconSize / 2],
				popupAnchor: [0, 2 - (iconSize / 2)]
			});
		},

		renderStops: function (overpassStops) {
			var stops = overpassStops.elements,
				osmLayer = $.viewmodel.mapLayers.osmStops,
				nodesId = $.viewmodel.nodesId,
				icon = this.getIcon('osm-bus-stop', 22),
				popupHtml, marker;
			for (var i = 0, stopsCount = stops.length; i < stopsCount; i++) {
				if (nodesId[stops[i].id]) { continue; }
				popupHtml = $.templates.osmPopupTemplate({
					tags: $.sm.helpers.hashToArrayKeyValues(stops[i].tags),
					id: stops[i].id,
					link: 'http://www.openstreetmap.org/browse/node/' + stops[i].id
				});
				marker = L.marker([stops[i].lat, stops[i].lon], {icon:icon})
					.on('click', function (e) {
						$.viewmodel.map.panTo(this._latlng);
						this.openPopup();
					})
					.bindPopup(popupHtml);
				osmLayer.addLayer(marker);
			}
		},

		updateStopsFromXapi: function () {
			var context = this,
				url = context.getApiUrl($.viewmodel.map.getBounds());
			$.ajax({
					type: "GET",
					url: url,
					dataType: 'json',
					success: context.renderStops,
					context: context
				});
		},

		getApiUrl: function (boundingbox) {
			var overpassUrl = "http://overpass-api.de/api/interpreter?data=[out:json];(node[highway=bus_stop]("
				+ boundingbox.getSouthWest().lat + "," + boundingbox.getSouthWest().lng
				+ "," + boundingbox.getNorthEast().lat
				+ "," + boundingbox.getNorthEast().lng
				+ ");>;);out;";
			return overpassUrl;
		},

		validateZoom: function () {
			if ($.viewmodel.map.getZoom() < 15) {
				return false;
			}
			return true;
		}
	});
})(jQuery);

