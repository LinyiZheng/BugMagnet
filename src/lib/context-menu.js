const injectValueRequestHandler = require('./inject-value-request-handler'),
	pasteRequestHandler = require('./paste-request-handler'),
	copyRequestHandler = require('./copy-request-handler');
module.exports = function ContextMenu(standardConfig, browserInterface, menuBuilder, processMenuObject, pasteSupported) {
	'use strict';
	let handlerType = 'injectValue';
	const self = this,
		handlerMenus = {},
		handlers = {
			injectValue: injectValueRequestHandler,
			paste: pasteRequestHandler,
			copy: copyRequestHandler
		},
		onClick = function (tabId, itemMenuValue) {
			const falsyButNotEmpty = function (v) {
					return !v && typeof (v) !== 'string';
				},
				toValue = function (itemMenuValue) {
					if (typeof (itemMenuValue) === 'string') {
						return { '_type': 'literal', 'value': itemMenuValue};
					}
					return itemMenuValue;
				},
				requestValue = toValue(itemMenuValue);
			if (falsyButNotEmpty(requestValue)) {
				return;
			};
			return handlers[handlerType](browserInterface, tabId, requestValue);
		},
		turnOnPasting = function () {
			return browserInterface.requestPermissions(['clipboardRead', 'clipboardWrite'])
				.then(() => handlerType = 'paste')
				.catch(() => {
					browserInterface.showMessage('Could not access clipboard');
					menuBuilder.selectChoice(handlerMenus.injectValue);
				});
		},
		turnOffPasting = function () {
			handlerType = 'injectValue';
			return browserInterface.removePermissions(['clipboardRead', 'clipboardWrite']);
		},
		turnOnCopy = function () {
			handlerType = 'copy';
		},
		loadAdditionalMenus = function (additionalMenus, rootMenu) {
			if (additionalMenus && Array.isArray(additionalMenus) && additionalMenus.length) {
				additionalMenus.forEach(function (configItem) {
					const object = {};
					object[configItem.name] = configItem.config;
					processMenuObject(object, menuBuilder, rootMenu, onClick);
				});
			}
		},
		addGenericMenus = function (rootMenu) {
			menuBuilder.separator(rootMenu);
			if (pasteSupported) {
				const modeMenu = menuBuilder.subMenu('Operational mode', rootMenu);
				handlerMenus.injectValue = menuBuilder.choice('Inject value', modeMenu, turnOffPasting, true);
				handlerMenus.paste = menuBuilder.choice('Simulate pasting', modeMenu, turnOnPasting);
				handlerMenus.copy = menuBuilder.choice('Copy to clipboard', modeMenu, turnOnCopy);
			}
			menuBuilder.menuItem('Customise menus', rootMenu, browserInterface.openSettings);
			menuBuilder.menuItem('Help/Support', rootMenu, () => browserInterface.openUrl('https://bugmagnet.org/contributing.html'));
		},
		rebuildMenu = function (options) {
			console.log('BugMagnet: 开始重建菜单');
			console.log('BugMagnet: 标准配置:', standardConfig);
			console.log('BugMagnet: 额外配置:', options);
			
			return menuBuilder.removeAll()
				.then(() => {
					const rootMenu =  menuBuilder.rootMenu('Bug Magnet'),
						additionalMenus = options && options.additionalMenus,
						skipStandard = options && options.skipStandard;
					if (!skipStandard) {
						console.log('BugMagnet: 处理标准配置菜单');
						processMenuObject(standardConfig, menuBuilder, rootMenu, onClick);
					}
					if (additionalMenus) {
						console.log('BugMagnet: 处理额外配置菜单');
						loadAdditionalMenus(additionalMenus, rootMenu);
					}
					addGenericMenus(rootMenu);
					console.log('BugMagnet: 菜单重建完成');
				});
		},
		wireStorageListener = function () {
			browserInterface.addStorageListener(function () {
				return menuBuilder.removeAll()
					.then(browserInterface.getOptionsAsync)
					.then(rebuildMenu);
			});
		};
	self.init = function () {
		console.log('BugMagnet: 开始初始化上下文菜单');
		return menuBuilder.removeAll()
			.then(() => browserInterface.getOptionsAsync())
			.then(rebuildMenu)
			.then(wireStorageListener)
			.then(() => {
				console.log('BugMagnet: 上下文菜单初始化完成');
			})
			.catch((error) => {
				console.error('BugMagnet: 初始化失败:', error);
			});
	};
};

