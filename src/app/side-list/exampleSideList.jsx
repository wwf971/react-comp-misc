import { useMemo } from 'react';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';
import ItemList from './ItemList.jsx';
import ItemTree from './ItemTree.jsx';
import {
  DemoPanel,
  Example,
  Explanation,
  Controls,
  CompDemoArea,
  MessageAndOutputs,
} from '../../dev/demo/DemoLayout.jsx';
import {
  ExampleGroup,
  ExampleSwitcher,
  ExampleSwitchButtons,
  ExampleJumpLink,
} from '../../dev/demo/ExampleGroup.jsx';
import { createStoreExampleGroup } from '../../dev/demo/demoStores.js';
import './side-list.css';

const DEMO_ITEMS = [
  { key: 'layout', label: 'Layout', description: 'Folder, tree, and panel examples' },
  { key: 'data', label: 'Data Structure', description: 'Json and key-value examples' },
  { key: 'application', label: 'Application', description: 'Config, calendar, and auth examples' },
  { key: 'visualization', label: 'Visualization', description: 'Chart and visual examples' },
];

const DEMO_TREE_ITEMS = [
  { key: 'cat-layout', label: 'Layout' },
  { key: 'cat-layout-folder', parentKey: 'cat-layout', label: 'Folder', description: 'Resizable folder view' },
  { key: 'cat-layout-tree', parentKey: 'cat-layout', label: 'Tree', description: 'Tree view and filter' },
  { key: 'cat-data', label: 'Data Structure' },
  { key: 'cat-data-json', parentKey: 'cat-data', label: 'Json', description: 'Json rendering' },
  { key: 'cat-data-json-mobx', parentKey: 'cat-data', label: 'Json Mobx', description: 'Mobx-driven json rendering' },
  { key: 'cat-app', label: 'Application' },
  { key: 'cat-app-auth', parentKey: 'cat-app', label: 'Auth', description: 'Login component examples' },
  { key: 'cat-app-calendar', parentKey: 'cat-app', label: 'Calendar', description: 'Date selector examples' },
];

function createStoreSideListExample() {
  return makeAutoObservable({
    selectedListKey: 'layout',
    selectedTreeKey: 'cat-layout-folder',
    listSelect(itemData) {
      this.selectedListKey = itemData.key;
    },
    treeSelect(itemKey) {
      this.selectedTreeKey = itemKey;
    },
  }, {}, { autoBind: true });
}

const ExampleItemList = observer(function ExampleItemList({ store }) {
  const storeLocal = useMemo(() => (store ? null : createStoreSideListExample()), [store]);
  const storeUsed = store || storeLocal;

  return (
    <Example title="ItemList">
      <Explanation>Searchable flat list. Click a row to select it.</Explanation>
      <CompDemoArea>
        <div className="side-list-example-frame">
          <ItemList
            items={DEMO_ITEMS}
            selectedItemKey={storeUsed.selectedListKey}
            titleText="Demo ItemList"
            searchPlaceholder="Search list items..."
            onItemSelect={(itemData) => storeUsed.listSelect(itemData)}
          />
        </div>
      </CompDemoArea>
      <MessageAndOutputs labelText="Selected:">
        <span>{storeUsed.selectedListKey}</span>
      </MessageAndOutputs>
    </Example>
  );
});

const ExampleItemTree = observer(function ExampleItemTree({ store }) {
  const storeLocal = useMemo(() => (store ? null : createStoreSideListExample()), [store]);
  const storeUsed = store || storeLocal;

  return (
    <Example title="ItemTree">
      <Explanation>Tree-style side list with branch toggle and leaf filtering. Only leaves are selectable.</Explanation>
      <CompDemoArea>
        <div className="side-list-example-frame">
          <ItemTree
            data={{
              items: DEMO_TREE_ITEMS,
              selectedItemKey: storeUsed.selectedTreeKey,
            }}
            config={{
              titleText: 'Demo ItemTree',
              searchPlaceholder: 'Search tree leaves...',
            }}
            onEvent={(eventType, eventData) => {
              if (eventType === 'itemSelect' && eventData.itemData?.parentKey) {
                storeUsed.treeSelect(eventData.itemData.key);
              }
            }}
          />
        </div>
      </CompDemoArea>
      <MessageAndOutputs labelText="Selected:">
        <span>{storeUsed.selectedTreeKey}</span>
      </MessageAndOutputs>
    </Example>
  );
});

const SideListExamplesPanel = ({ initialMode = 'list' }) => {
  const storeGroup = useMemo(
    () => createStoreExampleGroup({ exampleActiveId: initialMode === 'tree' ? 'tree' : 'list' }),
    [initialMode],
  );

  return (
    <DemoPanel>
      <Explanation titleText="Side list">
        Searchable side list and tree for selecting entries.
      </Explanation>
      <ExampleGroup title="List and tree" store={storeGroup}>
        <Explanation>
          <ul>
            <li>
              <ExampleJumpLink data={{ exampleId: 'list' }}>ItemList</ExampleJumpLink> is a flat searchable list.
            </li>
            <li>
              <ExampleJumpLink data={{ exampleId: 'tree' }}>ItemTree</ExampleJumpLink> is a tree with branch toggle and leaf filtering.
            </li>
          </ul>
        </Explanation>
        <Controls>
          <ExampleSwitchButtons />
        </Controls>
        <ExampleSwitcher>
          <ExampleItemList exampleId="list" labelText="ItemList" />
          <ExampleItemTree exampleId="tree" labelText="ItemTree" />
        </ExampleSwitcher>
      </ExampleGroup>
    </DemoPanel>
  );
};

export const sideListExamples = {
  ItemList: {
    component: null,
    description: 'Searchable side list component for selecting demo entries',
    example: () => <SideListExamplesPanel initialMode="list" />,
    routeAliases: ['item-list', 'side-list'],
  },
  ItemTree: {
    component: null,
    description: 'Tree-style side list with branch toggle and leaf filtering',
    example: () => <SideListExamplesPanel initialMode="tree" />,
    routeAliases: ['item-tree', 'side-tree'],
  },
};
