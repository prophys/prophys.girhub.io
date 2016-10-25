var play = null;
var quizDataJson = decodeURIComponent($('#data-holder').val());
var saveMap = {};
quizData = JSON.parse(quizDataJson);
quizData.canvasId  = 'nemo-game';
var saveListUpdated = false;
var solved = false;

//새로운 게임
function newGame(quizData) {
	var game = new NemoPlay(quizData);
	game.checkComplete = checkComplete;
	return game;
}

// 완료 체크
function checkComplete() {
	if (this.squiz == null) return;
	if (this.correctCount != this.fillCount) return;

	var answerStr = this.answer.join(',').replace(/2/g, '0');
	var sanswer = md5(answerStr);
	if (sanswer != this.squiz) return;

	if (g_logined) {
		Dialog.alert({title: 'Complete!', body: '완성했습니다! 즐거우셨다면 추천해주세요!<br><a id="thumb-up-comp" class="btn btn-default btn-sm" type="button"><span class="glyphicon glyphicon-hand-up color-blue-2">추천하기</span></a>'});
		$('#thumb-up-comp').on('click', thumb.bind(null, 'yes'));
	}
	else {
		Dialog.alert({title: 'Complete!', body: '즐거우셨나요?<br> 회원 가입 하시면 도감을 모을 수 있습니다!'});
	}

	if (!solved) {
		$.post('data.php', {request:'clear_game', quid:quizData.quid, answer:answerStr});
	}

	this.end = true;
	if (!this.solved) {
		this.solved = true;
		solved = true;
	}
}

var saveListDom = $('#save-list');
function loadSaveList(quizData) {
	if (saveListDom.length) {
		$.post('data.php', {request: 'load_save_list', quid:quizData.quid}, function(result) {
			if (result.result) {
				if (result.rows && result.rows.length > 0) {
					updateSaveList(result.rows);
				}
			}
			else {
				alert(result.msg);
			}
		});
	}
}

/*
* 코멘트
*/
var commentPage = 0;
function $TEMPLATE_COMMENT() {
	return '<div class="panel panel-default"> ' +
		'<div class="panel-heading"> ' +
			'<strong>[[name]]</strong> ' +
		'</div> ' +
		'<div class="panel-body"> ' +
			'[[comment]] ' +
		'</div> ' +
	'</div> ';
}

var commentTemplate = new Template($TEMPLATE_COMMENT());
function getComments(e) {
	if (e) e.preventDefault();
	var container = $('#comment-list-container');
	var quid = quizData.quid;
	$.post('data.php', {request: 'get_comments', quid:quid, page:commentPage}, function(result) {
		if (result.result) {
			var list = result.list;
			if (list.length > 0) {
				for(var i=0; i<list.length; ++i) {
					var item = $(commentTemplate.setValue(list[i]));
					container.append(item);
				}
				commentPage++;
			}
			if (list.length == 10)
				$('#more').show();
			else
				$('#more').hide();
		}
		else {
			alert(result.msg);
		}
	});
}

getComments();
$('#btn-more').on('click', getComments);
$('#btn-save-comment').on('click', function(e) {
	e.preventDefault();
	var comment = $('#comment-input').val() || '';
	if (comment.length < 4) {
		Dialog.alert({
			title: '코멘트 에러',
			body: '코멘트는 4글자 이상 써주세요'
		});
		return;
	}

	$.post('data.php', {request: 'save_comment', quid:quizData.quid, comment:comment}, function(result) {
		if (result.result) {
			var item = $(commentTemplate.setValue({name: USER_NAME, comment: comment}));
			$('#comment-list-container').prepend(item);

			$('#comment-input').val('');
		}
		else {
			alert(result.msg);
		}
	});
});

/*
* 저장 파일 리스트 업데이트
*/
function $TEMPLATE_SAVE_LIST() {
	return '<tr> ' +
		'<td>[[save_id]]</td> ' +
		'<td>[[reg_date]]</td> ' +
		'<td> ' +
			'<a href="[[save_id]]" class="btn-load">불러오기</a> ' +
			 '/ ' +
			'<a href="[[save_id]]" class="btn-delete">삭제</a> ' +
		'</td> ' +
	'</tr> ';
}
var saveListTemplate = new Template($TEMPLATE_SAVE_LIST());
function updateSaveList(rows) {
	if (!saveListUpdated) {
		saveListDom.empty();
		saveListUpdated = true;
	}
	var saveCon = $('#save-list');
	for(var i=0; i<rows.length; ++i) {
		rows[i].item_index = i + 1;
		var item = $(saveListTemplate.setValue(rows[i]));
		item.find('.btn-load').on('click', loadSaveData);
		item.find('.btn-delete').on('click', deleteSaveItem);
		saveCon.prepend(item);

		// cache data
		saveMap[rows[i].save_id] = rows[i];
	}
}

