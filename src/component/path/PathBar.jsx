import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import SpinningCircle from '../../icon/SpinningCircle.jsx';
import './PathBar.css';

export function defaultParsePathStrToPathData(raw) {
  if (raw == null) return null;
  const str = String(raw);
  if (str.includes('\0')) return null;
  let s = str.trim().replace(/\\/g, '/');
  s = s.replace(/\/+/g, '/');
  if (s === '' || s === '/') {
    return { segments: [] };
  }
  let body = s;
  if (body.startsWith('/')) {
    body = body.slice(1);
  }
  if (body.endsWith('/')) {
    body = body.slice(0, -1);
  }
  if (body === '') {
    return { segments: [] };
  }
  const parts = body.split('/');
  if (parts.some((p) => p === '')) {
    return null;
  }
  return { segments: parts.map((name) => ({ name })) };
}

export function buildCanonicalPathStrFromSegs(
  segmentList,
  { addSlashBeforeFirstSeg, appendTrailingSlash, separator }
) {
  const segs = segmentList || [];
  if (segs.length === 0) {
    return addSlashBeforeFirstSeg ? '/' : '';
  }
  const joined = segs.map((seg) => seg.name).join(separator);
  let out = addSlashBeforeFirstSeg ? '/' + joined : joined;
  if (appendTrailingSlash) {
    out += separator;
  }
  return out;
}

function arePathSegNamesEqual(currentSegs, nextSegments) {
  if (currentSegs.length !== nextSegments.length) {
    return false;
  }
  for (let i = 0; i < currentSegs.length; i++) {
    if (currentSegs[i].name !== nextSegments[i].name) {
      return false;
    }
  }
  return true;
}

