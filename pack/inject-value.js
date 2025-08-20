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
	listener = function (request /*, sender, sendResponse */) {
		'use strict';
		executeRequest(request);
		chrome.runtime.onMessage.removeListener(listener);
	};
chrome.runtime.onMessage.addListener(listener);


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

const getValue = __webpack_require__(0),
	triggerEvents = __webpack_require__(12);
module.exports = function injectValueToActiveElement(request) {
	'use strict';
	const actualValue = getValue(request);
	let domElement = document.activeElement;
	if (!domElement || !actualValue) {
		return;
	}
	while (domElement.contentDocument) {
		domElement = domElement.contentDocument.activeElement;
	}
	if (domElement.tagName === 'TEXTAREA' || domElement.tagName === 'INPUT') {
		domElement.value = actualValue;
		triggerEvents(domElement, ['input', 'change']);
	} else if (domElement.hasAttribute('contenteditable')) {
		domElement.innerText = actualValue;
	}
};


/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = function triggerEvents(element, eventArray) {
	'use strict';
	eventArray.forEach((eventName) => {
		const evt = document.createEvent('HTMLEvents');
		evt.initEvent(eventName, true, false);
		element.dispatchEvent(evt);
	});
};



/***/ })
/******/ ]);