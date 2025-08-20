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
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
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
/* 1 */
/***/ (function(module, exports) {

module.exports = function ChromeBrowserInterface(chrome) {
	'use strict';
	const self = this;
	self.saveOptions = function (options) {
		chrome.storage.sync.set(options);
	};
	self.getOptionsAsync = function () {
		return new Promise((resolve) => {
			chrome.storage.sync.get(null, resolve);
		});
	};
	self.openSettings = function () {
		if (chrome.runtime.openOptionsPage) {
			chrome.runtime.openOptionsPage();
		} else {
			window.open(chrome.runtime.getURL('options.html'));
		}
	};
	self.openUrl = function (url) {
		window.open(url);
	};
	self.addStorageListener = function (listener) {
		chrome.storage.onChanged.addListener(function (changes, areaName) {
			if (areaName === 'sync') {
				listener(changes);
			};
		});
	};
	self.getRemoteFile = function (url) {
		return fetch(url, {mode: 'cors'}).then(function (response) {
			if (response.ok) {
				return response.text();
			}
			throw new Error('Network error reading the remote URL');
		});
	};
	self.closeWindow = function () {
		window.close();
	};
	self.readFile = function (fileInfo) {
		return new Promise((resolve, reject) => {
			const oFReader = new FileReader();
			oFReader.onload = function (oFREvent) {
				try {
					resolve(oFREvent.target.result);
				} catch (e) {
					reject(e);
				}
			};
			oFReader.onerror = reject;
			oFReader.readAsText(fileInfo, 'UTF-8');
		});
	};
	self.executeScript = function (tabId, source) {
		return new Promise((resolve) => {
			if (chrome.scripting && chrome.scripting.executeScript) {
				// Manifest V3
				return chrome.scripting.executeScript({
					target: { tabId: tabId },
					files: [source]
				}, resolve);
			} else {
				// Manifest V2 fallback
				return chrome.tabs.executeScript(tabId, {file: source}, resolve);
			}
		});
	};
	self.sendMessage = function (tabId, message) {
		return new Promise((resolve, reject) => {
			console.log('BugMagnet: 发送消息到标签页:', tabId, '消息:', message);
			
			try {
				chrome.tabs.sendMessage(tabId, message, (response) => {
					if (chrome.runtime.lastError) {
						console.error('BugMagnet: 发送消息时出错:', chrome.runtime.lastError);
						reject(chrome.runtime.lastError);
					} else {
						console.log('BugMagnet: 消息发送成功，响应:', response);
						resolve(response);
					}
				});
			} catch (error) {
				console.error('BugMagnet: 发送消息时捕获到错误:', error);
				reject(error);
			}
		});
	};

	self.requestPermissions = function (permissionsArray) {
		return new Promise((resolve, reject) => {
			try {
				chrome.permissions.request({permissions: permissionsArray}, function (granted) {
					if (granted) {
						resolve();
					} else {
						reject();
					}
				});
			} catch (e) {
				console.log(e);
				reject(e);
			}
		});
	};
	self.removePermissions = function (permissionsArray) {
		return new Promise((resolve) => chrome.permissions.remove({permissions: permissionsArray}, resolve));
	};
	self.copyToClipboard = function (text) {
		const handler = function (e) {
			e.clipboardData.setData('text/plain', text);
			e.preventDefault();
		};
		document.addEventListener('copy', handler);
		document.execCommand('copy');
		document.removeEventListener('copy', handler);
	};
	self.showMessage = function (text) {
		chrome.tabs.executeScript(null, {code: `alert("${text}")`});
	};
};



/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

const getRequestValue = __webpack_require__(0);
module.exports = function pasteRequestHandler(browserInterface, tabId, request) {
	'use strict';
	browserInterface.copyToClipboard(getRequestValue(request));
};


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

/*global chrome, browser*/
const ContextMenu = __webpack_require__(4),
	ChromeMenuBuilder = __webpack_require__(7),
	ChromeBrowserInterface = __webpack_require__(1),
	processMenuObject = __webpack_require__(8),
	// 从pack目录加载配置，这样用户修改后能立即生效
	standardConfig = __webpack_require__(9),
	isFirefox = (typeof browser !== 'undefined');

console.log('BugMagnet: 加载配置:', standardConfig);

new ContextMenu(
	standardConfig,
	new ChromeBrowserInterface(chrome),
	new ChromeMenuBuilder(chrome),
	processMenuObject,
	!isFirefox
).init();



/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

const injectValueRequestHandler = __webpack_require__(5),
	pasteRequestHandler = __webpack_require__(6),
	copyRequestHandler = __webpack_require__(2);
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



/***/ }),
/* 5 */
/***/ (function(module, exports) {

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



/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

const copyToClipboard = __webpack_require__(2);
module.exports = function pasteRequestHandler(browserInterface, tabId, request) {
	'use strict';
	copyToClipboard(browserInterface, tabId, request);
	return browserInterface.executeScript(tabId, '/paste.js');
};


/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = function ChromeMenuBuilder(chrome) {
	'use strict';
	let itemValues = {},
		itemHandlers = {},
		menuCounter = 0,
		usedIds = new Set();
	const self = this,
		contexts = ['editable'];
	
	// 生成唯一ID的辅助函数
	const generateId = (prefix) => {
		const timestamp = Date.now();
		const random = Math.random().toString(36).substr(2, 9);
		const id = `${prefix}_${timestamp}_${random}`;
		usedIds.add(id);
		return id;
	};
	
	// 清理ID记录
	const cleanupId = (id) => {
		usedIds.delete(id);
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
		// 清理所有数据
		itemValues = {};
		itemHandlers = {};
		usedIds.clear();
		menuCounter = 0;
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


/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = function processMenuObject(configObject, menuBuilder, parentMenu, onClick) {
	'use strict';
	const getTitle = function (key) {
		if (configObject instanceof Array) {
			return configObject[key];
		}
		return key;
	};
	if (!configObject) {
		return;
	}
	Object.keys(configObject).forEach(function (key) {
		const value = configObject[key],
			title = getTitle(key);
		let result;
		if (typeof (value) === 'string' || (typeof (value) === 'object' && value.hasOwnProperty('_type'))) {
			menuBuilder.menuItem(title, parentMenu, onClick, value);
		} else if (typeof (value) === 'object') {
			result = menuBuilder.subMenu(title, parentMenu);
			processMenuObject(value, menuBuilder, result, onClick);
		}
	});
};



/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = {"Lorems":{"Latin":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.","Cyrillic":"Римский император Константин I Великий по достоинству оценил выгодное местоположение приморского Византия, расположенного на стыке Европы и Азии. Кроме того, на решение Константина повлияла неспокойная обстановка в самом Риме: недовольство знати и постоянные распри в борьбе за трон. Император хотел увенчать свою реформаторскую деятельность созданием нового административного центра огромной державы. Закладка города состоялась осенью 324 года, и Константин лично решил обозначить его границы.","Arabic (RTL)":"وضع ابن الهيثم تصور واضح للعلاقة بين النموذج الرياضي المثالي ومنظومة الظواهر الملحوظة.","Chinese":"北京位於華北平原的西北边缘，背靠燕山，有永定河流经老城西南，毗邻天津市、河北省，是一座有三千余年建城历史、八百六十余年建都史的历史文化名城，历史上有金、元、明、清、中华民国（北洋政府时期）等五个朝代在此定都，以及数个政权建政于此，荟萃了自元明清以来的中华文化，拥有众多历史名胜古迹和人文景观。《不列颠百科全书》将北京形容为全球最伟大的城市之一，而且断言，“这座城市是中国历史上最重要的组成部分。在中国过去的八个世纪里，不论历史是否悠久，几乎北京所有主要建筑都拥有着不可磨灭的民族和历史意义”。北京古迹众多，著名的有故宫、天坛、颐和园、圆明园、北海公园等。","Mixed charsets":"Lorem ipsum dolor sit amet, Римский император Константин I Великий, 北京位於華北平原的西北边缘","Czech":"Příliš žluťoučký kůň úpěl ďábelské ódy","Thai":"ทดสอบนะจ๊ะ","Hindi":"एक जल्दी भूरी लोमड़ी आलसी कुत्ते पर कूदता","Unicode symbols (non letters)":"Iñtërnâtiônàlizætiøn☃💪"},"Names":{"Latin charset":["John O'Grady","Peter de Montfort","John James O'Grady","John James \"Jimmy\" O'Grady","José Casal-Giménez","María-Jose Carreño Quiñones","Milan Vojnovič","Chloë Rømer","Björk Guðmundsdóttir","Rosalind Arusha Arkadina Altalune Florence Thurman-Busson","Leone Sextus Denys Oswolf Fraudatifilius Tollemache-Tollemache de Orellana Plantagenet Tollemache-Tollemache","Alasdair Mór Ùisdean GillEasbaig 'ic Iain Mac a' Ghobhainn Fear an t-Srònaich","Abu Karim Muhammad al-Jamil ibn Nidal ibn Abdulaziz al-Filistini","Nguyễn Tấn Dũng"],"Name length":["Rhoshandiatellyneshiaunneveshenk","StopFortnumAndMasonFoieGras","Stephen O","A Martinez","They"],"Unusual accents/chars":["Keihanaikukauakahihuliheʻekahaunaele","GoVeg.com","Number 16 Bus Shelter","John Blake Cusack 2.0"],"Other charsets":{"Japanese":"田中太郎","Japanese Tōkairin":"東海林賢蔵","Ze Dong":"泽东","Russian male":"Борис Николаевич Ельцин","Russian female":"Наина Иосифовна Ельцина","Ukrainian female":"Леся Українка","Thai nickname":"แม","Arabic":"ابن خلدون"},"Commonly thought as invalid":["Null","nil","false","Tom Test","Jeff Sample"],"Unicode case folding":"ᴮᴵᴳᴮᴵᴿᴰ","James Bond (with middle names)":"James Dr No From Russia with Love Goldfinger Thunderball You Only Live Twice On Her Majesty’s Secret Service Diamonds Are Forever Live and Let Die The Man with the Golden Gun The Spy Who Loved Me Moonraker For Your Eyes Only Octopussy A View to a Kill The Living Daylights Licence to Kill Golden Eye Tomorrow Never Dies The World Is Not Enough Die Another Day Casino Royale Bond"},"Post Codes":{"Alphanumeric (GB)":"EC11AA","With spaces (GB)":"EC1 1AA","4 digits (Aarau, CH)":"5004","3 digits (Kvivik, FO)":"340","10 digits (Tehran, IR)":"1193653471"},"Cities":{"Scandinavian letters":"Ærøskøbing","Welsh":"Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch","Single letter - Norwegian":"Å","Single letter - France":"Y"},"E-mail addresses":{"Valid":{"Simple":"email@domain.com","Dot in the address":"firstname.lastname@domain.com","Subdomain":"email@subdomain.domain.com","Plus in address":"firstname+lastname@domain.com","Numeric domain":"email@123.123.123.123","Square bracket around IP address":"email@[123.123.123.123]","Unnecessary quotes around address":"\"email\"@domain.com","Necessary quotes around address":"\"email..email\"@domain.com","Numeric address":"1234567890@domain.com","Dash in domain":"email@domain-one.com","Underscore":"_______@domain.com",">3 char TLD":"email@domain.name","2 char TLD":"email@domain.co.jp","Dash in address":"firstname-lastname@domain.com","Intranet":"name@localhost","Non-ascii Email":"nathan@学生优惠.com"},"Invalid":{"No @ or domain":"plainaddress","Missing @":"email.domain.com","Missing address":"@domain.com","Garbage":"#@%^%#$@#$@#.com","Copy/paste from address book with name":"Joe Smith <email@domain.com>","Superfluous text":"email@domain.com (Joe Smith)","Two @":"email@domain@domain.com","Leading dot in address":".email@domain.com","Trailing dot in address":"email.@domain.com","Multiple dots":"email..email@domain.com","Unicode chars in address":"あいうえお@domain.com","Leading dash in domain":"email@-domain.com","Leading dot in domain":"email@.domain.com","Invalid IP format":"email@111.222.333.44444","Multiple dots in the domain":"email@domain..com"}},"URLs":{"Valid":["www.mysite.com","mysite.com","http://www.mysite.com","https://www.mysite.com","http://www.mysite.com:80","ftp://mysite.com","https://www.xn--80ak6aa92e.com/"],"Invalid":["http//www.mysite.com","http:/www.mysite.com","://www.mysite.com","foo://www.mysite.com","http://:","mysite"]},"Numbers":["0","32767","32768","32769","65535","65536","65537","2147483647","2147483648","2147483649","4294967295","4294967296","4294967297","1E-16","-1","0.0001","1,234,567","1.234.567,89"],"Amounts":["5000","$5,000","$5 000","$5,000.00"],"Currencies":{"No decimals":"JPY","3 Decimals":"KWD"},"Payment cards":{"Authorize.net":{"Credit Card":{"American Express":"370000000000002","Discover":"6011000000000012","JCB":"3088000000000017","Diners Club/ Carte Blanch":"38000000000006","Visa":"4007000000027","MasterCard":"5424000000000015"},"Zip Code":{"Declined":"46282","AVS Invalid":"46203","AVS Unavailable":"46207","Non US Bank":"46204"},"CVV":{"Successful":"900","Does Not Match":"901","Not Processed":"46207"}},"Braintree":{"Valid Credit Card":{"American Express":"378282246310005","Discover":"6011111111111117","MasterCard":"5555555555554444","Visa":"4111111111111111"},"Invalid Credit Card":{"Visa":"4000111111111115","MasterCard":"5105105105105100","American Express":"378734493671000","JCB":"3566002020360505"}},"Cybersource":{"Credit Card":{"Visa":"4111111111111111","MasterCard":"5555555555554444","American Express":"378282246310005","Discover":"6011111111111117","JCB":"3566111111111113"}},"Payflow Pro":{"Credit Card":{"American Express":"378282246310005","American Express Corporate":"378734493671000","Diners Club":"30569309025904","Discover":"6011111111111117","JCB":"3530111333300000","MasterCard":"5555555555554444","Visa":"4111111111111111"}},"Paypal":{"Dankort PBS":"5019717010103742","American Express":"378282246310005","Visa":"4111111111111111","Discover":"6011000990139424","Visa (short)":"4222222222222","Switch/Solo (Paymentech)":"6331101999990016","Australian BankCard":"5610591081018250","Dankort PBS (short)":"76009244561","MasterCard":"5555555555554444","American Express Corporate":"378734493671000","JCB":"3566002020360505"},"Spreedly":{"Valid":{"Visa":"4111111111111111","MasterCard":"5555555555554444","American Express":"378282246310005","Discover":"6011111111111117","Diners Club":"30569309025904","JCB":"3530111333300000"},"Boundary Workflows":{"Successful charge, but...":{"funds added directly to available balance (bypassing pending)":"4000000000000077","address_line1_check and address_zip_check fail":"4000000000000010","address_line1_check fail":"4000000000000028","address_zip_check fail":"4000000000000036","address_zip_check and address_line1_check unavailable":"4000000000000044","CVC check will fail (if CVC entered)":"4000000000000101"},"Charge declined ..":{"Visa":"4012888888881881","Mastercard":"5105105105105100","American Express":"371449635398431"}}},"Stripe":{"Valid":{"Visa":"4242424242424242","Visa (debit)":"4000056655665556","MasterCard":"5555555555554444","MasterCard (debit)":"5200828282828210","MasterCard (prepaid)":"5105105105105100","American Express":"378282246310005","Discover":"6011111111111117","Diners Club":"30569309025904","JCB":"3530111333300000"},"Boundary Workflows":{"Successful charge, but...":{"funds added directly to available balance (bypassing pending)":"4000000000000077","address_line1_check and address_zip_check fail":"4000000000000010","address_line1_check fail":"4000000000000028","address_zip_check fail":"4000000000000036","address_zip_check and address_line1_check unavailable":"4000000000000044","CVC check will fail (if CVC entered)":"4000000000000101"},"Charge declined and..":{"Card still added to customer":"4000000000000341","Card declined":"4000000000000002","Fraud":"4100000000000019","Incorrect CVC":"4000000000000127","Expired Card":"4000000000000069","Processing Error":"4000000000000119"}}},"Vantiv":{"Credit Card":{"Visa":"4457010140000141","MasterCard":"5112000100000003","Discover":"6011010140000004","American Express":"375001000000005"},"CVV":{"Fail":"352","Fail Due to Security Mismatch":"358","Do Not Honor":"349","Generic Decline":"350"}}},"Text size":{"With spaces":{"128b":{"_type":"size","size":"128","template":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."},"129b":{"_type":"size","size":"129","template":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."},"256b":{"_type":"size","size":"256","template":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."},"257b":{"_type":"size","size":"257","template":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."},"32K - 1":{"_type":"size","size":"32767","template":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."},"32K":{"_type":"size","size":"32768","template":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."},"32K + 1":{"_type":"size","size":"32769","template":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."},"64K - 1":{"_type":"size","size":"65535","template":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."},"64K":{"_type":"size","size":"65536","template":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."},"64K + 1":{"_type":"size","size":"65537","template":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}},"Without spaces":{"128b":{"_type":"size","size":"128","template":"0123456789"},"129b":{"_type":"size","size":"129","template":"0123456789"},"256b":{"_type":"size","size":"256","template":"0123456789"},"257b":{"_type":"size","size":"257","template":"0123456789"},"32K - 1":{"_type":"size","size":"32767","template":"0123456789"},"32K":{"_type":"size","size":"32768","template":"0123456789"},"32K + 1":{"_type":"size","size":"32769","template":"0123456789"},"64K - 1":{"_type":"size","size":"65535","template":"0123456789"},"64K":{"_type":"size","size":"65536","template":"0123456789"},"64K + 1":{"_type":"size","size":"65537","template":"0123456789"}}},"Whitespace":{"Tabs and newlines":"Contains\tTabs\nAnd\tNewlines","Leading spaces":"  leading spaces","Mixing tabs and spaces":"\t leading tabs and spaces","spaces on both sides":" Space on both sides ","Just whitespace":"\t \t\n \n "},"Format exploits":{"SQL Injection":"Robert'); DROP TABLE Students;--","JS Script Injection":"Nice site,  I think I'll take it. <script>alert('Executing JS')</script>","JS String (XSS) Injection - single quote":"'-prompt()-'","JS String (XSS) Injection - double quote":"\"-prompt()-\"","HTML parsing":"<blink>Hello there</blink>","Broken HTML":"<i><b>Bold</i></b>"},"Unicode":{"Direction":{"Right-to-left override":"1234‮1234","Left-to-right override":"אבגד‭אבגד","RTL without override":"אבגד","curseword with direction switch for profanity filters":"‮kcuf‭ you"},"Looking like latin":{"fake apple.com":"https://аррӏе.com","with cyrilic a":"https://аpple.com","single-charset":"https://еріс.com/"},"Confusable":{"colon":"：ː˸։፡᛬⁚∶⠆︓﹕","semi-colon":"；;︔﹔","equals":"＝═⚌﹦","dollar sign":"＄﹩","plus":"＋᛭﹢","comma":"，ˏᛧ‚","a":"ªᵃᵅₐⓐａ"},"Case transforms":{"Small sharp S":"ß","Turkish Is":"iIİı"},"Length":{"Very long":"﷽","two rows":"NͫOͬ","Letter + Diacritic":"á","Symbol + Symbol combiner":"←⃝","Cantillation marks":"֪֟֨A","Nonsense":{"Letter + Symbol combiner":"A⃝","Symbol + Diacritic":"←́","only diacritic":"́","only symbol combiner":"́","only cantillation mark":"֟"},"Text with invisible spaces":{"Mongolian Vowel Separator":"two᠎words","Zero-width joiner":"two‍words","Zero-width non-joiner":"two‌words"}},"Emoji":{"plain":"👩","+variation selector":"👩🏿","+zws combo":"👩‍🍳","+zws combo + variation selector":"👩🏿‍🍳"},"Variations":{"regional indicators":{"US Flag":"🇺🇸","Chinese Flag":"🇨🇳","invalid combination":"🇺🇳"},"variation selectors":{"VS16 (emoji style)":"❤️","VS15 (text style)":"❤︎","nonsense":{"just the variation selector":"️","VS16 + invalid char":"A️","VS15 + smiley":"😁︎"}}}}}

/***/ })
/******/ ]);