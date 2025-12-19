import api from './api';

function loadGsiScript() {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      return resolve();
    }
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', (e) => reject(e));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
}

class GoogleAuthService {
  constructor() {
    this.initialized = false;
    this._pending = null;
    this._gsiCallback = this._gsiCallback.bind(this);
  }

  async initialize() {
    try {
      await loadGsiScript();
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) throw new Error('VITE_GOOGLE_CLIENT_ID not set');

      // Initialize GSI with a callback that resolves pending sign-in
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: this._gsiCallback
      });

      this.initialized = true;
      return true;
    } catch (err) {
      console.error('Failed to initialize Google Identity Services:', err);
      return false;
    }
  }

  _gsiCallback(response) {
    // response.credential is the ID token (JWT)
    if (this._pending) {
      this._pending.resolve(response);
      this._pending = null;
    }
  }

  async signInWithGoogle() {
    try {
      if (!this.initialized) {
        const ok = await this.initialize();
        if (!ok) throw new Error('Failed to initialize Google Auth');
      }

      const credentialResponse = await new Promise((resolve, reject) => {
        // store resolve so _gsiCallback can use it
        this._pending = { resolve, reject };

        // Prompt shows the One Tap / popup chooser
        try {
          window.google.accounts.id.prompt();
        } catch (e) {
          this._pending = null;
          reject(e);
        }

        // fallback timeout in case user closes prompt
        setTimeout(() => {
          if (this._pending) {
            this._pending = null;
            reject(new Error('Google sign-in timed out'));
          }
        }, 60000);
      });

      if (!credentialResponse || !credentialResponse.credential) {
        throw new Error('No credential returned');
      }

      const idToken = credentialResponse.credential;

      // Decode token payload to build a minimal profile object for backend
      function parseJwt(token) {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          return JSON.parse(jsonPayload);
        } catch (e) {
          return null;
        }
      }

      const payload = parseJwt(idToken) || {};
      const profile = {
        id: payload.sub,
        email: payload.email,
        firstName: payload.given_name || payload.name || '',
        lastName: payload.family_name || '',
        avatar: payload.picture || ''
      };

      const response = await api.post('/auth/google-signin', { idToken, profile });

      if (response.data && response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return { success: true, user: response.data.user, token: response.data.token };
      }

      return { success: false, error: response.data?.message || 'Google sign-in failed' };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    try {
      // GSI does not provide a direct signOut for credential based flow, but we can revoke
      if (window.google && window.google.accounts && window.google.accounts.id) {
        // There is no signOut method; clearing local state is sufficient for app sign-out
      }
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { success: true };
    } catch (error) {
      console.error('Google sign-out error:', error);
      return { success: false, error: error.message };
    }
  }

  isSignedIn() {
    // With GSI we don't keep a persistent client-side session; rely on localStorage
    return !!localStorage.getItem('token');
  }
}

export default new GoogleAuthService();