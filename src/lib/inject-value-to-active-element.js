const getValue = require('./get-request-value'),
	triggerEvents = require('./trigger-events');
module.exports = function injectValueToActiveElement(request) {
	'use strict';
	const actualValue = getValue(request);
	console.log('BugMagnet: 尝试注入值:', actualValue, '请求:', request);
	
	let domElement = document.activeElement;
	if (!domElement) {
		console.log('BugMagnet: 没有找到活动元素');
		return;
	}
	
	if (!actualValue) {
		console.log('BugMagnet: 没有获取到值');
		return;
	}
	
	// 处理iframe中的元素
	while (domElement.contentDocument) {
		domElement = domElement.contentDocument.activeElement;
	}
	
	console.log('BugMagnet: 目标元素:', domElement.tagName, domElement.type, domElement);
	
	// 检查是否为输入框
	if (domElement.tagName === 'TEXTAREA' || 
		(domElement.tagName === 'INPUT' && 
		 (domElement.type === 'text' || 
		  domElement.type === 'email' || 
		  domElement.type === 'password' || 
		  domElement.type === 'search' || 
		  domElement.type === 'tel' || 
		  domElement.type === 'url'))) {
		
		console.log('BugMagnet: 设置输入框值:', actualValue);
		domElement.value = actualValue;
		domElement.focus();
		triggerEvents(domElement, ['input', 'change']);
		
	} else if (domElement.hasAttribute('contenteditable')) {
		console.log('BugMagnet: 设置可编辑元素内容:', actualValue);
		domElement.innerText = actualValue;
		domElement.focus();
	} else {
		console.log('BugMagnet: 元素类型不支持:', domElement.tagName, domElement.type);
	}
};
