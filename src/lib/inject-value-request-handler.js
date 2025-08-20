module.exports = function injectValueRequestHandler(browserInterface, tabId, requestValue) {
	'use strict';
	console.log('BugMagnet: 开始处理注入值请求:', tabId, requestValue);
	
	return browserInterface.executeScript(tabId, '/inject-value.js')
		.then(() => {
			console.log('BugMagnet: 脚本注入成功，发送消息');
			return browserInterface.sendMessage(tabId, requestValue);
		})
		.then((response) => {
			console.log('BugMagnet: 消息发送成功，响应:', response);
		})
		.catch((error) => {
			console.error('BugMagnet: 注入值请求处理失败:', error);
			throw error;
		});
};

