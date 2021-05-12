$(document).ready(function () {
	var lifx_app_token = localStorage.getItem('lifx_app_token');
	var light = 'all';

	$('#lifx_app_token').val(lifx_app_token);

	$('#save-token').click(function () {
		if ($('#lifx_app_token').val()) {
			localStorage.setItem('lifx_app_token', $('#lifx_app_token').val());
			lifx_app_token = localStorage.getItem('lifx_app_token');
			load_light();
		}
	});

	$('#delete-token').click(function () {
		localStorage.removeItem('lifx_app_token');
		lifx_app_token = localStorage.getItem('lifx_app_token');
		$('#lifx_app_token').val(lifx_app_token);
	});

	$('#toggle').click(function () {
		if (lifx_app_token) {
			$.ajax({
				method: 'POST',
				url: 'https://api.lifx.com/v1/lights/' + light + '/toggle',
				data: {
					'duration': $('#duration').val()
				},
				// beforeSend: function (xhr) {
				// 	xhr.setRequestHeader('Authorization', 'Bearer ' + lifx_app_token);
				// },
				headers: {
					'Authorization': 'Bearer ' + lifx_app_token
				}
			});
			// .done(function (msg) {
			// 	console.log(msg);
			// });
		} else {
			alert('LIFX personal access token is missing.');
		}
	});

	$('#toggle-0s').click(function () {
		$('#duration').val(0);
		$('#toggle').click();
	});

	$('#toggle-1s').click(function () {
		$('#duration').val(1);
		$('#toggle').click();
	});

	$('#toggle-5m').click(function () {
		$('#duration').val(60*5);
		$('#toggle').click();
	});

	$('#toggle-5mq').click(function () {
		$('#duration').val(60*5);
		$('#toggle').click();

		setTimeout(function() {
			// window.close();
			window.electron.quitApp();
		}, 500);
	});

	$('#brightness').on('input change', function () {
		if (lifx_app_token) {
			var brightness = $(this).val();
			$('#current-brightness').html( Math.round( brightness * 100 ) + '%' );
		} else {
			alert('LIFX personal access token is missing.');
		}
	});

	$('#brightness').on('change', function () {
		if (lifx_app_token) {
			var brightness = $(this).val();

			$.ajax({
				method: 'PUT',
				url: 'https://api.lifx.com/v1/lights/' + light + '/state',
				data: {
					'power': 'on',
					'brightness': brightness,
					'duration': '0',
					'fast': true
				},
				headers: {
					'Authorization': 'Bearer ' + lifx_app_token
				}
			});
		} else {
			alert('LIFX personal access token is missing.');
		}
	});

	function load_light() {
		if (lifx_app_token) {
			$.ajax({
				method: 'GET',
				url: 'https://api.lifx.com/v1/lights/all',
				headers: {
					'Authorization': 'Bearer ' + lifx_app_token
				}
			})
			.done(function (msg) {
				var brightness = msg[0]['brightness'];
				$('#brightness').val(brightness);
				$('#current-brightness').html( Math.round( brightness * 100 ) + '%' );

				light = 'id:' + msg[0]['id'];
			});
		} else {
			$('#current-brightness').html('');
		}
	}

	load_light();
});