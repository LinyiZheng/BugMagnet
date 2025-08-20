module.exports = function triggerEvents(element, eventArray) {
	'use strict';
	eventArray.forEach((eventName) => {
		try {
			// 使用现代的事件创建方法
			const evt = new Event(eventName, {
				bubbles: true,
				cancelable: true
			});
			element.dispatchEvent(evt);
		} catch (e) {
			// 回退到旧方法
			try {
				const evt = document.createEvent('HTMLEvents');
				evt.initEvent(eventName, true, false);
				element.dispatchEvent(evt);
			} catch (fallbackError) {
				console.log('BugMagnet: 无法触发事件:', eventName, fallbackError);
			}
		}
	});
};

