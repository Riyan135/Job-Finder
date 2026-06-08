const API_URL = 'http://localhost:5000/api';

class API {
    static getToken() {
        return localStorage.getItem('token');
    }

    static async request(endpoint, options = {}) {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Remove Content-Type if it's FormData (browser will set it with boundary)
        if (options.body instanceof FormData) {
            delete headers['Content-Type'];
        }

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers
            });
            const contentType = response.headers.get('content-type') || '';
            const data = contentType.includes('application/json')
                ? await response.json()
                : { error: await response.text() };
            
            // Handle unauthorized globally, except for auth attempts where the
            // page should show the actual login/register error.
            const isAuthEndpoint = endpoint.startsWith('/auth/login') || endpoint.startsWith('/auth/register');
            if (response.status === 401 && !isAuthEndpoint) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
                throw new Error('Session expired. Please log in again.');
            }

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Something went wrong');
            }
            return { success: true, ...data };
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth
    static async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        return data;
    }

    static async register(name, email, password, role) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, role })
        });
        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        return data;
    }

    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }

    // Jobs
    static async getJobs(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        return this.request(`/jobs?${queryParams}`);
    }

    static async getJob(id) {
        return this.request(`/jobs/${id}`);
    }

    static async createJob(jobData) {
        return this.request('/jobs', {
            method: 'POST',
            body: JSON.stringify(jobData)
        });
    }

    // Profile
    static async getProfile() {
        return this.request('/profile');
    }

    static async updateProfile(profileData) {
        return this.request('/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    // Applications
    static async applyForJob(jobId, coverLetter = '') {
        return this.request(`/applications/${jobId}`, {
            method: 'POST',
            body: JSON.stringify({ coverLetter })
        });
    }

    static async getMyApplications() {
        return this.request('/applications/mine');
    }

    static async getJobApplications(jobId) {
        return this.request(`/applications/job/${jobId}`);
    }

    // AI Features
    static async analyzeResume(file) {
        const formData = new FormData();
        formData.append('resume', file);
        return this.request('/ai/parse-resume', {
            method: 'POST',
            body: formData
        });
    }

    static async analyzeSkillGap(jobId) {
        return this.request(`/ai/skill-gap/${jobId}`);
    }

    static async getLearningPaths() {
        return this.request('/ai/learning-paths');
    }
}

// Utility to check auth state on page load
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user && !['login.html', 'signup.html', 'index.html', ''].includes(window.location.pathname.split('/').pop())) {
        window.location.href = 'login.html';
    }
    return user;
}
