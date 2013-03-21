$(document).ready(function () {
	$('#export').off('click').on('click', function () {
		$('#status').attr('class', 'waiting');
		var params = $('#export_form').serializeArray();
		$('select, button').attr('disabled', 'disabled');
		$.ajax({
			url: document['url_root'] + 'export',
			type: 'post',
			data: params,
			dataType: 'json',
			success: function (data) {
				if (data.file) {
					$('#file').attr('href', document['url_root'] + 'static/export/' + data.file);
					$('#status').attr('class', 'finish');
					$('select, button').removeAttr('disabled');
				} else {
					alert('Извините, на сервере произошла ошибка');
					$('select, button').removeAttr('disabled');
				}
			}
		});
	});
});