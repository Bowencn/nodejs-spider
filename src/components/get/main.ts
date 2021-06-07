/*
 * @Author: bowen
 * @Date: 2021-06-04 17:09:26
 * @LastEditTime: 2021-06-07 10:33:30
 * @LastEditors: bowen
 * @Description: 获取图片信息 主入口
 * @FilePath: \demoExpress\src\components\get\main.ts
 * (#^.^#)
 */

const https = require('https');
const cheerio = require('cheerio');
const getImageUrl = require('./getImageUrl');
/**
 * @description: 爬取网页html
 * @param {string} defaultSrc 初始爬取地址
 * @return {*}
 */
module.exports = function main(
  defaultSrc: string = 'https://wallhaven.cc/toplist?',
  defaultPage = 1
): any {
  let src = defaultSrc + defaultPage;
  https
    .get(src, (res: { on: (arg0: string, arg1: { (value: any): void; (value: any): void; }) => void; }) => {
      let html: string;
      res.on('data', (value: string) => {
        html += value;
      });
      res.on('end', () => {
        console.log();
        load(html,defaultPage);
      });
    })
    .on('error', (e: any) => {
      console.error(e);
    })
    .on('timeout', (e: any) => {
      console.warn(e);
    });
};

/**
 * @description: 解析html获取图片地址
 * @param {type} html html字符串
 * @return {*}
 */
function load(html: string,defaultPage:number): any {
  const $ = cheerio.load(html);
  let li = $('div[id=thumbs] ul').find('li'); //选择li
  let arr: string[] = [];
  console.log(li.length);
  li.map(function () {
    let li = $(this);
    let imgSrc = li.find('a', 'figure').attr('href'); //选择li下的a标签里herf值
    if (!li.find('figure').attr('data-wallpaper-id')) {
      // 如果figure标签data-wallpaper-id没有值得话，就不是图片
      return false;
    }
    console.log('加载中...');
    arr.push(imgSrc);
  });
  console.log('加载完成');
  getImageUrl(arr,defaultPage);
}
