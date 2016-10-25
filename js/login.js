$('#btn-signup').on('click', function(e) {
	var email = $('#email').val();
	var nickname = $('#nickname').val();
	var password = $('#password').val();

	console.log(email, nickname, password);
	e.preventDefault();
});