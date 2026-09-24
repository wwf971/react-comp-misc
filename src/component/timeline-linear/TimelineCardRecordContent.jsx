import { observer } from 'mobx-react-lite';

const TimelineCardRecordContent = observer(function TimelineCardRecordContent({ itemData }) {
  const data = itemData.contentData || {};
  const fieldList = Array.isArray(data.fieldList) ? data.fieldList : [];
  return (
    <div className="progress-timeline-demo-record">
      {data.tableLabelText || data.tableName ? (
        <div className="progress-timeline-demo-code-row">
          <span>{data.tableLabelText || ''}</span>
          <code>{data.tableName || ''}</code>
        </div>
      ) : null}
      {data.recordIdLabelText || data.recordId ? (
        <div className="progress-timeline-demo-code-row">
          <span>{data.recordIdLabelText || ''}</span>
          <code>{data.recordId || ''}</code>
        </div>
      ) : null}
      <div className="progress-timeline-demo-field-grid">
        {fieldList.map((fieldData) => (
          <div key={fieldData.key}>
            <span>{fieldData.label || ''}</span>
            <strong>{fieldData.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
});

export default TimelineCardRecordContent;