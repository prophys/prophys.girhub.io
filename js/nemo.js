/*
* 네모네모 로직 플레이
*/
function NemoPlay(args) {
	if (args != null) this.initialize(args);
}
NemoPlay.prototype = {
	initialize: function(args) {
		// quiz vars initialize
		args = args || {};
		this.correctCount = args.count || args.correctCount;
		this.fillCount = 0;
		this.width = parseInt(args.width);
		this.height = parseInt(args.height);
		this.answer = args.answer || new Array(this.width*this.height);
		for (var i=0;i<this.answer.length; ++i) {
			if (this.answer[i]) {
				this.answer[i] = parseInt(this.answer[i]);
				if (this.answer[i] == 1)
					this.fillCount++;
			}
			else {
				this.answer[i] = 0;
			}
		}
		this.verticalHints = args.vhints;
		this.horizontalHints = args.hhints;
		this.quiz = args.quiz;
		this.squiz = args.squiz;

		// for logics
		this.cachedBox = {};

		// call initalize funcs
		if (this.verticalHints == null || this.quiz != null) {
			this.initHint(args);
		}
		this.initCanvas(args);
		this.draw(args);
		this.bind();

		this.currentLineDoms = this.canvas.find('.nemo-curlineable');
		this.hHintDomHash = {};
		this.vHintDomHash = {};
	},
	initHint: function(args) {
		var w, h, idx, connected, num, numTotal;
		//vertical hints
		this.verticalHints = [];
		for(w=0; w<this.width; ++w) {
			this.verticalHints[w] = [];
			connected = false;
			num = 0;
			numTotal = 0;
			for(h=0; h<this.height; ++h) {
				idx = this.getIdx(w, h);
				if (this.quiz[idx] == 0) {
					if (num > 0) this.verticalHints[w].push(num);
					connected = false;
					num = 0;
				}
				else {
					connected = true;
					++num;
					++numTotal;
				}
			}
			if (num > 0) this.verticalHints[w].push(num);
			if (numTotal == 0) this.verticalHints[w].push(0);
		}
		//horiz hints
		this.horizontalHints = [];
		for(h=0; h<this.height; ++h) {
			this.horizontalHints[h] = [];
			connected = false;
			num = 0;
			numTotal = 0;
			for(w=0; w<this.width; ++w) {
				idx = this.getIdx(w, h);
				if (this.quiz[idx] == 0) {
					if (num > 0) this.horizontalHints[h].push(num);
					connected = false;
					num = 0;
				}
				else {
					connected = true;
					++num;
					++numTotal;
				}
			}
			if (num > 0) this.horizontalHints[h].push(num);
			if (numTotal == 0) this.horizontalHints[h].push(0);
		}
	},
	initCanvas: function(args) {
		var canvasId = (args.canvasId || 'nemo-' + Date.now());
		this.canvas = null;
		if ($('#'+canvasId).length) {
			this.canvas = $('#'+canvasId);
		}
		else {
			this.canvas = $('<div></div>');
			this.canvas.attr('id', canvasId);
			$(document.body).append(this.canvas);
		}
		this.canvas.empty();
	},
	draw: function(args) {
		var i, idx, w, h, tr, td; 
		var table = $('<table class="nemo"></table>');
		var verticalHintTr = $('<tr class="nemo-v-hint"></tr>');
		table.append(verticalHintTr);
		
		var vHintsWithTag, hHintsWithTag;
		for (w=0; w<this.width+1; ++w) {
			if (w==0) {
				td = '<td></td>';
			}
			else {
				vHintsWithTag = this.verticalHints[w-1].slice();
				for (i=0; i<vHintsWithTag.length; ++i) {
					vHintsWithTag[i] = '<span class="hint-num">' + vHintsWithTag[i] + '</span>';
				}

				td = $('<td></td>');
				td.attr('id', 'nemo-v-hint-'+(w-1));
				td.append(vHintsWithTag.join('<br>'));
				td.addClass('nemo-box-b-guard nemo-curlineable');
			}
			verticalHintTr.append(td);
		}

		for (h=0; h<this.height; ++h) {
			tr = $('<tr></tr>');
			table.append(tr);
			for (w=0; w<this.width+1; ++w) {
				hHintsWithTag = this.horizontalHints[h].slice();
				for (i=0; i<hHintsWithTag.length; ++i) {
					hHintsWithTag[i] = '<span class="hint-num">' + hHintsWithTag[i] + '</span>';
				}

				if (w == 0) {
					td = $('<td class="nemo-h-hint"></td>');
					td.attr('id', 'nemo-h-hint-'+h);
					td.addClass('nemo-box-r-guard nemo-curlineable');
					td.append(hHintsWithTag.join(' '));
					tr.append(td);
				}
				else {
					idx = this.getIdx(w-1, h);
					td = $('<td class="nemo-box nemo-curlineable" id="nemo-box-'+ idx +'">' + idx + '</td>');
					if (w%5 == 0) {
						td.addClass('nemo-box-r-guard');
					}
					if ((h+1)%5 == 0) {
						td.addClass('nemo-box-b-guard');
					}
					this.cachedBox[idx] = td;
					this.updateBox(idx, td);
					tr.append(td);
				}
			}
		}

		// append to canvas 
		this.canvas.append(table);

		// zoom
		if (this.width == 5 && this.height == 5) {
			table.addClass('nemo-zoom-125');
		}

		// offset hint width
		var twidth = table.find('tr').outerWidth(true);
		var hwidth = table.find('.nemo-h-hint').outerWidth(false);
		var gwidth = twidth-hwidth;
		table.css('margin-left', -(hwidth + gwidth/2)+'px');

		// prevent context menu
		table.on('contextmenu', this.canvas, function(e) { return false; });
	},
	getIdx: function(w, h) {
		return w + this.width*h;
	},
	getPos: function(idx) {
		return {w:idx%this.width, h:Math.floor(idx/this.width), idx:idx};
	},
	checkComplete: function() {
	},
	fill: function(idx) {
		idx = parseInt(idx);
		if (this.answer[idx] == 1) return;
		this.answer[idx] = 1;
		this.fillCount++;
		this.updateBox(idx);
		this.checkComplete();
	},
	empty: function(idx) {
		idx = parseInt(idx);
		if (this.answer[idx] == 0) return;
		if (this.answer[idx] == 1)
			this.fillCount--;
		this.answer[idx] = 0;
		this.updateBox(idx);
		this.checkComplete();
	},
	mark: function(idx) {
		idx = parseInt(idx);
		if (this.answer[idx] == 2) return;
		if (this.answer[idx] == 1)
			this.fillCount--;
		this.answer[idx] = 2;
		this.updateBox(idx);
		this.checkComplete();
	},
	updateBox: function(idx, target) {
		var targetDom = target || this.cachedBox[idx];
		switch (this.answer[idx]) {
			case 0:
				targetDom.removeClass('nemo-box-filled');
				targetDom.removeClass('nemo-box-mark');
				break;
			case 1:
				targetDom.removeClass('nemo-box-mark');
				targetDom.addClass('nemo-box-filled');
				break;
			case 2:
				targetDom.removeClass('nemo-box-filled');
				targetDom.addClass('nemo-box-mark');
				break;
		}
	},
	leftBtnClick: function(pos, isDrag) {
		var curAnswer = this.answer[pos.idx];
		switch (curAnswer) {
			case 0:
				this.fill(pos.idx);
				break;
			case 1:
				this.mark(pos.idx);
				break;
			case 2:
				this.empty(pos.idx);
				break;
		}
	},
	rightBtnClick: function(pos, isDrag) {
		var curAnswer = this.answer[pos.idx];
		if (isDrag) {
			if (curAnswer == 0)
				this.mark(pos.idx);
			else if (curAnswer == 1) {
				this.empty(pos.idx);
			}
		}
		else {
			if (curAnswer == 1)
				this.empty(pos.idx);
			else if (curAnswer == 0) {
				this.mark(pos.idx);
			}
		}
	},
	bind: function() {
		var self = this;
		var isMouseDown, isDrag, pos, prePos, downE, downPos;
		var handled = {};
		var boxes = this.canvas.find('.nemo-box');
		function handle(pos, which, isDrag) {
			if (self.end) return;
			if (handled[pos.idx]) return;
			handled[pos.idx] = true;
			switch (which) {
				case 1:
					self.leftBtnClick(pos, isDrag);
					return;
				case 3:
					self.rightBtnClick(pos, isDrag);
					return;
			}
		}
		boxes.on('mousedown', function(e) {
			downE = e;
			downPos = self.getPos($(e.currentTarget).text());
			isMouseDown = true;
			e.preventDefault();
		});
		function mouseUp(e) {
			if (!isDrag) {
				// click
				pos = self.getPos($(e.currentTarget).text());
				handle(pos, e.which, false);
			}
			isMouseDown = false;
			isDrag = false;
			pos = null;
			prePos = null;
			handled = {};
			e.preventDefault();
		}
		boxes.on('mouseup', mouseUp);
		boxes.on('mousemove', function(e) {
			if (!isMouseDown) return;
			if (!self.isDrag(e, downE)) {
				return;
			} else {
				isDrag = true;
			}
			pos = self.getPos($(e.currentTarget).text());

			//인접한지 확인한다.
			//같은 라인이 아니면 리턴
			if (prePos) {
				if (handled['isVLine'] == null) {
					var xIng = (pos.h == prePos.h) && (Math.abs(pos.w - prePos.w) == 1);
					var yIng = (pos.w == prePos.w) && (Math.abs(pos.h - prePos.h) == 1);
					if (xIng || yIng) {} else return;
					handled['isVLine'] = yIng;
				}
				else {
					if (handled['isVLine']) {
						pos.w = downPos.w;
					}
					else {
						pos.h = downPos.h;
					}
					pos.idx = self.getIdx(pos.w, pos.h);
				}
			}

			handle(pos, downE.which, true);
			handle(downPos, downE.which, true);
			prePos = pos;
			e.preventDefault();
		});

		this.canvas.find('.nemo').mouseleave(function(e) {
			self.currentLineDoms.removeClass('nemo-current-line');
			isDrag = true;
			mouseUp(e);
		});

		boxes.on('mouseover', function(e) {
			if (isMouseDown) return;
			self.currentLineDoms.removeClass('nemo-current-line');

			var idx, pos, i;
			pos = self.getPos($(e.currentTarget).text());

			self.hHintDomHash[pos.h] = self.hHintDomHash[pos.h] || self.canvas.find('#nemo-h-hint-' + pos.h);
			self.vHintDomHash[pos.w] = self.vHintDomHash[pos.w] || self.canvas.find('#nemo-v-hint-' + pos.w);
			self.hHintDomHash[pos.h].addClass('nemo-current-line');
			self.vHintDomHash[pos.w].addClass('nemo-current-line');

			for(i=0; i<self.width; ++i) {
				idx = self.getIdx(i, pos.h);
				self.cachedBox[idx].addClass('nemo-current-line');
			}

			for(i=0; i<self.height; ++i) {
				idx = self.getIdx(pos.w, i);
				self.cachedBox[idx].addClass('nemo-current-line');
			}
		});

		this.canvas.find('.hint-num').on('click', function(e) {
			var target = $(e.currentTarget);
			if (target.hasClass('hint-num-del')) {
				target.removeClass('hint-num-del');
			}
			else {
				target.addClass('hint-num-del');
			}
		});
	},
	isDrag: function(e1, e2) {
		return (e1.clientX - e2.clientX)*(e1.clientX - e2.clientX) + (e1.clientY - e2.clientY)*(e1.clientY - e2.clientY) > 10;
	}
}

