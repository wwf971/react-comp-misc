import Login from './Login.jsx';

export const authExamples = {
  'Login': {
    component: Login,
    description: 'Reusable login form with timeout error handling',
    example: () => (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', background: '#f5f5f5' }}>
        <Login 
          title="Login"
          loginEndpoint="/api/login"
          timeout={5000}
          onSuccess={(data) => alert('Login successful!')}
          useAuthToken={true}
          authTokenKey="authToken"
          showTokenAtLogin={true}
        />
      </div>
    )
  },
};

