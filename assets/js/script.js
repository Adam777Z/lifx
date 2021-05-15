$(document).ready(function () {
	var lifx_app_token = localStorage.getItem('lifx_app_token');
	var token_alert = $('.token-alert');
	var spinner_container = $('#spinner-container');
	var settings_link_container = $('#settings-link-container');
	var section_settings = $('#section-settings');
	var section_main = $('#section-main');
	var light = 'all';
	var state;
	var duration = 0;

	if (lifx_app_token) {
		$('#lifx_app_token').val(lifx_app_token);
		load_light();
	} else {
		token_alert.show();
		settings_link_container.show();
		section_main.hide();
		$('#delete-token').hide();
		$('.back-btn').hide();

		if (
			! localStorage.getItem('lifx_app_duration_s')
			&&
			! localStorage.getItem('lifx_app_duration_m')
			&&
			! localStorage.getItem('lifx_app_duration_h')
			&&
			! localStorage.getItem('lifx_app_quit')
			&&
			! localStorage.getItem('lifx_app_lock')
		) {
			$('#delete-all-settings').hide();
		}
	}

	if (localStorage.getItem('lifx_app_duration_s')) {
		$('#duration-s').val(localStorage.getItem('lifx_app_duration_s'));
	}

	if (localStorage.getItem('lifx_app_duration_m')) {
		$('#duration-m').val(localStorage.getItem('lifx_app_duration_m'));
	}

	if (localStorage.getItem('lifx_app_duration_h')) {
		$('#duration-h').val(localStorage.getItem('lifx_app_duration_h'));
	}

	set_duration();

	if (localStorage.getItem('lifx_app_quit')) {
		$('#quit').prop('checked', (localStorage.getItem('lifx_app_quit') == 'true'));
	}

	if (localStorage.getItem('lifx_app_lock')) {
		$('#lock').prop('checked', (localStorage.getItem('lifx_app_lock') == 'true'));
	}

	if (window.electron) {
		$('.electron-only').show();
	}

	$('.settings-link').click(function (event) {
		event.preventDefault();

		if (lifx_app_token && section_settings.is(':visible')) {
			section_settings.hide();
			section_main.show();
		} else {
			section_settings.show();
			section_main.hide();

			if (lifx_app_token) {
				$('#delete-token').show();
			}

			if (
				localStorage.getItem('lifx_app_duration_s')
				||
				localStorage.getItem('lifx_app_duration_m')
				||
				localStorage.getItem('lifx_app_duration_h')
				||
				localStorage.getItem('lifx_app_quit')
				||
				localStorage.getItem('lifx_app_lock')
			) {
				$('#delete-all-settings').show();
			}
		}
	});

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
		$('#delete-token').hide();
		$('.back-btn').hide();
	});

	$('#delete-all-settings').click(function () {
		$('#delete-token').click();

		localStorage.removeItem('lifx_app_duration_s');
		localStorage.removeItem('lifx_app_duration_m');
		localStorage.removeItem('lifx_app_duration_h');
		$('#duration-s').val(0);
		$('#duration-m').val(0);
		$('#duration-h').val(0);

		localStorage.removeItem('lifx_app_quit');
		$('#quit').prop('checked', false);

		localStorage.removeItem('lifx_app_lock');
		$('#lock').prop('checked', false);

		$('#delete-all-settings').hide();
	});

	$('.back-btn').click(function () {
		section_settings.hide();
		section_main.show();
	});

	$('#power-switch').change(function () {
		if (lifx_app_token) {
			$.ajax({
				method: 'PUT',
				url: 'https://api.lifx.com/v1/lights/' + light + '/state',
				data: {
					'power': state == 'off' ? 'on' : 'off',
					'duration': 0
				},
				headers: {
					'Authorization': 'Bearer ' + lifx_app_token
				}
			})
			.done(function (msg) {
				if (!jQuery.isEmptyObject(msg)) {
					state = state == 'off' ? 'on' : 'off';
					update_state_on_buttons();
				} else {
					alert('Error.');
					$('#power-switch').prop('checked', state == 'on');
				}
			});
		}
	});

	$('#fade-btn').click(function () {
		if (lifx_app_token) {
			$.ajax({
				method: 'PUT',
				url: 'https://api.lifx.com/v1/lights/' + light + '/state',
				data: {
					'power': state == 'off' ? 'on' : 'off',
					'duration': duration
				},
				headers: {
					'Authorization': 'Bearer ' + lifx_app_token
				}
			})
			.done(function (msg) {
				if (!jQuery.isEmptyObject(msg)) {
					if (window.electron && $('#lock').prop('checked')) {
						window.electron.lock();
					}

					if (window.electron && $('#quit').prop('checked')) {
						window.electron.quitApp();
					} else {
						state = state == 'off' ? 'on' : 'off';
						update_state_on_buttons();
					}
				} else {
					alert('Error.');
				}
			});
		}
	});

	function set_duration() {
		duration = parseInt( $( '#duration-s' ).val() ) + ( parseInt( $( '#duration-m' ).val() ) * 60 ) + ( parseInt( $( '#duration-h' ).val() ) * 60 * 60 );

		localStorage.setItem('lifx_app_duration_s', $( '#duration-s' ).val());
		localStorage.setItem('lifx_app_duration_m', $( '#duration-m' ).val());
		localStorage.setItem('lifx_app_duration_h', $( '#duration-h' ).val());
	}

	$('#duration-s, #duration-m, #duration-h').on('input change', function () {
		set_duration();
	});

	$('#quit').change(function () {
		localStorage.setItem('lifx_app_quit', $(this).prop('checked'));
	});

	$('#lock').change(function () {
		localStorage.setItem('lifx_app_lock', $(this).prop('checked'));
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
					'duration': 0,
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

				$('#power-switch').prop('checked', state == 'on');
				update_state_on_buttons();

				spinner_container.hide();
				settings_link_container.show();
				section_main.show();
			});
		}
	}

	function update_state_on_buttons() {
		$('#power-switch').prop('checked', state == 'on');
		$('#fade-btn').html( 'Fade ' + ( state == 'off' ? 'on' : 'off' ) );
	}
});