// Modules to control application life and create native browser window

const {
	app,
	BrowserWindow,
	ipcMain,
	shell
} = require('electron');
const path = require('path');
let mainWindow = null;

// Portable mode (Windows only)
if (process.platform === 'win32') {
	const fs = require('fs');
	const data_path = path.join(path.dirname(app.getPath('exe')), 'data');

	if (fs.existsSync(data_path)) {
		app.setPath('userData', data_path);
	}
}

function createWindow() {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		autoHideMenuBar: true, // hide menu bar
		webPreferences: {
			preload: path.join(__dirname, 'preload.js')
		}
	});

	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details['url']);
		return { action: 'deny' };
	});

	// and load the index.html of the app.
	mainWindow.loadFile('index.html');

	// Open the DevTools.
	// mainWindow.webContents.openDevTools();
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
	app.quit();
} else {
	app.on('second-instance', (event, commandLine, workingDirectory) => {
		// Someone tried to run a second instance, we should focus our window.
		if (mainWindow) {
			if (mainWindow.isMinimized()) {
				mainWindow.restore();
			}

			mainWindow.focus();
		}
	});

	// This method will be called when Electron has finished
	// initialization and is ready to create browser windows.
	// Some APIs can only be used after this event occurs.
	app.whenReady().then(() => {
		createWindow();

		app.on('activate', () => {
			// On macOS it's common to re-create a window in the app when the
			// dock icon is clicked and there are no other windows open.
			if (BrowserWindow.getAllWindows().length === 0) {
				createWindow();
			}
		});
	});
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('quitApp', () => {
	app.releaseSingleInstanceLock();
	app.quit();
});

ipcMain.on('lock', () => {
	if (process.platform === 'win32') {
		require('child_process').exec('rundll32.exe user32.dll, LockWorkStation');
	}
});

ipcMain.on('sleep', () => {
	if (process.platform === 'win32') {
		require('child_process').execFile('resources/nircmdc.exe', ['standby']);
	}
});