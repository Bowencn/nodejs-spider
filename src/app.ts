/*
 * @Author: bowen
 * @Date: 2021-06-02 11:12:19
 * @LastEditTime: 2021-06-04 16:30:53
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
// const iconv = require('iconv-lite');
let page: string = '1';
const fs = require('fs');
app.get('/', (req, res) => {
  res.send('Hello World!');
});

function crawlerChapter(html) {
  const $ = cheerio.load(html);
  let chapters = $('div[id=thumbs] ul').find('li'); //css选择器
  /**
   * @description:
   * @param {*}
   * @return {*}
   */
  let arr = [];
  chapters.map(function () {
    let chapters = $(this);
    // let chapterTitle = chapters.find('.wall-res').text(); //选择器
    let imgSrc = chapters.find('a', 'figure').attr('href'); //选择器
    if (!chapters.find('figure').attr('data-wallpaper-id')) {
      return false;
    }
    // let page_url = `https://w.wallhaven.cc/full/${imgSrc.slice(0,2)}/wallhaven-${imgSrc}.jpg`
    // let chapterData = {
    //   name: chapterTitle,
    //   pic: imgSrc,
    // };
    console.log('加载中...');
    arr.push(imgSrc);
    // if (imgSrc) {
    //   data.push(page_url);
    // }
  });
  console.log('加载完成');
  getImageDetails(arr);
}

async function getImageDetails(arr: any[]) {
  // console.log(arr);
  console.log(`地址获取开始，本次任务共计${arr.length}项`);
  let i = 0;
  let list: any[] = [];
  const getImageUrl = (url: string, sleep?: number) =>
    new Promise((resolve, reject) =>
      setTimeout(async () => {
        https
          .get(url, (res) => {
            let html;
            res.on('data', (d) => (html += d));
            res.on('end', (d) => {
              const $ = cheerio.load(html);
              let chapters = $('img[id=wallpaper]').attr('data-cfsrc');
              console.log(`[${i + 1}/${arr.length}]:${chapters}`);
              if (chapters) {
                resolve(chapters);
                console.log('resolve');
              } else {
                // getImageUrl(url);
                reject();
                console.log('重试');
              }
            });
          })
          .on('error', (e) => {
            console.error(e);
          });
        // gbk.fetch(url).to('string', function (err: any, string: any) {
        //   if (err) return console.log(err);
        //   const $ = cheerio.load(string);
        //   let chapters = $('img[id=wallpaper]').attr('data-cfsrc');
        //   console.log(i,chapters)
        //   resolve(chapters);
        //   reject(err);
        // });
      }, sleep || 0)
    );
  async function main() {
    console.log(i, '/', arr.length);
    if (i === arr.length) {
      console.log(`开始文件写入`);
      console.log(list);
      fs.writeFile(
        `./output/wallpaper${page}.json`,
        JSON.stringify(list),
        function (err: any) {
          if (!err) {
            console.log('文件写入完毕');
            // console.log('\x1B[31m%s\x1B[0m', '开始下载');
            // downloadImage(list);
          }
        }
      );
      const newJson = {
        id: parseInt(page),
        pageNumber: parseInt(page),
        src: `../output/wallpaper${page}.json`,
      };
      fs.readFile('./output/wallpaper.json', 'utf8', (err, data) => {
        if (err) throw err;
        let status;
        const defaultData = JSON.parse(data);
        defaultData.map((item) => {
          if (item.id == newJson.id) status = false;
          if (item.id != newJson.id) {
            status = true;
          }
        });
        console.log(status);
        if (status) {
          defaultData.push(newJson);
          fs.writeFile(
            `./output/wallpaper.json`,
            JSON.stringify(defaultData),
            (err) => {
              if (err) throw err;
              console.log('数据已被更新到文件');
            }
          );
        }
      });
    }
    if (i <= arr.length - 1) {
      try {
        const res = await getImageUrl(arr[i]);
        console.log('for-main', res);
        list.push(res);
        i++;
        main();
      } catch (error) {
        main();
      }
    }
  }
  await main();
}

let downList = [];
let timeoutList = [];

