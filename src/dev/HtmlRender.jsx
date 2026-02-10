import React, { useEffect, useMemo, useState } from 'react';
import PanelDual from '../panel/PanelDual.jsx';
import './HtmlRender.css';

const validateHtml = (rawHtml) => {
  const parser = new DOMParser();
  const wrapped = `<root>${rawHtml}</root>`;
  const doc = parser.parseFromString(wrapped, 'text/xml');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    return errorNode.textContent || 'Invalid HTML';
  }
  return '';
};

const HtmlRender = ({
  title,
  rawHtml = '',
  isEditable = false,
  leftLabel = 'HTML Raw Text',
  rightLabel = 'Rendered',
  onChange,
  initialRatio = 0.5,
  fixedDivider = true,
  className = ''
}) => {
  const [text, setText] = useState(rawHtml || '');

  useEffect(() => {
    setText(rawHtml || '');
  }, [rawHtml]);

  const errorMessage = useMemo(() => validateHtml(text), [text]);

  const handleChange = (event) => {
    const nextValue = event.target.value;
    setText(nextValue);
    if (onChange) {
      onChange(nextValue);
    }
  };

  return (
    <div className={`html-render ${className}`.trim()}>
      {title ? <div className="html-render-title">{title}</div> : null}
      <div className="html-render-body">
        <PanelDual orientation="vertical" initialRatio={initialRatio} fixedDivider={fixedDivider}>
          <div className="html-render-pane">
            <div className="html-render-label">{leftLabel}</div>
            <textarea
              className="html-render-textarea"
              value={text}
              readOnly={!isEditable}
              onChange={isEditable ? handleChange : undefined}
            />
          </div>
          <div className="html-render-pane">
            <div className="html-render-label">{rightLabel}</div>
            {errorMessage ? (
              <div className="html-render-error">{errorMessage}</div>
            ) : (
              <div
                className="html-render-output"
                dangerouslySetInnerHTML={{ __html: text }}
              />
            )}
          </div>
        </PanelDual>
      </div>
    </div>
  );
};

export default HtmlRender;
