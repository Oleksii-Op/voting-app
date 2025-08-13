import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield, Users, UserPlus, QrCode, Trash2, Edit } from 'lucide-react'
import { QRCodeGenerator } from '@/components/common/QRCodeGenerator'
import { useToast } from '@/hooks/use-toast'
import { 
  useGenerateToken, 
  useAdminMembers, 
  useCreateTeam,
  useDeleteTeam,
  useCreateAdminMember,
  useDeleteAdminMember,
  useTeams
} from '@/hooks/api'
import { apiClient } from '@/api/client'

export default function AdminPage() {
  const [apiKey, setApiKey] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [generatedToken, setGeneratedToken] = useState('')
  const [registrationUrl, setRegistrationUrl] = useState('')
  const { toast } = useToast()

  // Form states
  const [teamForm, setTeamForm] = useState({ name: '', avatar: '' })
  const [memberForm, setMemberForm] = useState({ 
    name: '', 
    username: '', 
    token: '' 
  })

  // Hooks
  const generateTokenMutation = useGenerateToken()
  const { data: members } = useAdminMembers(isAuthenticated ? apiKey : null)
  const { data: teams } = useTeams()
  const createTeamMutation = useCreateTeam()
  const deleteTeamMutation = useDeleteTeam()
  const createMemberMutation = useCreateAdminMember()
  const deleteMemberMutation = useDeleteAdminMember()

  const handleLogin = async () => {
    try {
      const isValid = await apiClient.validateApiKey(apiKey)
      if (isValid) {
        setIsAuthenticated(true)
        toast({
          title: "Login successful",
          description: "Welcome to the admin panel.",
        })
      } else {
        toast({
          title: "Login failed",
          description: "Invalid API key. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Could not validate API key.",
        variant: "destructive",
      })
    }
  }

  const handleGenerateToken = async () => {
    try {
      const token = await generateTokenMutation.mutateAsync(apiKey)
      setGeneratedToken(token)
      const url = `${window.location.origin}/register?token=${token}`
      setRegistrationUrl(url)
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createTeamMutation.mutateAsync({
        data: {
          name: teamForm.name,
          avatar: teamForm.avatar || null
        },
        apiKey
      })
      setTeamForm({ name: '', avatar: '' })
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createMemberMutation.mutateAsync({
        data: {
          name: memberForm.name,
          username: memberForm.username,
          token: memberForm.token,
          has_joined_team: false,
          team_id: null
        },
        apiKey
      })
      setMemberForm({ name: '', username: '', token: '' })
    } catch (error) {
      // Error handled by hook
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center space-x-2">
                <Shield className="h-6 w-6 text-red-600" />
                <span>Admin Login</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Admin API Key
                  </label>
                  <Input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your admin API key"
                    className="mt-1"
                  />
                </div>
                <Button 
                  onClick={handleLogin}
                  className="w-full"
                  disabled={!apiKey.trim()}
                >
                  Login to Admin Panel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Admin Panel</h1>
                <p className="text-red-100 mt-2">
                  Manage teams, members, and system settings
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => setIsAuthenticated(false)}
              >
                Logout
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="tokens" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tokens" className="flex items-center space-x-2">
              <QrCode className="h-4 w-4" />
              <span>Tokens</span>
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Teams</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4" />
              <span>Members</span>
            </TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          {/* Token Generation */}
          <TabsContent value="tokens" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Registration Token</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleGenerateToken}
                  disabled={generateTokenMutation.isPending}
                  className="mb-6"
                >
                  {generateTokenMutation.isPending ? 'Generating...' : 'Generate New Token'}
                </Button>

                {registrationUrl && (
                  <QRCodeGenerator
                    value={registrationUrl}
                    title="Registration QR Code"
                    downloadFileName={`registration-token-${generatedToken}.png`}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Management */}
          <TabsContent value="teams" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Team</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTeam} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Team Name</label>
                      <Input
                        value={teamForm.name}
                        onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                        placeholder="Enter team name"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Avatar URL</label>
                      <Input
                        value={teamForm.avatar}
                        onChange={(e) => setTeamForm({ ...teamForm, avatar: e.target.value })}
                        placeholder="Enter avatar URL (optional)"
                        type="url"
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={createTeamMutation.isPending}>
                    {createTeamMutation.isPending ? 'Creating...' : 'Create Team'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Teams List */}
            <Card>
              <CardHeader>
                <CardTitle>Existing Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teams?.map((team) => (
                    <div key={team.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {team.avatar ? (
                          <img src={team.avatar} alt={team.name} className="h-12 w-12 rounded-full" />
                        ) : (
                          <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                            {team.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium">{team.name}</h3>
                          <p className="text-sm text-gray-500">ID: {team.id}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deleteTeamMutation.mutate({ teamId: team.id, apiKey })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Member Management */}
          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Member</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateMember} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Name</label>
                      <Input
                        value={memberForm.name}
                        onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                        placeholder="Full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Username</label>
                      <Input
                        value={memberForm.username}
                        onChange={(e) => setMemberForm({ ...memberForm, username: e.target.value })}
                        placeholder="Username"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Token</label>
                      <Input
                        value={memberForm.token}
                        onChange={(e) => setMemberForm({ ...memberForm, token: e.target.value })}
                        placeholder="Authentication token"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={createMemberMutation.isPending}>
                    {createMemberMutation.isPending ? 'Creating...' : 'Create Member'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Members List */}
            <Card>
              <CardHeader>
                <CardTitle>Existing Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members?.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{member.name}</h3>
                        <p className="text-sm text-gray-500">@{member.username}</p>
                        <div className="flex space-x-4 mt-2 text-xs">
                          <span className={`px-2 py-1 rounded ${member.has_joined_team ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {member.has_joined_team ? 'In Team' : 'No Team'}
                          </span>
                          <span className={`px-2 py-1 rounded ${member.has_voted ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                            {member.has_voted ? 'Voted' : 'Not Voted'}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deleteMemberMutation.mutate({ memberId: member.id, apiKey })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics */}
          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>System Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{teams?.length || 0}</div>
                    <div className="text-gray-500">Total Teams</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{members?.length || 0}</div>
                    <div className="text-gray-500">Total Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {members?.filter(m => m.has_voted).length || 0}
                    </div>
                    <div className="text-gray-500">Votes Cast</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}