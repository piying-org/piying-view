import type { APIContext } from 'astro';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  allDocSourcePaths,
  buildCopyMarkdown,
  sourcePathToSlug,
} from '../../utils/copy-markdown';
import { ROOT } from '../../utils/preview-sources';
export const prerender = true;

export async function getStaticPaths() {
  const seen = new Set<string>();
  const paths: { params: { slug: string }; props: { file: string } }[] = [];
  for (const file of allDocSourcePaths()) {
    const slug = sourcePathToSlug(file);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    paths.push({ params: { slug }, props: { file } });
  }
  return paths;
}

export async function GET({ props }: APIContext) {
  const raw = await readFile(resolve(ROOT, props.file), 'utf-8');
  const text = await buildCopyMarkdown(raw);
  return new Response(text, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
