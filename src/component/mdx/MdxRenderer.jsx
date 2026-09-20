import { useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { createMdxRendererStore } from './MdxRendererStore.js';
import './MdxRenderer.css';

function MdxRenderer({ data = {}, config = {}, onEvent }) {
  const store = useMemo(() => createMdxRendererStore(), []);
  const source = String(data.source ?? data.mdx ?? '');
  const isExpressionAllowed = config.isExpressionAllowed === true;
  const remarkPlugins = config.remarkPlugins;

  useEffect(() => {
    void store.sourceLoad(source, { isExpressionAllowed, remarkPlugins }).then((result) => {
      if (result.code < 0) onEvent?.('renderError', { message: result.message, source });
      else if (result.code === 0 && source.trim()) onEvent?.('renderComplete', { source });
    });
  }, [store, source, isExpressionAllowed, remarkPlugins]);

  const ContentComp = store.ContentComp;
  const className = `mdx-renderer is-${store.status}${config.isSourceStylePreferred === true ? ' is-source-style-preferred' : ''} ${config.className || ''}`.trim();
  if (store.status === 'empty') {
    return <div className={className}>{config.textEmpty || '（内容なし）'}</div>;
  }
  if (store.status === 'loading') {
    return <div className={className} role="status">{config.textLoading || 'MDX を読み込んでいます。'}</div>;
  }
  if (store.status === 'error' || !ContentComp) {
    return (
      <div className={className} role="alert">
        <div>{config.textError || 'MDX を表示できません。'}</div>
        <pre className="mdx-renderer-error-detail">{store.message}</pre>
        {config.isSourceVisibleOnError ? (
          <details className="mdx-renderer-error-source" open>
            <summary>Raw source</summary>
            <pre>{source}</pre>
          </details>
        ) : null}
      </div>
    );
  }
  return (
    <div className={className}>
      <ContentComp components={config.components || {}} />
    </div>
  );
}

export default observer(MdxRenderer);
