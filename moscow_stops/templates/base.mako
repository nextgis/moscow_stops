<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/html" xmlns="http://www.w3.org/1999/html">
<head>
	<meta charset="utf-8">
	<title>Редактор остановок общественного транспорта</title>
	<meta name="description" content="">
	<meta name="viewport" content="width=device-width">

##	<link rel="stylesheet" href="${request.static_url('moscow_stops:static/css/bootstrap.min.css')}">
##	<link rel="stylesheet" href="${request.static_url('moscow_stops:static/css/tagsinput/jquery.tagsinput.css')}">
##	<link rel="stylesheet" href="${request.static_url('moscow_stops:static/css/main.css')}">
	<link rel="stylesheet" href="${request.static_url('moscow_stops:static/build/sm.min.css')}" />
		<link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.5/leaflet.css"/>
	<!--[if lte IE 8]>
	<link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.5/leaflet.ie.css"/>
	<![endif]-->

##	<link rel="stylesheet" href="${request.static_url('moscow_stops:static/js/Leaflet.markercluster/MarkerCluster.css')}" />

##	<link rel="stylesheet" href="${request.static_url('moscow_stops:static/js/Leaflet.markercluster/MarkerCluster.Default.css')}" />
	<!--[if lte IE 8]><!--<link rel="stylesheet" href="${request.static_url('moscow_stops:static/js/Leaflet.markercluster/MarkerCluster.Default.ie.css')}" />--><![endif]-->

	<script type="text/javascript">
		document['url_root'] = '${request.route_url('home')}';
	</script>
	<script type="text/javascript" src="http://cdnjs.cloudflare.com/ajax/libs/mustache.js/0.7.0/mustache.min.js"></script>
	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
	<script type="text/javascript" src="http://cdn.leafletjs.com/leaflet-0.5/leaflet.js"></script>
##	<script src="${request.static_url('moscow_stops:static/js/Leaflet.markercluster/leaflet.markercluster-src.js')}"></script>

	<script type="text/javascript" src="${request.static_url('moscow_stops:static/js/jquery/jquery.cookie.js')}"></script>
	<script type="text/javascript" src="${request.static_url('moscow_stops:static/build/sm.min.js')}"></script>
##	<script type="text/javascript" src="${request.static_url('moscow_stops:static/js/tagsinput/jquery.tagsinput.js')}"></script>
##	<script type="text/javascript" src="${request.static_url('moscow_stops:static/js/jquery.imagesloaded.js')}"></script>
##	<script type="text/javascript" src="${request.static_url('moscow_stops:static/js/leaflet/bing.js')}"></script>
##	<script type="text/javascript" src="${request.static_url('moscow_stops:static/js/mustache.js')}"></script>
####	<script type="text/javascript" src="${request.static_url('moscow_stops:static/js/sm/sm.templates.js')}"></script>
##	<script type="text/javascript" src="${request.static_url('moscow_stops:static/js/sm/sm.loader.js')}"></script>
##	<script type="text/javascript" src="${request.static_url('moscow_stops:static/js/sm/sm.helpers.js')}"></script>
##	<script type="text/javascript" src="${request.static_url('moscow_stops:static/js/sm/sm.common.js')}"></script>
##	<script type="text/javascript" src="${request.static_url('moscow_stops:static/js/sm/sm.map.js')}"></script>
##	<script type="text/javascript" src="${request.static_url('moscow_stops:static/js/sm/sm.map.helpers.js')}"></script>
##	<script type="text/javascript" src="${request.static_url('moscow_stops:static/js/sm/sm.map.manager.js')}"></script>
##	<script type="text/javascript" src="${request.static_url('moscow_stops:static/js/sm/sm.searcher.js')}"></script>
##	<script type="text/javascript" src="${request.static_url('moscow_stops:static/js/sm/sm.editor.js')}"></script>
##	<script type="text/javascript" src="${request.static_url('moscow_stops:static/js/sm/sm.osm.js')}"></script>
##	<script type="text/javascript" src="${request.static_url('moscow_stops:static/js/sm/sm.stops.js')}"></script>
##	<script type="text/javascript" src="${request.static_url('moscow_stops:static/js/sm/sm.user.js')}"></script>
	</head>
