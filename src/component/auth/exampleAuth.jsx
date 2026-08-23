import { useMemo } from 'react';
import { makeAutoObservable, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import Login from './Login.jsx';
import AuthStatusButton from './AuthStatusButton.jsx';
import {
  DemoPanel,
  Example,
  Explanation,
  Controls,
  ControlItem,
  CompDemoArea,
  MessageAndOutputs,
} from '../../dev/demo/DemoLayout.jsx';
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
    isAutoLoginEnabled: true,
    loginMode: 'credentials',
    loginStatus: '',
    userState: 'anonymous',
    init() {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const savedToken = window.localStorage.getItem('authTokenDemo');
      this.isAutoLoginEnabled = window.localStorage.getItem('authTokenDemoAutoLogin') !== 'false';
      if (!savedToken) return;
      this.token = savedToken;
      this.message = 'Saved token is available.';
      this.messageType = 'success';
    },
    logout() {
      this.isLoggedIn = false;
      this.userState = 'anonymous';
      this.token = '';
      this.loginStatus = '';
      this.message = 'Logged out.';
      this.messageType = 'success';
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('authTokenDemo');
      }
    },
    goToLoginPage() {
      this.isLoggedIn = false;
      this.userState = 'login-page';
      this.loginMode = this.token ? 'token' : 'credentials';
      this.message = 'Token is kept. Auto login is paused.';
      this.messageType = 'success';
      this.setAutoLoginEnabled(false);
    },
    setAutoLoginEnabled(isEnabled) {
      this.isAutoLoginEnabled = Boolean(isEnabled);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('authTokenDemoAutoLogin', this.isAutoLoginEnabled ? 'true' : 'false');
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
      if (type === 'set-auto-login-enabled') {
        this.setAutoLoginEnabled(params.isAutoLoginEnabled === true);
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
            this.isAutoLoginEnabled = true;
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
          this.isAutoLoginEnabled = true;
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

const LoginExamplePanel = observer(function LoginExamplePanel({ store }) {
  const storeLocal = useMemo(() => (store ? null : createLoginDemoStore()), [store]);
  const storeUsed = store || storeLocal;

  return (
    <DemoPanel>
      <Explanation titleText="Login">
        Render-only login view driven by a MobX store.
      </Explanation>
      <Example title="Login and auth status">
        <Controls>
          <ControlItem labelText="Auth status:">
            <AuthStatusButton
              data={{
                isLoggedIn: storeUsed.isLoggedIn,
                username: storeUsed.username,
              }}
              config={{
                minWidth: 170,
                menuAlign: 'right',
              }}
              onEvent={(eventType) => {
                if (eventType === 'go-login') {
                  storeUsed.goToLoginPage();
                }
                if (eventType === 'sign-out') {
                  storeUsed.logout();
                }
              }}
            />
          </ControlItem>
          <ControlItem>
            <button type="button" className="demo-button" onClick={() => storeUsed.logout()}>
              Logout
            </button>
          </ControlItem>
        </Controls>
        <CompDemoArea>
          <div className="auth-login-demo-box">
            <Login
              title="Login"
              data={storeUsed}
              onDataChangeRequest={storeUsed.onDataChangeRequest}
              useAuthToken={true}
              showTokenAtLogin={true}
            />
          </div>
        </CompDemoArea>
        <MessageAndOutputs labelText="Current user state:">
          <span>{storeUsed.userState}</span>
          {storeUsed.message ? <span>{storeUsed.message}</span> : null}
        </MessageAndOutputs>
      </Example>
    </DemoPanel>
  );
});

export const authExamples = {
  Login: {
    component: Login,
    description: 'Render-only login view driven by a MobX store',
    example: LoginExamplePanel,
  },
};

export default LoginExamplePanel;
