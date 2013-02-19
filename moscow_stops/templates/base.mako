<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/html" xmlns="http://www.w3.org/1999/html">
<head>
	<meta charset="utf-8">
	<title>Менеджер станций</title>
	<meta name="description" content="">
	<meta name="viewport" content="width=device-width">

##	<link rel="stylesheet" href="${request.static_url('moscow_stops:static/css/bootstrap.min.css')}">
	<link rel="stylesheet" href="${request.static_url('moscow_stops:static/build/sm.min.css')}" />
	<link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.5/leaflet.css"/>
	<!--[if lte IE 8]>
	<link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.5/leaflet.ie.css"/>
	<![endif]-->

	<link rel="stylesheet" href="${request.static_url('moscow_stops:static/js/Leaflet.markercluster/MarkerCluster.css')}" />

	<link rel="stylesheet" href="${request.static_url('moscow_stops:static/js/Leaflet.markercluster/MarkerCluster.Default.css')}" />
	<!--[if lte IE 8]><link rel="stylesheet" href="${request.static_url('moscow_stops:static/js/Leaflet.markercluster/MarkerCluster.Default.ie.css')}" /><![endif]-->
##	<link rel="stylesheet" href="${request.static_url('moscow_stops:static/css/tagsinput/jquery.tagsinput.css')}">
##	<link rel="stylesheet" href="${request.static_url('moscow_stops:static/css/main.css')}">

	<script type="text/javascript">
		document['url_root'] = '${request.route_url('home')}';
	</script>
	<script type="text/javascript" src="http://cdnjs.cloudflare.com/ajax/libs/mustache.js/0.7.0/mustache.min.js"></script>
	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
	<script type="text/javascript" src="http://cdn.leafletjs.com/leaflet-0.5/leaflet.js"></script>
	<script src="${request.static_url('moscow_stops:static/js/Leaflet.markercluster/leaflet.markercluster-src.js')}"></script>

	<script type="text/javascript" src="${request.static_url('moscow_stops:static/build/sm.min.js')}"></script>
##	<script type="text/javascript" src="${request.static_url('moscow_stops:static/js/jquery.cookie.js')}"></script>
##	<script type="text/javascript" src="${request.static_url('moscow_stops:static/js/tagsinput/jquery.tagsinput.js')}"></script>
##	<script type="text/javascript" src="${request.static_url('moscow_stops:static/js/mustache.js')}"></script>
##	<script type="text/javascript" src="${request.static_url('moscow_stops:static/js/sm/sm.loader.js')}"></script>
##	<script type="text/javascript" src="${request.static_url('moscow_stops:static/js/sm/sm.helpers.js')}"></script>
##	<script type="text/javascript" src="${request.static_url('moscow_stops:static/js/sm/sm.common.js')}"></script>
##	<script type="text/javascript" src="${request.static_url('moscow_stops:static/js/sm/sm.map.js')}"></script>
##	<script type="text/javascript" src="${request.static_url('moscow_stops:static/js/sm/sm.map.helpers.js')}"></script>
##	<script type="text/javascript" src="${request.static_url('moscow_stops:static/js/sm/sm.searcher.js')}"></script>
##	<script type="text/javascript" src="${request.static_url('moscow_stops:static/js/sm/sm.editor.js')}"></script>
##	<script type="text/javascript" src="${request.static_url('moscow_stops:static/js/sm/sm.osm.js')}"></script>
##	<script type="text/javascript" src="${request.static_url('moscow_stops:static/js/sm/sm.stops.js')}"></script>
##	<script type="text/javascript" src="${request.static_url('moscow_stops:static/js/sm/sm.user.js')}"></script>
</head>
<body class="searcher-collapsed">
<!--[if lt IE 7]>
<p class="chromeframe">Вы используете <strong>устаревший</strong> браузер. Пожалуйста <a href="http://browsehappy.com/">обновите
	ваш браузер</a></p>
