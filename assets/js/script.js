document.addEventListener('DOMContentLoaded', (event) => {
	var lifx_app_token = localStorage.getItem('lifx_app_token');
	var error_alert = document.querySelector('#error-alert');
	var token_alert = document.querySelector('#token-alert');
	var spinner_container = document.querySelector('#spinner-container');
	var top_container = document.querySelector('#top-container');
	var settings_only = document.querySelector('#settings-only');
	var reload_link = document.querySelector('#reload-link');
	var section_settings = document.querySelector('#section-settings');
	var section_lights = document.querySelector('#section-lights');
	var section_main = document.querySelector('#section-main');
	var section_debug = document.querySelector('#section-debug');
	var section_offline = document.querySelector('#section-offline');
	var delete_token_btn = document.querySelector('#delete-token-btn');
	var delete_all_settings_btn = document.querySelector('#delete-all-settings-btn');
	var debug_enabled = document.querySelector('#debug-enabled');
	var back_button = document.querySelector('#back-btn');
	var lights_select = document.querySelector('select[id="lights"]');
	var lights = {};
	var groups = {};
	var locations = {};
	var selector = 'all';
	var id;
	var state;
	var duration = 0;

	if (lifx_app_token) {
		document.querySelector('#lifx_app_token').value = lifx_app_token;
		reload_link.style.display = 'block';
		get_lights();
	} else {
		token_alert.style.display = 'block';
		top_container.style.display = 'block';
		section_main.style.display = 'none';
		delete_token_btn.style.display = 'none';
		back_button.style.display = 'none';

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
			delete_all_settings_btn.style.display = 'none';
		}
	}

	if (localStorage.getItem('debug_enabled')) {
		debug_enabled.checked = localStorage.getItem('debug_enabled') == 'true';
		debug_enabled.dispatchEvent(new Event('change'));
	}

	if (localStorage.getItem('lifx_app_duration_s')) {
		document.querySelector('#duration-s').value = localStorage.getItem('lifx_app_duration_s');
	}

	if (localStorage.getItem('lifx_app_duration_m')) {
		document.querySelector('#duration-m').value = localStorage.getItem('lifx_app_duration_m');
	}

	if (localStorage.getItem('lifx_app_duration_h')) {
		document.querySelector('#duration-h').value = localStorage.getItem('lifx_app_duration_h');
	}

	set_duration();

	if (localStorage.getItem('lifx_app_quit')) {
		document.querySelector('#quit').checked = localStorage.getItem('lifx_app_quit') == 'true';
	}

	if (localStorage.getItem('lifx_app_lock')) {
		document.querySelector('#lock').checked = localStorage.getItem('lifx_app_lock') == 'true';
	}

	function get_version() {
		fetch('package.json', {
			'method': 'GET',
			'headers': {
				'Content-Type': 'application/json',
			},
			'cache': 'no-store'
		})
		.then((response) => {
			if (response.ok) {
				return response.json();
			} else {
				throw 'Error';
			}
		})
		.then((data) => {
			if (data['version']) {
				document.querySelector('#app-version').textContent = data['version'];
			}
		})
		.catch((error) => {
		});
	}

	get_version();

	if (window.electron) {
		document.querySelectorAll('.electron-only').forEach(e => e.style.display = null);
	}

	reload_link.addEventListener('click', (event) => {
		event.preventDefault();
		top_container.style.display = 'none';
		section_lights.style.display = 'none';
		section_main.style.display = 'none';
		section_offline.style.display = 'none';
		section_debug.style.display = 'none';
		get_lights();
	});

	document.querySelectorAll('.settings-link').forEach(e => e.addEventListener('click', (event) => {
		event.preventDefault();

		if (lifx_app_token && window.getComputedStyle(section_settings).display != 'none') {
			section_settings.style.display = 'none';
			settings_only.style.display = 'none';
			reload_link.style.display = 'block';

			if (window.getComputedStyle(error_alert).display == 'none') {
				lights_select.dispatchEvent(new Event('change'));
				section_lights.style.display = 'block';
			}
		} else {
			section_settings.style.display = 'block';
			settings_only.style.display = 'block';
			reload_link.style.display = 'none';
			section_lights.style.display = 'none';
			section_main.style.display = 'none';
			section_offline.style.display = 'none';

			if (lifx_app_token) {
				delete_token_btn.style.display = 'block';
				back_button.style.display = 'block';
			} else {
				delete_token_btn.style.display = 'none';
				back_button.style.display = 'none';
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
				delete_all_settings_btn.style.display = 'block';
			}
		}
	}));

	document.querySelector('#save-token').addEventListener('click', (event) => {
		if (document.querySelector('#lifx_app_token').value) {
			localStorage.setItem('lifx_app_token', document.querySelector('#lifx_app_token').value);
			lifx_app_token = localStorage.getItem('lifx_app_token');
			error_alert.style.display = 'none';
			token_alert.style.display = 'none';
			section_settings.style.display = 'none';
			settings_only.style.display = 'none';
			reload_link.style.display = 'block';
			get_lights();
		} else {
			delete_token_btn.click();
		}
	});

	delete_token_btn.addEventListener('click', (event) => {
		localStorage.removeItem('lifx_app_token');
		lifx_app_token = localStorage.getItem('lifx_app_token');
		document.querySelector('#lifx_app_token').value = lifx_app_token;
		error_alert.style.display = 'none';
		token_alert.style.display = 'block';
		delete_token_btn.style.display = 'none';
		reload_link.style.display = 'none';
		back_button.style.display = 'none';
	});

	delete_all_settings_btn.addEventListener('click', (event) => {
		delete_token_btn.click();

		localStorage.removeItem('debug_enabled');
		debug_enabled.checked = false;

		lights_select.value = 'all';
		localStorage.removeItem('selected');

		localStorage.removeItem('lifx_app_duration_s');
		localStorage.removeItem('lifx_app_duration_m');
		localStorage.removeItem('lifx_app_duration_h');
		document.querySelector('#duration-s').value = 0;
		document.querySelector('#duration-m').value = 0;
		document.querySelector('#duration-h').value = 0;

		localStorage.removeItem('lifx_app_quit');
		document.querySelector('#quit').checked = false;

		localStorage.removeItem('lifx_app_lock');
		document.querySelector('#lock').checked = false;

		delete_all_settings_btn.style.display = 'none';
	});

	debug_enabled.addEventListener('change', (event) => {
		if (event.target.checked) {
			localStorage.setItem('debug_enabled', event.target.checked);
			section_debug.style.display = 'block';
		} else {
			localStorage.removeItem('debug_enabled');
			section_debug.style.display = 'none';
		}
	});

	back_button.addEventListener('click', (event) => {
		// document.querySelector('.settings-link').click();

		section_settings.style.display = 'none';
		settings_only.style.display = 'none';
		reload_link.style.display = 'block';

		if (lifx_app_token && window.getComputedStyle(error_alert).display == 'none') {
			lights_select.dispatchEvent(new Event('change'));
			section_lights.style.display = 'block';
		}
	});

	document.querySelector('#power-switch').addEventListener('change', (event) => {
		if (lifx_app_token) {
			fetch('https://api.lifx.com/v1/lights/' + selector + '/state', {
				'method': 'PUT',
				'headers': {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + lifx_app_token
				},
				'body': JSON.stringify({
					'power': state == 'off' ? 'on' : 'off',
					'duration': 0
				}),
				'cache': 'no-store'
			})
			.then((response) => {
				if (response.ok) {
					return response.json();
				} else {
					throw 'Error';
				}
			})
			.then((data) => {
				if (Object.keys(data).length !== 0) {
					state = state == 'off' ? 'on' : 'off';
					update_state();
				} else {
					alert('Error.');
					document.querySelector('#power-switch').checked = state == 'on';
				}
			})
			.catch((error) => {
			});
		}
	});

	document.querySelector('#fade-btn').addEventListener('click', (event) => {
		if (lifx_app_token) {
			fetch('https://api.lifx.com/v1/lights/' + selector + '/state', {
				'method': 'PUT',
				'headers': {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + lifx_app_token
				},
				'body': JSON.stringify({
					'power': state == 'off' ? 'on' : 'off',
					'duration': duration
				}),
				'cache': 'no-store'
			})
			.then((response) => {
				if (response.ok) {
					return response.json();
				} else {
					throw 'Error';
				}
			})
			.then((data) => {
				if (Object.keys(data).length !== 0) {
					if (window.electron && document.querySelector('#lock').checked) {
						window.electron.lock();
					}

					if (window.electron && document.querySelector('#quit').checked) {
						window.electron.quitApp();
					} else {
						state = state == 'off' ? 'on' : 'off';
						update_state();
					}
				} else {
					alert('Error.');
				}
			})
			.catch((error) => {
			});
		}
	});

	function set_duration() {
		duration = parseInt( document.querySelector('#duration-s').value ) + ( parseInt( document.querySelector('#duration-m').value ) * 60 ) + ( parseInt( document.querySelector('#duration-h').value ) * 60 * 60 );

		localStorage.setItem('lifx_app_duration_s', document.querySelector('#duration-s').value);
		localStorage.setItem('lifx_app_duration_m', document.querySelector('#duration-m').value);
		localStorage.setItem('lifx_app_duration_h', document.querySelector('#duration-h').value);
	}

	document.querySelectorAll('#duration-s, #duration-m, #duration-h').forEach((e) => {
		['input', 'change'].forEach((event) => {
			e.addEventListener(event, (event2) => {
				set_duration();
			});
		});
	});

	document.querySelector('#quit').addEventListener('change', (event) => {
		if (event.target.checked) {
			localStorage.setItem('lifx_app_quit', event.target.checked);
		} else {
			localStorage.removeItem('lifx_app_quit');
		}
	});

	document.querySelector('#lock').addEventListener('change', (event) => {
		if (event.target.checked) {
			localStorage.setItem('lifx_app_lock', event.target.checked);
		} else {
			localStorage.removeItem('lifx_app_lock');
		}
	});

	function update_state() {
		document.querySelector('#power-switch').checked = state == 'on';
		document.querySelector('#fade-btn').textContent = 'Fade ' + ( state == 'off' ? 'on' : 'off' );
		lights[id]['power'] = state;
	}

	['input', 'change'].forEach(type => document.querySelector('#brightness').addEventListener(type, (event) => {
		if (lifx_app_token) {
			let brightness = parseFloat(event.target.value);
			document.querySelector('#current-brightness').textContent = Math.round( brightness * 100 ) + '%';
		}
	}));

	document.querySelector('#brightness').addEventListener('change', (event) => {
		if (lifx_app_token) {
			let brightness = parseFloat(event.target.value);

			fetch('https://api.lifx.com/v1/lights/' + selector + '/state', {
				'method': 'PUT',
				'headers': {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + lifx_app_token
				},
				'body': JSON.stringify({
					'power': 'on',
					'brightness': brightness,
					'duration': 0,
					'fast': true
				}),
				'cache': 'no-store'
			})
			.then((response) => {
				if (response.ok) {
					return response.json();
				} else {
					throw 'Error';
				}
			})
			.then((data) => {
			})
			.catch((error) => {
			});
		}
	});

	function get_lights() {
		if (lifx_app_token) {
			spinner_container.style.display = 'block';

			fetch('https://api.lifx.com/v1/lights/' + selector, {
				'method': 'GET',
				'headers': {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + lifx_app_token
				},
				'cache': 'no-store'
			})
			.then((response) => {
				if (response.ok) {
					return response.json();
				} else {
					throw 'Error';
				}
			})
			.then((data) => {
				// Load again to avoid incorrect power state
				fetch('https://api.lifx.com/v1/lights/' + selector, {
					'method': 'GET',
					'headers': {
						'Content-Type': 'application/json',
						'Authorization': 'Bearer ' + lifx_app_token
					},
					'cache': 'no-store'
				})
				.then((response) => {
					if (response.ok) {
						return response.json();
					} else {
						throw 'Error';
					}
				})
				.then((data) => {
					spinner_container.style.display = 'none';
					top_container.style.display = 'block';

					document.querySelector('#debug-info').innerHTML = syntax_highlight(JSON.stringify(data, null, 4));
					document.querySelector('#debug-info').classList.add('border', 'border-dark', 'rounded', 'p-3');
					debug_enabled.dispatchEvent(new Event('change'));

					lights = {};
					groups = {};
					locations = {};

					data.forEach(function (light) {
						lights[ light['id'] ] = light;

						groups[ light['group']['id'] ] = light['group'];
						groups[ light['group']['id'] ]['first_light_id'] = light['id'];

						locations[ light['location']['id'] ] = light['location'];
						locations[ light['location']['id'] ]['first_light_id'] = light['id'];
					});

					lights_select.querySelectorAll('option:not(:first-child)').forEach(e => e.remove());

					for (let [key, element] of Object.entries(locations)) {
						let option = document.createElement('option');
						option.value = element['id'];
						option.text = 'Location: ' + element['name'];
						option.dataset['type'] = 'location';
						lights_select.add(option);
					}

					for (let [key, element] of Object.entries(groups)) {
						let option = document.createElement('option');
						option.value = element['id'];
						option.text = 'Group: ' + element['name'];
						option.dataset['type'] = 'group';
						lights_select.add(option);
					}

					for (let [key, element] of Object.entries(lights)) {
						let option = document.createElement('option');
						option.value = element['id'];
						option.text = 'Light: ' + element['label'];
						option.dataset['type'] = 'light';
						lights_select.add(option);
					}

					if (localStorage.getItem('selected')) {
						lights_select.value = localStorage.getItem('selected');
					}

					lights_select.dispatchEvent(new Event('change'));
					section_lights.style.display = 'block';
				})
				.catch((error) => {
					spinner_container.style.display = 'none';
					top_container.style.display = 'block';
					error_alert.style.display = 'block';
					section_debug.style.display = 'none';
				});
			})
			.catch((error) => {
				spinner_container.style.display = 'none';
				top_container.style.display = 'block';
				error_alert.style.display = 'block';
				section_debug.style.display = 'none';
			});
		}
	}

	lights_select.addEventListener('change', (event) => {
		id = event.target.value;

		localStorage.setItem('selected', id);

		let type = id != 'all' ? event.target.selectedOptions[0].dataset['type'] : '';
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
			id = event.target.querySelector('option[data-type="light"]').value;
		} else if (type == 'group') {
			id = groups[id]['first_light_id'];
		} else if (type == 'location') {
			id = locations[id]['first_light_id'];
		}

		load(id);
	});

	function load(id) {
		if (lights[id]['connected']) {
			let brightness = lights[id]['brightness'];
			document.querySelector('#brightness').value = brightness;
			document.querySelector('#current-brightness').textContent = Math.round( brightness * 100 ) + '%';

			state = lights[id]['power'];
			document.querySelector('#power-switch').checked = state == 'on';
			update_state();

			section_main.style.display = 'block';
		} else {
			section_main.style.display = 'none';
			section_offline.style.display = 'block';
		}
	}

	function syntax_highlight(json) {
		json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
			let cls = 'number';
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