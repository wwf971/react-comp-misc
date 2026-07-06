import React from 'react'
import KeyValues from '../component/key-value/KeyValues.jsx'
import SpinningCircle from '../icon/SpinningCircle.jsx'
import './EndpointCard.css'

/**
 * @typedef {Object} EndpointCardActionItem
 * @property {string} id
 * @property {string} [labelText]
 * @property {boolean} [isVisible]
 * @property {boolean} [isDisabled]
 * @property {boolean} [isDanger]
 */

/**
 * data — content to render
 * @typedef {Object} EndpointCardData
 * @property {string} [id] — stable id included on every onEvent callback
 * @property {string} [titleText]
 * @property {string} [descriptionText]
 * @property {Array<{ key: string, value: string }>} [keyValues]
 * @property {string} [statusTagText]
 * @property {{ status?: 'idle'|'loading'|'success'|'error', messageText: string }|null} [statusMessage]
 * @property {string} [errorMessage]
 */

/**
 * config — interaction and layout state
 * @typedef {Object} EndpointCardConfig
 * @property {boolean} [isSelected]
 * @property {boolean} [isLocked] — show lock overlay and block actions
 * @property {boolean} [isUnavailable] — muted unavailable styling
 * @property {boolean} [isSelectable] — whole card clickable; emits 'select'
 * @property {boolean} [isCardDisabled] — disabled without lock overlay
 * @property {EndpointCardActionItem[]} [actionItems] — header action buttons (top right)
 * @property {string} [keyColWidth]
 * @property {string} [statusTagClassName]
 * @property {boolean} [showStatusDot]
 * @property {string} [selectedDetailText] — shown when isSelected
 */

/**
 * onEvent(eventType, eventData) — unified parent callback
 * eventType: 'action' | 'select' | 'dismissStatusMessage'
 * For 'action': eventData has { id, actionId, actionItem }
 * For 'select' | 'dismissStatusMessage': eventData has { id, ... }
 *
 * @param {{
 *   data?: EndpointCardData,
 *   config?: EndpointCardConfig,
 *   onEvent?: (eventType: string, eventData: Record<string, unknown>) => void | Promise<void>,
 * }} props
 */
const EndpointCard = ({
  data = {},
  config = {},
  onEvent,
}) => {
  const {
    id = '',
    titleText = '',
    descriptionText = '',
    keyValues = [],
    statusTagText = '',
    statusMessage = null,
    errorMessage = '',
  } = data

  const {
    isSelected = false,
    isLocked = false,
    isUnavailable = false,
    isSelectable = false,
    isCardDisabled = false,
    actionItems = [],
    keyColWidth = 'min',
    statusTagClassName = '',
    showStatusDot = false,
    selectedDetailText = '',
  } = config

  const [pendingActionId, setPendingActionId] = React.useState('')
  const isBusy = Boolean(pendingActionId)
  const isOverlayVisible = isLocked || isBusy
  const isInteractionLocked = isOverlayVisible || isCardDisabled
  const isRootDisabled = isInteractionLocked || isUnavailable

  const emitEvent = (eventType, eventData = {}) => {
    if (!onEvent) return undefined
    return onEvent(eventType, { id, ...eventData })
  }

  const handleActionClick = async (actionItem, event) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    if (!actionItem?.id || isInteractionLocked) return
    if (actionItem.isDisabled === true) return
    const timeStarted = Date.now()
    setPendingActionId(actionItem.id)
    try {
      await Promise.resolve(emitEvent('action', { actionId: actionItem.id, actionItem }))
      await waitUntilMinimumElapsed(timeStarted, 200)
    } finally {
      setPendingActionId('')
    }
  }

  const handleRootClick = () => {
    if (!isSelectable || isRootDisabled) return
    emitEvent('select', {})
  }

  const handleRootKeyDown = (event) => {
    if (!isSelectable || isRootDisabled) return
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    emitEvent('select', {})
  }

  const visibleActionItems = actionItems.filter((item) => item?.isVisible !== false)
  const rootClassName = [
    'endpoint-card',
    isSelected ? 'is-selected' : '',
    isUnavailable ? 'is-unavailable' : '',
    isOverlayVisible ? 'is-locked' : '',
    isRootDisabled ? 'is-disabled' : '',
    isSelectable ? 'is-selectable' : '',
    statusTagText ? 'has-status' : '',
    errorMessage ? 'is-error' : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      className={rootClassName}
      aria-disabled={isRootDisabled}
      role={isSelectable ? 'button' : undefined}
      tabIndex={isSelectable && !isRootDisabled ? 0 : -1}
      onClick={isSelectable ? handleRootClick : undefined}
      onKeyDown={isSelectable ? handleRootKeyDown : undefined}
    >
      {isOverlayVisible ? (
        <div className="endpoint-card-lock-overlay">
          <SpinningCircle width={24} height={24} color="#666" />
        </div>
      ) : null}
      <div className="endpoint-card-header">
        <div className="endpoint-card-title-wrap">
          <span className="endpoint-card-title">{titleText}</span>
          {statusTagText ? (
            <span className={`endpoint-card-status-tag ${statusTagClassName}`.trim()}>
              {showStatusDot ? <span className="endpoint-card-status-dot" /> : null}
              <span>{statusTagText}</span>
            </span>
          ) : null}
        </div>
        {visibleActionItems.length > 0 ? (
          <div className="endpoint-card-actions">
            {visibleActionItems.map((item) => {
              const isActionDisabled = isInteractionLocked || item.isDisabled === true
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`endpoint-card-action-btn ${item.isDanger === true ? 'is-danger' : ''}`}
                  disabled={isActionDisabled}
                  onClick={(event) => {
                    handleActionClick(item, event)
                  }}
                >
                  {item.labelText || item.id}
                </button>
              )
            })}
          </div>
        ) : null}
      </div>
      {descriptionText ? <div className="endpoint-card-desc">{descriptionText}</div> : null}
      {statusMessage && statusMessage.messageText ? (
        <div className={`endpoint-card-message status-${statusMessage.status || 'idle'}`}>
          <div className="endpoint-card-message-text-wrap">
            <span className="endpoint-card-message-text">{statusMessage.messageText}</span>
          </div>
          <button
            type="button"
            className="endpoint-card-message-dismiss-btn"
            onClick={(event) => {
              event.stopPropagation()
              emitEvent('dismissStatusMessage', {})
            }}
          >
            Dismiss
          </button>
        </div>
      ) : null}
      {isSelected && selectedDetailText ? (
        <div className="endpoint-card-selected-detail">{selectedDetailText}</div>
      ) : null}
      {keyValues.length > 0 ? (
        <div className="endpoint-card-kv">
          <KeyValues
            data={{ rows: keyValues }}
            config={{ isEditable: false, keyColWidth }}
          />
        </div>
      ) : null}
      {errorMessage ? <div className="endpoint-card-error">{errorMessage}</div> : null}
    </div>
  )
}

function waitUntilMinimumElapsed(timeStarted, durationMs) {
  const delayMs = Math.max(0, durationMs - (Date.now() - timeStarted))
  if (delayMs <= 0) return Promise.resolve()
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs)
  })
}

export default EndpointCard
