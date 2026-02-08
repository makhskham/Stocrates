/**
 * Investment Feedback Generator
 * Generates educational feedback for investment decisions
 */

import { InvestmentFeedback } from './types'

interface FeedbackInput {
  symbol: string
  companyName: string
  amount: number
  purchasePrice: number
  availablePoints: number
  portfolioSize: number
}

/**
 * Generate educational feedback for an investment decision
 */
export function generateInvestmentFeedback(input: FeedbackInput): InvestmentFeedback {
  const {
    symbol,
    companyName,
    amount,
    purchasePrice,
    availablePoints,
    portfolioSize
  } = input

  // Calculate investment percentage
  const investmentPercentage = (amount / (availablePoints + amount)) * 100

  // Determine risk level based on investment percentage and diversification
  const riskLevel = determineRiskLevel(investmentPercentage, portfolioSize)

  // Generate market condition assessment
  const marketCondition = assessMarketCondition(purchasePrice, symbol)

  // Generate reasoning
  const reasoning = generateReasoning(
    companyName,
    investmentPercentage,
    portfolioSize,
    riskLevel
  )

  // Generate historical context
  const historicalContext = generateHistoricalContext(symbol, purchasePrice, riskLevel)

  // Generate learning points
  const learningPoints = generateLearningPoints(
    investmentPercentage,
    portfolioSize,
    riskLevel,
    marketCondition
  )

  return {
    reasoning,
    historicalContext,
    learningPoints,
    riskLevel,
    marketCondition
  }
}

function determineRiskLevel(
  investmentPercentage: number,
  portfolioSize: number
): 'low' | 'medium' | 'high' {
  // High risk: >30% of portfolio in one stock OR first investment >50%
  if (investmentPercentage > 30 || (portfolioSize === 0 && investmentPercentage > 50)) {
    return 'high'
  }
  // Medium risk: 15-30% of portfolio
  if (investmentPercentage > 15) {
    return 'medium'
  }
  // Low risk: <15% of portfolio
  return 'low'
}

function assessMarketCondition(price: number, symbol: string): string {
  // Simple heuristic based on price ranges (in real app, use actual market data)
  if (price > 400) {
    return 'High-priced stock - typically indicates established, large-cap company'
  } else if (price > 150) {
    return 'Mid-to-high priced stock - often indicates growth or established company'
  } else if (price > 50) {
    return 'Moderate price range - common for many established companies'
  } else {
    return 'Lower-priced stock - could indicate smaller company or recent price decline'
  }
}

function generateReasoning(
  companyName: string,
  investmentPercentage: number,
  portfolioSize: number,
  riskLevel: 'low' | 'medium' | 'high'
): string {
  if (portfolioSize === 0) {
    return `This is your first investment in ${companyName}. You're allocating ${investmentPercentage.toFixed(1)}% of your total points to this position. ${
      riskLevel === 'high'
        ? 'This is a concentrated position for a first investment - consider the implications of putting many eggs in one basket.'
        : riskLevel === 'medium'
        ? 'This is a moderate allocation for a first investment, leaving room for diversification.'
        : 'This is a conservative allocation, leaving plenty of room to diversify your portfolio.'
    }`
  }

  return `You're adding ${companyName} to your portfolio of ${portfolioSize} investment${portfolioSize > 1 ? 's' : ''}. This represents ${investmentPercentage.toFixed(1)}% of your available capital. ${
    riskLevel === 'high'
      ? 'This is a significant concentration in one position - historically, concentrated portfolios can be more volatile.'
      : riskLevel === 'medium'
      ? 'This is a balanced allocation that maintains reasonable diversification.'
      : 'This is a conservative position size that promotes diversification.'
  }`
}

function generateHistoricalContext(
  symbol: string,
  price: number,
  riskLevel: 'low' | 'medium' | 'high'
): string {
  const contexts = {
    high: `Historically, concentrated positions (like yours) have led to both the biggest gains and biggest losses. Famous investor Warren Buffett advocates for concentration when you have high conviction, but also warns that diversification protects against ignorance.`,
    medium: `Historical data shows that moderate position sizing (like yours) balances the potential for meaningful returns with risk management. This approach is common among professional portfolio managers.`,
    low: `Conservative position sizing (like yours) aligns with modern portfolio theory, which suggests diversification reduces unsystematic risk. While individual positions may have less impact, the overall portfolio tends to be more stable.`
  }

  return contexts[riskLevel]
}

function generateLearningPoints(
  investmentPercentage: number,
  portfolioSize: number,
  riskLevel: 'low' | 'medium' | 'high',
  marketCondition: string
): string[] {
  const points: string[] = []

  // Diversification learning
  if (portfolioSize === 0) {
    points.push('First Investment: You\'re starting your portfolio. Consider how many different positions you want to build.')
  } else if (portfolioSize < 3) {
    points.push(`Portfolio Size: You have ${portfolioSize} investment${portfolioSize > 1 ? 's' : ''}. Many experts suggest 5-10 positions for adequate diversification.`)
  }

  // Position sizing learning
  if (investmentPercentage > 25) {
    points.push('Position Sizing: You\'re allocating over 25% to one position. Ask yourself: What happens if this investment declines significantly?')
  } else if (investmentPercentage < 5) {
    points.push('🎯 Position Sizing: Small positions limit both potential gains and losses. Consider if this aligns with your learning goals.')
  }

  // Risk awareness
  points.push(`Risk Level: ${riskLevel.toUpperCase()} - ${
    riskLevel === 'high'
      ? 'High concentration means higher potential volatility'
      : riskLevel === 'medium'
      ? 'Balanced approach between concentration and diversification'
      : 'Conservative approach prioritizes stability over maximum returns'
  }`)

  // Market condition awareness
  points.push(`Market Context: ${marketCondition}`)

  return points
}

