import { visit } from 'unist-util-visit';

const RAW_URL = /^(?:#|\/\/|[a-z][a-z0-9+.-]*:)/i;

export default function mdastBaseLinks({ base }) {
  return {
    name: 'mdast-base-links',
    before(tree, ctx) {
      visit(tree, (node) => {
        const url = node.url;
        if (!url || RAW_URL.test(url) || url.startsWith(base)) return;
        ctx.setProperty(node, 'url', base + url.replace(/^\.?\/+/, ''));
      });
    },
  };
}
