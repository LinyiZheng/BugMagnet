/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 13);
/******/ })
/************************************************************************/
/******/ ({

/***/ 1:
/***/ (function(module, exports) {

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
			return chrome.tabs.executeScript(tabId, {file: source}, resolve);
		});
	};
	self.sendMessage = function (tabId, message) {
		return chrome.tabs.sendMessage(tabId, message);
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



/***/ }),

/***/ 13:
/***/ (function(module, exports, __webpack_require__) {

/*global chrome */
const ChromeConfigInterface = __webpack_require__(1),
	initConfigWidget = __webpack_require__(14);
document.addEventListener('DOMContentLoaded', function () {
	'use strict';
	initConfigWidget(document.getElementById('main'), new ChromeConfigInterface(chrome));
});


/***/ }),

/***/ 14:
/***/ (function(module, exports) {

module.exports = function initConfigWidget(domElement, browserInterface) {
	'use strict';
	let template,
		list,
		skipStandard,
		additionalMenus = [];
	const showErrorMsg = function (text) {
			const status = domElement.querySelector('[role=status]');
			status.textContent = text;
			setTimeout(function () {
				status.textContent = '';
			}, 1500);
		},
		addLink = function (parent, url) {
			const link = document.createElement('a');
			link.setAttribute('href', url);
			link.setAttribute('target', '_blank');
			link.textContent = url.replace(/.*\//g, '');
			parent.appendChild(link);
		},
		saveOptions = function () {
			browserInterface.saveOptions({
				additionalMenus: additionalMenus,
				skipStandard: skipStandard
			});
		},
		rebuildMenu = function () {
			list.innerHTML = '';
			if (additionalMenus && additionalMenus.length) {
				additionalMenus.forEach(function (configItem, index) {
					const clone = template.cloneNode(true);
					list.appendChild(clone);
					clone.querySelector('[role=name]').textContent = configItem.name;
					if (configItem.remote) {
						addLink(clone.querySelector('[role=source]'), configItem.source);
					} else {
						clone.querySelector('[role=source]').textContent = configItem.source || '';
					}


					clone.querySelector('[role=remove]').addEventListener('click', function () {
						additionalMenus.splice(index, 1);
						rebuildMenu();
						saveOptions();
					});
				});
				domElement.querySelector('[role=no-custom]').style.display = 'none';
				domElement.querySelector('[role=yes-custom]').style.display = '';
			} else {
				domElement.querySelector('[role=yes-custom]').style.display = 'none';
				domElement.querySelector('[role=no-custom]').style.display = '';
			}
			domElement.querySelector('[role=option-skipStandard]').checked = (!!skipStandard);
		},
		showMainScreen = function () {
			domElement.querySelector('[role=main-screen]').style.display = '';
			domElement.querySelector('[role=file-loader]').style.display = 'none';
		},
		addSubMenu = function (textContent, props) {
			const parsed = JSON.parse(textContent);
			additionalMenus.push(Object.assign({}, props, {config: parsed}));
			showMainScreen();
			rebuildMenu();
			saveOptions();
		},
		restoreOptions = function () {
			return browserInterface.getOptionsAsync().then(function (opts) {
				if (opts && Array.isArray(opts.additionalMenus)) {
					additionalMenus = opts.additionalMenus;
				}	else {
					additionalMenus = [];
				}
				skipStandard = opts && opts.skipStandard;
				rebuildMenu();
			});
		},
		showFileSelector = function () {
			const submenuField =  domElement.querySelector('[role=submenu-name]'),
				configTextArea = domElement.querySelector('[role=custom-config-text]');
			submenuField.value = '';
			configTextArea.value = '';
			domElement.querySelector('[role=main-screen]').style.display = 'none';
			domElement.querySelector('[role=file-loader]').style.display = '';
		},
		initScreen = function () {
			const submenuField =  domElement.querySelector('[role=submenu-name]'),
				skipStandardCheckbox = domElement.querySelector('[role=option-skipStandard]');
			Array.from(domElement.querySelectorAll('form')).map(el => el.addEventListener('submit', e => e.preventDefault()));
			domElement.querySelector('[role=close]').addEventListener('click', browserInterface.closeWindow);
			domElement.querySelector('[role=add]').addEventListener('click', showFileSelector);
			Array.from(domElement.querySelectorAll('[role=back]')).map(el => el.addEventListener('click', showMainScreen));
			domElement.querySelector('[role=select-file-cover]').addEventListener('click', () => {
				const event = new MouseEvent('click', {
					view: window,
					bubbles: true,
					cancelable: true
				});
				domElement.querySelector('[role=file-selector]').dispatchEvent(event);
			});
			skipStandardCheckbox.addEventListener('change', function () {
				skipStandard = !!skipStandardCheckbox.checked;
				saveOptions();
			});
			domElement.querySelector('[role=file-selector]').addEventListener('change', function () {
				const element = this,
					fileInfo = this.files[0],
					fileName = fileInfo.name,
					submenuName = submenuField.value && submenuField.value.trim();
				if (!submenuName) {
					showErrorMsg('Please provide submenu name!');
					submenuField.value = '';
				} else {
					browserInterface.readFile(fileInfo).then(result => {
						addSubMenu(result, {name: submenuName, source: fileName});
					}).catch(showErrorMsg);
				}
				element.value = '';
			});
			domElement.querySelector('[role=add-custom-config]').addEventListener('click', () => {
				const submenuName = submenuField.value && submenuField.value.trim(),
					customConfigText = 	domElement.querySelector('[role=custom-config-text]').value;
				if (!submenuName) {
					submenuField.value = '';
					return showErrorMsg('Please provide submenu name!');
				}
				if (!customConfigText) {
					return showErrorMsg('Please provide the configuration');
				}
				try {
					addSubMenu(customConfigText, {name: submenuName});
				} catch (e) {
					showErrorMsg(e);
				}
			});
			domElement.querySelector('[role=add-remote-config]').addEventListener('click', () => {
				const submenuName = submenuField.value && submenuField.value.trim(),
					urlField = domElement.querySelector('[role="remote-config-url"]'),
					url = urlField.value;
				if (!submenuName) {
					showErrorMsg('Please provide submenu name!');
					submenuField.value = '';
				} else if (!url) {
					return showErrorMsg('Please provide the url');
				} else {
					browserInterface.getRemoteFile(url).then(result => {
						showErrorMsg('got file', result);
						addSubMenu(result, {name: submenuName, source: url, remote: true});
						submenuField.value = '';
						urlField.value = '';
					}).catch(showErrorMsg);
				}
			});

			template = domElement.querySelector('[role=template]');
			list = template.parentElement;
			list.removeChild(template);
			showMainScreen();
			return restoreOptions();
		};
	return initScreen();
};



/***/ })

/******/ });