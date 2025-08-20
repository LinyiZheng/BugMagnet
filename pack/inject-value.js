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
/******/ 	return __webpack_require__(__webpack_require__.s = 10);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

const type_flag = '_type',
	generators = {
		literal: function (request) {
			'use strict';
			return request.value;
		},
		size: function (request) {
			'use strict';
			const size = parseInt(request.size, 10);
			let value = request.template;
			while (value.length < size) {
				value += request.template;
			}
			return value.substring(0, request.size);
		}
	};
module.exports = function getRequestValue(request) {
	'use strict';
	if (!request) {
		return false;
	}
	const generator = generators[request[type_flag]];
	if (!generator) {
		return false;
	}
	return generator(request);
};


/***/ }),
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

/*global chrome*/
const executeRequest = __webpack_require__(11),
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


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

const getValue = __webpack_require__(0),
	triggerEvents = __webpack_require__(12);
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


/***/ }),
/* 12 */
/***/ (function(module, exports) {

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



/***/ })
/******/ ]);