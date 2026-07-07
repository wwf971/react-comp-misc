import { makeAutoObservable, runInAction } from 'mobx';

const toText = (value) => `${value ?? ''}`.trim();

const defaultEndpoints = {
  login: '/login',
  tokenLogin: '/login/token',
  temporaryToken: '/login/temporary-token',
  logout: '/logout',
};

export function createAuthStore(config = {}) {
  const endpoints = {
    ...defaultEndpoints,
    ...(config.endpoints || {}),
  };
  const storageKey = toText(config.storageKey) || 'auth-token';
  const autoLoginStorageKey = toText(config.autoLoginStorageKey) || `${storageKey}-auto-login-enabled`;
  const requestJsonData = config.requestJsonData;
  if (typeof requestJsonData !== 'function') {
    throw new Error('createAuthStore requires requestJsonData');
  }

  const store = {
    isInitializing: false,
    isLoading: false,
    isLoggedIn: false,
    username: '',
    password: '',
    token: '',
    temporaryToken: '',
    temporaryTokenExpiresAt: 0,
    loginMode: 'credentials',
    message: '',
    messageType: 'error',
    isPasswordVisible: false,
    permission: 'R',
    isAutoLoginEnabled: true,

    get loginData() {
      return {
        isLoggedIn: this.isLoggedIn,
        isLoading: this.isLoading,
        username: this.username,
        password: this.password,
        token: this.token,
        loginMode: this.loginMode,
        message: this.message,
        messageType: this.messageType,
        isPasswordVisible: this.isPasswordVisible,
        isAutoLoginEnabled: this.isAutoLoginEnabled,
        loginStatus: this.message,
      };
    },

    get isWritable() {
      return this.permission.includes('W');
    },

    getAuthHeaders() {
      return this.getAuthHeadersForToken(this.token);
    },

    getAuthHeadersForToken(token) {
      const tokenText = toText(token);
      if (!tokenText) return {};
      return { Authorization: `Bearer ${tokenText}` };
    },

    saveToken(token) {
      const tokenText = toText(token);
      if (!tokenText) {
        localStorage.removeItem(storageKey);
        return;
      }
      localStorage.setItem(storageKey, tokenText);
    },

    loadSavedToken() {
      return toText(localStorage.getItem(storageKey));
    },

    loadAutoLoginEnabled() {
      return localStorage.getItem(autoLoginStorageKey) !== 'false';
    },

    saveAutoLoginEnabled(isEnabled) {
      localStorage.setItem(autoLoginStorageKey, isEnabled ? 'true' : 'false');
    },

    setAutoLoginEnabled(isEnabled) {
      runInAction(() => {
        this.isAutoLoginEnabled = isEnabled;
      });
      this.saveAutoLoginEnabled(isEnabled);
    },

    async requestData(url, options = {}) {
      return requestJsonData(url, options);
    },

    async initialize() {
      if (this.isInitializing) return;
      runInAction(() => {
        this.isInitializing = true;
        this.token = this.loadSavedToken();
        this.isAutoLoginEnabled = this.loadAutoLoginEnabled();
        this.loginMode = this.token ? 'token' : 'credentials';
      });
      if (!this.token || !this.isAutoLoginEnabled) {
        runInAction(() => {
          this.isInitializing = false;
        });
        return;
      }
      await this.submitTokenLogin();
      runInAction(() => {
        this.isInitializing = false;
      });
    },

    async submitCredentialsLogin() {
      runInAction(() => {
        this.isLoading = true;
        this.message = '';
      });
      try {
        const data = await this.requestData(endpoints.login, {
          method: 'POST',
          body: JSON.stringify({
            username: this.username,
            password: this.password,
          }),
        });
        const tokenText = toText(data?.token);
        runInAction(() => {
          this.token = tokenText;
          this.temporaryToken = '';
          this.temporaryTokenExpiresAt = 0;
          this.username = toText(data?.username) || this.username;
          this.permission = toText(data?.permission) || 'R';
          this.isLoggedIn = true;
          this.password = '';
          this.message = config.loginSuccessMessage || 'Login success';
          this.messageType = 'success';
        });
        this.saveToken(tokenText);
        return { code: 0 };
      } catch (error) {
        runInAction(() => {
          this.isLoggedIn = false;
          this.permission = 'R';
          this.temporaryToken = '';
          this.temporaryTokenExpiresAt = 0;
          this.message = error instanceof Error ? error.message : String(error);
          this.messageType = 'error';
        });
        return { code: -1, message: this.message };
      } finally {
        runInAction(() => {
          this.isLoading = false;
        });
      }
    },

    async submitTokenLogin() {
      runInAction(() => {
        this.isLoading = true;
        this.message = '';
      });
      try {
        const data = await this.requestData(endpoints.tokenLogin, {
          method: 'POST',
          body: JSON.stringify({ token: this.token }),
        });
        const tokenText = toText(data?.token) || this.token;
        runInAction(() => {
          this.token = tokenText;
          this.temporaryToken = '';
          this.temporaryTokenExpiresAt = 0;
          this.username = toText(data?.username) || this.username;
          this.permission = toText(data?.permission) || 'R';
          this.isLoggedIn = true;
          this.message = config.loginSuccessMessage || 'Login success';
          this.messageType = 'success';
        });
        this.saveToken(tokenText);
        return { code: 0 };
      } catch (error) {
        runInAction(() => {
          this.isLoggedIn = false;
          this.permission = 'R';
          this.temporaryToken = '';
          this.temporaryTokenExpiresAt = 0;
          this.message = error instanceof Error ? error.message : String(error);
          this.messageType = 'error';
        });
        this.saveToken('');
        return { code: -1, message: this.message };
      } finally {
        runInAction(() => {
          this.isLoading = false;
        });
      }
    },

    async getServiceToken() {
      if (!this.token) return '';
      const now = Math.floor(Date.now() / 1000);
      if (this.temporaryToken && this.temporaryTokenExpiresAt > now + 30) {
        return this.temporaryToken;
      }
      try {
        const data = await this.requestData(endpoints.temporaryToken, {
          method: 'POST',
          body: JSON.stringify({ token: this.token }),
        });
        const temporaryToken = toText(data?.token);
        runInAction(() => {
          this.temporaryToken = temporaryToken;
          this.temporaryTokenExpiresAt = Number(data?.expires_at || data?.expiresAt || 0);
        });
        return temporaryToken;
      } catch (_error) {
        return '';
      }
    },

    clearSessionOnUnauthorized() {
      if (!this.isLoggedIn) return;
      runInAction(() => {
        this.token = '';
        this.temporaryToken = '';
        this.temporaryTokenExpiresAt = 0;
        this.isLoggedIn = false;
        this.permission = 'R';
        this.message = 'Session expired, please login again';
        this.messageType = 'error';
      });
      this.saveToken('');
    },

    goToLoginPage() {
      runInAction(() => {
        this.isLoggedIn = false;
        this.temporaryToken = '';
        this.temporaryTokenExpiresAt = 0;
        this.loginMode = this.token ? 'token' : 'credentials';
        this.message = 'Token is kept. Auto login is paused.';
        this.messageType = 'success';
      });
      this.setAutoLoginEnabled(false);
    },

    async logout() {
      const token = this.token;
      if (token) {
        try {
          await this.requestData(endpoints.logout, {
            method: 'POST',
            body: JSON.stringify({ token }),
          });
        } catch (_error) {
          // Local logout should still complete when the server is already unavailable.
        }
      }
      runInAction(() => {
        this.isLoggedIn = false;
        this.username = '';
        this.password = '';
        this.token = '';
        this.temporaryToken = '';
        this.temporaryTokenExpiresAt = 0;
        this.permission = 'R';
        this.message = config.logoutSuccessMessage || 'Logged out';
        this.messageType = 'success';
      });
      this.saveToken('');
    },

    async onDataChangeRequest(type, params = {}) {
      if (type === 'set-login-mode') {
        const nextMode = toText(params.loginMode);
        runInAction(() => {
          this.loginMode = nextMode === 'token' ? 'token' : 'credentials';
          this.message = '';
        });
        return { code: 0 };
      }
      if (type === 'set-username') {
        runInAction(() => {
          this.username = `${params.username ?? ''}`;
        });
        return { code: 0 };
      }
      if (type === 'set-password') {
        runInAction(() => {
          this.password = `${params.password ?? ''}`;
        });
        return { code: 0 };
      }
      if (type === 'set-token') {
        runInAction(() => {
          this.token = `${params.token ?? ''}`;
        });
        return { code: 0 };
      }
      if (type === 'toggle-password-visible') {
        runInAction(() => {
          this.isPasswordVisible = !this.isPasswordVisible;
        });
        return { code: 0 };
      }
      if (type === 'set-auto-login-enabled') {
        this.setAutoLoginEnabled(params.isAutoLoginEnabled === true);
        return { code: 0 };
      }
      if (type === 'submit-credentials') {
        return this.submitCredentialsLogin();
      }
      if (type === 'submit-token') {
        return this.submitTokenLogin();
      }
      return { code: -1, message: `unsupported action: ${type}` };
    },
  };

  return makeAutoObservable(store, {}, { autoBind: true });
}

export default createAuthStore;
