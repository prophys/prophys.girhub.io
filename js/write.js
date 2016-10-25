$('#btn-save').on('click', function(e) {
	var body = $('#body-input').val();
	body = body.replace(/(?:\r\n|\r|\n)/g, '<br>');
	$('#body').val(body);
});