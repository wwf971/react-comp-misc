import { useState, useEffect, useRef } from 'react'
import './Login.css'

/**
 * Login Component - Reusable login form with timeout error handling
 * 
 * @param {Object} props
 * @param {string} props.title - Title to display (default: 'Login')
 * @param {string} props.loginEndpoint - API endpoint for login (default: 'login')
 * @param {number} props.timeout - Request timeout in milliseconds (default: 5000)
 * @param {Function} props.onSuccess - Callback when login succeeds (receives response data)
 * @param {boolean} props.useAuthToken - Enable auth token storage and retrieval (default: true)
 * @param {string} props.authTokenKey - localStorage key for auth token (default: 'authToken')
 * @param {boolean} props.showTokenAtLogin - Show token login panel (default: true)
 * @param {boolean} props.autoLoginWithToken - Auto-login with saved token on mount (default: true)
 */
function Login({
  title = 'Login',
  loginEndpoint = 'login',
  timeout = 5000,
  onSuccess,
  useAuthToken = true,
  authTokenKey = 'authToken',
  showTokenAtLogin = true,
  autoLoginWithToken = true,
}) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [loginMode, setLoginMode] = useState('credentials') // 'credentials' or 'token'
  const hasAttemptedAutoLogin = useRef(false)

  // Load existing token from localStorage on mount
  useEffect(() => {
    if (useAuthToken && typeof window !== 'undefined' && window.localStorage) {
      const savedToken = localStorage.getItem(authTokenKey)
      if (savedToken) {
        setToken(savedToken)
      }
    }
  }, [useAuthToken, authTokenKey])

  // Auto-login with saved token if enabled
  useEffect(() => {
    if (autoLoginWithToken && token && onSuccess && !hasAttemptedAutoLogin.current) {
      hasAttemptedAutoLogin.current = true
      setLoading(true)
      setMessage('✓ Auto-logging in with saved token...')
      
      // Small delay to show the message
      setTimeout(() => {
        onSuccess({ token })
        setLoading(false)
      }, 300)
    }
  }, [autoLoginWithToken, token, onSuccess])  // Only run when token becomes available

  const handleCredentialsLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // Create an AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(loginEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (data.code === 0) {
        setMessage('✓ Login successful!')

        // Store token if useAuthToken is enabled
        if (useAuthToken && data.data.token && typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(authTokenKey, data.data.token)
          setToken(data.data.token)
        }

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(data.data)
        }
      } else {
        setMessage(`✗ ${data.message}`)
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        setMessage('✗ Server not responding. Please check if the server is running.')
      } else {
        setMessage(`✗ Error: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleTokenLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (!token) {
      setMessage('✗ Please enter an auth token')
      setLoading(false)
      return
    }

    try {
      // Call onSuccess with token directly
      // Assuming the token validation is done by the parent component
      setMessage('✓ Using saved token!')
      
      if (onSuccess) {
        onSuccess({ token })
      }
    } catch (error) {
      setMessage(`✗ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="login-box">
        <h1>{title}</h1>
        
        {/* Mode Switcher */}
        {useAuthToken && showTokenAtLogin && token && (
          <div className="login-mode-switcher">
            <button
              type="button"
              className={`mode-button ${loginMode === 'credentials' ? 'active' : ''}`}
              onClick={() => setLoginMode('credentials')}
            >
              Username & Password
            </button>
            <button
              type="button"
              className={`mode-button ${loginMode === 'token' ? 'active' : ''}`}
              onClick={() => setLoginMode('token')}
            >
              Use Saved Token
            </button>
          </div>
        )}

        {/* Credentials Login Form */}
        {loginMode === 'credentials' && (
          <form onSubmit={handleCredentialsLogin}>
            <div className="form-group">
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}

        {/* Token Login Form */}
        {loginMode === 'token' && useAuthToken && (
          <form onSubmit={handleTokenLogin}>
            <div className="form-group">
              <label htmlFor="token">Auth Token:</label>
              <textarea
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                disabled={loading}
                rows="4"
                placeholder="Paste your auth token here..."
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login with Token'}
            </button>
          </form>
        )}

        {message && <div className={`message ${message.startsWith('✓') ? 'success' : 'error'}`}>{message}</div>}
      </div>
    </>
  )
}

export default Login
