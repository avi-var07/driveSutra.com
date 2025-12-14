import api from './api';

class GoogleAuthService {
  constructor() {
    this.isInitialized = false;
  }

  // Initialize Google Auth
  async initialize() {
    try {
      if (typeof gapi === 'undefined') {
        console.error('Google API not loaded');
        return false;
      }

      await new Promise((resolve) => {
        gapi.load('auth2', resolve);
      });

      const authInstance = gapi.auth2.getAuthInstance();
      if (!authInstance) {
        await gapi.auth2.init({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          scope: 'profile email'
        });
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Auth:', error);
      return false;
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) throw new Error('Failed to initialize Google Auth');
      }

      const authInstance = gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      
      if (user.isSignedIn()) {
        const profile = user.getBasicProfile();
        const idToken = user.getAuthResponse().id_token;
        
        // Send to backend for verification and JWT creation
        const response = await api.post('/auth/google-signin', {
          idToken,
          profile: {
            id: profile.getId(),
            email: profile.getEmail(),
            firstName: profile.getGivenName(),
            lastName: profile.getFamilyName(),
            avatar: profile.getImageUrl()
          }
        });

        if (response.data.success) {
          // Store JWT token
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
          return {
            success: true,
            user: response.data.user,
            token: response.data.token
          };
        }
      }
      
      throw new Error('Google sign-in failed');
    } catch (error) {
      console.error('Google sign-in error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Sign out
  async signOut() {
    try {
      if (this.isInitialized) {
        const authInstance = gapi.auth2.getAuthInstance();
        await authInstance.signOut();
      }
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      return { success: true };
    } catch (error) {
      console.error('Google sign-out error:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if user is signed in
  isSignedIn() {
    if (!this.isInitialized) return false;
    
    const authInstance = gapi.auth2.getAuthInstance();
    return authInstance && authInstance.isSignedIn.get();
  }
}

export default new GoogleAuthService();