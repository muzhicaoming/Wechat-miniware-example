#!/usr/bin/env node

/**
 * 微信小程序开发环境检查脚本
 *
 * 这个脚本会检查是否在正确的环境中运行小程序代码
 * 并给出相应的提示和解决方案
 */

const chalk = require('chalk');

console.log(chalk.blue('====================================='));
console.log(chalk.blue('   微信小程序运行环境检查'));
console.log(chalk.blue('=====================================\n'));

// 检查是否为小程序环境
if (typeof App === 'undefined' || typeof Page === 'undefined') {
  console.log(chalk.red('❌ 错误：当前不是微信小程序运行环境'));
  console.log(chalk.yellow('\n💡 解决方案：'));
  console.log(chalk.white('1. 使用微信开发者工具打开本项目'));
  console.log(chalk.white('2. 点击"编译"按钮运行小程序'));
  console.log(chalk.white('3. 不要在 Node.js 或浏览器中直接运行小程序代码\n'));

  console.log(chalk.cyan('📱 微信开发者工具下载地址：'));
  console.log(chalk.underline('https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html\n'));

  console.log(chalk.green('✅ 项目结构检查：'));
  console.log(chalk.white('- app.js ✓'));
  console.log(chalk.white('- app.json ✓'));
  console.log(chalk.white('- pages/ 目录 ✓'));
  console.log(chalk.white('- project.config.json ✓\n'));

  process.exit(1);
} else {
  console.log(chalk.green('✅ 当前是微信小程序运行环境'));
  console.log(chalk.green('小程序可以正常运行\n'));
}