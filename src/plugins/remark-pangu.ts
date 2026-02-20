import { visit } from 'unist-util-visit';
import pangu from 'pangu';
import type { Root } from 'mdast';

function format<T extends string | null | undefined>(value: T) {
  if (!value) return value;
  return pangu.spacingText(value);
}

export default function remarkPangu() {
  return function (tree: Root) {
    visit(tree, (node) => {
      // text / inlineCode: format value
      if (node.type === 'text' || node.type === 'inlineCode') {
        node.value = format(node.value);
      }

      // link / image / definition: format title
      if (node.type === 'link' || node.type === 'image' || node.type === 'definition') {
        node.title = format(node.title);
      }

      // image / imageReference: format alt
      if (node.type === 'image' || node.type === 'imageReference') {
        node.alt = format(node.alt);
      }
    });
  };
}
