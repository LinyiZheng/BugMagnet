module.exports = function ChromeMenuBuilder(chrome) {
	'use strict';
	let itemValues = {},
		itemHandlers = {},
		menuCounter = 0;
	const self = this,
		contexts = ['editable'];
	
	// 生成唯一ID的辅助函数
	const generateId = (prefix) => {
		return `${prefix}_${++menuCounter}`;
	};
	
	self.rootMenu = function (title) {
		const id = generateId('bugmagnet-root');
		return chrome.contextMenus.create({ 
			'id': id,
			'title': title, 
			'contexts': contexts
		});
	};
	self.subMenu = function (title, parentMenu) {
		const id = generateId('bugmagnet-sub');
		return chrome.contextMenus.create({
			'id': id,
			'title': title, 
			'parentId': parentMenu, 
			'contexts': contexts
		});
	};
	self.separator = function (parentMenu) {
		const id = generateId('bugmagnet-sep');
		return chrome.contextMenus.create({
			'id': id,
			'type': 'separator', 
			'parentId': parentMenu, 
			'contexts': contexts
		});
	};
	self.menuItem = function (title, parentMenu, clickHandler, value) {
		const id = generateId('bugmagnet-item');
		chrome.contextMenus.create({ 
			'id': id,
			'title': title, 
			'parentId': parentMenu, 
			'contexts': contexts
		});
		itemValues[id] = value;
		itemHandlers[id] = clickHandler;
		return id;
	};
	self.choice  = function (title, parentMenu, clickHandler, value) {
		const id = generateId('bugmagnet-choice');
		chrome.contextMenus.create({
			id: id,
			type: 'radio', 
			checked: value, 
			title: title, 
			parentId: parentMenu, 
			'contexts': contexts
		});
		itemHandlers[id] = clickHandler;
		return id;
	};
	self.removeAll = function () {
		itemValues = {};
		itemHandlers = {};
		return new Promise(resolve => chrome.contextMenus.removeAll(resolve));
	};
	chrome.contextMenus.onClicked.addListener((info, tab) => {
		const itemId = info && info.menuItemId;
		if (itemHandlers[itemId]) {
			itemHandlers[itemId](tab.id, itemValues[itemId]);
		}
	});
	self.selectChoice = function (menuId) {
		return chrome.contextMenus.update(menuId, {checked: true});
	};
};
