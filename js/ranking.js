$('.ranker-uid').on('click', function(e) {
	e.preventDefault();
	var self = $(this);
	var uid = self.attr('id');
	var name = self.text();

	$.post('data.php', {request:'get_point_log', uid:uid}, showPointDetail.bind(null, name));
});

function $TEMPLATE_POINT_LOG_ITEM() {
	return '<li>[[log]] +[[point]]</li>';
}

var pointItemTemplate = new Template($TEMPLATE_POINT_LOG_ITEM()); 
function showPointDetail(name, result) {
	if (!result['result']) return;

	var listCon = $('<ul></ul>');

	var list = result.data;
	var item = null;
	for(var i=0; i<list.length; ++i) {
		item = $(pointItemTemplate.setValue(list[i]));
		listCon.append(item);
	}

	Dialog.alert({
		title: name + '의 포인트 현황',
		body: listCon
	});
}