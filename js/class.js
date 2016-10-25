/*
* Javascript Template Engine by lsk
*/
function Template(funcStr) {
	this.PATTERN_FIND_HTML 	= /<\s*(\S+)(\s[^>]*)?>[\s\S]*<\s*\/\1\s*>/g;
	this.funcStr = funcStr;
	this.init();
}
Template.prototype = {
	init: function() {
		var ret = this.funcStr.match(this.PATTERN_FIND_HTML);
		if (ret != null && ret.length > 0) {
			this.template = ret[0];
		}
		else {
			console.log(ret);
			throw '[Template:init] invalid template string. ' + ret;
		}
	},
	setValue: function(data) {
		var ret = this.template;
		for(var key in data) {
			ret = ret.replace(new RegExp('\\[\\[' + key + '\\]\\]', 'g'), data[key]);
		}
		return ret;
	}
};

/*
* Dialog impl
*/
function DialogImpl() {
	this.templs = {};
	this.setTemplates(this.templs);
}
DialogImpl.prototype = {
	confirm: function(args) {
		var title = args.title || '',
			body = args.body || args.message || args.msg || '',
			self = this;

		if (!this.confirmDialog) {
			this.confirmDialog 				= $(new Template(this.templs.confirm()).template);
			this.confirmDialog.titleDom 	= this.confirmDialog.find('#confirm-modal-title');
			this.confirmDialog.bodyDom 		= this.confirmDialog.find('#confirm-modal-body');
			this.confirmDialog.btnOkDom 	= this.confirmDialog.find('#btn-ok');
			this.confirmDialog.btnCancelDom = this.confirmDialog.find('#btn-cancel');
			$(document.body).append(this.confirmDialog);
			this.confirmDialog.draggable({ handle: '.modal-header' });
		}

		this.confirmDialog.titleDom.text(title);
		this.confirmDialog.bodyDom.html(body);
		this.confirmDialog.modal();
		// this.confirmDialog.css("top", $(window).scrollTop() + 30);

		if (args.ok != null) {
			this.confirmDialog.btnOkDom.on('click', function() {
				args.ok();
				self.confirmDialog.btnOkDom.off();
			});
		}

		if (args.cancel != null) {
			this.confirmDialog.btnCancelDom.on('click', function() {
				args.Cancel();
				self.confirmDialog.btnCancelDom.off();
			});
		}
	},
	alert: function(args) {
		var title = args.title || '',
			body = args.body || args.message || args.msg || '';

		if (!this.alertDialog) {
			this.alertDialog 			= $(new Template(this.templs.alert()).template);
			this.alertDialog.titleDom 	= this.alertDialog.find('#alert-modal-title');
			this.alertDialog.bodyDom 	= this.alertDialog.find('#alert-modal-body');
			$(document.body).append(this.alertDialog);
			this.alertDialog.draggable({ handle: '.modal-header' });
		}

		this.alertDialog.titleDom.text(title);
		this.alertDialog.bodyDom.html(body);
		this.alertDialog.modal();
		// this.alertDialog.css("top", $(window).scrollTop() + 30);
	},
	setTemplates: function(holder) {
		holder.confirm = function() {
			return '<div class="modal fade" id="nemo-confirm-dialog" role="dialog">' + 
	'<div class="modal-dialog modal-sm">' +
		'<div class="modal-content"> ' +
			'<div class="modal-header"> ' +
				'<button type="button" class="close" data-dismiss="modal">&times;</button> ' +
				'<h4 id="confirm-modal-title" class="modal-title"></h4> ' +
			'</div> ' +
			'<div id="confirm-modal-body" class="modal-body"> ' +
			'</div> ' +
			'<div class="modal-footer"> ' +
				'<button id="btn-ok" type="button" class="btn btn-success" data-dismiss="modal">예</button> ' +
				'<button id="btn-cancel" type="button" class="btn btn-default" data-dismiss="modal">아니오</button> ' +
			'</div> ' +
		'</div> ' +
	'</div> ' +
'</div>  ';
		};

		holder.alert = function() {
			return '<div class="modal fade" id="nemo-alert-dialog" role="dialog"> ' +
	'<div class="modal-dialog modal-sm"> ' +
		'<div class="modal-content"> ' +
			'<div class="modal-header"> ' +
				'<button type="button" class="close" data-dismiss="modal">&times;</button> ' +
				'<h4 id="alert-modal-title" class="modal-title"></h4> ' +
			'</div> ' +
			'<div id="alert-modal-body" class="modal-body"> ' +
			'</div> ' +
			'<div class="modal-footer"> ' +
				'<button type="button" class="btn btn-default" data-dismiss="modal">닫기</button> ' +
			'</div> ' +
		'</div> ' +
	'</div> ' +
'</div>	';
		};
	}
};
var Dialog = new DialogImpl();