import path from 'path';
import fs from 'fs';
import { version } from '../package.json';
async function main() {
  const { $ } = await import('execa');
  const dir = path.join(process.cwd(), 'dist');
  const list = fs.readdirSync(dir);
  const result2 = await $({
    reject: false,
  })`git ls-remote --tags --exit-code origin refs/tags/${version}`;
  console.log(result2);
  // if (result2.stdout) {
  //   return;
  // }
  const TAG = process.env['PUBLISH_TAG'] ?? 'latest';
  await $({ stdio: 'inherit' })`npm run changelog`;
  await $({ stdio: 'inherit' })`ls- lh`;
  await $({ stdio: 'inherit' })`git add ./changelog`;
  await $({ stdio: 'inherit' })`git commit -m "changelog"`;
  console.log('end');

  // await $({ stdio: 'inherit' })`git push`;
  // await $({ stdio: 'inherit' })`git tag ${version}`;
  // await $({ stdio: 'inherit' })`git push origin ${version}`;
  return;
  for (const item of list) {
    await fs.promises.cp(
      path.join(process.cwd(), 'readme.md'),
      path.join(dir, item, 'readme.md'),
    );
    await $({ stdio: 'inherit' })('npm', [
      'publish',
      '--access=public',
      '--registry=https://registry.npmjs.org',
      `./dist/${item}`,
      //   '--dry-run',
      '--tag',
      TAG,
    ]);
    console.log(`⬆️${item}✅`);
  }

  console.log(`🏁⬆️🔚`);
}
main();
