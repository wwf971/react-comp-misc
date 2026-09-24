import { observer } from 'mobx-react-lite';
import SpinningCircle from '../../icon/SpinningCircle.jsx';

const FieldStatusValue = observer(function FieldStatusValue({ fieldData }) {
  if (['running', 'waiting', 'pending', 'loading'].includes(fieldData.statusKind)) {
    return (
      <span className="progress-timeline-demo-loading-value">
        <SpinningCircle width={13} height={13} />
        <span>{fieldData.messageText || ''}</span>
      </span>
    );
  }
  if (fieldData.statusKind === 'idle') return <span className="progress-timeline-demo-muted-value">{fieldData.messageText || ''}</span>;
  if (fieldData.statusKind === 'error') return <span className="progress-timeline-demo-error-value">{fieldData.messageText || fieldData.value || ''}</span>;
  return <strong>{fieldData.value || ''}</strong>;
});

const TimelineCardFieldStatusTableContent = observer(function TimelineCardFieldStatusTableContent({ itemData }) {
  const fieldList = Array.isArray(itemData.contentData?.fieldList) ? itemData.contentData.fieldList : [];
  return (
    <div className="progress-timeline-demo-status-table" role="table" aria-label="Independent data request status">
      <div className="progress-timeline-demo-status-header" role="row">
        <span role="columnheader">Data</span>
        <span role="columnheader">Status</span>
        <span role="columnheader">Value</span>
      </div>
      {fieldList.map((fieldData) => (
        <div className="progress-timeline-demo-status-row" role="row" key={fieldData.key}>
          <span role="cell">{fieldData.label || fieldData.key}</span>
          <span role="cell" className={fieldData.statusKind ? `is-${fieldData.statusKind}` : ''}>{fieldData.statusKind || ''}</span>
          <span role="cell"><FieldStatusValue fieldData={fieldData} /></span>
        </div>
      ))}
    </div>
  );
});

export default TimelineCardFieldStatusTableContent;