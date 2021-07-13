/*
 * @Author: bowen
 * @Date: 2021-06-04 17:09:00
 * @LastEditTime: 2021-07-13 17:10:39
 * @LastEditors: bowen
 * @Description: 获取图片地址
 * @FilePath: \demoExpress\src\components\get\getImageUrl.ts
 * (#^.^#)
 */

module.exports = async function main(
  arr: string[],
  page: string,
  callback: Function
) {
  const fs = require('fs');
  const https = require('https');
  const cheerio = require('cheerio');
  const utils = require('../../utils/utils');
  const today = new Date().toLocaleDateString();
  console.log('file:getImageUrl ', arr);
  console.log(`地址获取开始，本次任务共计${arr.length}项`);
  let isOver = false;
  let i = 0;
  let list: any[] = [];
  const getUrl = (url: string) =>
    new Promise((resolve, reject) =>
      https
        .get(url, { timeout: 3000 }, (res: any) => {
          let html: string;
          res.on('data', (value: string) => (html += value));
          res.on('end', () => {
            const $ = cheerio.load(html);
            let chapters = $('img[id=wallpaper]').attr('data-cfsrc');
            console.log(`[${i + 1}/${arr.length}]:${chapters}`);
            if (chapters) {
              resolve(chapters);
            } else {
              reject();
            }
          });
        })
        .on('error', (e) => {
          console.error(e);
        })
        .on('timeout', () => {
          reject();
          console.log('timeout', url);
        })
    );
  async function begin() {
    if (i === arr.length) {
      console.log(`开始文件写入`);
      await utils.mkdir(new Date().toLocaleDateString(), '');
      fs.writeFile(
        `./output/${new Date().toLocaleDateString()}/wallpaper${page}.json`,
        JSON.stringify(list),
        function (err: any) {
          if (!err) {
            console.log('文件写入完毕');
          }
        }
      );
      console.log(`开始更新数据到总目录`);
      const newJson = {
        id: parseInt(today.replace(/-/g, '') + page),
        folderName: parseInt(today) + '第' + page + '页',
        src: `../output/${today}/wallpaper${page}.json`,
        date:new Date().toLocaleString()
      };
      console.log(`Data:`, newJson);
      fs.readFile(
        './output/wallpaper.json',
        'utf8',
        (err: any, data: string) => {
          if (err) throw err;
          let status;
          const defaultData = JSON.parse(data);
          defaultData.map((item: { id: number }) => {
            if (item.id == newJson.id) status = false;
            if (item.id != newJson.id) {
              status = true;
            }
          });
          if (status) {
            defaultData.push(newJson);
            fs.writeFile(
              `./output/wallpaper.json`,
              JSON.stringify(defaultData),
              (err: any) => {
                if (err) throw err;
                console.log('数据已被更新到文件');
                callback(page + 1);
                // isOver = true
              }
            );
          } else {
            callback(page + 1);
          }
        }
      );
    }
    if (i <= arr.length - 1) {
      try {
        const res = await getUrl(arr[i]);
        list.push(res);
        i++;
        begin();
      } catch (error) {
        begin();
      }
    }
    if (isOver) {
      console.log('over');
    }
  }
  await begin();
};
