# LIFX App (unofficial)

A simple app to control LIFX lights over the Internet.\
Available as a desktop app (built using Electron) on multiple platforms and on the web.

Requires your LIFX personal access token, get it [here](https://cloud.lifx.com/).

No data is collected.\
Data is stored locally.\
The stored token and all settings can be deleted in the app Settings.

## Features
- Select light(s) to control: All, Location, Group, Light
- Turn on/off
- Fade on/off (can set the duration)
  - Only available in the desktop app: Quit and Lock after pressing the Fade button
- Set brightness

## Download
Download the latest version on the **Releases** page.

## How to build
1. yarn install
2. yarn dist

## Credits
- Thanks to [LIFX](https://www.lifx.com/) for the lights and the [LIFX HTTP API](https://api.developer.lifx.com/)
- [Electron](https://www.electronjs.org/) (desktop app)
- [Bootstrap](https://getbootstrap.com/)
- [Bootstrap Icons](https://icons.getbootstrap.com/)