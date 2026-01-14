# Huawei B312 Band Locker & Signal Monitor

An advanced browser extension to unlock the full potential of your Huawei 4G Routers.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

## 🚀 Features

*   **Band Locking**: Manually select specific 4G bands (e.g., B1, B3, B40) to force your router to connect to the fastest available tower.
*   **Signal Monitoring**: Real-time graphs for RSRP, SINR, and RSRQ to help you position your antenna perfectly.
*   **Tower Info**: View the current Cell ID and eNB ID.
*   **Zero-Config**: Automatically detects your router session (no need to log in twice if you are already logged in `192.168.8.1`).

## 📱 Supported Devices

Primarily designed for **Huawei HiLink** devices using the web API:
*   **B312** (Tested)
*   B310, B315, B525, B535, B715 (Should work)
*   *Note: Newer routers with "HarmonyOS" firmware might require different APIs.*

## 🛠️ Installation (Developer Mode)

1.  Download or Clone this repository.
2.  Run `npm install` to install dependencies.
3.  Run `npm run build` to create the production extension.
4.  Open Chrome/Edge and go to `chrome://extensions`.
5.  Enable **Developer Mode** (top right).
6.  Click **Load unpacked** and select the `dist` folder.

## 🤝 Contributing

Issues and pull requests are welcome!

## 📄 License

MIT License