<![endif]-->
<div id="map"></div>
<!--<div id="map-controls">-->
	<!--<div class="osm-layer-control"><span></span></a>-->
<!--</div>-->
<div id="userContainer"
% if u_name:
class="inner"
% endif
>
	<form id="signInForm" class="form-inline">
		<input id="em" type="email" class="input-small" placeholder="E-mail">
		<input id="p" type="password" class="input-small" placeholder="Пароль">
		<button type="button" class="btn btn-primary">Войти</button>
	</form>
	<form id="signOutForm" class="form-inline">
		<fieldset>
			<label id="display-name" class="control-label">
				% if u_name:
						${u_name}
				% endif
			</label>
			<button type="button" class="btn">Выйти</button>
		</fieldset>
	</form>
</div>
<div id="searchContainer">
	<span class="icon-collapse"></span>
	<div class="title"><span>Поиск</span></div>
	<form class="form-search">
		<fieldset>
			<input type="text" class="input-name" placeholder="Название">
			<input type="text" class="input-id" placeholder="ID">
		</fieldset>
	</form>
	<div id="searchResults">
		<ul>
			<li>Хлебозавод</li>
			<li>56-я городская больница</li>
			<li>Павелецкая набережная, 2</li>
			<li>Детский сад</li>
			<li>1-я Ситценабивная фабрика</li>
			<li>Дербеневская набережная</li>
			<li>Дербеневская улица</li>
			<li>Новоспасский мост</li>
			<li>Кожевническая улица</li>
			<li>Шлюзовая набережная - Дом Музыки</li>
			<li>Детская поликлиника № 18</li>
			<li>Шлюзовая набережная - Дом Музыки</li>
			<li>Метро "Павелецкая"</li>
			<li>Большой Строченовский переулок</li>
			<li>Большой Строченовский переулок</li>
			<li>Павелецкий вокзал</li>
		</ul>
	</div>
</div>
<div id="editorContainer">
	<span class="icon-collapse"></span>
	<div class="title"><span>Редактор</span></div>
	<div class="form-wrap">
		<form class="form-inline">
			<div class="group">
				<label class="control-label middle" for="name">Название</label>
				<input type="text" id="name" class="stand"/>
			</div>
			<div class="group">
				<label class="control-label middle" for="id">ID</label>
				<input type="text" id="id" class="stand"/>
			</div>
			<div class="group">
				<label class="control-label top" for="routes">Маршруты</label>
				<input name="tags" id="routes" value="21,58,93,45,66"/>
			</div>
			<div class="group">
				<label class="control-label" for="pavilion">Павильон</label>
				<select id="pavilion" class="stand">
					<option value="None">Нет</option>
					<option value="Small">Маленький</option>
					<option value="Big">Большой</option>
				</select>
			</div>
			<!--<div class="group">-->
			<!--<label class="control-label" for="kiosk">Киоск</label>-->
			<!--<input name="tags" id="kiosk"/>-->
			<!--</div>-->
			<div class="group">
				<label class="control-label" for="stop_type">Остановка</label>
				<select id="stop_type" class="stand">
					<option value="None">Обычная</option>
					<option value="Small">Только вход</option>
					<option value="Big">Только выход</option>
				</select>
			</div>
			<div class="group">
				<label class="control-label top" for="comment">Примечание</label>
				<textarea id="comment"></textarea>
			</div>
			<div class="group">
				<label class="control-label top" for="pan_link">Ссылка на панораму</label>
				<input type="text" id="pan_link" class="stand"/>
				<div class="link">
					<a id="pan_link_a" target="_blank"></a>
				</div>
			</div>
			<!--<div class="group">-->
			<!--<label class="control-label middle" for="check">Проверено</label>-->
			<!--<input type="checkbox" id="check"/>-->
			<!--</div>-->
			<button id="save" type="submit" class="btn">Сохранить</button>
		</form>
	</div>

</div>
</body>
</html>

