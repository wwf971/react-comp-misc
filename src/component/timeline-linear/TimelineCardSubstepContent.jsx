import { observer } from 'mobx-react-lite';
import CrossIcon from '../../icon/CrossIcon.jsx';
import SpinningCircle from '../../icon/SpinningCircle.jsx';

function classNameJoin(...classList) {
  return classList.filter(Boolean).join(' ');
}

function substepStatusGet(stepData) {
  return stepData.statusKind || stepData.status || '';
}

function substepVisibleCheck(stepData, mode) {
  if (mode !== 'reveal') return true;
  return stepData.isVisible !== false && substepStatusGet(stepData) !== 'hidden';
}

const SubstepIcon = observer(function SubstepIcon({ statusKind }) {
  if (['running', 'active', 'pending', 'loading'].includes(statusKind)) {
    return <SpinningCircle width={14} height={14} color="#3d73b9" />;
  }
  if (statusKind === 'done' || statusKind === 'ok' || statusKind === 'success') {
    return <span className="progress-timeline-substep-check" aria-hidden="true" />;
  }
  if (statusKind === 'error' || statusKind === 'failed') {
    return <CrossIcon size={12} color="#b95454" strokeWidth={2.5} />;
  }
  if (statusKind === 'waiting' || statusKind === 'idle') {
    return <span className="progress-timeline-substep-dot" aria-hidden="true" />;
  }
  return null;
});

/**
 * Built-in timeline card content for a series of substeps.
 *
 * Use through itemData.contentType = 'substepList'. The timeline/demo maps that contentType to
 * this renderer without changing the generic timeline data/config/onEvent contract.
 *
 * itemData.contentData accepted shape:
 * {
 *   mode?: 'all' | 'reveal',
 *   stepList: [
 *     {
 *       id?: string,
 *       text?: string,
 *       textValue?: string,
 *       statusKind?: 'waiting' | 'running' | 'done' | 'error' | 'failed' | 'hidden',
 *       status?: same as statusKind,
 *       isVisible?: boolean,
 *     }
 *   ]
 * }
 *
 * Rendering conventions:
 * - mode 'all': every step is listed immediately and runs one by one through data updates.
 * - mode 'reveal': steps can be hidden until previous substeps finish.
 * - done steps show a check shape, running steps show SpinningCircle, waiting steps show a dot,
 *   failed steps show CrossIcon. This component uses div/span, not a ul/li list.
 */
const TimelineCardSubstepContent = observer(function TimelineCardSubstepContent({ itemData }) {
  const contentData = itemData.contentData || {};
  const mode = contentData.mode || '';
  const stepList = Array.isArray(contentData.stepList) ? contentData.stepList : [];
  const stepListVisible = stepList.filter((stepData) => substepVisibleCheck(stepData, mode));

  return (
    <div className={classNameJoin('progress-timeline-substep-list', mode ? `is-${mode}` : '')} role="list" aria-label={contentData.labelText || itemData.titleText || ''}>
      {stepListVisible.map((stepData, stepIndex) => {
        const statusKind = substepStatusGet(stepData);
        return (
          <div className={classNameJoin('progress-timeline-substep-row', statusKind ? `is-${statusKind}` : '')} role="listitem" key={stepData.id || `substep-${stepIndex}`}>
            <span className="progress-timeline-substep-icon" aria-hidden="true"><SubstepIcon statusKind={statusKind} /></span>
            <span className="progress-timeline-substep-text">{stepData.text || stepData.textValue || ''}</span>
          </div>
        );
      })}
    </div>
  );
});

export default TimelineCardSubstepContent;