import { glob } from 'fast-glob';
import path from 'path';
import fs from 'fs';
const version = process.env['PUBLISH_VERSION'];

if (!version) {
  throw new Error('version not found');
}
async function main() {
  let absDir = path.join(process.cwd(), 'dist');
  let result = await glob('*/package.json', { cwd: absDir });
  for (const item of result) {
    JSON.stringify(
      await fs.promises.readFile(path.join(absDir, item), {
        encoding: 'utf-8',
      }),
    );
  }
  await Promise.all([
    result.map(async (item) => {
      let data = JSON.parse(
        await fs.promises.readFile(path.join(absDir, item), {
          encoding: 'utf-8',
        }),
      );
      data['version'] = version;
      if (data?.dependencies?.['@piying/view-angular-core']) {
        data.dependencies['@piying/view-angular-core'] = `^${version}`;
      }
      if (data?.dependencies?.['@piying/view-core']) {
        data.dependencies['@piying/view-core'] = `^${version}`;
      }
      await fs.promises.writeFile(
        path.join(absDir, item),
        JSON.stringify(data, undefined, 4),
      );
    }),
  ]);
  console.log(`©️${version}🔧✅`);
}
main();
