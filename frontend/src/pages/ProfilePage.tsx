import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCurrentUser, useUpdateProfile, useDeleteProfile } from '@/hooks/api'
import { User, Edit3, Trash2, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { data: user } = useCurrentUser()
  const updateProfileMutation = useUpdateProfile()
  const deleteProfileMutation = useDeleteProfile()
  
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: user?.name || '' })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Please Login</h2>
            <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
            <Button onClick={() => navigate('/register')} className="w-full">
              Register Now
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateProfileMutation.mutateAsync({ name: editForm.name })
      setIsEditing(false)
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleDeleteProfile = async () => {
    try {
      await deleteProfileMutation.mutateAsync()
      navigate('/')
    } catch (error) {
      // Error handled by hook
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
            <h1 className="text-3xl font-bold flex items-center">
              <User className="h-8 w-8 mr-3" />
              My Profile
            </h1>
            <p className="text-purple-100 mt-2">
              Manage your account information and settings
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Profile Information
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(!isEditing)
                      setEditForm({ name: user.name })
                    }}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ name: e.target.value })}
                        placeholder="Enter your full name"
                        required
                        maxLength={20}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Username (Read-only)
                      </label>
                      <Input
                        value={user.username}
                        disabled
                        className="mt-1 bg-gray-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Username cannot be changed
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Full Name
                        </label>
                        <div className="text-lg font-medium">{user.name}</div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Username
                        </label>
                        <div className="text-lg font-medium">@{user.username}</div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Member ID
                        </label>
                        <div className="text-lg font-medium">#{user.id}</div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Account Status
                        </label>
                        <div className="text-lg font-medium text-green-600">Active</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Status & Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Team Membership</span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      user.has_joined_team 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.has_joined_team ? 'In Team' : 'No Team'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Voting Status</span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      user.has_voted 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.has_voted ? 'Voted' : 'Not Voted'}
                    </span>
                  </div>
                  
                  {user.team_id && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Team ID</span>
                      <span className="font-medium">#{user.team_id}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/vote')}
                >
                  Go to Voting
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/results')}
                >
                  View Results
                </Button>
                
                {user.has_joined_team && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/vote')}
                  >
                    Manage Team
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!showDeleteConfirm ? (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                      <strong>Warning:</strong> This action cannot be undone. 
                      This will permanently delete your account and all associated data.
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteProfile}
                        disabled={deleteProfileMutation.isPending}
                        className="flex-1"
                      >
                        {deleteProfileMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}