$(document).ready(function () {
	var lifx_app_token = localStorage.getItem('lifx_app_token');
	var token_alert = $('.token-alert');
	var spinner_container = $('#spinner-container');
	var top_container = $('#top-container');
	var section_settings = $('#section-settings');
	var section_lights = $('#section-lights');
	var section_main = $('#section-main');
	var section_debug = $('#section-debug');
	var section_offline = $('#section-offline');
	var lights_select = $('select[id="lights"]');
	var lights = {};
	var groups = {};
	var locations = {};
	var selector = 'all';
	var id;
	var state;
	var duration = 0;

	if (lifx_app_token) {
		$('#lifx_app_token').val(lifx_app_token);
		get_lights();
	} else {
		token_alert.show();
		top_container.show();
		section_main.hide();
		$('#delete-token').hide();
		$('.back-btn').hide();

		if (
			! localStorage.getItem('debug_enabled')
			&&
			! localStorage.getItem('selected')
			&&
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

	if (localStorage.getItem('debug_enabled')) {
		var debug_enabled = localStorage.getItem('debug_enabled') == 'true';

		$('#debug-enabled').prop('checked', debug_enabled);

		if (debug_enabled) {
			section_debug.show();
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

	$('.reload-link').click(function (event) {
		event.preventDefault();
		top_container.hide();
		section_lights.hide();
		section_main.hide();
		section_offline.hide();
		get_lights();
	});

	$('.settings-link').click(function (event) {
		event.preventDefault();

		if (lifx_app_token && section_settings.is(':visible')) {
			section_settings.hide();
			section_lights.show();
			lights_select.change();
		} else {
			section_settings.show();
			section_lights.hide();
			section_main.hide();
			section_offline.hide();

			if (lifx_app_token) {
				$('#delete-token').show();
			}

			if (
				localStorage.getItem('debug_enabled')
				||
				localStorage.getItem('selected')
				||
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
			get_lights();
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

		localStorage.removeItem('debug_enabled');
		$('#debug-enabled').prop('checked', false);

		lights_select.val('all');
		localStorage.removeItem('selected');

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

	$('#debug-enabled').change(function () {
		if ($(this).prop('checked')) {
			localStorage.setItem('debug_enabled', $(this).prop('checked'));
			section_debug.show();
		} else {
			localStorage.removeItem('debug_enabled');
			section_debug.hide();
		}
	});

	$('.back-btn').click(function () {
		// $('.settings-link').click();
		section_settings.hide();
		section_lights.show();
		lights_select.change();
	});

	$('#power-switch').change(function () {
		if (lifx_app_token) {
			$.ajax({
				method: 'PUT',
				url: 'https://api.lifx.com/v1/lights/' + selector + '/state',
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
					update_state();
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
				url: 'https://api.lifx.com/v1/lights/' + selector + '/state',
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
						update_state();
					}
				} else {
					alert('Error.');
				}
			});
		}
	});

	function set_duration() {
		duration = parseInt( $('#duration-s').val() ) + ( parseInt( $('#duration-m').val() ) * 60 ) + ( parseInt( $('#duration-h').val() ) * 60 * 60 );

		localStorage.setItem('lifx_app_duration_s', $('#duration-s').val());
		localStorage.setItem('lifx_app_duration_m', $('#duration-m').val());
		localStorage.setItem('lifx_app_duration_h', $('#duration-h').val());
	}

	$('#duration-s, #duration-m, #duration-h').on('input change', function () {
		set_duration();
	});

	$('#quit').change(function () {
		if ($(this).prop('checked')) {
			localStorage.setItem('lifx_app_quit', $(this).prop('checked'));
		} else {
			localStorage.removeItem('lifx_app_quit');
		}
	});

	$('#lock').change(function () {
		if ($(this).prop('checked')) {
			localStorage.setItem('lifx_app_lock', $(this).prop('checked'));
		} else {
			localStorage.removeItem('lifx_app_lock');
		}
	});

	function update_state() {
		$('#power-switch').prop('checked', state == 'on');
		$('#fade-btn').html( 'Fade ' + ( state == 'off' ? 'on' : 'off' ) );
		lights[id]['power'] = state;
	}

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
				url: 'https://api.lifx.com/v1/lights/' + selector + '/state',
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

	function get_lights() {
		if (lifx_app_token) {
			spinner_container.show();

			$.ajax({
				method: 'GET',
				url: 'https://api.lifx.com/v1/lights/' + selector,
				headers: {
					'Authorization': 'Bearer ' + lifx_app_token
				}
			})
			.done(function (msg) {
				// Load again to avoid incorrect power state
				$.ajax({
					method: 'GET',
					url: 'https://api.lifx.com/v1/lights/' + selector,
					headers: {
						'Authorization': 'Bearer ' + lifx_app_token
					}
				})
				.done(function (msg) {
					spinner_container.hide();
					top_container.show();

					if ($('#debug-enabled').prop('checked')) {
						$('#debug-info').html(syntax_highlight(JSON.stringify(msg, null, 4))).show();
					}

					lights = {};
					groups = {};
					locations = {};

					msg.forEach(function (light) {
						lights[ light['id'] ] = light;

						groups[ light['group']['id'] ] = light['group'];
						groups[ light['group']['id'] ]['first_light_id'] = light['id'];

						locations[ light['location']['id'] ] = light['location'];
						locations[ light['location']['id'] ]['first_light_id'] = light['id'];
					});

					lights_select.find('option').slice(1).remove();

					$.each( locations, function ( key, element ) {
						lights_select.append('<option value="' + element['id'] + '" data-type="location">Location: ' + element['name'] + '</option>');
					} );

					$.each( groups, function ( key, element ) {
						lights_select.append('<option value="' + element['id'] + '" data-type="group">Group: ' + element['name'] + '</option>');
					} );

					$.each( lights, function ( key, element ) {
						lights_select.append('<option value="' + element['id'] + '" data-type="light">Light: ' + element['label'] + '</option>');
					} );

					if (localStorage.getItem('selected')) {
						lights_select.val(localStorage.getItem('selected'));
					}

					lights_select.change();
					section_lights.show();
				});
			});
		}
	}

	lights_select.on('change', function () {
		id = $(this).val();

		localStorage.setItem('selected', id);

		let type = $(this).find('option:selected').data('type');
		let new_selector = '';

		if (type == 'light') {
			new_selector = 'id:';
		} else if (type == 'group') {
			new_selector = 'group_id:';
		} else if (type == 'location') {
			new_selector = 'location_id:';
		}

		selector = new_selector + id;

		if (id == 'all') {
			id = $(this).find('option[data-type="light"]').first().val();
		} else if (type == 'group') {
			id = groups[id]['first_light_id'];
		} else if (type == 'location') {
			id = locations[id]['first_light_id'];
		}

		load(id);
	});

	function load(id) {
		if (lights[id]['connected']) {
			var brightness = lights[id]['brightness'];
			$('#brightness').val(brightness);
			$('#current-brightness').html( Math.round( brightness * 100 ) + '%' );

			state = lights[id]['power'];
			$('#power-switch').prop('checked', state == 'on');
			update_state();

			section_main.show();
		} else {
			section_main.hide();
			section_offline.show();
		}
	}

	function syntax_highlight(json) {
		json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
			var cls = 'number';
			if (/^"/.test(match)) {
				if (/:$/.test(match)) {
					cls = 'key';
				} else {
					cls = 'string';
				}
			} else if (/true|false/.test(match)) {
				cls = 'boolean';
			} else if (/null/.test(match)) {
				cls = 'null';
			}
			return '<span class="' + cls + '">' + match + '</span>';
		});
	}
});