const getImageSourceData = (picUrl, name, srcName) => {
  https
    .get(
      picUrl,{timeout: 3000},
      function (res: {
        setEncoding: (arg0: string) => void;
        on: (arg0: string, arg1: { (chunk: any): void; (): void }) => void;
      }) {
        // console.log('-------', i, '-----------');
        res.setEncoding('binary');
        // console.time('下载');
        let str = '';
        res.on('data', function (chunk: string) {
          str += chunk;
        });
        res.on('end', async function () {
          downList.push(str);
          console.log(downList.length);
          // console.log('net - success');
          // fs.access(`./output/images/${srcName}`, fs.constants.F_OK, (err) => {
          //   if (err) {
          //     console.log(err);
          //     if (err.code === 'ENOENT') {
          //       console.log(err);
          //       fs.mkdir(
          //         `./output/images/${srcName}`,
          //         { recursive: true },
          //         (err) => {
          //           if (err) throw err;
          //         }
          //       );
          //     }
          //   }
          // });
          // console.timeEnd('下载');
          // fs.writeFile(
          //   `./output/images/${srcName}/${name}.png`,
          //   str,
          //   'binary',
          //   (err) => {
          //     if (!err) {
          //     } else {
          //     }
          //   }
          // );
        });
      }
    )
    .on('error', (e) => {
      console.error(e);
    })
    .on('timeout', () => {
      console.log('timeout', picUrl);
      timeoutList.push(picUrl);
    });
};
async function downloadImage(allFilms: string | any[], srcName) {
  // return new Promise(async (reslove, reject) => {
  for (let i = 0; i < allFilms.length; i++) {
    const picUrl = allFilms[i];
    const name = allFilms[i].title || i;
    downList = []
    getImageSourceData(picUrl, name, srcName);
    // console.log(picUrl, name, srcName);
    // const res = await getImageSourceData(picUrl, name, srcName);
    // console.log(res);
    // 请求 -> 拿到内容
    // fs.writeFile('./xx.png','内容')
    // https
    //   .get(
    //     picUrl,
    //     {timeout: 3000},
    //     function (res: {
    //       setEncoding: (arg0: string) => void;
    //       on: (arg0: string, arg1: { (chunk: any): void; (): void }) => void;
    //     }) {
    //       // console.log('-------', i, '-----------');
    //       res.setEncoding('binary');
    //       let str = '';
    //       res.on('data', function (chunk: string) {
    //         str += chunk;
    //       });

    //       res.on('end', async function () {
    //         downList.push(str);
    //         console.log(downList.length);
    //         // 创建文件夹
    //         // fs.access(`./output/images/${srcName}`, fs.constants.F_OK, (err) => {
    //         //   if (err) {
    //         //     console.log(err);
    //         //     if (err.code === 'ENOENT') {
    //         //       console.log(err);
    //         //       fs.mkdir(
    //         //         `./output/images/${srcName}`,
    //         //         { recursive: true },
    //         //         (err) => {
    //         //           if (err) throw err;
    //         //         }
    //         //       );
    //         //     }
    //         //   }
    //         // });
    //         // const error = fs.writeFileSync(
    //         //   `./output/images/${srcName}/${name}.png`,
    //         //   str,
    //         //   'binary'
    //         // );
    //         // if (!error) {
    //         //   downList.push(name);
    //         //   console.log(name);
    //         // } else {
    //         //   console.warn(name + '下载失败');
    //         //   errorDownList.push(name);
    //         //   console.log(errorDownList);
    //         // }
    //       });
    //     }
    //   )
    //   .on('error', (e) => {
    //     console.error(e);
    //   }).on('timeout',()=>{
    //     console.log('timeout',i,picUrl)
    //     timeoutList.push(picUrl)
    //   });

    // console.log('完成');
  }
}
app.get('/get', (req, res) => {
  console.log(req._parsedUrl.query);
  let src = 'https://wallhaven.cc/toplist?' + req._parsedUrl.query;
  page = req._parsedUrl.query.split('=')[1];
  https.get(src, function (res: any) {
    gbk.fetch(src).to('string', function (err: any, string: any) {
      if (err) return console.log(err);
      crawlerChapter(string);
    });
  });
  res.send('ok');
});

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
});
