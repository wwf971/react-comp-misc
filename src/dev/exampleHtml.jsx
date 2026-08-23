import { useMemo } from 'react';
import HtmlRender from './HtmlRender.jsx';
import {
  DemoPanel,
  Example,
  Explanation,
  CompDemoArea,
} from './demo/DemoLayout.jsx';

const HtmlRenderExamplePanel = () => {
  const sampleHtml = useMemo(() => [
    '<div>',
    '  <div>Simple html render example</div>',
    '  <div><strong>Bold text</strong> and <em>italic text</em></div>',
    '</div>',
  ].join('\n'), []);

  return (
    <DemoPanel>
      <Explanation titleText="Html Render">
        Render raw HTML with side-by-side source and preview. Validation highlights malformed markup.
      </Explanation>

      <Example title="Preview and source">
        <CompDemoArea>
          <HtmlRender
            title="Html Render"
            rawHtml={sampleHtml}
            isEditable={false}
            leftLabel="HTML Raw Text"
            rightLabel="Rendered"
          />
        </CompDemoArea>
      </Example>
    </DemoPanel>
  );
};

export const htmlExamples = {
  'Html Render': {
    component: null,
    description: 'Render raw HTML with preview and validation',
    example: HtmlRenderExamplePanel,
  },
};

export default HtmlRenderExamplePanel;
