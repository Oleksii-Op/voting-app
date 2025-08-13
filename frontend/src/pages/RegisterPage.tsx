import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRegisterMember } from '@/hooks/api'
import { UserPlus, Key, User, AtSign } from 'lucide-react'

export default function RegisterPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    token: searchParams.get('token') || '',
    name: '',
    username: ''
  })

  const registerMutation = useRegisterMember()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await registerMutation.mutateAsync({
        token: formData.token,
        data: {
          name: formData.name,
          username: formData.username
        }
      })
      
      // Redirect to voting page after successful registration
      navigate('/vote')
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center space-x-2">
              <UserPlus className="h-6 w-6 text-blue-600" />
              <span>Register New Member</span>
            </CardTitle>
            <p className="text-center text-gray-600 mt-2">
              Create your account to start voting
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Key className="h-4 w-4" />
                  <span>Registration Token</span>
                </label>
                <Input
                  type="text"
                  value={formData.token}
                  onChange={handleInputChange('token')}
                  placeholder="Enter your registration token"
                  required
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get this token from an administrator via QR code
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Full Name</span>
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  placeholder="Enter your full name"
                  required
                  maxLength={20}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <AtSign className="h-4 w-4" />
                  <span>Username</span>
                </label>
                <Input
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange('username')}
                  placeholder="Choose a unique username"
                  required
                  maxLength={30}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be your unique identifier in the system
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={registerMutation.isPending || !formData.token || !formData.name || !formData.username}
              >
                {registerMutation.isPending ? 'Registering...' : 'Register'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already registered?{' '}
                <a 
                  href="/vote" 
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Go to voting
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Registration Process Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Registration Process</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Get Token</h4>
                    <p className="text-sm text-gray-600">
                      Contact an administrator to receive your registration token via QR code
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Fill Form</h4>
                    <p className="text-sm text-gray-600">
                      Enter your token, full name, and choose a unique username
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Complete</h4>
                    <p className="text-sm text-gray-600">
                      Submit the form to create your account and receive authentication cookie
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}