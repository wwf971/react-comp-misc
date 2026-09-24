import { observer } from 'mobx-react-lite';

const TimelineCardQueryContent = observer(function TimelineCardQueryContent({ itemData }) {
  const data = itemData.contentData || {};
  return (
    <div className="progress-timeline-demo-query">
      {data.descriptionText ? <div>{data.descriptionText}</div> : null}
      {data.queryData ? <pre>{JSON.stringify(data.queryData, null, 2)}</pre> : null}
    </div>
  );
});

export default TimelineCardQueryContent;