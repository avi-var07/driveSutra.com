// Simple and Reliable Google Authentication
class GoogleAuth {
  constructor() {
    this.isInitialized = false;
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  }

  // Load Google Identity Services
  async loadGoogleScript() {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.accounts) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Initialize Google Auth
  async init() {
    try {
      if (this.isInitialized) return true;
      
      if (!this.clientId) {
        throw new Error('Google Client ID not found');
      }

      await this.loadGoogleScript();

      // Initialize with simple configuration
      window.google.accounts.id.initialize({
        client_id: this.clientId,
        callback: this.handleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: false
      });

      this.isInitialized = true;
      return true;

    } catch (error) {
      console.error('Google Auth initialization failed:', error);
      return false;
    }
  }

  // Handle credential response
  handleCredentialResponse(response) {
    if (this.pendingResolve) {
      this.pendingResolve(response);
      this.pendingResolve = null;
    }
  }

  // Sign in with Google
  async signIn() {
    try {
      if (!this.isInitialized) {
        const initialized = await this.init();
        if (!initialized) {
          throw new Error('Failed to initialize Google Auth');
        }
      }

      // Create promise for credential response
      const credentialPromise = new Promise((resolve, reject) => {
        this.pendingResolve = resolve;
        
        // Set timeout
        setTimeout(() => {
          if (this.pendingResolve) {
            this.pendingResolve = null;
            reject(new Error('Google sign-in timeout'));
          }
        }, 30000); // 30 second timeout
      });

      // Show Google One Tap
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          this.showPopup();
        }
      });

      // Wait for credential response
      const credentialResponse = await credentialPromise;
      
      if (!credentialResponse || !credentialResponse.credential) {
        throw new Error('No credential received');
      }

      // Parse the JWT token
      const userData = this.parseJWT(credentialResponse.credential);
      if (!userData) {
        throw new Error('Failed to parse user data');
      }
      
      return {
        success: true,
        user: {
          id: userData.sub,
          email: userData.email,
          firstName: userData.given_name || '',
          lastName: userData.family_name || '',
          avatar: userData.picture || '',
          idToken: credentialResponse.credential
        }
      };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Show popup as fallback
  showPopup() {
    try {
      // Create a button element and click it programmatically
      const buttonDiv = document.createElement('div');
      document.body.appendChild(buttonDiv);
      
      window.google.accounts.id.renderButton(buttonDiv, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left'
      });
      
      // Auto-click the button
      setTimeout(() => {
        const button = buttonDiv.querySelector('div[role="button"]');
        if (button) {
          button.click();
        }
        // Clean up
        setTimeout(() => {
          if (buttonDiv.parentNode) {
            buttonDiv.parentNode.removeChild(buttonDiv);
          }
        }, 1000);
      }, 100);
      
    } catch (error) {
      console.error('Google popup failed:', error);
    }
  }

  // Parse JWT token
  parseJWT(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  }

  // Sign out
  async signOut() {
    try {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.disableAutoSelect();
      }
      this.isInitialized = false;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new GoogleAuth();