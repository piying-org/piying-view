import { glob } from 'fast-glob';
import path from 'path';
import fs from 'fs';
let matchReg = /@angular\/core/g;
let match2Reg = /@piying\/view-angular-core/g;
async function main() {
  let absDir = path.join(process.cwd(), 'projects/view-core');
  let result = await glob('**/*.ts', { cwd: absDir });
  await Promise.all([
    result.map(async (item) => {
      let absFilePath = path.join(absDir, item);
      let content = await fs.promises.readFile(absFilePath, {
        encoding: 'utf-8',
      });
      content = content
        .replace(matchReg, 'static-injector')
        .replace(match2Reg, '@piying/view-core');
      return fs.promises.writeFile(absFilePath, content);
    }),
  ]);
  let result2 = await glob('*.json', { cwd: absDir });
  await Promise.all([
    result2.map(async (item) => {
      let absFilePath = path.join(absDir, item);
      let content = await fs.promises.readFile(absFilePath, {
        encoding: 'utf-8',
      });
      content = content.replaceAll('view-angular-core', 'view-core');
      return fs.promises.writeFile(absFilePath, content);
    }),
  ]);
  console.log('复制完成')
}
main();
