import React from 'react';
import HtmlRender from './HtmlRender.jsx';

const HtmlRenderExamplePanel = () => {
  const sampleHtml = [
    '<div>',
    '  <div>Simple html render example</div>',
    '  <div><strong>Bold text</strong> and <em>italic text</em></div>',
    '</div>',
  ].join('\n');

  return (
    <HtmlRender
      title="Html Render"
      rawHtml={sampleHtml}
      isEditable={false}
      leftLabel="HTML Raw Text"
      rightLabel="Rendered"
    />
  );
};

export const htmlExamples = {
  'Html Render': {
    component: null,
    description: 'Render raw HTML with preview and validation',
    example: () => <HtmlRenderExamplePanel />,
  },
};
