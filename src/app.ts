/*
 * @Author: bowen
 * @Date: 2021-06-02 11:12:19
 * @LastEditTime: 2021-07-08 14:20:28
 * @LastEditors: bowen
 * @Description: 入口文件
 * @FilePath: \demoExpress\src\app.ts
 * (#^.^#)
 */
import express = require('express');
const https = require('https');
const gbk = require('gbk');
const app: express.Application = express();
const port = 9090;
const cheerio = require('cheerio');
const utils = require('./utils/utils');
const getImageInfo = require('./components/get/main');
// const iconv = require('iconv-lite');
let page: string = '1';
const fs = require('fs');
app.get('/', (req, res) => {
  res.send('Hello World!');
});

let downList = [];
let timeoutList = [];
let allList = [];
function downloadImage(allFilms: string | any[], srcName) {
  downList = [];
  // return new Promise(async (reslove, reject) => {

  // let index = 1;
  // async function main() {
  //   const picUrl = allFilms[index];
  //   if (index <= allFilms.length) {
  //     try {
  //       const res = await getImageSourceData(picUrl, index, srcName);
  //       console.log('success:' + res);
  //       index++;
  //       main()
  //     } catch (error) {
  //       console.log('timeout:' + error);
  //     }
  //   }
  //   if (index === allFilms.length) {
  //     console.log('all success');
  //   }
  // }
  // main();
  for (let i = 0; i < allFilms.length; i++) {
    const picUrl = allFilms[i];
    const name = allFilms[i].title || i;
    // console.log(picUrl, name, srcName);
    // const res = await getImageSourceData(picUrl, name, srcName);
    https
      .get(
        picUrl,
        { timeout: 3000 },
        function (res: {
          setEncoding: (arg0: string) => void;
          on: (arg0: string, arg1: { (chunk: any): void; (): void }) => void;
        }) {
          // console.log('-------', i, '-----------');
          res.setEncoding('binary');
          let str = '';
          res.on('data', function (chunk: string) {
            str += chunk;
          });

          res.on('end', async function () {
            downList.push(str);
            allList.push(i);
            // console.log(downList.length);

            const error = fs.writeFileSync(
              `./output/images/${srcName}/${name}.png`,
              str,
              'binary'
            );
            if (!error) {
              console.log(name + '下载成功');
              console.log('fs:' + allList.length === 24);
            } else {
              console.warn(name + '下载失败');
            }
          });
        }
      )
      .on('error', (e) => {
        console.error(e);
      })
      .on('timeout', () => {
        console.log('timeout', i, picUrl);
        timeoutList.push(picUrl);
        allList.push(i);
        console.log('timeout:' + allList.length === 24);
      });
  }
}

app.get('/get', (req, res) => {
  // console.log(req._parsedUrl.query);
  // let src = 'https://wallhaven.cc/toplist?' + req._parsedUrl.query;
  // page = req._parsedUrl.query.split('=')[1];
  getImageInfo('https://wallhaven.cc/toplist?', 6, 8);
  // https.get(src, function (res: any) {
  //   gbk.fetch(src).to('string', function (err: any, string: any) {
  //     if (err) return console.log(err);
  //     crawlerChapter(string);
  //   });
  // });
  res.send('ok');
});
// utils.mkdir(new Date().toLocaleDateString(),'')
// console.log(new Date().toLocaleDateString().replace(/-/g, ''));
// getImageInfo('https://wallhaven.cc/toplist?page=22')
// downloadImage(require(`../output/wallpaper7.json`), 7);
app.get('/down', (req, res) => {
  const pageJson = require(`../output/wallpaper.json`);
  let initPageNumber = 7;
  const maxPageNumber = pageJson.length;
  console.log(initPageNumber, pageJson);
  const down = async () => {
    if (initPageNumber <= maxPageNumber) {
      const downloadSrc = await require(`${pageJson[initPageNumber].src}`);
      console.log(downloadSrc);
      try {
        const res = await downloadImage(downloadSrc, initPageNumber);
        console.log(res);
        // if (res) {
        //   // initPageNumber += 1;
        //   down()
        // }
      } catch (error) {
        // down();
        console.log(error);
      }
    }
  };
  down();
  // downloadImage(downloadSrc);
  // console.log(downloadSrc);
  res.send('ok');
  // res.write(JSON.stringify(res))
});
app.use('/static', express.static('public'));
// 404 page
app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!");
});
app.listen(port, () => {
  console.log('\x1B[31m%s\x1B[0m', `Example app listening on port ${port}!`);

  utils.init();
});
