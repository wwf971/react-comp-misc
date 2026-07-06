# Auth Components

This folder contains render components for sign in and auth status display, and a small shared auth store factory.

The render components do not own login logic. They render from `data`, accept visual options from `config`, and send change requests upward. Apps can either provide their own store, or use `createAuthStore` to share the common token login flow.

## Components

### Login

`Login` renders the sign in page.

It supports two sign in modes:

- username and password
- auth token

It also renders an `auto login with token` option. This option is only a UI control. The app store decides how to save it and whether startup should use a saved token.

Typical store behavior:

1. Read saved token from local storage.
2. Read `isAutoLoginEnabled` from local storage.
3. If both are present, verify token and enter the app.
4. If auto login is disabled, stay on login page and show the token mode.

### AuthStatusButton

`AuthStatusButton` renders the small auth status button usually placed at the right side of a header.

It wraps `ButtonWithDropDown` and provides two standard actions:

- `go-login`: go to login page without deleting the saved token.
- `sign-out`: run real sign out logic. Usually this also deletes the saved token.

This keeps header auth UI consistent across services.

### createAuthStore

`createAuthStore` creates a MobX auth store for the common service auth flow.

The app supplies:

- local storage keys
- endpoint paths
- `requestJsonData`, which adapts the app's request helper to return response `data`

Example:

```js
const authStore = createAuthStore({
  storageKey: 'example-auth-token',
  autoLoginStorageKey: 'example-auto-login-enabled',
  endpoints: {
    login: '/login',
    tokenLogin: '/login/token',
    temporaryToken: '/login/temporary-token',
    logout: '/logout',
  },
  requestJsonData,
})
```

## Data Model

### Login Data

`Login` expects a data object like:

```js
{
  isLoggedIn: false,
  isLoading: false,
  username: '',
  password: '',
  token: '',
  loginMode: 'credentials',
  message: '',
  messageType: 'success',
  isPasswordVisible: false,
  isAutoLoginEnabled: true,
  loginStatus: ''
}
```

`loginMode` is either:

- `credentials`
- `token`

`isAutoLoginEnabled` controls the checkbox state. The component does not persist this value.

### AuthStatusButton Data

`AuthStatusButton` expects:

```js
{
  isLoggedIn: true,
  username: 'demo'
}
```

The button label is:

```text
login: demo
```

When not logged in, the label is:

```text
login
```

## Events

### Login Events

`Login` uses `onDataChangeRequest(type, params)`.

Supported request types:

```text
set-login-mode
set-username
set-password
set-token
toggle-password-visible
set-auto-login-enabled
submit-credentials
submit-token
```

The store should accept or reject each request.

For example:

```js
if (type === 'set-auto-login-enabled') {
  store.setAutoLoginEnabled(params.isAutoLoginEnabled === true)
  return { code: 0 }
}
```

### AuthStatusButton Events

`AuthStatusButton` uses `onEvent(eventType, eventData)`.

Supported event types:

```text
go-login
sign-out
```

Typical handling:

```js
if (eventType === 'go-login') {
  authStore.goToLoginPage()
}

if (eventType === 'sign-out') {
  authStore.logout()
}
```

## Auto Login With Token

Use local storage for this preference. It is a browser UI preference, not a server credential.

Suggested local storage values:

```text
auth-token
auth-auto-login-enabled
```

Suggested behavior:

- Default is enabled.
- When user unchecks `auto login with token`, save `false`.
- When user chooses `go to login page`, keep token but save auto login as `false`.
- When user signs in again manually, save auto login as `true` if that is the desired service behavior.
- When user chooses `sign out`, delete token.

This gives precise control:

- valid token plus auto login enabled: app enters main page quickly.
- valid token plus auto login disabled: app stays on login page.
- no token: app stays on login page.

## Store Responsibilities

The store should own:

- saved token read/write
- auto login preference read/write
- username and password values
- token verification request
- login request
- sign out request
- temporary service token request, if the app uses one
- handling unauthorized response

The components should not call backend APIs directly.

When using `createAuthStore`, these responsibilities are handled by the shared store. The app still owns its request helper and endpoint configuration.

## Header Usage

The header should use `AuthStatusButton` instead of custom username text plus a separate sign out button.

Example:

```jsx
<AuthStatusButton
  data={{
    isLoggedIn: authStore.isLoggedIn,
    username: authStore.username,
  }}
  config={{
    buttonClassName: 'app-header-btn',
    menuAlign: 'right',
    minWidth: 170,
  }}
  onEvent={(eventType) => {
    if (eventType === 'go-login') {
      authStore.goToLoginPage()
    }
    if (eventType === 'sign-out') {
      authStore.logout()
    }
  }}
/>
```

## Example

See `example.jsx` in this folder.

The example shows:

- username and password sign in
- token sign in
- auto login checkbox
- auth status dropdown
- temporary sign out with token kept
- real sign out with token deleted

The example is registered on the dev test page through the normal component example registry.
