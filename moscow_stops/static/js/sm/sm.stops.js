(function ($) {
	$.extend($.viewmodel, {
		stopSelected: null,
		stopSelectedId: null
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
			$.view.$document.off('/sm/map/openPopupEnd').on('/sm/map/openPopupEnd', function (marker) {
				$.getJSON(document['url_root'] + 'stop/' + $.viewmodel.stopSelectedId, function (data) {
					$.viewmodel.stopSelected = data.stop;
					var helper = $.sm.helpers,
						html = $.templates.stopPopupInfoTemplate({
							id: data.stop.id,
							name: data.stop.name,
							is_shelter: helper.boolToString(data.stop.is_shelter),
							is_bench: helper.boolToString(data.stop.is_bench),
							stop_type_id: helper.valueNullToString(data.stop.stop_type_id),
							routes: data.stop.routes,
							types: data.stop.types,
							check_status: helper.valueCheckToString(data.stop.check_status),
							comment: helper.valueNullToString(data.stop.comment),
							isUserEditor: $.viewmodel.isAuth,
							editDenied: $.viewmodel.editable
						});
					$('#stop-popup').removeClass('loader').empty().append(html);
					$('button#edit').off('click').on('click', function (e) {
						$.view.$document.trigger('/sm/editor/startEdit');
					});
				}).error(function () {
						$('#stop-popup').removeClass('loader').empty().append('Error connection');
					});
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

		updateStops: function () {
			var validateZoom = this.validateZoom();
			$.viewmodel.mapLayers.stops.clearLayers();
			if (!validateZoom) { return; }
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
				iconCheck = mp.getIcon('stop-check', 20),
				stopsIterable, stop, marker, popupHtml;

			stopsIterable = data.stops.block;
			for (stop in stopsIterable) {
				if (stopsIterable.hasOwnProperty(stop)) {
					popupHtml = $.templates.stopPopupTemplate({
						css: 'block'
					});
					marker = L.marker([stopsIterable[stop].lat, stopsIterable[stop].lon], {icon: iconBlock})
						.bindPopup(popupHtml, {autoPan: false})
						.off('click').on('click', function (e) {
							$.viewmodel.stopSelectedId = marker.stop_id;
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
						$.viewmodel.stopSelectedId = marker.stop_id;
						$.view.$document.trigger('/sm/map/openPopup', [marker]);
					});
					marker['stop_id'] = stop;

					stopsLayer.addLayer(marker);
				}
			}

			stopsIterable = data.stops.non_block.check;
			for (stop in stopsIterable) {
				if (stopsIterable.hasOwnProperty(stop)) {
					marker = L.marker([stopsIterable[stop].lat, stopsIterable[stop].lon], {icon: iconEdit}).on('click', function (e) {
						$.view.$document.trigger('/sm/map/MarkerClick');
						var marker = e.target;
						marker.bindPopup($.templates.stopPopupTemplate({ css: 'edit' }), {autoPan: false});
						$.viewmodel.stopSelectedId = marker.stop_id;
						$.view.$document.trigger('/sm/map/openPopup', [marker]);
					});
					marker['stop_id'] = stop;

					stopsLayer.addLayer(marker);
				}
			}
		},

		renderStop: function () {

		},

		validateZoom: function () {
			if ($.viewmodel.map.getZoom() < 15) {
				return false;
			}
			return true;
		}
	});
})(jQuery);