const PathBar = observer(function PathBar({
  pathData = { segments: [] },
  onPathSegClicked,
  onPathChangeCommit,
  parsePathString = defaultParsePathStrToPathData,
  addSlashBeforeFirstSeg = false,
  appendTrailingSlash = true,
  allowEditText = true,
  height = 32,
  separator = '/'
}) {
  const segments = pathData.segments || [];

  const pathStringOptions = useMemo(
    () => ({ addSlashBeforeFirstSeg, appendTrailingSlash, separator }),
    [addSlashBeforeFirstSeg, appendTrailingSlash, separator]
  );

  const canonicalPathString = buildCanonicalPathStrFromSegs(segments, pathStringOptions);

  const [isStringEditorOpen, setIsStringEditorOpen] = useState(false);
  const [editorText, setEditorText] = useState('');
  const [isCommitPending, setIsCommitPending] = useState(false);
  const [pendingSubmittedText, setPendingSubmittedText] = useState(null);

  const inputRef = useRef(null);
  const isStringEditorOpenRef = useRef(false);
  const editorTextRef = useRef('');
  const isCommitPendingRef = useRef(false);
  const blurCommitFrameRef = useRef(null);
  const segmentsRef = useRef(segments);

  segmentsRef.current = segments;

  const isPathStringEditable = allowEditText && typeof onPathChangeCommit === 'function';
  const showTextField = isStringEditorOpen || isCommitPending;
  const textFieldValue = isCommitPending ? pendingSubmittedText ?? '' : editorText;

  useEffect(() => {
    isStringEditorOpenRef.current = isStringEditorOpen;
  }, [isStringEditorOpen]);

  useEffect(() => {
    editorTextRef.current = editorText;
  }, [editorText]);

  useEffect(() => {
    isCommitPendingRef.current = isCommitPending;
  }, [isCommitPending]);

  useEffect(() => {
    return () => {
      if (blurCommitFrameRef.current != null) {
        cancelAnimationFrame(blurCommitFrameRef.current);
      }
    };
  }, []);

  const cancelBlurCommitAnimation = () => {
    if (blurCommitFrameRef.current != null) {
      cancelAnimationFrame(blurCommitFrameRef.current);
      blurCommitFrameRef.current = null;
    }
  };

  const discardStringEditor = () => {
    cancelBlurCommitAnimation();
    isStringEditorOpenRef.current = false;
    setIsStringEditorOpen(false);
    setEditorText('');
  };

  const runParentCommit = useCallback(
    async (submittedText, parsedPathData) => {
      isCommitPendingRef.current = true;
      isStringEditorOpenRef.current = false;
      setIsStringEditorOpen(false);
      setEditorText('');
      setPendingSubmittedText(submittedText);
      setIsCommitPending(true);
      try {
        await onPathChangeCommit(parsedPathData);
      } catch {
        /* parent rejected */
      } finally {
        setIsCommitPending(false);
        setPendingSubmittedText(null);
        isCommitPendingRef.current = false;
      }
    },
    [onPathChangeCommit]
  );

  const finishStringEditor = useCallback(async () => {
    cancelBlurCommitAnimation();
    if (isCommitPendingRef.current) return;
    if (!isStringEditorOpenRef.current) return;

    const draft = editorTextRef.current;
    let parsed = null;
    try {
      parsed = parsePathString(draft);
    } catch {
      parsed = null;
    }

    if (parsed == null) {
      discardStringEditor();
      return;
    }

    if (arePathSegNamesEqual(segmentsRef.current, parsed.segments)) {
      discardStringEditor();
      return;
    }

    if (!onPathChangeCommit) {
      discardStringEditor();
      return;
    }

    await runParentCommit(draft, parsed);
  }, [onPathChangeCommit, parsePathString, runParentCommit]);

  const openStringEditorFromBarClick = (e) => {
    if (!isPathStringEditable || isCommitPending) return;

    const target = e.target;
    if (
      !(
        target instanceof Element &&
        (target.classList.contains('pathbar-content') ||
          target.classList.contains('pathbar-container'))
      )
    ) {
      return;
    }

    const initialText = canonicalPathString;
    editorTextRef.current = initialText;
    setEditorText(initialText);
    isStringEditorOpenRef.current = true;
    setIsStringEditorOpen(true);
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (el) {
        el.focus();
        const len = el.value.length;
        el.setSelectionRange(len, len);
      }
    });
  };

  const scheduleBlurCommit = () => {
    blurCommitFrameRef.current = requestAnimationFrame(() => {
      blurCommitFrameRef.current = null;
      if (isStringEditorOpenRef.current && !isCommitPendingRef.current) {
        finishStringEditor();
      }
    });
  };

  const handleInputBlur = () => {
    if (isCommitPendingRef.current) return;
    scheduleBlurCommit();
  };

  const handleInputKeyDown = (e) => {
    if (isCommitPendingRef.current) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      cancelBlurCommitAnimation();
      finishStringEditor();
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      discardStringEditor();
    }
  };

  const handleSegmentClick = (index) => {
    if (isCommitPending) return;
    if (onPathSegClicked) {
      onPathSegClicked(index);
    }
  };

  const containerClassName = ['pathbar-container', isCommitPending ? 'pathbar-locked' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={containerClassName}
      style={{
        height: `${height}px`,
        cursor: isPathStringEditable && !isCommitPending ? 'text' : 'default'
      }}
      onClick={openStringEditorFromBarClick}
    >
      <div className="pathbar-main">
        {showTextField ? (
          <div className="pathbar-edit-wrap">
            <input
              ref={inputRef}
              type="text"
              className="pathbar-input"
              value={textFieldValue}
              readOnly={isCommitPending}
              onChange={
                isCommitPending
                  ? undefined
                  : (e) => {
                      const v = e.target.value;
                      editorTextRef.current = v;
                      setEditorText(v);
                    }
              }
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
            />
          </div>
        ) : (
          <div className="pathbar-content">
            {segments.length === 0 ? (
              <span className="pathbar-empty">{addSlashBeforeFirstSeg ? '/' : '(empty)'}</span>
            ) : (
              <>
                {addSlashBeforeFirstSeg && <span className="pathbar-separator">/</span>}
                {segments.map((segment, index) => (
                  <React.Fragment key={segment.id || index}>
                    <span
                      className="pathbar-segment"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSegmentClick(index);
                      }}
                    >
                      {segment.name}
                    </span>
                    {index < segments.length - 1 && separator && (
                      <span className="pathbar-separator">{separator}</span>
                    )}
                  </React.Fragment>
                ))}
                {appendTrailingSlash && segments.length > 0 && separator && (
                  <span className="pathbar-separator">{separator}</span>
                )}
              </>
            )}
          </div>
        )}
      </div>
      {isCommitPending && (
        <div className="pathbar-spinner-wrap">
          <SpinningCircle width={14} height={14} />
        </div>
      )}
    </div>
  );
});

export default PathBar;
