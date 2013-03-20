<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/html" xmlns="http://www.w3.org/1999/html">
<head>
	<meta charset="utf-8">
	<title>Экспорт данных</title>
	<meta name="description" content="">
	<meta name="viewport" content="width=device-width">

		<link rel="stylesheet" href="${request.static_url('moscow_stops:static/css/bootstrap.min.css')}">
		<link rel="stylesheet" href="${request.static_url('moscow_stops:static/css/tagsinput/jquery.tagsinput.css')}">
		<link rel="stylesheet" href="${request.static_url('moscow_stops:static/css/main.css')}">
##		<link rel="stylesheet" href="${request.static_url('moscow_stops:static/build/sm.min.css')}" />
		</head>
<body style="text-align: center;">
<h2>Экспорт данных</h2>
<p>Выберите условия фильтрации данных:</p>

<form style="width: 210px; margin: 0 auto; text-align: left;">
	<div class="control-group">
		<label class="control-label" for="is_shelter">Крыша</label>
		<select id="is_shelter" class="stand" name="is_shelter">
			<option value="None"></option>
			<option value="true">Да</option>
			<option value="false">Нет</option>
		</select>
	</div>
	<div class="control-group">
		<label class="control-label" for="is_bench">Скамейка</label>
		<select id="is_bench" class="stand" name="is_bench">
			<option value="None"></option>
			<option value="true">Да</option>
			<option value="false">Нет</option>
		</select>
	</div>
	<div class="control-group">
		<label class="control-label" for="is_check">Проверка на</br>местности</label>
		<select id="is_check" name="is_check" class="stand">
				% for check_type in check_types:
					<option value="${check_type.id}">${check_type.name}</option>
				% endfor
		</select>
	</div>
	<div class="control-group">
		<label class="control-label" for="format">Формат экспорта:</label>
		<select id="format" name="format" class="stand">
			<option value="yma">Яндекс.Карты для Андроида</option>
			<option value="xml_cat">XML categories</option>
		</select>
	</div>
	<div class="control-group" style="text-align: right;">
		<div class="controls">
			<button id="save" type="button" class="btn btn-success">Экспорт</button>
		</div>
	</div>
</form>

</body>
</html>

