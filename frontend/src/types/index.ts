// API Response Types
export interface Member {
  id: number
  name: string
  username: string
  has_joined_team: boolean
  has_voted: boolean
  team_id: number | null
  vote_id: number | null
}

export interface Team {
  id: number
  name: string
  avatar: string | null
}

export interface TeamWithMembers {
  name: string
  avatar: string
  members: { name: string }[]
}

export interface VotingResult {
  name: string
  stats: {
    votes: number
  }
}

// API Request Types
export interface MemberRegistration {
  name: string
  username: string
}

export interface MemberUpdate {
  name?: string
}

export interface TeamCreate {
  name: string
  avatar?: string | null
}

export interface TeamUpdate {
  name?: string
  avatar?: string | null
}

export interface AdminMemberCreate {
  name: string
  username: string
  has_joined_team: boolean
  token: string
  team_id: number | null
}

export interface AdminMemberUpdate {
  name?: string
  username?: string
  token?: string
}

// Component Props Types
export interface QRCodeProps {
  value: string
  size?: number
}

export interface TeamCardProps {
  team: Team
  onJoin?: (teamId: number) => void
  onVote?: (teamId: number) => void
  canJoin?: boolean
  canVote?: boolean
  isUserTeam?: boolean
  hasVoted?: boolean
  votesCount?: number
}

// Auth Types
export interface AuthState {
  isAuthenticated: boolean
  user: Member | null
  isLoading: boolean
}

// Admin Types
export interface AdminState {
  isAuthenticated: boolean
  apiKey: string | null
}

// Error Types
export interface ApiError {
  detail: string
}

// Query Keys
export const queryKeys = {
  member: ['member'] as const,
  teams: ['teams'] as const,
  teamMembers: (id: number) => ['teams', id, 'members'] as const,
  votingResults: ['voting', 'results'] as const,
  adminMembers: ['admin', 'members'] as const,
  adminMember: (id: number) => ['admin', 'member', id] as const,
} as const