var maker = new NemoMaker({
	canvasId: 'nemo-create',
	width: 5,
	height: 5
});
var player = null;
var remainTime = parseInt($('#remain-time-input').val());

$('#btn-reset').on('click', function(e) {
	e.preventDefault();
	$('#invalid-alert').addClass('hide');
	Dialog.confirm({
		title: '다시 만들기',
		body: '작업한 내용이 사라집니다.<br>계속 하시겠습니까?',
		ok: function() {
			maker.reset();
		}
	});
});

$('#btn-leave').on('click', function(e) {
	e.preventDefault();
	Dialog.confirm({
		title: '나가기',
		body: '작업한 내용이 사라집니다.<br>계속 하시겠습니까?',
		ok: function() {
			window.history.back();
		}
	});
});

$('#btn-save').on('click', function(e) {
	e.preventDefault();
	if (remainTime > 0) {
		return;
	}
	var title = $('#title').val();
	if (!title || title.length == 0 || maker.quiz.length <= 0) {
		$('#invalid-alert').removeClass('hide');
		return;
	}

	Dialog.confirm({
		title: '네모네모로직 저장',
		body: '로직을 만들어 주셔서 감사합니다 :)<br>지금 저장하시겠습니까?<br>한번 저장되면 수정할 수 없습니다',
		ok: function() {
			$('#quiz-input').val(maker.quiz.join(','));
			$('#save-submit').submit();
		}
	});
});

$('#btn-play').on('click', function(e) {
	player = new NemoPlay({
		canvasId: 'pre-play',
		width: maker.width,
		height: maker.height,
		quiz: maker.quiz.slice()
	});
});

$('#size-select').on('change', function(e) {
	e.preventDefault();
	Dialog.confirm({
		title: '로직 사이즈 변경',
		body: '작업한 내용이 사라집니다.<br>계속 하시겠습니까?',
		ok: function() {
			var size = $('#size-select option:selected').val();
			maker = new NemoMaker({
				canvasId: 'nemo-create',
				width: size,
				height: size
			});
		}
	});
	
});

if (remainTime > 0) {
	var saveBtn = $('#btn-save');
	setInterval(function() {
		remainTime = Math.max(0, remainTime - 1000);
		if (remainTime > 0) {
			saveBtn.text(Math.round(remainTime / 1000) + '초 후 저장가능');
		}
		else {
			saveBtn.addClass('btn-success');
			saveBtn.text('저장');
		}
	}, 1000);
}

if (g_logined) {
	setInterval(function() {
		$.post('data.php', {request:'ping'});
	}, 60000);
}