import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTeams, useVotingResults } from '@/hooks/api'
import { Vote, Users, BarChart, QrCode } from 'lucide-react'

export default function HomePage() {
  const { data: teams } = useTeams()
  const { data: votingResults } = useVotingResults(60000) // Refresh every minute

  const totalVotes = votingResults?.reduce((sum, result) => sum + result.stats.votes, 0) || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-20 px-4"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Vote className="h-20 w-20 text-blue-600 mx-auto" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-bold text-gray-900 mb-6"
          >
            Team Voting System
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
          >
            A modern, democratic voting platform where members can join teams and vote for their favorites. 
            Get your registration token from an admin and start participating!
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/register">
              <Button size="lg" className="text-lg px-8 py-3">
                Get Started
              </Button>
            </Link>
            <Link to="/vote">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Vote Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: QrCode,
                title: "Get Token",
                description: "Receive a QR code with registration token from an administrator"
              },
              {
                icon: Users,
                title: "Register",
                description: "Create your account using the token and join the voting community"
              },
              {
                icon: Vote,
                title: "Join Team",
                description: "Choose a team to join or participate as an independent voter"
              },
              {
                icon: BarChart,
                title: "Vote",
                description: "Cast your vote for your favorite team (not your own team)"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center h-full">
                  <CardHeader>
                    <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Current Statistics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <Card>
                <CardContent className="p-8">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {teams?.length || 0}
                  </div>
                  <div className="text-gray-600">Active Teams</div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <Card>
                <CardContent className="p-8">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {totalVotes}
                  </div>
                  <div className="text-gray-600">Total Votes</div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center"
            >
              <Card>
                <CardContent className="p-8">
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {votingResults?.length || 0}
                  </div>
                  <div className="text-gray-600">Teams with Votes</div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Start Voting?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join the community and make your voice heard in the democratic process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="secondary" size="lg" className="text-lg px-8 py-3">
                Register Now
              </Button>
            </Link>
            <Link to="/results">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600">
                View Results
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}