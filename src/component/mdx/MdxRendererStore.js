import { makeAutoObservable, runInAction } from 'mobx';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import styleToJS from 'style-to-js';

const mdxNodeTypeBlockedSet = new Set([
  'mdxjsEsm',
  'mdxFlowExpression',
  'mdxTextExpression',
  'mdxJsxAttributeValueExpression',
]);

function remarkMdxReactAttributeNormalize() {
  return (tree) => {
    const nodeNormalize = (node) => {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node.attributes)) {
        node.attributes = node.attributes.filter((attribute) => {
          const name = String(attribute?.name || '');
          return name !== 'dangerouslySetInnerHTML' && !/^on/i.test(name);
        });
        node.attributes.forEach((attribute) => {
          if (attribute?.name === 'class') attribute.name = 'className';
          if (attribute?.name === 'for') attribute.name = 'htmlFor';
          if (attribute?.name === 'style' && typeof attribute.value === 'string') {
            const style = styleToJS(attribute.value);
            const expression = {
              type: 'ObjectExpression',
              properties: Object.entries(style).map(([name, value]) => ({
                type: 'Property',
                method: false,
                shorthand: false,
                computed: false,
                kind: 'init',
                key: { type: 'Literal', value: name, raw: JSON.stringify(name) },
                value: { type: 'Literal', value, raw: JSON.stringify(value) },
              })),
            };
            attribute.value = {
              type: 'mdxJsxAttributeValueExpression',
              value: '',
              data: {
                estree: {
                  type: 'Program',
                  sourceType: 'module',
                  body: [{ type: 'ExpressionStatement', expression }],
                },
              },
            };
          }
        });
      }
      Object.values(node).forEach((value) => {
        if (Array.isArray(value)) value.forEach(nodeNormalize);
        else if (value && typeof value === 'object') nodeNormalize(value);
      });
    };
    nodeNormalize(tree);
  };
}

function sourceMdxNormalize(source, isExpressionAllowed) {
  let sourceNormalized = String(source || '').replace(/<!--[\s\S]*?-->/g, '');
  sourceNormalized = sourceNormalized.replace(
    /<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)(\s[^<>]*?)?(?<!\/)\s*>/gi,
    '<$1$2 />',
  );
  if (!isExpressionAllowed) {
    sourceNormalized = sourceNormalized.replaceAll('{', '&#123;').replaceAll('}', '&#125;');
  }
  return sourceNormalized;
}

function remarkMdxTableNormalize() {
  return (tree) => {
    const isElement = (node, name) => (
      (node?.type === 'mdxJsxFlowElement' || node?.type === 'mdxJsxTextElement')
      && String(node.name || '').toLowerCase() === name
    );
    const isWhitespace = (node) => node?.type === 'text' && /^\s*$/.test(node.value || '');
    const childrenNormalize = (children) => {
      const childrenNormalized = [];
      for (let childIndex = 0; childIndex < children.length; childIndex += 1) {
        const child = children[childIndex];
        if (!isElement(child, 'tr')) {
          childrenNormalized.push(child);
          continue;
        }
        const rowList = [child];
        let childIndexNext = childIndex + 1;
        while (childIndexNext < children.length) {
          while (childIndexNext < children.length && isWhitespace(children[childIndexNext])) {
            childIndexNext += 1;
          }
          if (!isElement(children[childIndexNext], 'tr')) break;
          rowList.push(children[childIndexNext]);
          childIndexNext += 1;
        }
        childrenNormalized.push({
          type: child.type,
          name: 'tbody',
          attributes: [],
          children: rowList,
        });
        childIndex = childIndexNext - 1;
      }
      return childrenNormalized;
    };
    const nodeNormalize = (node) => {
      if (!node || typeof node !== 'object') return;
      if (isElement(node, 'table') && Array.isArray(node.children)) {
        node.children = childrenNormalize(node.children.map((child) => {
          if (child?.type !== 'paragraph' || !Array.isArray(child.children)) return child;
          return { ...child, children: childrenNormalize(child.children) };
        }));
      }
      Object.values(node).forEach((value) => {
        if (Array.isArray(value)) value.forEach(nodeNormalize);
        else if (value && typeof value === 'object') nodeNormalize(value);
      });
    };
    nodeNormalize(tree);
  };
}

function remarkMdxExecutableBlock() {
  return (tree) => {
    const nodeCheck = (node) => {
      if (!node || typeof node !== 'object') return;
      if (mdxNodeTypeBlockedSet.has(node.type)) {
        throw new Error('MDX imports, exports, and JavaScript expressions are disabled for this renderer.');
      }
      Object.values(node).forEach((value) => {
        if (Array.isArray(value)) value.forEach(nodeCheck);
        else if (value && typeof value === 'object') nodeCheck(value);
      });
    };
    nodeCheck(tree);
  };
}

class MdxRendererStore {
  source = '';
  status = 'empty';
  message = '';
  ContentComp = null;
  requestId = 0;

  constructor() {
    makeAutoObservable(this, { ContentComp: false }, { autoBind: true });
  }

  async sourceLoad(sourceRaw, { isExpressionAllowed = false, remarkPlugins = [] } = {}) {
    const source = String(sourceRaw || '').trim();
    const sourceNormalized = sourceMdxNormalize(source, isExpressionAllowed);
    const requestId = this.requestId + 1;
    this.requestId = requestId;
    this.source = source;
    this.ContentComp = null;
    this.message = '';
    if (!source) {
      this.status = 'empty';
      return { code: 0, data: null };
    }

    this.status = 'loading';
    try {
      const { evaluate } = await import('@mdx-js/mdx');
      const moduleMdx = await evaluate(sourceNormalized, {
        Fragment,
        jsx,
        jsxs,
        baseUrl: import.meta.url,
        remarkPlugins: isExpressionAllowed
          ? [...remarkPlugins, remarkMdxTableNormalize, remarkMdxReactAttributeNormalize]
          : [
            ...remarkPlugins,
            remarkMdxExecutableBlock,
            remarkMdxTableNormalize,
            remarkMdxReactAttributeNormalize,
          ],
      });
      if (requestId !== this.requestId) return { code: 1, message: 'A newer MDX source replaced this request.' };
      runInAction(() => {
        this.ContentComp = moduleMdx.default;
        this.status = 'loaded';
      });
      return { code: 0, data: moduleMdx.default };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error || 'MDX could not be rendered.');
      if (requestId === this.requestId) runInAction(() => {
        this.ContentComp = null;
        this.status = 'error';
        this.message = message;
      });
      return { code: -1, message };
    }
  }
}

function createMdxRendererStore() {
  return new MdxRendererStore();
}

export { createMdxRendererStore, MdxRendererStore };
export default MdxRendererStore;
