import { useState } from 'react';
import { makeAutoObservable, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import Login from './Login.jsx';
import './example.css';

function createLoginDemoStore() {
  const store = {
    username: 'demo',
    password: 'demo',
    token: '',
    message: '',
    messageType: 'success',
    isLoading: false,
    isLoggedIn: false,
    isPasswordVisible: false,
    loginMode: 'credentials',
    loginStatus: '',
    userState: 'anonymous',
    init() {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const savedToken = window.localStorage.getItem('authTokenDemo');
      if (!savedToken) return;
      this.token = savedToken;
      this.message = 'Saved token is available.';
      this.messageType = 'success';
    },
    logout() {
      this.isLoggedIn = false;
      this.userState = 'anonymous';
      this.loginStatus = '';
      this.message = 'Logged out.';
      this.messageType = 'success';
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('authTokenDemo');
      }
    },
    async onDataChangeRequest(type, params = {}) {
      if (type === 'set-username') {
        this.username = params.username || '';
        return { code: 0 };
      }
      if (type === 'set-password') {
        this.password = params.password || '';
        return { code: 0 };
      }
      if (type === 'set-token') {
        this.token = params.token || '';
        return { code: 0 };
      }
      if (type === 'set-login-mode') {
        this.loginMode = params.loginMode === 'token' ? 'token' : 'credentials';
        this.message = '';
        return { code: 0 };
      }
      if (type === 'toggle-password-visible') {
        this.isPasswordVisible = !this.isPasswordVisible;
        return { code: 0 };
      }
      if (type === 'submit-credentials') {
        if (!this.username || !this.password) {
          this.message = 'Username and password are required.';
          this.messageType = 'error';
          return { code: -1 };
        }
        this.isLoading = true;
        this.message = '';
        await new Promise((resolve) => setTimeout(resolve, 450));
        runInAction(() => {
          if (this.username === 'demo' && this.password === 'demo') {
            const nextToken = 'demo-token-from-server';
            this.token = nextToken;
            this.isLoggedIn = true;
            this.userState = 'authenticated';
            this.loginStatus = 'Logged in as demo user.';
            this.message = 'Login successful.';
            this.messageType = 'success';
            if (typeof window !== 'undefined' && window.localStorage) {
              window.localStorage.setItem('authTokenDemo', nextToken);
            }
          } else {
            this.message = 'Invalid username or password.';
            this.messageType = 'error';
          }
          this.isLoading = false;
        });
        return { code: 0 };
      }
      if (type === 'submit-token') {
        if (!this.token) {
          this.message = 'Auth token is required.';
          this.messageType = 'error';
          return { code: -1 };
        }
        this.isLoading = true;
        this.message = '';
        await new Promise((resolve) => setTimeout(resolve, 300));
        runInAction(() => {
          this.isLoading = false;
          this.isLoggedIn = true;
          this.userState = 'authenticated';
          this.loginStatus = 'Logged in with saved token.';
          this.message = 'Token login successful.';
          this.messageType = 'success';
        });
        return { code: 0 };
      }
      return { code: 0 };
    },
  };
  const observableStore = makeAutoObservable(store, {}, { autoBind: true });
  observableStore.init();
  return observableStore;
}

const LoginExamplePanel = observer(() => {
  const [loginStore] = useState(() => createLoginDemoStore());
  return (
    <div className="auth-login-demo-root">
      <div className="auth-login-demo-box">
        <Login
          title="Login"
          data={loginStore}
          onDataChangeRequest={loginStore.onDataChangeRequest}
          useAuthToken={true}
          showTokenAtLogin={true}
        />
      </div>
      <div className="auth-login-demo-state">
        <span className="auth-login-demo-state-label">Current user state:</span>
        <span className="auth-login-demo-state-value">{loginStore.userState}</span>
      </div>
      <button
        type="button"
        className="auth-login-demo-logout-button"
        onClick={() => loginStore.logout()}
      >
        Logout
      </button>
    </div>
  );
});

export const authExamples = {
  'Login': {
    component: Login,
    description: 'Render-only login view driven by a MobX store',
    example: () => <LoginExamplePanel />
  },
};

