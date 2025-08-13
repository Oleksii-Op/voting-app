// import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCurrentUser, useTeams, useJoinTeam, useLeaveTeam, useVoteForTeam, useRollbackVote } from '@/hooks/api'
import { Vote, Users, UserCheck, UserX } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function VotingPage() {
  const { data: user, isLoading: userLoading } = useCurrentUser()
  const { data: teams } = useTeams()
  const joinTeamMutation = useJoinTeam()
  const leaveTeamMutation = useLeaveTeam()
  const voteMutation = useVoteForTeam()
  const rollbackMutation = useRollbackVote()

  if (userLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Please Login</h2>
            <p className="text-gray-600 mb-6">You need to be registered to vote.</p>
            <Link to="/register">
              <Button className="w-full">Register Now</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const canVoteForTeam = (teamId: number) => {
    return !user.has_voted && user.team_id !== teamId
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Profile */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="h-6 w-6" />
                <span>My Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Name</div>
                  <div className="font-medium">{user.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Username</div>
                  <div className="font-medium">@{user.username}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Team Status</div>
                  <div className="font-medium">
                    {user.has_joined_team ? 'In Team' : 'No Team'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Vote Status</div>
                  <div className="font-medium">
                    {user.has_voted ? 'Voted' : 'Not Voted'}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex space-x-2">
                {!user.has_joined_team && (
                  <Button variant="outline" disabled>
                    Join a Team Below
                  </Button>
                )}
                {user.has_joined_team && (
                  <Button 
                    variant="destructive" 
                    onClick={() => leaveTeamMutation.mutate()}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Leave Team
                  </Button>
                )}
                {user.has_voted && (
                  <Button 
                    variant="outline" 
                    onClick={() => rollbackMutation.mutate()}
                  >
                    Change Vote
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Voting Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Vote className="h-8 w-8 mr-3 text-blue-600" />
            Vote for Your Favorite Team
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams?.map((team) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="h-full"
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      {team.avatar ? (
                        <img 
                          src={team.avatar} 
                          alt={team.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                          {team.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <CardTitle>{team.name}</CardTitle>
                        <p className="text-sm text-gray-500">Team ID: {team.id}</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {/* Team Actions */}
                      {!user.has_joined_team && (
                        <Button
                          onClick={() => joinTeamMutation.mutate(team.id)}
                          variant="outline"
                          className="w-full"
                          disabled={joinTeamMutation.isPending}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Join This Team
                        </Button>
                      )}
                      
                      {/* Voting Actions */}
                      <div className="space-y-2">
                        {user.team_id === team.id && (
                          <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                            This is your team
                          </div>
                        )}
                        
                        {user.has_voted && user.vote_id === team.id && (
                          <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                            You voted for this team
                          </div>
                        )}
                        
                        <Button
                          onClick={() => voteMutation.mutate(team.id)}
                          disabled={!canVoteForTeam(team.id) || voteMutation.isPending}
                          className="w-full"
                          variant={user.vote_id === team.id ? "default" : "outline"}
                        >
                          <Vote className="h-4 w-4 mr-2" />
                          {user.vote_id === team.id ? 'Voted' : 'Vote'}
                        </Button>
                        
                        {!canVoteForTeam(team.id) && user.team_id !== team.id && (
                          <p className="text-xs text-gray-500 text-center">
                            {user.has_voted ? 'You have already voted' : 'Cannot vote for your own team'}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}