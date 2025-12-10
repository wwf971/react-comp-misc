import { 
  FileIconDefault, 
  DeleteIcon, 
  SearchIcon, 
  ClearIcon, 
  InfoIcon,
  SuccessIcon,
  ErrorIcon,
  UploadIcon,
  BackIcon,
  ForwardIcon
} from './Icon.jsx';

export const iconExamples = {
  'FileIconDefault': {
    component: FileIconDefault,
    description: 'Default file icon SVG',
    example: () => (
      <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
        <FileIconDefault width={24} height={24} />
        <FileIconDefault width={48} height={48} />
        <FileIconDefault width={64} height={64} />
      </div>
    )
  },
  'DeleteIcon': {
    component: DeleteIcon,
    description: 'Delete/trash icon',
    example: () => (
      <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
        <DeleteIcon width={24} height={24} />
        <DeleteIcon width={48} height={48} />
      </div>
    )
  },
  'SearchIcon': {
    component: SearchIcon,
    description: 'Search/magnifying glass icon',
    example: () => (
      <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
        <SearchIcon width={24} height={24} />
        <SearchIcon width={48} height={48} />
      </div>
    )
  },
  'ClearIcon': {
    component: ClearIcon,
    description: 'Clear/reset icon (clockwise arrow)',
    example: () => (
      <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
        <ClearIcon width={24} height={24} />
        <ClearIcon width={48} height={48} />
      </div>
    )
  },
  'InfoIcon': {
    component: InfoIcon,
    description: 'Information icon',
    example: () => (
      <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
        <InfoIcon width={24} height={24} />
        <InfoIcon width={48} height={48} />
      </div>
    )
  },
  'SuccessIcon': {
    component: SuccessIcon,
    description: 'Success/checkmark icon',
    example: () => (
      <div style={{display: 'flex', gap: '10px', alignItems: 'center', color: 'green'}}>
        <SuccessIcon width={24} height={24} />
        <SuccessIcon width={48} height={48} />
      </div>
    )
  },
  'ErrorIcon': {
    component: ErrorIcon,
    description: 'Error/X icon',
    example: () => (
      <div style={{display: 'flex', gap: '10px', alignItems: 'center', color: 'red'}}>
        <ErrorIcon width={24} height={24} />
        <ErrorIcon width={48} height={48} />
      </div>
    )
  },
  'UploadIcon': {
    component: UploadIcon,
    description: 'Upload/cloud upload icon',
    example: () => (
      <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
        <UploadIcon width={24} height={24} />
        <UploadIcon width={48} height={48} />
      </div>
    )
  },
  'BackIcon': {
    component: BackIcon,
    description: 'Back/previous arrow icon',
    example: () => (
      <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
        <BackIcon width={24} height={24} />
        <BackIcon width={48} height={48} />
      </div>
    )
  },
  'ForwardIcon': {
    component: ForwardIcon,
    description: 'Forward/next arrow icon',
    example: () => (
      <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
        <ForwardIcon width={24} height={24} />
        <ForwardIcon width={48} height={48} />
      </div>
    )
  },
};

