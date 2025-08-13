import axios, { AxiosInstance } from 'axios'
import { 
  Member, 
  Team, 
  TeamWithMembers, 
  VotingResult, 
  MemberRegistration, 
  MemberUpdate,
  TeamCreate,
  TeamUpdate,
  AdminMemberCreate,
  AdminMemberUpdate 
} from '@/types'

class VotingAPIClient {
  private client: AxiosInstance

  constructor() {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    
    this.client = axios.create({
      baseURL: `${baseURL}/v1`,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.data?.detail) {
          throw new Error(error.response.data.detail)
        }
        throw error
      }
    )
  }

  // Member/User Endpoints
  async generateToken(apiKey: string): Promise<string> {
    const response = await this.client.get('/token', {
      headers: { 'x-api-key': apiKey }
    })
    return response.data
  }

  async registerMember(token: string, data: MemberRegistration): Promise<MemberRegistration> {
    const response = await this.client.post(`/register/${token}`, data)
    return response.data
  }

  async getCurrentUser(): Promise<Member> {
    const response = await this.client.get('/users/me')
    return response.data
  }

  async updateProfile(data: MemberUpdate): Promise<Member> {
    const response = await this.client.patch('/users/me', data)
    return response.data
  }

  async deleteProfile(): Promise<void> {
    await this.client.delete('/users/me')
  }

  async resetCookie(token: string): Promise<void> {
    await this.client.get(`/users/reset/${token}`)
  }

  async joinTeam(teamId: number): Promise<void> {
    await this.client.post(`/users/join/${teamId}`)
  }

  async leaveTeam(): Promise<void> {
    await this.client.post('/users/leave/')
  }

  // Voting Endpoints
  async voteForTeam(teamId: number): Promise<void> {
    await this.client.post(`/voting/${teamId}`)
  }

  async rollbackVote(): Promise<void> {
    await this.client.post('/voting/rollback/')
  }

  async getVotingResults(): Promise<VotingResult[]> {
    const response = await this.client.get('/voting/count')
    return response.data
  }

  // Team Endpoints
  async getTeams(): Promise<Team[]> {
    const response = await this.client.get('/teams')
    return response.data
  }

  async getTeamMembers(teamId: number): Promise<TeamWithMembers> {
    const response = await this.client.get(`/teams/${teamId}/users`)
    return response.data
  }

  async createTeam(data: TeamCreate, apiKey: string): Promise<Team> {
    const response = await this.client.post('/teams', data, {
      headers: { 'x-api-key': apiKey }
    })
    return response.data
  }

  async updateTeam(teamId: number, data: TeamUpdate, apiKey: string): Promise<Team> {
    const response = await this.client.patch(`/teams/${teamId}`, data, {
      headers: { 'x-api-key': apiKey }
    })
    return response.data
  }

  async deleteTeam(teamId: number, apiKey: string): Promise<void> {
    await this.client.delete(`/teams/${teamId}`, {
      headers: { 'x-api-key': apiKey }
    })
  }

  // Admin Endpoints
  async getMembers(apiKey: string): Promise<Member[]> {
    const response = await this.client.get('/admin/members', {
      headers: { 'x-api-key': apiKey }
    })
    return response.data
  }

  async getMember(memberId: number, apiKey: string): Promise<Member> {
    const response = await this.client.get(`/admin/member/${memberId}`, {
      headers: { 'x-api-key': apiKey }
    })
    return response.data
  }

  async createMember(data: AdminMemberCreate, apiKey: string): Promise<Member> {
    const response = await this.client.post('/admin/member', data, {
      headers: { 'x-api-key': apiKey }
    })
    return response.data
  }

  async updateMember(memberId: number, data: AdminMemberUpdate, apiKey: string): Promise<Member> {
    const response = await this.client.patch(`/admin/member/${memberId}`, data, {
      headers: { 'x-api-key': apiKey }
    })
    return response.data
  }

  async deleteMember(memberId: number, apiKey: string): Promise<void> {
    await this.client.delete(`/admin/member/${memberId}`, {
      headers: { 'x-api-key': apiKey }
    })
  }

  // Utility Methods
  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      await this.client.get('/admin/members', {
        headers: { 'x-api-key': apiKey }
      })
      return true
    } catch {
      return false
    }
  }

  async checkAuthStatus(): Promise<boolean> {
    try {
      await this.getCurrentUser()
      return true
    } catch {
      return false
    }
  }
}

export const apiClient = new VotingAPIClient()
export default VotingAPIClient