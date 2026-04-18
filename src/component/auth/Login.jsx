import { observer } from 'mobx-react-lite'
import './Login.css'
import { EyeIcon, EyeOffIcon, CheckIcon } from '../../icon/Icon'

/**
 * Login Component - Render-only login view.
 * 
 * @param {Object} props
 * @param {string} props.title - Title to display (default: 'Login')
 * @param {Object} props.data - Render data from data-management layer
 * @param {Function} props.onDataChangeRequest - Upward callback for change attempts
 * @param {boolean} props.useAuthToken - Enable auth token storage and retrieval (default: true)
 * @param {boolean} props.showTokenAtLogin - Show token login panel (default: true)
 */
const Login = observer(function Login({
  data,
  title = 'Login',
  onDataChangeRequest,
  useAuthToken = true,
  showTokenAtLogin = true,
}) {
  const handleDataChangeRequest = async (type, params = {}) => {
    if (!onDataChangeRequest) return { code: 0 }
    return onDataChangeRequest(type, params)
  }

  const handleCredentialsLogin = async (e) => {
    e.preventDefault()
    await handleDataChangeRequest('submit-credentials')
  }

  const handleTokenLogin = async (e) => {
    e.preventDefault()
    await handleDataChangeRequest('submit-token')
  }

  return (
    <div className="login-box">
      <div className="login-title">{title}</div>
      <div className="login-body">
        {data?.isLoggedIn ? (
          <div className="login-success-state">
            <div className="login-success-icon-wrap" aria-hidden="true">
              <CheckIcon width={36} height={36} />
            </div>
            <div className="login-success-text">You have logged in.</div>
            <div className="login-success-subtext">{data.loginStatus || 'Logged in successfully.'}</div>
          </div>
        ) : (
          <>
            {useAuthToken && showTokenAtLogin && data?.token && (
              <div className="login-mode-switcher">
                <button
                  type="button"
                  className={`mode-button ${data.loginMode === 'credentials' ? 'active' : ''}`}
                  onClick={() => handleDataChangeRequest('set-login-mode', { loginMode: 'credentials' })}
                >
                  Username and Password
                </button>
                <button
                  type="button"
                  className={`mode-button ${data.loginMode === 'token' ? 'active' : ''}`}
                  onClick={() => handleDataChangeRequest('set-login-mode', { loginMode: 'token' })}
                >
                  Use Saved Token
                </button>
              </div>
            )}

            {data?.loginMode === 'credentials' && (
              <form onSubmit={handleCredentialsLogin}>
                <div className="form-group">
                  <label className="form-label" htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    className="login-input-field"
                    value={data?.username || ''}
                    onChange={(e) => handleDataChangeRequest('set-username', { username: e.target.value })}
                    required
                    disabled={data?.isLoading}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="password">Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={data?.isPasswordVisible ? 'text' : 'password'}
                      id="password"
                      className="login-input-field login-password-input"
                      value={data?.password || ''}
                      onChange={(e) => handleDataChangeRequest('set-password', { password: e.target.value })}
                      required
                      disabled={data?.isLoading}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => handleDataChangeRequest('toggle-password-visible')}
                      disabled={data?.isLoading}
                      aria-label={data?.isPasswordVisible ? 'Hide password' : 'Show password'}
                    >
                      {data?.isPasswordVisible ? <EyeOffIcon width={20} height={20} /> : <EyeIcon width={20} height={20} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={data?.isLoading} className="login-submit-button">
                  {data?.isLoading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            )}

            {data?.loginMode === 'token' && useAuthToken && (
              <form onSubmit={handleTokenLogin}>
                <div className="form-group">
                  <label className="form-label" htmlFor="token">Auth Token</label>
                  <textarea
                    id="token"
                    className="login-token-input"
                    value={data?.token || ''}
                    onChange={(e) => handleDataChangeRequest('set-token', { token: e.target.value })}
                    required
                    disabled={data?.isLoading}
                    rows="4"
                    placeholder="Paste your auth token here..."
                  />
                </div>
                <button type="submit" disabled={data?.isLoading} className="login-submit-button">
                  {data?.isLoading ? 'Logging in...' : 'Login with Token'}
                </button>
              </form>
            )}
          </>
        )}

        {data?.message ? (
          <div className={`message ${data.messageType === 'success' ? 'success' : 'error'}`}>
            {data.message}
          </div>
        ) : (
          <div className="message-placeholder" />
        )}
      </div>
    </div>
  )
})

export default Login
