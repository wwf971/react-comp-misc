import React from 'react'
import KeyValues from '../component/key-value/KeyValues.jsx'
import SpinningCircle from '../icon/SpinningCircle.jsx'
import './DbConnectionCard.css'

const DbConnectionCard = ({
  titleText = '',
  statusTagText = '',
  statusMessage = null,
  keyValuesData = [],
  actionItems = [],
  isLocked = false,
  onDismissStatusMessage,
  onAction,
}) => {
  const [pendingActionId, setPendingActionId] = React.useState('')
  const isBusy = Boolean(pendingActionId)
  const isCardLocked = isLocked || isBusy

  const handleActionClick = async (actionItem) => {
    if (!actionItem || !actionItem.id || isCardLocked) {
      return
    }
    if (actionItem.isDisabled === true) {
      return
    }
    setPendingActionId(actionItem.id)
    try {
      if (onAction) {
        await Promise.resolve(onAction(actionItem.id, actionItem))
      }
    } finally {
      setPendingActionId('')
    }
  }

  const visibleActionItems = actionItems.filter((item) => item?.isVisible !== false)

  return (
    <div className={`database-conn-card ${statusTagText ? 'has-status' : ''} ${isCardLocked ? 'is-locked' : ''}`}>
      {isCardLocked ? (
        <div className="database-conn-card-lock-overlay">
          <SpinningCircle width={28} height={28} color="#4d4d4d" />
        </div>
      ) : null}
      <div className="database-conn-card-header">
        <div className="database-conn-card-title-wrap">
          <span className="database-conn-card-title">{titleText}</span>
          {statusTagText ? <span className="database-conn-card-status-tag">{statusTagText}</span> : null}
        </div>
        <div className="database-conn-card-actions">
          {visibleActionItems.map((item) => {
            const isActionDisabled = isCardLocked || item.isDisabled === true
            return (
              <button
                key={item.id}
                type="button"
                className={`database-conn-card-action-btn ${item.isDanger === true ? 'is-danger' : ''}`}
                disabled={isActionDisabled}
                onClick={() => {
                  handleActionClick(item)
                }}
              >
                {item.labelText || item.id}
              </button>
            )
          })}
        </div>
      </div>
      {statusMessage && statusMessage.messageText ? (
        <div className={`database-conn-card-message status-${statusMessage.status || 'idle'}`}>
          <div className="database-conn-card-message-text-wrap">
            {statusMessage.status === 'loading' ? <SpinningCircle width={10} height={10} color="#324259" /> : null}
            <span className="database-conn-card-message-text">{statusMessage.messageText}</span>
          </div>
          <button
            type="button"
            className="database-conn-card-message-dismiss-btn"
            onClick={() => {
              if (onDismissStatusMessage) {
                onDismissStatusMessage()
              }
            }}
          >
            Dismiss
          </button>
        </div>
      ) : null}
      <div className="database-conn-card-kv">
        <KeyValues
          data={keyValuesData}
          isEditable={false}
          keyColWidth="80px"
        />
      </div>
    </div>
  )
}

export default DbConnectionCard
