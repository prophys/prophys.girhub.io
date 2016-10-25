var game = null;

function checkComplete() {
	if (this.end) {
		return;
	}
	for(var i=0, j=this.answer.length; i<j; ++i) {
		if (this.answer[i] == 2 && this.quiz[i] == 0) {
			continue;
		}
		if (this.answer[i] != this.quiz[i]) {
			return;
		}
	}
	alert('완료! 잘하셨습니다!');
	this.end = true;
	if (!this.solved) {
		this.solved = true;
		solved = true;
	}
}

// step 1
game = new NemoPlay({
	canvasId 	: 'tutorial-step-1'
	,quiz 		: [
		0, 1, 1, 1, 0
	]
	,width		: 5
	,height		: 1
});
game.checkComplete = checkComplete;

// step 2
game = new NemoPlay({
	canvasId 	: 'tutorial-step-2'
	,quiz 		: [
		0, 1, 1, 1, 0
	]
	,width		: 1
	,height		: 5
});
game.checkComplete = checkComplete;

// step 3
game = new NemoPlay({
	canvasId 	: 'tutorial-step-3'
	,quiz 		: [
		1, 1, 0, 1, 0
	]
	,width		: 5
	,height		: 1
});
game.checkComplete = checkComplete;

// step 4
game = new NemoPlay({
	canvasId 	: 'tutorial-step-4'
	,quiz 		: [
		0, 1, 1, 0, 1
	]
	,width		: 1
	,height		: 5
});
game.checkComplete = checkComplete;

// step 5
game = new NemoPlay({
	canvasId 	: 'tutorial-step-5'
	,quiz 		: [
		0, 1, 0, 1, 0,
		1, 1, 1, 1, 1,
		1, 1, 1, 1, 1,
		0, 1, 1, 1, 0,
		0, 0, 1, 0, 0
	]
	,width		: 5
	,height		: 5
});
game.checkComplete = checkComplete;