<body class="searcher-collapsed loading">
<div class="loading">
	<img src="${request.static_url('moscow_stops:static/img/sm-loading.png')}"/>
	<span>Инициализация</br>редактора...</span>
</div>
<div class="popup-background"></div>
<div id="popup">
	<a class="close"></a>
	<div class="header"></div>
	<div class="content"></div>
</div>
<div class="main-loader"></div>
<!--[if lt IE 7]>
<p class="chromeframe">Вы используете <strong>устаревший</strong> браузер. Пожалуйста <a href="http://browsehappy.com/">обновите
	ваш браузер</a></p>
<![endif]-->
<div id="target"></div>
<div id="map"></div>
<!--<div id="map-controls">-->
	<!--<div class="osm-layer-control"><span></span></a>-->
<!--</div>-->
<div id="userContainer"
% if u_name:
class="inner"
% endif
>
	<form id="signInForm" class="form-inline" method="post">
		<input id="em" type="email" class="input-small" name="mail" placeholder="E-mail">
		<input id="p" type="password" class="input-small" name="pass" placeholder="Пароль">
		<button type="submit" class="btn btn-primary">Войти</button>
	</form>
	<form id="signOutForm" class="form-inline" method="post">
		<div class="log" title="Статистика пользователей"><span></span></div>
		<div class="export" title="Экспорт данных"><a href="${request.route_url('export')}"><span></span></a></div>
		<fieldset>
			<label id="display-name" class="control-label">
				% if u_name:
						${u_name}
				% endif
			</label>
			<input type="hidden" name="sign_out" value="true" />
			<button type="submit" class="btn">Выйти</button>
		</fieldset>
	</form>
</div>
<div id="searchContainer">
	<span class="icon-collapse"></span>
	<div class="title"><span>Поиск</span></div>
	<form class="form-search">
		<fieldset>
			<input id="filter_name" type="text" class="input-name" placeholder="Название">
			<input id="filter_id" type="text" class="input-id" placeholder="ID">
			<div id="search" class="active" title="Поиск">
				<span></span>
			</div>
		</fieldset>
		<fieldset>
			<div class="is_help">
				<input type="checkbox" id="filter_is_help">
				<label for="filter_is_help">Нужна помощь</label>
			</div>
		</fieldset>
	</form>
	<div id="searchResults" class="active">
		<p class="update">Запрос данных...</p>
		<p class="description">Для поиска введите</br>название остановки (более 3 символов)</br>или ее ID (только цифры)</br>и нажмите на кнопку</br></br>
			Для отображения списка остановок кликните на эту область
		</p>
		<div></div>
	</div>
</div>
<div id="manager">
	<div class="group tile-layers">
		<div class="icon osm" title="Слой Openstreetmap" data-layer="osm">
			<button></button>
		</div>
		<div class="icon bing" title="Слой Bing" data-layer="bing">
			<button></button>
		</div>
	</div>
	<div class="group vector-layers">
		<div id="labelsButton" class="icon labels" title="Включить подписи">
			<button></button>
		</div>
	</div>
