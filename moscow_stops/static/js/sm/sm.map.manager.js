(function ($) {

	$.extend($.viewmodel, {
		currentTileLayer: null
	});

	$.extend($.view, {
		$tileLayers: null,
		$manager: null,
		isLabelsButtonOn: false
	});

	$.extend($.sm.map, {

		_layers: {},
		_lastIndex: 0,

		layersName: {
			osm: 'osm',
			osm19: 'osm_19',
			bing: 'bing'
		},


		buildLayerManager: function () {
			var v = $.view;
			$.view.$manager = $('#manager');
			this.buildLabelsButton();
			// http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
			// http://{s}.tile.osmosnimki.ru/kosmo/{z}/{x}/{y}.png
			// http://{s}.tiles.mapbox.com/v3/karavanjo.map-opq7bhsy/{z}/{x}/{y}.png
			this.addTileLayer(this.layersName.osm, 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', '© OpenStreetMap contributors', 8, 18, 'osm');
			this.addTileLayer(this.layersName.osm19, 'http://nextgis.ru/data/moscow-stops/Tiles/moscow-stops/{z}/{x}/{y}.png', '© OpenStreetMap contributors', 19, 19, 'osm');
			this.addBingLayer('AujH--7B6FRTK8b81QgPhuvw_Sb3kc8hBO-Lp5OLNyhCD4ZQoGGW4cQS6zBgaeEh');
			$.view.$tileLayers = v.$map.find('div.leaflet-tile-pane div.leaflet-layer');
			this.bindLayerManagerEvents();
			this.onLayer('osm');
			this.manageOsmLayer();
		},


		buildLabelsButton: function () {
			$.view.$body.toggleClass('no-button-labels', $.viewmodel.map.getZoom() <= 15);
		},


		bindLayerManagerEvents: function () {
			var context = this;

			$.viewmodel.map.off('zoomend').on('zoomend', function () {
				context.onLayer();
				context.validateLabelsRendering();
			});
			$.view.$manager.find('div.tile-layers div.icon').off('click').on('click', function (e) {
				var layer = $(this).data('layer');
				if (layer === context.layersName.osm) {
					context.onLayer(layer);
					context.manageOsmLayer();
				} else {
					context.onLayer(layer);
				}
			});

			$('#labelsButton').off('click').on('click', function (e) {
				var viewmodel = $.viewmodel,
					isRenderedLabels = !viewmodel.isRenderedLabels;
				$.view.$body.toggleClass('labels', isRenderedLabels);
				viewmodel.isRenderedLabels = isRenderedLabels;
				viewmodel.isLabelsMode = !viewmodel.isLabelsMode;
				$.view.$document.trigger('/sm/stops/updateStops');
			});

			$.view.$document.on('/sm/map/validate', function () {
				context.validateLabelsRendering();
			});
		},


		onLayer: function (nameLayer) {
			var vm = $.viewmodel;
			if (vm.currentTileLayer == nameLayer) return false;
			var v = $.view,
				$tileLayers = $($.viewmodel.map.getPanes().tilePane).find('div.leaflet-layer');
			if (nameLayer) {
				if (vm.currentTileLayer) {
					v.$body.removeClass(this._layers[vm.currentTileLayer].css).addClass(this._layers[nameLayer].css);
				} else {
					v.$body.addClass(this._layers[nameLayer].css); // For initialization map
				}
				vm.currentTileLayer = nameLayer;
				$tileLayers.hide().eq(this._layers[nameLayer].index).show();
			} else {
				$tileLayers.hide().eq(this._layers[vm.currentTileLayer].index).show();
			}
		},


		addTileLayer: function (nameLayer, url, attribution, minZoom, maxZoom, css) {
			var layer = new L.TileLayer(url, {minZoom: minZoom, maxZoom: maxZoom, attribution: attribution});
			this._layers[nameLayer] = {
				'layer' : $.viewmodel.map.addLayer(layer, true),
				'index' : this._lastIndex,
				'css': css || nameLayer
			};
			this._lastIndex += 1;
		},


		addBingLayer: function (key) {
			var bingLayer = new L.BingLayer(key, {minZoom: 8, maxZoom: 19});
			this._layers['bing'] = {
				'layer' : $.viewmodel.map.addLayer(bingLayer, true),
				'index' : this._lastIndex,
				'css': this.layersName.bing
			};
			this._lastIndex += 1;
		},


		manageOsmLayer: function () {
			var vm = $.viewmodel,
				layersName = this.layersName,
				zoom = vm.map.getZoom();
			if (zoom > 18 && vm.currentTileLayer === layersName.osm) {
				this.onLayer(layersName.osm19);
			}
			if (zoom <= 18 && vm.currentTileLayer === layersName.osm19) {
				this.onLayer(layersName.osm);
			}
			return true;
		},


		validateLabelsRendering: function () {
			var zoom = $.viewmodel.map.getZoom();
			this.buildLabelsButton();
			$.viewmodel.isRenderedLabels = zoom >= 16 && $.viewmodel.isLabelsMode;
		}
	});
})(jQuery);