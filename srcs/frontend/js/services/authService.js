export const authService = {
	async logout() {
		try {
			const token = tokenService.getAccessToken();
			const response = await fetch('http://localhost:8000/auth/logout/', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
				},
				credentials: 'include'
			});

			if (response.ok) {
				tokenService.removeTokens();
				return true;
			}
			return false;
		} catch (error) {
			console.error('Logout failed:', error);
			return false;
		}
	},

	async login(username_or_email, password) {
		try {
			const response = await fetch('http://localhost:8000/auth/login/', {
				method: 'POST',
				headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
				},
				body: JSON.stringify({
					username_or_email,
					password
				}),
				credentials: 'include'
			});

			const data = await response.json();

			if (response.ok) {
				tokenService.setAccessToken(data.access);
				return { success: true };
			}

			return { success: false, error: data.error };

		} catch (error) {
			return { success: false, error: error.message };
		}
	},

	async oauth42Login() {
		try {
			const response = await fetch(`http://localhost:8000/oauth/42/login/`, {
				method: 'GET',
				headers: {
					'Accept': 'application/json'
				}
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			if (data.authorization_url) {
				return { success: true, url: data.authorization_url };
			}
			throw new Error('No authorization URL received');
		} catch (error) {
			return { success: false, error: error.message };
		}
	}
};

export const tokenService = {
	setAccessToken(token) {
		localStorage.setItem('access_token', token);
	},

	getAccessToken() {
		return localStorage.getItem('access_token');
	},

	removeTokens() {
		localStorage.removeItem('access_token');
	},

	async validateToken() {
	  const token = this.getAccessToken();
	  if (!token) return false;

	  try {
		  const response = await fetch('http://localhost:8000/auth/validate/', {
			  headers: {
				  'Authorization': `Bearer ${token}`,
				  'Content-Type': 'application/json'
			  },
			  credentials: 'include'
		  });

		  if (response.ok) return true;

		  const refreshResponse = await fetch('http://localhost:8000/auth/refresh/', {
			  method: 'POST',
			  credentials: 'include'
		  });

		  if (refreshResponse.ok) {
			  const data = await refreshResponse.json();
			  this.setAccessToken(data.access);
			  return true;
		  }

		  this.removeTokens();
		  return false;
	  } catch (error) {
		  console.error('Auth validation error:', error);
		  this.removeTokens();
		  return false;
	  }
	}
  };
