import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LogIn, Key } from 'lucide-react'
import { apiClient } from '@/api/client'
import { useToast } from '@/hooks/use-toast'
import { useNavigate, Link } from 'react-router-dom'

export default function LoginPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [token, setToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await apiClient.resetCookie(token)
      toast({
        title: "Login successful",
        description: "Welcome back! You are now logged in.",
      })
      navigate('/vote')
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid token. Please check your token and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center space-x-2">
              <LogIn className="h-6 w-6 text-blue-600" />
              <span>Login</span>
            </CardTitle>
            <p className="text-center text-gray-600 mt-2">
              Enter your authentication token to login
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Key className="h-4 w-4" />
                  <span>Authentication Token</span>
                </label>
                <Input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter your authentication token"
                  required
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This is the token you received during registration
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading || !token.trim()}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Register here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Help Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div>
                  <strong>Lost your token?</strong>
                  <p>Contact an administrator to get a new authentication token.</p>
                </div>
                
                <div>
                  <strong>First time here?</strong>
                  <p>You need to register first using a registration token from an admin.</p>
                </div>
                
                <div>
                  <strong>Token not working?</strong>
                  <p>Make sure you're using the most recent token provided to you.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}