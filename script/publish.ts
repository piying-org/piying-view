import path from 'path';
import fs from 'fs';
async function main() {
  let { $ } = await import('execa');
  let dir = path.join(process.cwd(), 'dist');
  let list = fs.readdirSync(dir);
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
    ]);
    console.log(`⬆️${item}✅`);
  }
  console.log(`🏁⬆️🔚`);
}
main();