</div>
<div id="editorContainer">
	<span class="icon-collapse"></span>
	<div class="title"><span>Редактор</span></div>
	<div class="form-wrap">
		<form class="form-inline disabled" id="editorForm">
			<div class="group">
				<label class="control-label middle" for="name">Название</label>
				<input type="text" id="name" name="name" class="stand" disabled="disabled"/>
			</div>
			<div class="group">
				<label class="control-label middle" for="id">ID</label>
				<input type="text" id="id" name="id" class="stand" disabled="disabled"/>
			</div>
			<div class="group">
				<label class="control-label top" for="routes">Маршруты</label>
				<select id="route_type" class="route-type-sel" disabled="disabled">
					% for k, v in routes_types.iteritems():
						<option value="${k}">${v.name}</option>
					% endfor
				</select>
				% for k, v in routes.iteritems():
					<select id="route_type_${k}" class="route" disabled="disabled" style="display: none;">
						% for route in v:
							<option value="${route.id}">${route.name}</option>
						% endfor
					</select>
				% endfor
				<a id="add-route" title="Добавить маршрут"></a>
				<input name="tags" id="routes" value=""/>
			</div>
			<div class="group">
				<label class="control-label" for="lat">Широта</label>
				<input type="text" id="lat" name="lat" class="stand" disabled="disabled"/>
			</div>
			<div class="group">
				<label class="control-label" for="lon">Долгота</label>
				<input type="text" id="lon" name="lon" class="stand" disabled="disabled"/>
			</div>
			<div class="group">
				<label class="control-label" for="is_shelter">Крыша</label>
				<select id="is_shelter" class="stand" name="is_shelter" disabled="disabled">
					<option value="None"></option>
					<option value="true">Да</option>
					<option value="false">Нет</option>
				</select>
			</div>
			<div class="group">
				<label class="control-label" for="is_bench">Скамейка</label>
				<select id="is_bench" class="stand" name="is_bench" disabled="disabled">
					<option value="None"></option>
					<option value="true">Да</option>
					<option value="false">Нет</option>
				</select>
			</div>
			<div class="group" id="types">
				<label class="control-label top">Тип остановки</label>
				<div class="parameters">
					<div class="parameter default">
						<input type="checkbox" id="stype_0" disabled="disabled">
						<label class="control-label" for="stype_0">Промежуточная</label>
					</div>
					<div class="parameter">
						<input type="checkbox" id="other_stype" disabled="disabled">
						<label class="control-label" for="other_stype">Конечная</label>
					</div>
					<div class="parameter sub">
						<input type="checkbox" id="stype_1" data-id="1" disabled="disabled">
						<label class="control-label" for="stype_1" >Высадка</label>
					</div>
					<div class="parameter sub">
						<input type="checkbox" id="stype_2" data-id="2" disabled="disabled">
						<label class="control-label" for="stype_2">Посадка</label>
					</div>
					<div class="parameter sub">
						<input type="checkbox" id="stype_3" data-id="3" disabled="disabled">
						<label class="control-label" for="stype_3">Конечная</label>
					</div>
				</div>
			</div>
			<div class="group">
				<label class="control-label top" for="pan_link">Ссылка на панораму</label>
				<input type="text" name="panorama_link" id="pan_link" class="stand" disabled="disabled"/>
				<div class="link">
					<a id="pan_link_a" target="_blank"></a>
				</div>
			</div>
			<div class="group auto-link">
				<a id="auto_link" target="_blank">Авто-ссылка</a>
			</div>
			<div class="group">
				<label class="control-label top" for="comment">Коммента-</br>рий</label>
				<textarea id="comment" name="comment" disabled="disabled"></textarea>
			</div>
			<div class="group">
				<label class="control-label" for="is_check">Проверка</br>на мест-</br>ности</label>
				<select id="is_check" name="is_check" class="stand" disabled="disabled">
					% for check_type in check_types:
							<option value="${check_type.id}">${check_type.name}</option>
					% endfor
				</select>
			</div>
			<div class="group">
				<label class="control-label" for="pan_link">Фото</label>
				<input type="text" id="photo" class="stand" disabled="disabled"/>
			</div>
			<div class="group-checkboxes">
				<input id="is_help" type="hidden" name="is_help" value="0">
				<input id="chb_is_help"  type="checkbox" class="stand" disabled="disabled" data-id="is_help"/>
				<label class="control-label top" for="is_help">Нужна помощь</label>
			</div>
			<div class="group-submit">
				<button id="discard" type="button" class="btn btn-warning" disabled="disabled">Отменить</button>
				<button id="save" type="button" class="btn btn-success" disabled="disabled">Сохранить</button>
			</div>
		</form>
	</div>
</div>
</body>
</html>

