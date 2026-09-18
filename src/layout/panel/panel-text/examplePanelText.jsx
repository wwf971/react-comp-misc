import { useMemo } from 'react';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';
import PanelText from './PanelText.jsx';
import Toolbar from '../../toolbar/Toolbar.jsx';
import {
  CompDemoArea,
  Controls,
  ControlItem,
  DemoPanel,
  Example,
  Explanation,
  MessageAndOutputs,
} from '../../../dev/demo/DemoLayout.jsx';
import {
  ExampleGroup,
  ExampleStackVertical,
} from '../../../dev/demo/ExampleGroup.jsx';
import './examplePanelText.css';

const toolbarActionList = [
  'Refresh data',
  'Create record',
  'Edit selection',
  'Duplicate selection',
  'Apply filter',
  'Change sorting',
  'Export CSV',
  'Open details',
];

function CustomContentExample({ data = {}, onEvent }) {
  return (
    <div className="panel-text-demo-custom-content">
      <strong className="panel-text-demo-custom-heading">{data.heading || 'Custom component content'}</strong>
      <span>This body is rendered by a React component instead of the text field.</span>
      <button type="button" className="panel-text-demo-custom-action" onClick={() => onEvent?.('customContentAction', { message: 'Custom content button clicked.' })}>Run custom action</button>
    </div>
  );
}

const PanelTextExamplesPanel = observer(function PanelTextExamplesPanel({ store }) {
  const storeLocal = useMemo(() => (store ? null : makeAutoObservable({
    isPopupOpen: false,
    actionMessage: 'No header action yet.',
    toolbarScrollLeft: 0,
    popupOpenSet(isOpen) {
      this.isPopupOpen = isOpen;
    },
    actionMessageSet(message) {
      this.actionMessage = message;
    },
    toolbarScrollSet(scrollLeft, scrollLeftMax) {
      this.toolbarScrollLeft = Math.max(0, Math.min(Number(scrollLeft) || 0, Number(scrollLeftMax) || 0));
    },
  }, {}, { autoBind: true })), [store]);
  const storeUsed = store || storeLocal;

  return (
    <DemoPanel>
      <Explanation titleText="PanelText">Scrollable text panels support semantic tones, custom React content, header slots, toolbars, and popup presentation.</Explanation>
      <ExampleGroup title="Text panel capabilities">
        <ExampleStackVertical>
          <Example title="Multilingual text and semantic tones">
            <Explanation>Text panels display Japanese, Chinese, and Korean text while semantic tones provide visual distinction without changing the content API.</Explanation>
            <CompDemoArea>
              <div className="panel-text-demo-grid">
                <PanelText data={{ title: '日本語', text: 'このパネルは日本語の文章を表示します。長い内容はパネル内でスクロールできます。', tone: 'reason' }} />
                <PanelText data={{ title: '简体中文', text: '此面板用于显示简体中文文本。较长的内容可以在面板内滚动查看。', tone: 'good' }} />
                <PanelText data={{ title: '한국어', text: '이 패널은 한국어 텍스트를 표시합니다. 긴 내용은 패널 안에서 스크롤하여 확인할 수 있습니다.', tone: 'improve' }} />
              </div>
            </CompDemoArea>
          </Example>
          <Example title="Header actions and custom body">
            <CompDemoArea>
              <div className="panel-text-demo-grid">
                <PanelText
                  data={{ title: 'Header actions', text: storeUsed.actionMessage, tone: 'reason' }}
                  headerRightContent={(
                    <div className="panel-text-demo-header-actions">
                      <button type="button" className="panel-text-demo-header-action" onClick={() => storeUsed.actionMessageSet('Accepted from the custom header area.')}>Accept</button>
                      <button type="button" className="panel-text-demo-header-action" onClick={() => storeUsed.actionMessageSet('Reset from the custom header area.')}>Reset</button>
                    </div>
                  )}
                />
                <PanelText
                  data={{ title: 'Custom component', contentData: { heading: 'Interactive panel body' } }}
                  config={{ contentComp: CustomContentExample }}
                  onEvent={(eventType, eventData) => {
                    if (eventType === 'customContentAction') storeUsed.actionMessageSet(eventData.message);
                  }}
                />
              </div>
            </CompDemoArea>
            <MessageAndOutputs>{storeUsed.actionMessage}</MessageAndOutputs>
          </Example>
          <Example title="Scrollable header toolbar">
            <Explanation>The thin toolbar is intentionally wider than its panel; wheel input controls its horizontal offset.</Explanation>
            <CompDemoArea>
              <div className="panel-text-demo-grid">
                <PanelText
                  data={{ title: 'Toolbar under header', text: `Horizontal offset: ${Math.round(storeUsed.toolbarScrollLeft)} px\n${storeUsed.actionMessage}`, tone: 'summary' }}
                  headerBottomContent={(
                    <Toolbar
                      data={{
                        scrollLeft: storeUsed.toolbarScrollLeft,
                        groupList: [{ id: 'actions', ariaLabel: 'Panel actions', content: toolbarActionList.map((actionText) => (
                          <button type="button" key={actionText} className="panel-text-demo-toolbar-button" onClick={() => storeUsed.actionMessageSet(`${actionText} selected.`)}>{actionText}</button>
                        )) }],
                      }}
                      config={{ isThin: true }}
                      onEvent={(eventType, eventData) => {
                        if (eventType === 'scrollLeftSet') storeUsed.toolbarScrollSet(eventData.scrollLeft, eventData.scrollLeftMax);
                      }}
                    />
                  )}
                />
              </div>
            </CompDemoArea>
          </Example>
          <Example title="Popup presentation">
            <Explanation>The same component can own a modal backdrop and expose a close request event.</Explanation>
            <Controls>
              <ControlItem>
                <button type="button" className="demo-button" onClick={() => storeUsed.popupOpenSet(true)}>Open popup</button>
              </ControlItem>
            </Controls>
          </Example>
        </ExampleStackVertical>
      </ExampleGroup>
      {storeUsed.isPopupOpen ? (
        <PanelText
          data={{ title: 'ポップアップ表示', text: 'これは汎用テキストパネルのポップアップ表示例です。\n\n背景部分または右上の閉じるボタンで終了できます。', tone: 'summary' }}
          config={{ isPopup: true, isCloseVisible: true }}
          headerRightContent={<span className="panel-text-demo-header-label">Custom header</span>}
          onEvent={(eventType) => {
            if (eventType === 'closeRequest') storeUsed.popupOpenSet(false);
          }}
        />
      ) : null}
    </DemoPanel>
  );
});

export const panelTextExamples = {
  PanelText: {
    component: null,
    description: 'Scrollable text panel with tones, header slots, custom content, and popup presentation',
    example: PanelTextExamplesPanel,
  },
};

export default PanelTextExamplesPanel;
