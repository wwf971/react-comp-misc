import { useMemo } from 'react';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';
import {
  FileIcon,
  DeleteIcon,
  DragIcon,
  SearchIcon,
  RefreshClockwise,
  RefreshCounterClockwise,
  InfoIcon,
  InfoIconWithTooltip,
  SuccessIcon,
  ErrorIcon,
  UploadIcon,
  BackIcon,
  ForwardIcon,
  UpIcon,
  DownIcon,
  UpDownIcon,
  CollapseIconHorizontal,
  CollapseIconVertical,
  ExpandIconHorizontal,
  ExpandIconVertical,
  SortIconBidirection,
  EyeIcon,
  EyeOffIcon,
  CrossIcon,
  CopyIcon,
  PlusIcon,
  MinusIcon,
  SpinningCircle,
  FolderIcon,
  EditIconNotepad,
  EditIconPen,
  SettingIcon,
  FilterIcon,
  FilterIconEnabled,
  PinIcon,
  FavoriteIcon,
  FavoriteIconEnabled,
  ThreeDotsIcon,
  ExternalLinkIcon,
} from './Icon.jsx';
import {
  DemoPanel,
  Example,
  Explanation,
  Controls,
  ControlItem,
  CompDemoArea,
  MessageAndOutputs,
} from '../dev/demo/DemoLayout.jsx';
import './exampleIcons.css';

const ICON_LIST = [
  { name: 'FileIcon', component: FileIcon, description: 'Default file icon' },
  { name: 'FolderIcon', component: FolderIcon, description: 'Folder' },
  { name: 'DeleteIcon', component: DeleteIcon, description: 'Delete/trash icon' },
  { name: 'EyeIcon', component: EyeIcon, description: 'Show password' },
  { name: 'EyeOffIcon', component: EyeOffIcon, description: 'Hide password' },
  { name: 'SearchIcon', component: SearchIcon, description: 'Search/magnifying glass' },
  { name: 'RefreshClockwise', component: RefreshClockwise, description: 'Refresh clockwise' },
  { name: 'RefreshCounterClockwise', component: RefreshCounterClockwise, description: 'Refresh counter-clockwise (also RefreshIcon)' },
  { name: 'InfoIcon', component: InfoIcon, description: 'Information' },
  { name: 'InfoIconWithTooltip', component: (props) => <InfoIconWithTooltip {...props} tooltipText="Example tooltip text" />, description: 'Info icon with custom tooltip' },
  { name: 'SuccessIcon', component: SuccessIcon, description: 'Success/checkmark', color: 'green' },
  { name: 'ErrorIcon', component: ErrorIcon, description: 'Error/X', color: 'red' },
  { name: 'UploadIcon', component: UploadIcon, description: 'Upload/cloud' },
  { name: 'BackIcon', component: BackIcon, description: 'Back/previous (also ChevronLeft, LeftIcon)' },
  { name: 'ForwardIcon', component: ForwardIcon, description: 'Forward/next (also ChevronRight, RightIcon)' },
  { name: 'UpIcon', component: UpIcon, description: 'Up/collapse (also ChevronUp)' },
  { name: 'DownIcon', component: DownIcon, description: 'Down/expand (also ChevronDown)' },
  { name: 'UpDownIcon', component: UpDownIcon, description: 'Up and down / sort (also ChevronUpDown)' },
  { name: 'CollapseIconHorizontal', component: CollapseIconHorizontal, description: 'Collapse horizontal (chevrons inward)' },
  { name: 'CollapseIconVertical', component: CollapseIconVertical, description: 'Collapse vertical (chevrons inward)' },
  { name: 'ExpandIconHorizontal', component: ExpandIconHorizontal, description: 'Expand horizontal (chevrons outward, also ExpandIcon)' },
  { name: 'ExpandIconVertical', component: ExpandIconVertical, description: 'Expand vertical (chevrons outward)' },
  { name: 'CrossIcon', component: CrossIcon, description: 'Close/dismiss' },
  { name: 'CopyIcon', component: CopyIcon, description: 'Copy to clipboard' },
  { name: 'PlusIcon', component: PlusIcon, description: 'Plus (also AddIcon)' },
  { name: 'MinusIcon', component: MinusIcon, description: 'Minus' },
  { name: 'SpinningCircle', component: SpinningCircle, description: 'Loading spinner' },
  { name: 'EditIconNotepad', component: EditIconNotepad, description: 'Edit/pen on notepad' },
  { name: 'EditIconPen', component: EditIconPen, description: 'Edit/pencil only' },
  { name: 'ThreeDotsIcon', component: ThreeDotsIcon, description: 'Vertical three-dot menu (half of DragIcon)' },
  { name: 'DragIcon', component: DragIcon, description: 'Drag/grip lines' },
  { name: 'SettingIcon', component: SettingIcon, description: 'Settings/gear' },
  { name: 'FilterIcon', component: FilterIcon, description: 'Filter/funnel' },
  { name: 'FilterIconEnabled', component: FilterIconEnabled, description: 'Filter/funnel enabled state' },
  { name: 'SortIconBidirection', component: SortIconBidirection, description: 'Bidirectional sort (also SortIcon)' },
  { name: 'PinIcon', component: PinIcon, description: 'Pin/thumbtack outline (also ThumbstackIcon)' },
  { name: 'PinIconEnabled', component: (props) => <PinIcon {...props} isEnabled={true} />, description: 'PinIcon with isEnabled={true} (also ThumbstackIconEnabled)' },
  { name: 'FavoriteIcon', component: FavoriteIcon, description: 'Favorite/star outline' },
  { name: 'FavoriteIconEnabled', component: FavoriteIconEnabled, description: 'Favorite/star filled (also FavoriteIcon isEnabled={true})' },
  { name: 'ExternalLinkIcon', component: ExternalLinkIcon, description: 'Open an external link' },
];

