$(document).ready(function () {
	var lifx_app_token = localStorage.getItem('lifx_app_token');
	var token_alert = $('.token-alert');
	var spinner_container = $('#spinner-container');
	var settings_link_container = $('#settings-link-container');
	var section_settings = $('#section-settings');
	var section_main = $('#section-main');
	var light = 'all';
	var state;

	if (lifx_app_token) {
		$('#lifx_app_token').val(lifx_app_token);
		load_light();
	} else {
		token_alert.show();
		settings_link_container.show();
		section_main.hide();
		$('.back-btn').hide();
	}

	$('#save-token').click(function () {
		if ($('#lifx_app_token').val()) {
			localStorage.setItem('lifx_app_token', $('#lifx_app_token').val());
			lifx_app_token = localStorage.getItem('lifx_app_token');
			token_alert.hide();
			section_settings.hide();
			$('.back-btn').show();
			load_light();
		}
	});

	$('#delete-token').click(function () {
		localStorage.removeItem('lifx_app_token');
		lifx_app_token = localStorage.getItem('lifx_app_token');
		$('#lifx_app_token').val(lifx_app_token);
		token_alert.show();
		$('.back-btn').hide();
	});

	$('.settings-link').click(function (event) {
		event.preventDefault();

		if (lifx_app_token && section_settings.is(':visible')) {
			section_settings.hide();
			section_main.show();
		} else {
			section_settings.show();
			section_main.hide();
		}
	});

	$('.back-btn').click(function () {
		section_settings.hide();
		section_main.show();
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
		}
	});

	$('#power-btn').click(function () {
		if (lifx_app_token) {
			var $this = $(this);

			$.ajax({
				method: 'PUT',
				url: 'https://api.lifx.com/v1/lights/' + light + '/state',
				data: {
					'power': state == 'off' ? 'on' : 'off',
					'duration': '0',
					'fast': true
				},
				headers: {
					'Authorization': 'Bearer ' + lifx_app_token
				}
			})
			.done(function (msg) {
				state = state == 'off' ? 'on' : 'off';
				$this.html( 'Turn ' + ( state == 'off' ? 'on' : 'off' ) );
			});
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
			window.electron.quitApp();
		}, 500);
	});

	$('#brightness').on('input change', function () {
		if (lifx_app_token) {
			var brightness = $(this).val();
			$('#current-brightness').html( Math.round( brightness * 100 ) + '%' );
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
		}
	});

	function load_light() {
		if (lifx_app_token) {
			spinner_container.show();

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
				state = msg[0]['power'];

				$('#power-btn').html( 'Turn ' + ( state == 'off' ? 'on' : 'off' ) );

				spinner_container.hide();
				settings_link_container.show();
				section_main.show();
			});
		}
	}
});