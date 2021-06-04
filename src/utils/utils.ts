/*
 * @Author: bowen
 * @Date: 2021-06-04 16:47:36
 * @LastEditTime: 2021-06-04 16:49:16
 * @LastEditors: bowen
 * @Description: 工具
 * @FilePath: \demoExpress\src\utils\utils.ts
 * (#^.^#)
 */

const fs = require('fs');

/**
 * @description: 检测output/images/ 文件夹下是否有文件夹 没有则创建
 * @param {string} dirName 文件夹名称
 * @return {*}
 */
function mkdir(dirName: string) {
  // 创建文件夹
  fs.access(
    `./output/images/${dirName}`,
    fs.constants.F_OK,
    (err: { code: string }) => {
      if (err) {
        if (err.code === 'ENOENT') {
          fs.mkdir(
            `./output/images/${dirName}`,
            { recursive: true },
            (err: any) => {
              if (err) throw err;
            }
          );
        }
      }
    }
  );
}
export default { mkdir };
