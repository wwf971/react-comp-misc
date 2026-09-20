import { useMemo } from 'react';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';
import { CompDemoArea, Controls, DemoPanel, Example, Explanation, MessageAndOutputs } from '../../dev/demo/DemoLayout.jsx';
import { ExampleGroup, ExampleSwitcher, ExampleSwitchButtons } from '../../dev/demo/ExampleGroup.jsx';
import MdxRenderer from './MdxRenderer.jsx';
import './exampleMdxRenderer.css';

const sourceById = {
  html: '<section class="four-seasons-note"><h1>Four Seasons / 四季 / 사계절</h1><p><strong>Languages:</strong> English, 中文, 日本語, 한국어</p><h2>Overview</h2><p>This stored HTML fragment mixes English, Chinese, Japanese, and Korean text to check multilingual rendering.</p><h2>Nature notes / 自然笔记</h2><ul><li>Spring brings new leaves.<ul><li>春天百花盛开。</li><li>桜が咲きます。</li></ul></li><li>겨울에는 눈이 내립니다.</li></ul><h2>Daily observations / 日々の観察</h2><ol><li>Water the plants in the morning.</li><li>观察天空的颜色。<ol><li>朝焼けを見る。</li><li>저녁 노을을 봅니다.</li></ol></li><li>Write one line in a journal.</li></ol></section>',
  markdown: `# Markdown example

MDX renders ordinary **Markdown** and inline HTML.

> JavaScript expressions are disabled by default so stored report text cannot execute code.

## Unordered list

- Data-driven source
  - HTML fragments
  - Markdown documents
- Customizable element mapping
  - Headings and paragraphs
  - Lists and nested lists
- Loading and error states

## Ordered list

1. Load the source
2. Compile the MDX
   1. Parse Markdown
   2. Normalize HTML attributes
3. Render the React component`,
};

function ExampleMdxRenderer({ store }) {
  const storeLocal = useMemo(() => (store ? null : makeAutoObservable({
    isSourceVisible: false,
    message: '',
    messageSet(message) {
      this.message = message;
    },
    sourceVisibleSet(isVisible) {
      this.isSourceVisible = isVisible === true;
    },
  }, {}, { autoBind: true })), [store]);
  const storeUsed = store || storeLocal;

  return (
    <DemoPanel>
      <Explanation>Asynchronous data-driven rendering for Markdown, MDX, and stored HTML fragments, with executable expressions disabled by default.</Explanation>
      <ExampleGroup title="Stored content formats">
        <Explanation>Switch between equivalent stored-content inputs while keeping source visibility and render status in the shared example store.</Explanation>
        <Controls>
          <ExampleSwitchButtons />
          <label className="mdx-renderer-demo-source-toggle">
            <input type="checkbox" checked={storeUsed.isSourceVisible} onChange={(event) => storeUsed.sourceVisibleSet(event.target.checked)} />
            <span>Show source</span>
          </label>
        </Controls>
        <ExampleSwitcher>
          <MdxSourceExample exampleId="html" labelText="HTML fragment" title="Stored HTML fragment" source={sourceById.html} store={storeUsed} />
          <MdxSourceExample exampleId="markdown" labelText="Markdown" title="Markdown document" source={sourceById.markdown} store={storeUsed} />
        </ExampleSwitcher>
        <MessageAndOutputs>{storeUsed.message}</MessageAndOutputs>
      </ExampleGroup>
    </DemoPanel>
  );
}

const MdxSourceExample = observer(function MdxSourceExample({ title, source, store }) {
  return (
    <Example title={title}>
      <Explanation>
        {title === 'Stored HTML fragment'
          ? 'Use this path for trusted stored markup that must be normalized into React-compatible attributes before rendering.'
          : 'Use this path for authored documents that need Markdown structure while keeping executable MDX expressions disabled.'}
      </Explanation>
      <CompDemoArea>
        <div className={`mdx-renderer-demo-layout${store.isSourceVisible ? ' is-source-visible' : ''}`}>
          <section className="mdx-renderer-demo-pane">
            {store.isSourceVisible ? <div className="mdx-renderer-demo-pane-title">Rendered</div> : null}
            <div className="mdx-renderer-demo-frame">
              <MdxRenderer
                data={{ source }}
                onEvent={(eventType, eventData) => {
                  if (eventType === 'renderError') store.messageSet(eventData.message);
                  if (eventType === 'renderComplete') store.messageSet('Rendered successfully.');
                }}
              />
            </div>
          </section>
          {store.isSourceVisible ? (
            <section className="mdx-renderer-demo-pane">
              <div className="mdx-renderer-demo-pane-title">Source</div>
              <pre className="mdx-renderer-demo-source"><code>{source}</code></pre>
            </section>
          ) : null}
        </div>
      </CompDemoArea>
    </Example>
  );
});

const ExampleMdxRendererPanel = observer(ExampleMdxRenderer);

export const mdxExamples = {
  MdxRenderer: {
    component: null,
    description: 'Data-driven renderer for Markdown, MDX, and stored HTML fragments',
    example: ExampleMdxRendererPanel,
    routeAliases: ['mdx'],
  },
};

export default ExampleMdxRendererPanel;