/*
* 저장 아이템 불러오기
*/
function loadSaveData(e) {
	var self = $(this);
	e.preventDefault();
	Dialog.confirm({
		title: '게임 불러오기',
		body: '저장한 게임을 불러옵니다.<br>진행중인 내용은 사라집니다.<br>계속하시겠습니까?',
		ok: function() {
			var saveId = self.attr('href');
			var saveData = saveMap[saveId];
			var data = {};
			for(var key in quizData) {
				data[key] = quizData[key];
			}
			data.answer = saveData.val.split(',');
			play = newGame(data);
		}
	});
}

// 저장 아이템 지우기
function deleteSaveItem(e) {
	var self = $(this);
	e.preventDefault();
	Dialog.confirm({
		title: '저장 파일 지우기',
		body: '저장 파일을 삭제합니다. 계속하시겠습니까?',
		ok: function() {
			var saveId = self.attr('href');
			$.post('data.php', {request:'del_quiz_progress', save_id:saveId}, function(result) {
				if (result.result) {
					delete saveMap[saveId];
					self.parent().parent().remove();
				}
				else {
					alert(result.msg);
				}
			}, 'json');
		}
	});
}

// 리셋
$('#btn-reset').on('click', function(e) {
	Dialog.confirm({
		title: '게임 다시하기',
		body: '게임을 다시 시작합니다. 계속하시겠습니까?',
		ok: function() {
			play = newGame(quizData);
		}
	})
});

// 스냅샷 저장 
$('#btn-save').on('click', function(e) {
	var val = play.answer.slice();

	var count = 0;
	for (var key in saveMap) {
		++count;
	}
	if (count >= 10) {
		Dialog.alert({title: '저장 실패', body: '10개 이상 저장할 수 없습니다.'});
		return;
	}

	$.post('data.php', {request:'save_quiz_progress', quid:quizData.quid, value:val.join(',')}, function(result) {
		if (result.result) {
			updateSaveList(result.rows);
			Dialog.alert({title: '저장 완료', body: '저장을 완료했습니다.<br>10개까지 저장할 수 있습니다.'});
		}
		else {
			alert(result.msg);
		}
	}, 'json');
});

// 다음 문제
$('#btn-next, #btn-prev').on('click', function(e) {
	e.preventDefault();
	var self = this;
	Dialog.confirm({
		title: '나가기',
		body: '목록으로 이동합니다. 계속하시겠습니까?',
		ok: function() {
			window.location = self.href;
		}
	});
});

// 랜덤
$('#btn-random').on('click', function(e) {
	e.preventDefault();
	var self = this;
	Dialog.confirm({
		title: '랜덤 로직',
		body: '완성하지 않은 로직으로 랜덤하게 이동합니다. 계속하시겠습니까?',
		ok: function() {
			$.post('data.php', {request: 'rand_logic'}, function(result) {
				if (result.result) {
					var quid = result.quid;
					if (quid > 0) {
						window.location = '/play_logic.php?quid=' + quid;
					}
					else {
						Dialog.alert({title: '모든 로직 완성', body: '모든 로직을 완성했습니다! 새롭게 업데이트 되는 로직을 기다려주세요!'});
					}
				}
				else {
					alert(result.msg);
				}
			});
		}
	});
});

//추천
function thumb(isUp, e) {
	e.preventDefault();
	$.post('data.php', {request: 'thumb_updown', quid:quizData.quid, is_up:isUp}, function(result) {
		if (result.result) {
			var targetDom = $(e.currentTarget).find('span');
			var prevVal = parseInt(targetDom.text()) || 0;
			prevVal = isUp == 'yes' ? prevVal + 1 : prevVal + 1;
			targetDom.text(prevVal);

			var msg = null;
			if (isUp == 'yes') {
				msg = '로직을 추천했습니다.';
			}
			else {
				msg = '로직을 반대했습니다. 반대가 많은 로직은 자동으로 스팸처리 됩니다.';
			}
			Dialog.alert({title: '추천 완료', body: msg});
		}
		else {
			Dialog.alert({title: '추천', body: '이미 추천하셨습니다.'});
		}
	});
}
$('#thumb-up').on('click', thumb.bind(null, 'yes'));
$('#thumb-down').on('click', thumb.bind(null, 'no'));

play = newGame(quizData);
loadSaveList(quizData);

if (g_logined) {
	setInterval(function() {
		$.post('data.php', {request:'ping'});
	}, 60000);
}