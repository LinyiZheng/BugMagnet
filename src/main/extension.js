/*global chrome, browser*/
const ContextMenu = require('../lib/context-menu'),
	ChromeMenuBuilder = require('../lib/chrome-menu-builder'),
	ChromeBrowserInterface = require('../lib/chrome-browser-interface'),
	processMenuObject = require('../lib/process-menu-object'),
	// 从pack目录加载配置，这样用户修改后能立即生效
	standardConfig = require('../../pack/config.json'),
	isFirefox = (typeof browser !== 'undefined');

console.log('BugMagnet: 加载配置:', standardConfig);

new ContextMenu(
	standardConfig,
	new ChromeBrowserInterface(chrome),
	new ChromeMenuBuilder(chrome),
	processMenuObject,
	!isFirefox
).init();

