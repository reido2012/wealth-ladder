import { TrendingUp, CheckCircle, Target, ArrowRight } from 'lucide-react'
import { currencyFormat } from '../lib/format'

interface WealthLevel {
  level: number
  name: string
  minAmount: number
  maxAmount: number
  description: string
  freedom: string
}

const wealthLevels: WealthLevel[] = [
  {
    level: 1,
    name: "Paycheck-to-paycheck",
    minAmount: 0,
    maxAmount: 10000,
    description: "You are conscious of every dollar you spend. This includes people with crippling debt.",
    freedom: "Building financial awareness"
  },
  {
    level: 2,
    name: "Grocery freedom",
    minAmount: 10000,
    maxAmount: 100000,
    description: "You can buy what you want at the grocery store without worrying about your finances.",
    freedom: "Grocery choices are trivial"
  },
  {
    level: 3,
    name: "Restaurant freedom",
    minAmount: 100000,
    maxAmount: 1000000,
    description: "You can eat what you want at restaurants.",
    freedom: "Restaurant choices are trivial"
  },
  {
    level: 4,
    name: "Travel freedom",
    minAmount: 1000000,
    maxAmount: 10000000,
    description: "You travel when and where you want.",
    freedom: "Travel choices are trivial"
  },
  {
    level: 5,
    name: "House freedom",
    minAmount: 10000000,
    maxAmount: 100000000,
    description: "You can afford your dream home with little impact on your overall finances.",
    freedom: "Housing choices are trivial"
  },
  {
    level: 6,
    name: "Impact freedom",
    minAmount: 100000000,
    maxAmount: Infinity,
    description: "You can use money to have a profound impact on the lives of others (e.g., buy businesses, engage in large-scale philanthropy, etc.).",
    freedom: "You can change the world"
  }
]

function getCurrentLevel(netWorth: number): WealthLevel {
  return wealthLevels.find(level => 
    netWorth >= level.minAmount && netWorth < level.maxAmount
  ) || wealthLevels[0]
}

function getNextLevel(currentLevel: WealthLevel): WealthLevel | null {
  const nextLevelIndex = wealthLevels.findIndex(level => level.level === currentLevel.level) + 1
  return nextLevelIndex < wealthLevels.length ? wealthLevels[nextLevelIndex] : null
}

function getProgressPercentage(netWorth: number, currentLevel: WealthLevel, nextLevel: WealthLevel | null): number {
  if (!nextLevel) return 100
  
  const progress = netWorth - currentLevel.minAmount
  const total = nextLevel.minAmount - currentLevel.minAmount
  return Math.min(100, Math.max(0, (progress / total) * 100))
}

export function WealthLevelCard({ netWorth }: { netWorth: number }) {
  const currentLevel = getCurrentLevel(netWorth)
  const nextLevel = getNextLevel(currentLevel)
  const progressPercentage = getProgressPercentage(netWorth, currentLevel, nextLevel)
  
  const isAtMaxLevel = currentLevel.level === 6
  const amountToNext = nextLevel ? nextLevel.minAmount - netWorth : 0
  
  return (
    <div className="rounded-2xl border bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-sm mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-full bg-blue-100 p-2">
          <TrendingUp className="text-blue-600" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Level {currentLevel.level}: {currentLevel.name}
          </h3>
          <p className="text-sm text-gray-600">{currentLevel.description}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl bg-white/70 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="text-emerald-600" size={16} />
            <span className="text-sm font-semibold text-emerald-700">Freedom Unlocked</span>
          </div>
          <p className="text-sm text-gray-700">{currentLevel.freedom}</p>
        </div>
        
        {nextLevel && (
          <div className="rounded-xl bg-white/70 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="text-blue-600" size={16} />
              <span className="text-sm font-semibold text-blue-700">Next Milestone</span>
            </div>
            <p className="text-sm text-gray-700">{nextLevel.freedom}</p>
            <p className="text-xs text-gray-500 mt-1">
              {currencyFormat(amountToNext)} to go
            </p>
          </div>
        )}
      </div>
      
      {!isAtMaxLevel && nextLevel && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress to Level {nextLevel.level}</span>
            <span className="font-semibold text-gray-900">
              {currencyFormat(netWorth)} / {currencyFormat(nextLevel.minAmount)}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{Math.round(progressPercentage)}% complete</span>
            <div className="flex items-center gap-1">
              <span>Next: {nextLevel.name}</span>
              <ArrowRight size={12} />
            </div>
          </div>
        </div>
      )}
      
      {isAtMaxLevel && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800">
            <CheckCircle size={16} />
            <span className="font-semibold">Maximum level achieved! 🎉</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">You've reached the highest level of financial freedom!</p>
        </div>
      )}
    </div>
  )
}
