/**
 * API client for Team Voting System
 * Handles all communication with the FastAPI backend
 */

class VotingAPI {
    constructor() {
        // Get base URL from current location, adjust for API endpoints
        this.baseURL = `${window.location.protocol}//${window.location.hostname}:${window.location.port || 8000}`;
        this.apiVersion = 'v1';
    }

    /**
     * Make HTTP request with proper error handling
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}/${this.apiVersion}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'include', // Include cookies
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            // Handle different response types
            const contentType = response.headers.get('content-type');
            let data = null;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else if (contentType && contentType.includes('text/')) {
                data = await response.text();
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${data?.detail || response.statusText}`);
            }

            return data;
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            throw error;
        }
    }

    /**
     * Member/User Endpoints
     */

    // Generate registration token (admin only)
    async generateToken(apiKey) {
        return await this.request('/token', {
            headers: {
                'x-api-key': apiKey
            }
        });
    }

    // Register new member
    async registerMember(token, memberData) {
        return await this.request(`/register/${token}`, {
            method: 'POST',
            body: JSON.stringify(memberData)
        });
    }

    // Get current user profile
    async getCurrentUser() {
        return await this.request('/users/me');
    }

    // Update current user profile
    async updateProfile(profileData) {
        return await this.request('/users/me', {
            method: 'PATCH',
            body: JSON.stringify(profileData)
        });
    }

    // Delete current user account
    async deleteProfile() {
        return await this.request('/users/me', {
            method: 'DELETE'
        });
    }

    // Reset user cookie with token
    async resetCookie(token) {
        return await this.request(`/users/reset/${token}`);
    }

    // Join a team
    async joinTeam(teamId) {
        return await this.request(`/users/join/${teamId}`, {
            method: 'POST'
        });
    }

    // Leave current team
    async leaveTeam() {
        return await this.request('/users/leave/', {
            method: 'POST'
        });
    }

    /**
     * Voting Endpoints
     */

    // Vote for a team
    async voteForTeam(teamId) {
        return await this.request(`/voting/${teamId}`, {
            method: 'POST'
        });
    }

    // Remove current vote
    async rollbackVote() {
        return await this.request('/voting/rollback/', {
            method: 'POST'
        });
    }

    // Get voting results/statistics
    async getVotingResults() {
        return await this.request('/voting/count');
    }

    /**
     * Team Endpoints
     */

    // Get all teams
    async getTeams() {
        return await this.request('/teams');
    }

    // Get team members
    async getTeamMembers(teamId) {
        return await this.request(`/teams/${teamId}/users`);
    }

    // Create new team (admin only)
    async createTeam(teamData, apiKey) {
        return await this.request('/teams', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey
            },
            body: JSON.stringify(teamData)
        });
    }

    // Update team (admin only)
    async updateTeam(teamId, teamData, apiKey) {
        return await this.request(`/teams/${teamId}`, {
            method: 'PATCH',
            headers: {
                'x-api-key': apiKey
            },
            body: JSON.stringify(teamData)
        });
    }

    // Delete team (admin only)
    async deleteTeam(teamId, apiKey) {
        return await this.request(`/teams/${teamId}`, {
            method: 'DELETE',
            headers: {
                'x-api-key': apiKey
            }
        });
    }

    /**
     * Admin Endpoints
     */

    // Get all members (admin only)
    async getMembers(apiKey) {
        return await this.request('/admin/members', {
            headers: {
                'x-api-key': apiKey
            }
        });
    }

    // Get specific member (admin only)
    async getMember(memberId, apiKey) {
        return await this.request(`/admin/member/${memberId}`, {
            headers: {
                'x-api-key': apiKey
            }
        });
    }

    // Create member directly (admin only)
    async createMember(memberData, apiKey) {
        return await this.request('/admin/member', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey
            },
            body: JSON.stringify(memberData)
        });
    }

    // Update member (admin only)
    async updateMember(memberId, memberData, apiKey) {
        return await this.request(`/admin/member/${memberId}`, {
            method: 'PATCH',
            headers: {
                'x-api-key': apiKey
            },
            body: JSON.stringify(memberData)
        });
    }

    // Delete member (admin only)
    async deleteMember(memberId, apiKey) {
        return await this.request(`/admin/member/${memberId}`, {
            method: 'DELETE',
            headers: {
                'x-api-key': apiKey
            }
        });
    }

    /**
     * Utility Methods
     */

    // Check if user is authenticated (has valid cookie)
    async isAuthenticated() {
        try {
            await this.getCurrentUser();
            return true;
        } catch (error) {
            return false;
        }
    }

    // Validate admin API key
    async validateAdminKey(apiKey) {
        try {
            await this.getTeams(); // Try a protected endpoint
            return true;
        } catch (error) {
            return false;
        }
    }

    // Get system status/health
    async getSystemStatus() {
        try {
            const teams = await this.getTeams();
            const results = await this.getVotingResults();
            
            return {
                status: 'healthy',
                teamsCount: teams.length,
                totalVotes: results.reduce((sum, team) => sum + team.stats.votes, 0),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Export voting data as JSON
    async exportVotingData() {
        try {
            const [teams, results] = await Promise.all([
                this.getTeams(),
                this.getVotingResults()
            ]);

            return {
                exportDate: new Date().toISOString(),
                teams: teams,
                votingResults: results,
                summary: {
                    totalTeams: teams.length,
                    totalVotes: results.reduce((sum, team) => sum + team.stats.votes, 0),
                    teamsWithVotes: results.length
                }
            };
        } catch (error) {
            throw new Error(`Failed to export data: ${error.message}`);
        }
    }
}

// Create global API instance
const api = new VotingAPI();

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VotingAPI;
}