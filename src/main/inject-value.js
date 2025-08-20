/*global chrome*/
const executeRequest = require('../lib/inject-value-to-active-element'),
	listener = function (request, sender, sendResponse) {
		'use strict';
		console.log('BugMagnet: 收到消息:', request, '发送者:', sender);
		
		try {
			executeRequest(request);
			console.log('BugMagnet: 值注入完成');
		} catch (error) {
			console.error('BugMagnet: 注入值时出错:', error);
		}
		
		// 发送响应
		if (sendResponse) {
			sendResponse({success: true});
		}
		
		// 移除监听器（可选，取决于是否需要持续监听）
		// chrome.runtime.onMessage.removeListener(listener);
	};

console.log('BugMagnet: 注入脚本已加载，正在设置消息监听器');
chrome.runtime.onMessage.addListener(listener);
