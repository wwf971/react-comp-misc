import { observer } from 'mobx-react-lite';

const TimelineCardExceptionContent = observer(function TimelineCardExceptionContent({ itemData }) {
  const data = itemData.contentData || {};
  return (
    <div className="progress-timeline-demo-exception">
      {data.errorName ? <strong>{data.errorName}</strong> : null}
      {data.messageText || itemData.messageText ? <span>{data.messageText || itemData.messageText}</span> : null}
      {data.detailText ? <code>{data.detailText}</code> : null}
    </div>
  );
});

export default TimelineCardExceptionContent;