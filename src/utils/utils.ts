/*
 * @Author: bowen
 * @Date: 2021-06-04 16:47:36
 * @LastEditTime: 2021-06-07 11:09:34
 * @LastEditors: bowen
 * @Description: 工具
 * @FilePath: \demoExpress\src\utils\utils.ts
 * (#^.^#)
 */

const fs = require('fs');

/**
 * @description: 创建文件夹
 * @param {string} dirName 文件夹名称
 * @return {*}
 */
function mkdir(dirName: string, path = 'images') {
  // 创建文件夹
  console.log('dirname', dirName);
  fs.access(
    `./output/${path}/${dirName.toString()}`,
    fs.constants.F_OK,
    (err: { code: string }) => {
      if (err) {
        if (err.code === 'ENOENT') {
          console.log('文件夹： ' + dirName + ' 不存在，正在创建文件夹');
          fs.mkdir(
            `./output/${path}/${dirName.toString()}`,
            { recursive: true },
            (err: any) => {
              if (err) throw err;
              console.log('文件夹 ' + dirName + ' 创建成功');
            }
          );
        }
      } else {
        console.log('文件夹 ' + dirName + ' 已存在');
      }
    }
  );
}
/**
 * @description: 检测文件夹
 * @param {string} dirName
 * @return {*}
 */
// function access(dirName: string) {
//   // 创建文件夹
//   fs.access(
//     `./output/images/${dirName}`,
//     fs.constants.F_OK,
//     (err: { code: string }) => {
//       if (err) {
//         if (err.code === 'ENOENT') {
//           fs.mkdir(
//             `./output/images/${dirName}`,
//             { recursive: true },
//             (err: any) => {
//               if (err) throw err;
//             }
//           );
//         }
//       }
//     }
//   );
// }
module.exports = { mkdir };
