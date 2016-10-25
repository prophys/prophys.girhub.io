var elapseTime = 0;
var finish = false;

function checkComplete() {
	if (this.squiz == null) return;
	if (this.correctCount != this.fillCount) return;

	var answerStr = this.answer.join(',').replace(/2/g, '0');
	var sanswer = md5(answerStr);
	if (sanswer != this.squiz) return;

	this.end = true;
	if (!this.solved) {
		this.solved = true;
	}

	loadGame(answerStr);
}

function loadGame(answer) {
	//게임을 로드한다.
	$.post('data.php', {request:'load_breakrecord_game', answer:answer || ''}, function(result) {
		if (result.record > 0) {
			elapseTime = result.record;
		}
		if (result.result && !result.complete) {
			result.canvasId = 'nemo-game';
			var game = new NemoPlay(result);
			game.checkComplete = checkComplete;

			$('#game-progress').text(result.play_count);

			var recordField = $('#record-field');
			setInterval(function() {
				if (finish)
					return;
				elapseTime = elapseTime + 0.01;
				recordField.text(elapseTime.toFixed(2));
			}, 10);
		}
		else {
			Dialog.alert({title: '기록깨기 게임', body: result.msg});
		}

		if (result.complete) {
			$('#nemo-game').html('<p class="text-center"><a href="/play_logic_breakrecord.php" class="btn btn-lg btn-primary">다시하기</a></p>');
			var recordField = $('#record-field');
			recordField.text(result.record);
			finish = true;
		}
	});
}

$('#btn-start-game').on('click', function(e) {
	$(e.currentTarget).remove();
	loadGame();
	e.preventDefault();
});