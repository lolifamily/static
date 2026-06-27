import { defineMdastPlugin } from 'satteri';
import pangu from 'pangu';

function format(value: string): string {
  if (!value) return value;
  return pangu.spacingText(value);
}

/**
 * Pangu(盘古之白)—— 在 CJK 与西文之间自动插入空格。
 * Sätteri 版:逐节点 visitor 替代 unist-util-visit,ctx.setProperty 改写 value/title/alt。
 */
export default function remarkPanguSatteri() {
  return defineMdastPlugin({
    name: 'remark-pangu-satteri',
    text(node, ctx) {
      ctx.setProperty(node, 'value', format(node.value));
    },
    inlineCode(node, ctx) {
      ctx.setProperty(node, 'value', format(node.value));
    },
    link(node, ctx) {
      if (node.title != null) ctx.setProperty(node, 'title', format(node.title));
    },
    image(node, ctx) {
      if (node.title != null) ctx.setProperty(node, 'title', format(node.title));
      if (node.alt != null) ctx.setProperty(node, 'alt', format(node.alt));
    },
    definition(node, ctx) {
      if (node.title != null) ctx.setProperty(node, 'title', format(node.title));
    },
    imageReference(node, ctx) {
      if (node.alt != null) ctx.setProperty(node, 'alt', format(node.alt));
    },
  });
}
