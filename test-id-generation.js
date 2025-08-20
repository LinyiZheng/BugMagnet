// 测试ID生成机制的脚本
const ChromeMenuBuilder = require('./src/lib/chrome-menu-builder');

// 模拟chrome对象
const mockChrome = {
	contextMenus: {
		create: function(options) {
			console.log('创建菜单项:', options);
			return options.id;
		},
		removeAll: function(callback) {
			console.log('清除所有菜单项');
			if (callback) callback();
		},
		onClicked: {
			addListener: function(listener) {
				console.log('添加点击监听器');
			}
		}
	}
};

console.log('开始测试ID生成...');

const menuBuilder = new ChromeMenuBuilder(mockChrome);

// 测试创建多个菜单项
console.log('\n=== 第一轮创建 ===');
const root1 = menuBuilder.rootMenu('Bug Magnet');
const sub1 = menuBuilder.subMenu('Test Submenu', root1);
const item1 = menuBuilder.menuItem('Test Item 1', sub1, () => {}, 'value1');
const item2 = menuBuilder.menuItem('Test Item 2', sub1, () => {}, 'value2');

console.log('\n=== 清除菜单 ===');
menuBuilder.removeAll();

console.log('\n=== 第二轮创建 ===');
const root2 = menuBuilder.rootMenu('Bug Magnet 2');
const sub2 = menuBuilder.subMenu('Test Submenu 2', root2);
const item3 = menuBuilder.menuItem('Test Item 3', sub2, () => {}, 'value3');

console.log('\n测试完成！');
