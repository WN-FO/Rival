'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from './AuthProvider'

interface User {
  id: string
  username: string
  avatar_url: string | null
  points: number
  rank: string
  correct_picks: number
  total_picks: number
  win_streak: number
  best_streak: number
}

interface LeaderboardTabsProps {
  activeTab: string
  users: User[]
}

const tabs = [
  { name: 'Global', value: 'global' },
  { name: 'Friends', value: 'friends' },
  { name: 'Weekly', value: 'weekly' },
  { name: 'Monthly', value: 'monthly' },
]

// Generate a dynamic SVG for rank badges
const generateRankBadge = (rank: string): string => {
  const colors: Record<string, { bg: string; text: string }> = {
    'Diamond': { bg: '#B9F2FF', text: '#00496C' },
    'Platinum': { bg: '#E5E4E2', text: '#2F4F4F' },
    'Gold': { bg: '#FFD700', text: '#B8860B' },
    'Silver': { bg: '#C0C0C0', text: '#4A4A4A' },
    'Bronze': { bg: '#CD7F32', text: '#8B4513' },
  }
  
  const { bg, text } = colors[rank] || { bg: '#4f46e5', text: '#ffffff' }
  
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="${bg.replace('#', '%23')}" /><text x="50" y="50" font-family="Arial" font-size="14" fill="${text.replace('#', '%23')}" text-anchor="middle" dominant-baseline="central" font-weight="bold">${rank.toUpperCase()}</text></svg>`
}

export default function LeaderboardTabs({ activeTab, users }: LeaderboardTabsProps) {
  const { user } = useAuth()
  
  // Calculate accuracy percentage
  const calculateAccuracy = (correct: number, total: number): string => {
    if (total === 0) return '0%'
    return `${Math.round((correct / total) * 100)}%`
  }
  
  // Find current user in the leaderboard
  const currentUserRank = users.findIndex(u => u.id === user?.id) + 1
  
  return (
    <div>
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <Link
              key={tab.value}
              href={`/ranks?tab=${tab.value}`}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.value
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Leaderboard table */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                    Rank
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    User
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Points
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Accuracy
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Win Streak
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Best Streak
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user, index) => (
                  <tr 
                    key={user.id}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}
                  >
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                      {index + 1}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {user.avatar_url ? (
                            <Image
                              className="h-10 w-10 rounded-full"
                              src={user.avatar_url}
                              alt=""
                              width={40}
                              height={40}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                              <span className="text-white font-medium">
                                {user.username.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{user.username}</div>
                          <div className="flex items-center mt-1">
                            <Image
                              src={generateRankBadge(user.rank)}
                              alt={user.rank}
                              width={16}
                              height={16}
                              className="mr-1"
                            />
                            <span className="text-xs text-gray-500">{user.rank}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className="font-medium text-gray-900">{user.points.toLocaleString()}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {calculateAccuracy(user.correct_picks, user.total_picks)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className={user.win_streak > 0 ? 'text-green-600 font-medium' : ''}>
                        {user.win_streak}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {user.best_streak}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Current user's rank (if logged in) */}
            {user && currentUserRank > 0 && (
              <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                <div className="text-sm text-indigo-700">
                  Your current rank: <span className="font-bold">#{currentUserRank}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 