function createStoreIconGalleryExample() {
  return makeAutoObservable({
    searchTerm: '',
    searchTermSet(searchTerm) {
      this.searchTerm = searchTerm;
    },
    searchTermClear() {
      this.searchTerm = '';
    },
  }, {}, { autoBind: true });
}

const IconGallery = observer(function IconGallery({ store }) {
  const storeLocal = useMemo(() => (store ? null : createStoreIconGalleryExample()), [store]);
  const storeUsed = store || storeLocal;

  const filteredIcons = ICON_LIST.filter((iconItem) => {
    if (!storeUsed.searchTerm) return true;
    const term = storeUsed.searchTerm.toLowerCase();
    return iconItem.name.toLowerCase().includes(term) || iconItem.description.toLowerCase().includes(term);
  });

  return (
    <DemoPanel>
      <Explanation titleText="Icon Gallery">
        Gallery of all available icons, shown at 24 and 32 pixels.
      </Explanation>
      <Example title="Icons">
        <Controls>
          <ControlItem labelText="Search:">
            <input
              type="text"
              className="icon-example-search-input"
              placeholder="Search icons..."
              value={storeUsed.searchTerm}
              onChange={(event) => storeUsed.searchTermSet(event.target.value)}
            />
            {storeUsed.searchTerm ? (
              <button type="button" className="demo-button" onClick={() => storeUsed.searchTermClear()}>
                Clear
              </button>
            ) : null}
          </ControlItem>
        </Controls>
        <CompDemoArea>
          {filteredIcons.length === 0 ? (
            <div className="icon-example-empty">
              No icons found matching &quot;{storeUsed.searchTerm}&quot;
            </div>
          ) : (
            <div className="icon-example-grid">
              {filteredIcons.map(({ name, component: Icon, description, color }) => (
                <div key={name} className="icon-example-card">
                  <div className="icon-example-card-icons" style={{ color: color || 'inherit' }}>
                    <Icon width={24} height={24} />
                    <Icon width={32} height={32} />
                  </div>
                  <div className="icon-example-card-name">{name}</div>
                  <div className="icon-example-card-desc">{description}</div>
                </div>
              ))}
            </div>
          )}
        </CompDemoArea>
        <MessageAndOutputs>
          <span>{filteredIcons.length} icons</span>
        </MessageAndOutputs>
      </Example>
    </DemoPanel>
  );
});

export const iconsExamples = {
  'Icons-SVG': {
    component: IconGallery,
    description: 'Gallery of all available icons',
    example: IconGallery,
  },
};

export default IconGallery;
