/*global chrome, browser*/
const ContextMenu = require('../lib/context-menu'),
	ChromeMenuBuilder = require('../lib/chrome-menu-builder'),
	ChromeBrowserInterface = require('../lib/chrome-browser-interface'),
	processMenuObject = require('../lib/process-menu-object'),
	templateConfig = require('../../template/config.json'),
	isFirefox = (typeof browser !== 'undefined');

const browserInterface = new ChromeBrowserInterface(chrome);
const menuBuilder = new ChromeMenuBuilder(chrome);

const loadConfig = function () {
	try {
		const url = chrome.runtime.getURL('config.json');
		return fetch(url)
			.then(r => r.ok ? r.json() : Promise.reject(new Error('config.json not found')))
			.catch(() => templateConfig);
	} catch (e) {
		return Promise.resolve(templateConfig);
	}
};

loadConfig().then((standardConfig) => {
	console.log('BugMagnet: 加载配置:', standardConfig);
	return new ContextMenu(
		standardConfig,
		browserInterface,
		menuBuilder,
		processMenuObject,
		!isFirefox
	).init();
});

