(function ($) {
	$.extend($.viewmodel, {
		editorCollapsed: false,
		editable: false,
		routeTypeSelected: null
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
			this.buildEditLayer();
			this.buildRoutesSelector();
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
			$.view.$document.on('/sm/editor/startEdit', function (e) {
				context.startEdit();

			});
			$('#save').off('click').on('click', function (e) {
				e.stopPropagation();
				context.save();
			});
			$('#discard').off('click').on('click', function (e) {
				e.stopPropagation();
				context.discard();
			});
			$('#route_type').off('change').on('change', function (e) {
				var newRouteType = e.target.value;
				$('#route_type_' + $.viewmodel.routeTypeSelected).hide();
				$('#route_type_' + newRouteType).show();
				$.viewmodel.routeTypeSelected = newRouteType;
				context.changeRouteType(newRouteType);
			});
			$('#add-route').off('click').on('click', function (e) {
				var $selectedOption = $('#route_type_' + $.viewmodel.routeTypeSelected).find(":selected");
				context.addRoute($selectedOption.val(), $selectedOption.text());
			});
		},

		setDomOptions: function () {
			$.view.$editorContainer = $('#editorContainer');
		},

		buildTags: function () {
			var context = this;
			$('#routes').tagsInput({
				'defaultText': '+',
				'width': '185px',
				'maxChars' : 5,
				'interactive': false,
				'onRemoveTag': function (e) { context.removeRoute(e); context.changeRouteType(); }
			});
		},

		buildEditLayer: function () {
			var editedLayer = L.layerGroup();
			$.viewmodel.mapLayers['edit'] = $.viewmodel.map.addLayer(editedLayer);
		},

		buildRoutesSelector: function () {
			var route_type_selected = $('#route_type').find(":selected").val();
			$('#route_type_' + route_type_selected).show();
			$.viewmodel.routeTypeSelected = route_type_selected;
		},

		save: function () {
			var context = this,
				frm = $('#editorContainer form'),
				data_serialized = frm.serializeArray(),
				i = 0,
				ds_length = data_serialized.length,
				url = document['url_root'] + 'stop/' + $.viewmodel.stopSelected.id,
				stop = { 'id' :  $.viewmodel.stopSelected.id },
				name;
			for (i; i < ds_length; i += 1) {
				name = data_serialized[i].name;
				switch (name) {
					case name === 'lon':
						stop['geom']['lon'] = data_serialized[i].value;
						break;
					case name === 'lat':
						stop['geom']['lat'] = data_serialized[i].value;
						break;
					default:
						stop[data_serialized[i].name] = data_serialized[i].value;
						break;
				}
			}
			$.ajax({
				type: 'POST',
				url: url,
				data: { 'stop' : JSON.stringify(stop)}
			}).done(function () {
					context.finishEditing();
			});
		},

		discard: function () {
			this.finishEditing();
		},

		startEdit: function () {
			var icon = $.sm.helpers.getIcon('stop-editable', 25),
				vm = $.viewmodel,
				v = $.view,
				marker;
			v.$body.addClass('editable');
			v.$editorContainer.find('input, select, textarea, button').removeAttr('disabled');
			v.$editorContainer.find('form').removeClass('disabled');
			vm.editable = true;
			marker = L.marker([vm.stopSelected.geom.lat, vm.stopSelected.geom.lon], {icon: icon, draggable: true});
			marker.on('dragend', function (e) {
				var latLon = e.target.getLatLng();
				$('#lat').val(latLon.lat);
				$('#lon').val(latLon.lng);
			});
			vm.mapLayers['edit'].addLayer(marker);
			this.fillEditor(vm.stopSelected);
			vm.map.closePopup();
		},

		fillEditor: function (stop) {
			var helpers = $.sm.helpers;
			$('#name').val(stop.name);
			$('#id').val(stop.id).attr('disabled', 'disabled');
			$('#lat').val(stop.geom.lat);
			$('#lon').val(stop.geom.lon);
			this.fillRoutes(stop.routes);
			this.changeRouteType($.viewmodel.routeTypeSelected);
			for (var i = 0, tl = stop.types.length; i < tl; i += 1) {
				$('#stype_' + stop.types[i].id).prop('checked', true);
			}
			$('#is_shelter').val(helpers.boolToString(stop.is_shelter, true));
			$('#is_bench').val(helpers.boolToString(stop.is_bench, true));
			$('#pan_link').val(helpers.valueNullToString(stop.panorama_link));
			$('#comment').val(helpers.valueNullToString(stop.comment));
			$('#is_check').val(stop.is_check);
		},

		fillRoutes: function (routes) {
			var helpers = $.sm.helpers,
				routes_sorted = routes.sort(helpers.sortByFields('route_type_id', 'name')),
				i = 0,
				routesCount= routes_sorted.length,
				routesEditable = {};

			for (i; i < routesCount; i += 1) {
				if (!routesEditable[routes_sorted[i].route_type_id]) {
					routesEditable[routes_sorted[i].route_type_id] = { 'ids' : {}, 'routes' : [] };
				}
				routesEditable[routes_sorted[i].route_type_id].routes.push(routes_sorted[i]);
				routesEditable[routes_sorted[i].route_type_id].ids[routes_sorted[i].id] = true;
			}

			$.viewmodel.stopSelected['routes'] = routesEditable;
		},

		changeRouteType: function (routeTypeId) {
			var routeTypeId = routeTypeId || $.viewmodel.routeTypeSelected,
				routes = $.viewmodel.stopSelected.routes[routeTypeId],
				i = 0,
				routesCount;

			this.clearRoutes();

			if (routes) {
				routesCount = routes.routes.length;
			} else {
				return false;
			}

			for (i; i < routesCount; i += 1) {
				$('#routes').addTag(routes.routes[i].name, { 'css_class' : 'tag type-id-' + routeTypeId});
			}
		},

		clearRoutes: function() {
			$('#routes').importTags('');
		},

		addRoute: function (id, name) {
			var vm = $.viewmodel,
				routeTypeId = vm.routeTypeSelected,
				routes = vm.stopSelected.routes[routeTypeId].routes,
				ids = vm.stopSelected.routes[routeTypeId].ids;
			if (ids[id]) {
				return false;
			} else {
				ids[id] = true;
			}
			routes.push({
				"route_type_id": routeTypeId,
				"id": id,
				"name": name
			});
			vm.stopSelected.routes[routeTypeId].routes = routes.sort($.sm.helpers.sortByFields('name'));
			this.changeRouteType(routeTypeId);
		},

		removeRoute: function (name) {
			var vm = $.viewmodel,
				routeTypeId = vm.routeTypeSelected,
				routes = vm.stopSelected.routes[routeTypeId].routes,
				ids = vm.stopSelected.routes[routeTypeId].ids,
				removedRoute,
				i = 0,
				routesCount = routes.length;
			for (i; i < routesCount; i += 1) {
				if (routes[i].name === name) {
					removedRoute = routes[i];
					ids[removedRoute.id] = false;
					routes.splice(i, 1);
					return true;
				}
			}
		},

		finishEditing: function () {
			var vd = $.view.$document,
				vm = $.viewmodel,
				v = $.view;
			vm.mapLayers['edit'].clearLayers();
			vm.editable = false;
			v.$body.addClass('editable');
			v.$editorContainer.find('input, textarea').val('');
			v.$editorContainer.find('input:checkbox').prop('checked', false);
			v.$editorContainer.find('input, select, textarea, button').attr('disabled', 'disabled');
			v.$editorContainer.find('form').addClass('disabled');
			$('#routes').importTags('');
			vd.trigger('/sm/osm/updateOsmLayer');
			vd.trigger('/sm/stops/updateStops')
		}
	});
})(jQuery);

