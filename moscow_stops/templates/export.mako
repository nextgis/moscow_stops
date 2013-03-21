<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/html" xmlns="http://www.w3.org/1999/html">
<head>
	<meta charset="utf-8">
	<title>Экспорт данных</title>
	<meta name="description" content="">
	<meta name="viewport" content="width=device-width">

	<link rel="stylesheet" href="${request.static_url('moscow_stops:static/build/sm.min.css')}" />

	<style type="text/css">
		#status span {
			color: #ff5d5a;
		}

		#status span,
		#status a#file {
			display: none;
		}
		#status.waiting span,
		#status.finish a#file {
			display: inline;
		}
	</style>

	<script type="text/javascript">
		document['url_root'] = '${request.route_url('home')}';
	</script>
	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
	<script type="text/javascript" src="${request.static_url('moscow_stops:static/js/pages/export.js')}"></script>
</head>
<body style="text-align: center;">
<h2>Экспорт данных</h2>

<p>Выберите условия фильтрации данных:</p>

<form id="export_form" style="width: 210px; margin: 0 auto; text-align: left;" method="POST">
	<div class="control-group">
		<label class="control-label" for="condition_check_type_1">Проверка на</br>местности</label>
		<select id="condition_check_type_1" name="condition_check_type_1" class="stand">
			<option value="None"></option>
			% for check_type in check_types:
					<option value="${check_type.id}">${check_type.name}</option>
			% endfor
		</select>
		<select id="condition_check_type_2" name="condition_check_type_2" class="stand">
			<option value="None"></option>
			% for check_type in check_types:
					<option value="${check_type.id}">${check_type.name}</option>
			% endfor
		</select>
	</div>
	<div class="control-group">
		<label class="control-label" for="format">Формат экспорта:</label>
		<select id="format" name="format" class="stand">
			<option value="yma">Яндекс.Карты для Андроида</option>
##			<option value="xml_cat">XML categories</option>
		</select>
	</div>
	<div class="control-group" style="text-align: right;">
		<div class="controls">
			<button id="export" type="button" class="btn btn-success">Экспорт</button>
		</div>
	</div>
</form>
<div id="status">
	<span>Файл создается...</span>
	<a id="file">Скачать файл</a>
</div>
</body>
</html>

