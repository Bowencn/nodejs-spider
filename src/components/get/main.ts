/*
 * @Author: bowen
 * @Date: 2021-06-04 17:09:26
 * @LastEditTime: 2021-07-13 16:32:40
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
 * @param {string} defaultPage 初始爬取页数
 * @return {*}
 */
module.exports = function main(
  defaultSrc: string = 'https://wallhaven.cc/toplist?',
  defaultPage = 5,
  endPage = 0
): any {
  let src = defaultSrc + defaultPage;
  console.log('获取图片路径')
  console.log('路径地址：',defaultSrc)
  console.log('开始页数：',defaultPage)
  console.log('结束页数',endPage)
  https
    .get(
      src,
      (res: {
        on: (
          arg0: string,
          arg1: { (value: any): void; (value: any): void }
        ) => void;
      }) => {
        let html: string;
        res.on('data', (value: string) => {
          html += value;
        });
        res.on('end', async () => {
          console.log();
          await load(html, defaultPage, (res) => {
            console.log('http-callback-res:', res);
            if (endPage >= res) {
              main('https://wallhaven.cc/toplist?', res,endPage);
            }
          });
          console.log('http end!');
        });
      }
    )
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
function load(html: string, defaultPage: number, callback: Function) {
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
  getImageUrl(arr, defaultPage, callback);
  // return true;
}
