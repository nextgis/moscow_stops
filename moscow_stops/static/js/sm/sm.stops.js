(function ($) {
	$.extend($.viewmodel, {

	});
	$.extend($.view, {

	});
	$.sm.stops = {};
	$.extend($.sm.stops, {
		init: function () {
			this.setDomOptions();
			this.buildStopsLayers();
			this.updateStops();
			this.bindEvents();
		},

		bindEvents: function () {
			var context = this;
			$.view.$document.on('/sm/stops/updateStops', function (e, isCleared) {
				context.updateStops(isCleared);
			});
		},

		setDomOptions: function () {

		},

		buildStopsLayers: function () {
			var stopsGroup = new L.layerGroup(),
				editGroup = new L.layerGroup();
			$.viewmodel.map.addLayer(stopsGroup);
			$.viewmodel.mapLayers['stops'] = stopsGroup;

			$.viewmodel.map.addLayer(editGroup);
			$.viewmodel.mapLayers['edit'] = editGroup;
		},

		updateStops: function (isCleared) {
			var validateZoom = this.validateZoom();
			if (validateZoom) {
				$.viewmodel.mapLayers.stops.clearLayers();
			}
			if (!validateZoom) {
				return;
			}
			this.updateStopsByAjax();
		},

		updateStopsByAjax: function () {
			var context = this,
				url = document['url_root'] + 'stops?bbox=' + JSON.stringify($.viewmodel.get_bbox());
			$.ajax({
				type: "GET",
				url: url,
				dataType: 'json',
				success: context.renderStops,
				context: context
			});
		},

		renderStops: function (data) {
			var mp = $.sm.map,
				vm = $.viewmodel,
				stopsLayer = vm.mapLayers.stops,
				iconBlock = mp.getIcon('stop-block', 20),
				iconEdit = mp.getIcon('stop-edit', 20),
				stopsIterable, stop, marker, popupHtml;

			stopsIterable = data.stops.block;
			for (stop in stopsIterable) {
				if (stopsIterable.hasOwnProperty(stop)) {
					popupHtml = $.templates.stopPopup({
						css: 'block'
					});
					marker = L.marker([stopsIterable[stop].lat, stopsIterable[stop].lon], {icon: iconEdit})
						.bindPopup(popupHtml, {autoPan: false})
						.off('click').on('click', function (e) {
							$.view.$document.trigger('/sm/map/openPopup', [marker]);
						});
					stopsLayer.addLayer(marker);
				}
			}

			stopsIterable = data.stops.non_block.non_check;
			for (stop in stopsIterable) {
				if (stopsIterable.hasOwnProperty(stop)) {
					marker = L.marker([stopsIterable[stop].lat, stopsIterable[stop].lon], {icon: iconEdit}).on('click', function (e) {
						$.view.$document.trigger('/sm/map/MarkerClick');
						var marker = e.target;
						marker.bindPopup($.templates.stopPopupTemplate({ css: 'edit' }), {autoPan: false});
						$.view.$document.off('/sm/map/openPopupEnd').on('/sm/map/openPopupEnd', function () {
							$.getJSON(document['url_root'] + 'stop/' + e.target.stop_id, function (data) {
								var html = $.templates.stopPopupInfoTemplate({
									id: data.stop.id,
									name: data.stop.name,
									is_shelter: data.stop.is_shelter,
									is_bench: data.stop.is_bench,
									stop_type_id: data.stop.stop_type_id,
									is_check: data.stop.is_check
								});
								$('#stop-popup').removeClass('loader').empty().append(html);
							}).error(function () {
								$('#stop-popup').removeClass('loader').empty().append('Error connection');
							});
						});
						$.view.$document.trigger('/sm/map/openPopup', [marker]);
					});
					marker['stop_id'] = stop;

					stopsLayer.addLayer(marker);
				}
			}
		},

		validateZoom: function () {
			if ($.viewmodel.map.getZoom() < 15) {
				return false;
			}
			return true;
		}
	});
})(jQuery);

