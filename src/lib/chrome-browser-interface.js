module.exports = function ChromeBrowserInterface(chrome) {
	'use strict';
	const self = this;
	self.saveOptions = function (options) {
		chrome.storage.sync.set(options);
	};
	self.getOptionsAsync = function () {
		return new Promise((resolve) => {
			chrome.storage.sync.get(null, resolve);
		});
	};
	self.openSettings = function () {
		if (chrome.runtime.openOptionsPage) {
			chrome.runtime.openOptionsPage();
		} else {
			window.open(chrome.runtime.getURL('options.html'));
		}
	};
	self.openUrl = function (url) {
		window.open(url);
	};
	self.addStorageListener = function (listener) {
		chrome.storage.onChanged.addListener(function (changes, areaName) {
			if (areaName === 'sync') {
				listener(changes);
			};
		});
	};
	self.getRemoteFile = function (url) {
		return fetch(url, {mode: 'cors'}).then(function (response) {
			if (response.ok) {
				return response.text();
			}
			throw new Error('Network error reading the remote URL');
		});
	};
	self.closeWindow = function () {
		window.close();
	};
	self.readFile = function (fileInfo) {
		return new Promise((resolve, reject) => {
			const oFReader = new FileReader();
			oFReader.onload = function (oFREvent) {
				try {
					resolve(oFREvent.target.result);
				} catch (e) {
					reject(e);
				}
			};
			oFReader.onerror = reject;
			oFReader.readAsText(fileInfo, 'UTF-8');
		});
	};
	self.executeScript = function (tabId, source) {
		return new Promise((resolve) => {
			if (chrome.scripting && chrome.scripting.executeScript) {
				// Manifest V3
				return chrome.scripting.executeScript({
					target: { tabId: tabId },
					files: [source]
				}, resolve);
			} else {
				// Manifest V2 fallback
				return chrome.tabs.executeScript(tabId, {file: source}, resolve);
			}
		});
	};
	self.sendMessage = function (tabId, message) {
		return new Promise((resolve, reject) => {
			console.log('BugMagnet: 发送消息到标签页:', tabId, '消息:', message);
			
			try {
				chrome.tabs.sendMessage(tabId, message, (response) => {
					if (chrome.runtime.lastError) {
						console.error('BugMagnet: 发送消息时出错:', chrome.runtime.lastError);
						reject(chrome.runtime.lastError);
					} else {
						console.log('BugMagnet: 消息发送成功，响应:', response);
						resolve(response);
					}
				});
			} catch (error) {
				console.error('BugMagnet: 发送消息时捕获到错误:', error);
				reject(error);
			}
		});
	};

	self.requestPermissions = function (permissionsArray) {
		return new Promise((resolve, reject) => {
			try {
				chrome.permissions.request({permissions: permissionsArray}, function (granted) {
					if (granted) {
						resolve();
					} else {
						reject();
					}
				});
			} catch (e) {
				console.log(e);
				reject(e);
			}
		});
	};
	self.removePermissions = function (permissionsArray) {
		return new Promise((resolve) => chrome.permissions.remove({permissions: permissionsArray}, resolve));
	};
	self.copyToClipboard = function (text) {
		const handler = function (e) {
			e.clipboardData.setData('text/plain', text);
			e.preventDefault();
		};
		document.addEventListener('copy', handler);
		document.execCommand('copy');
		document.removeEventListener('copy', handler);
	};
	self.showMessage = function (text) {
		chrome.tabs.executeScript(null, {code: `alert("${text}")`});
	};
};

