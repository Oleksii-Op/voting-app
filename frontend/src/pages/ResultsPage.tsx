import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useVotingResults, useTeams } from '@/hooks/api'
import { BarChart3, TrendingUp, Trophy, Download, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function ResultsPage() {
  const { data: votingResults, refetch, isRefetching } = useVotingResults(30000) // Auto-refresh every 30 seconds
  const { data: teams } = useTeams()
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    if (votingResults) {
      setLastUpdated(new Date())
    }
  }, [votingResults])

  const totalVotes = votingResults?.reduce((sum, result) => sum + result.stats.votes, 0) || 0
  const sortedResults = votingResults?.sort((a, b) => b.stats.votes - a.stats.votes) || []

  const exportResults = () => {
    const csvContent = [
      'Rank,Team,Votes,Percentage',
      ...sortedResults.map((result, index) => {
        const percentage = totalVotes > 0 ? ((result.stats.votes / totalVotes) * 100).toFixed(1) : '0.0'
        return `${index + 1},${result.name},${result.stats.votes},${percentage}%`
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `voting_results_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return rank.toString()
    }
  }

  const getProgressBarColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-400'
      case 2:
        return 'bg-gray-300'
      case 3:
        return 'bg-amber-600'
      default:
        return 'bg-blue-500'
    }
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
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center">
                  <BarChart3 className="h-8 w-8 mr-3" />
                  Voting Results
                </h1>
                <p className="text-green-100 mt-2">
                  Live voting results and team statistics
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => refetch()}
                  disabled={isRefetching}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button variant="secondary" onClick={exportResults}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{totalVotes}</div>
              <div className="text-gray-600">Total Votes</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{teams?.length || 0}</div>
              <div className="text-gray-600">Total Teams</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {teams?.length > 0 ? Math.round(((votingResults?.length || 0) / teams.length) * 100) : 0}%
              </div>
              <div className="text-gray-600">Participation</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {lastUpdated.toLocaleTimeString()}
              </div>
              <div className="text-gray-600">Last Updated</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-6 w-6 mr-2" />
                Team Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedResults.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No votes yet</h3>
                  <p className="text-gray-500">Results will appear here once voting begins.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedResults.map((result, index) => {
                    const rank = index + 1
                    const percentage = totalVotes > 0 ? ((result.stats.votes / totalVotes) * 100) : 0
                    
                    return (
                      <motion.div
                        key={result.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
                          {getRankIcon(rank)}
                        </div>
                        
                        <div className="flex-grow">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg">{result.name}</h3>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">
                                {result.stats.votes}
                              </div>
                              <div className="text-sm text-gray-500">
                                {percentage.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                              className={`h-3 rounded-full ${getProgressBarColor(rank)}`}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Team Performance Cards */}
        {teams && teams.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="h-6 w-6 mr-2" />
              All Teams Overview
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => {
                const teamResult = votingResults?.find(result => result.name === team.name)
                const votes = teamResult?.stats.votes || 0
                const rank = sortedResults.findIndex(result => result.name === team.name) + 1 || 'N/A'
                
                return (
                  <motion.div
                    key={team.id}
                    whileHover={{ scale: 1.02 }}
                    className="h-full"
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          {team.avatar ? (
                            <img 
                              src={team.avatar} 
                              alt={team.name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                              {team.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <CardTitle className="text-lg">{team.name}</CardTitle>
                            <p className="text-sm text-gray-500">
                              Rank: {rank === 'N/A' ? 'No votes' : `#${rank}`}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Votes Received</span>
                            <span className="text-2xl font-bold text-blue-600">{votes}</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Vote Share</span>
                            <span className="font-semibold">
                              {totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : 0}%
                            </span>
                          </div>
                          
                          {votes > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${totalVotes > 0 ? (votes / totalVotes) * 100 : 0}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}