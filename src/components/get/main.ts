/*
 * @Author: bowen
 * @Date: 2021-06-04 17:09:26
 * @LastEditTime: 2021-06-04 17:29:26
 * @LastEditors: bowen
 * @Description: 获取图片信息 主入口
 * @FilePath: \demoExpress\src\components\get\main.ts
 * (#^.^#)
 */

const https = require('https');

/**
 * @description:
 * @param {string} defaultSrc 初始爬取地址
 * @return {*}
 */
function main(
  defaultSrc: string = 'https://wallhaven.cc/toplist?',
  defaultPage = 1
): any {
  let src = defaultSrc + defaultPage;
  https
    .get(src, (res) => {
      res.on('data', (d) => {
        process.stdout.write(d);
      });
    })
    .on('error', (e) => {
      console.error(e);
    })
    .on('timeout', (e) => {
      console.warn(e);
    });
}

module.exports = { main };
