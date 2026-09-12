import type { APIContext } from 'astro';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { definitionFiles, toPlaygroundCode } from '../../utils/definition-playground';
import { ROOT, definitionName } from '../../utils/preview-sources';

export const prerender = true;

export async function getStaticPaths() {
  return definitionFiles().map((file) => ({
    params: { name: definitionName(file) },
    props: { file },
  }));
}

export async function GET({ props }: APIContext) {
  const source = await readFile(resolve(ROOT, props.file), 'utf-8');
  const code = await toPlaygroundCode(source, props.file);
  return new Response(
    JSON.stringify({ name: definitionName(props.file), source: props.file, code }),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  );
}
