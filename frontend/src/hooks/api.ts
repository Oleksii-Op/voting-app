import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { queryKeys } from '@/types'
import { useToast } from '@/hooks/use-toast'
import type { 
  MemberRegistration, 
  MemberUpdate, 
  TeamCreate, 
  TeamUpdate,
  AdminMemberCreate,
  AdminMemberUpdate 
} from '@/types'

// Member/User Hooks
export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.member,
    queryFn: () => apiClient.getCurrentUser(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: MemberUpdate) => apiClient.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.member })
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}

export const useDeleteProfile = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: () => apiClient.deleteProfile(),
    onSuccess: () => {
      queryClient.clear()
      toast({
        title: "Account deleted",
        description: "Your account has been deleted successfully.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}

export const useJoinTeam = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (teamId: number) => apiClient.joinTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.member })
      queryClient.invalidateQueries({ queryKey: queryKeys.teams })
      toast({
        title: "Joined team",
        description: "You have successfully joined the team.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to join team",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}

export const useLeaveTeam = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: () => apiClient.leaveTeam(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.member })
      queryClient.invalidateQueries({ queryKey: queryKeys.teams })
      toast({
        title: "Left team",
        description: "You have successfully left the team.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to leave team",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}

// Registration Hook
export const useRegisterMember = () => {
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ token, data }: { token: string; data: MemberRegistration }) =>
      apiClient.registerMember(token, data),
    onSuccess: () => {
      toast({
        title: "Registration successful",
        description: "Welcome! You have been registered successfully.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}

// Voting Hooks
export const useVoteForTeam = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (teamId: number) => apiClient.voteForTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.member })
      queryClient.invalidateQueries({ queryKey: queryKeys.votingResults })
      toast({
        title: "Vote cast",
        description: "Your vote has been recorded successfully.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Vote failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}

export const useRollbackVote = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: () => apiClient.rollbackVote(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.member })
      queryClient.invalidateQueries({ queryKey: queryKeys.votingResults })
      toast({
        title: "Vote removed",
        description: "Your vote has been removed. You can vote again.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove vote",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}

export const useVotingResults = (refetchInterval: number = 30000) => {
  return useQuery({
    queryKey: queryKeys.votingResults,
    queryFn: () => apiClient.getVotingResults(),
    refetchInterval,
    staleTime: 10 * 1000, // 10 seconds
  })
}

// Team Hooks
export const useTeams = () => {
  return useQuery({
    queryKey: queryKeys.teams,
    queryFn: () => apiClient.getTeams(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useTeamMembers = (teamId: number) => {
  return useQuery({
    queryKey: queryKeys.teamMembers(teamId),
    queryFn: () => apiClient.getTeamMembers(teamId),
    enabled: !!teamId,
    staleTime: 60 * 1000, // 1 minute
  })
}

// Admin Hooks
export const useGenerateToken = () => {
  const { toast } = useToast()

  return useMutation({
    mutationFn: (apiKey: string) => apiClient.generateToken(apiKey),
    onSuccess: () => {
      toast({
        title: "Token generated",
        description: "Registration token has been generated successfully.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Token generation failed",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}

export const useAdminMembers = (apiKey: string | null) => {
  return useQuery({
    queryKey: queryKeys.adminMembers,
    queryFn: () => apiClient.getMembers(apiKey!),
    enabled: !!apiKey,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export const useCreateTeam = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ data, apiKey }: { data: TeamCreate; apiKey: string }) =>
      apiClient.createTeam(data, apiKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams })
      toast({
        title: "Team created",
        description: "Team has been created successfully.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create team",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}

export const useUpdateTeam = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ teamId, data, apiKey }: { teamId: number; data: TeamUpdate; apiKey: string }) =>
      apiClient.updateTeam(teamId, data, apiKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams })
      toast({
        title: "Team updated",
        description: "Team has been updated successfully.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update team",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}

export const useDeleteTeam = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ teamId, apiKey }: { teamId: number; apiKey: string }) =>
      apiClient.deleteTeam(teamId, apiKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams })
      toast({
        title: "Team deleted",
        description: "Team has been deleted successfully.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete team",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}

export const useCreateAdminMember = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ data, apiKey }: { data: AdminMemberCreate; apiKey: string }) =>
      apiClient.createMember(data, apiKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminMembers })
      toast({
        title: "Member created",
        description: "Member has been created successfully.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create member",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}

export const useUpdateAdminMember = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ memberId, data, apiKey }: { memberId: number; data: AdminMemberUpdate; apiKey: string }) =>
      apiClient.updateMember(memberId, data, apiKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminMembers })
      toast({
        title: "Member updated",
        description: "Member has been updated successfully.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update member",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}

export const useDeleteAdminMember = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ memberId, apiKey }: { memberId: number; apiKey: string }) =>
      apiClient.deleteMember(memberId, apiKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminMembers })
      toast({
        title: "Member deleted",
        description: "Member has been deleted successfully.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete member",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}