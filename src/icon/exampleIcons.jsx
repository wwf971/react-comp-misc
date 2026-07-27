import React, { useState, useMemo } from 'react';
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
} from './Icon.jsx';

const IconGallery = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const icons = [
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
  ];

  const filteredIcons = useMemo(() => {
    if (!searchTerm) return icons;
    
    const term = searchTerm.toLowerCase();
    return icons.filter(icon => 
      icon.name.toLowerCase().includes(term) ||
      icon.description.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  return (
    <div>
      <h3 style={{ margin: '0 0 12px 0' }}>Icon Gallery ({filteredIcons.length} icons)</h3>
      <div style={{ position: 'relative', width: '300px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search icons..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 32px 8px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              border: 'none',
              background: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#666',
              padding: '0 4px',
            }}
          >
            ×
          </button>
        )}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '15px'
      }}>
        {filteredIcons.map(({ name, component: Icon, description, color }) => (
          <div 
            key={name}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              padding: '15px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#fafafa',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ color: color || 'inherit', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Icon width={24} height={24} />
              <Icon width={32} height={32} />
            </div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', textAlign: 'center' }}>{name}</div>
            <div style={{ fontSize: '11px', color: '#666', textAlign: 'center' }}>{description}</div>
          </div>
        ))}
      </div>
      {filteredIcons.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          No icons found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export const iconsExamples = {
  'Icons-SVG': {
    component: IconGallery,
    description: 'Gallery of all available icons',
    example: () => <IconGallery />
  }
};