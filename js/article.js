$('#del-btn').on('click', function(e) {
	if (confirm("해당 글을 삭제합니다")) {
	}
	else {
		e.preventDefault();
	}
});

$('#btn-comment').on('click', function(e) {
	var body = $('#comment_input').val();
	body = body.replace(/(?:\r\n|\r|\n)/g, '<br>');
	$('#comment').val(body);
});

$('.btn_del_cmt').on('click', function(e) {

	if (confirm('댓글을 삭제하시겠습니까?')) {

	}
	else {
		e.preventDefault();
	}
});