/*
* 네모네모 메이커
*/
function NemoMaker(args) {
	// vars
	args = args || {};
	this.width = args.width;
	this.height = args.height;
	this.quiz = new Array(this.width * this.height);
	for(var i=0;i<this.quiz.length; ++i) {
		this.quiz[i] = 0;
	}

	this.cachedBox = {};

	// call initalize funcs
	this.initCanvas(args);
	this.draw(args);
	this.bind();
}
NemoMaker.prototype = {
	initCanvas: NemoPlay.prototype.initCanvas,
	draw: function(args) {
		var idx, w, h, tr, td; 
		var table = $('<table class="nemo"></table>');
		for (h=0; h<this.height; ++h) {
			tr = $('<tr></tr>');
			table.append(tr);
			for (w=0; w<this.width; ++w) {
				idx = this.getIdx(w, h);
				td = $('<td class="nemo-box" id="nemo-box-' + idx + '">' + idx + '</td>');
				if ((w+1)%5 == 0) {
					td.addClass('nemo-box-r-guard');
				}
				if ((h+1)%5 == 0) {
					td.addClass('nemo-box-b-guard');
				}
				tr.append(td);
				this.cachedBox[idx] = td;
			}
		}

		// append
		this.canvas.append(table);

		// offset hint width
		var twidth = table.find('tr').outerWidth(true);
		var hwidth = table.find('.nemo-h-hint').outerWidth(false);
		var gwidth = twidth-hwidth;
		table.css('margin-left', -(hwidth + gwidth/2)+'px');

		// prevent context menu
		table.on('contextmenu', this.canvas, function(e) { return false; });
		if (this.width == 5 && this.height == 5) {
			table.addClass('nemo-zoom-125');
		}
	},
	getIdx: NemoPlay.prototype.getIdx,
	getPos: NemoPlay.prototype.getPos,
	reset: function() {
		for (var i=0; i<this.quiz.length; ++i) {
			this.quiz[i] = 0;
		}
		this.canvas.find('.nemo-box').removeClass('nemo-box-filled');
	},
	leftBtnClick: function(pos, isDrag) {
		var targetDom = this.cachedBox[pos.idx];
		if (!targetDom.hasClass('nemo-box-filled')) {
			targetDom.addClass('nemo-box-filled');
			this.quiz[parseInt(pos.idx)] = 1;
		}
	},
	rightBtnClick: function(pos, isDrag) {
		var targetDom = this.cachedBox[pos.idx];
		targetDom.removeClass('nemo-box-filled');
		this.quiz[parseInt(pos.idx)] = 0;
	},
	bind: function() {
		var self = this;
		var isMouseDown, isDrag, pos, prePos, downE, downPos;
		var handled = {};
		var boxes = this.canvas.find('.nemo-box');
		function handle(pos, which, isDrag) {
			if (self.end) return;
			if (handled[pos.idx]) return;
			handled[pos.idx] = true;
			switch (which) {
				case 1:
					self.leftBtnClick(pos, isDrag);
					return;
				case 3:
					self.rightBtnClick(pos, isDrag);
					return;
			}
		}
		boxes.on('mousedown', function(e) {
			downE = e;
			downPos = self.getPos($(e.currentTarget).text());
			isMouseDown = true;
			e.preventDefault();
		});
		function mouseUp(e) {
			if (!isDrag) {
				// click
				pos = self.getPos($(e.currentTarget).text());
				handle(pos, e.which, false);
			}
			isMouseDown = false;
			isDrag = false;
			pos = null;
			prePos = null;
			handled = {};
			e.preventDefault();
		}
		boxes.on('mouseup', mouseUp);
		boxes.on('mousemove', function(e) {
			if (!isMouseDown) return;
			if (!self.isDrag(e, downE)) {
				return;
			} else {
				isDrag = true;
			}
			pos = self.getPos($(e.currentTarget).text());

			handle(pos, downE.which, true);
			prePos = pos;
			e.preventDefault();
		});
		this.canvas.find('.nemo').mouseleave(function(e) {
			isDrag = true;
			mouseUp(e);
		});
	},
	isDrag: NemoPlay.prototype.isDrag 
}