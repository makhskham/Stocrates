/**
 * Halal / Shariah-compliant investing mode for Stocrates.
 *
 * Screening methodology follows AAOIFI (Accounting and Auditing Organization
 * for Islamic Financial Institutions) standards.
 *
 * Certified sources referenced in responses:
 *   - Islamicly (islamicly.com)
 *   - Zoya (zoya.finance)
 *   - Dow Jones Islamic Market Index (S&P Global)
 *   - MSCI Islamic Indexes
 *   - IdealRatings (idealratings.com)
 *   - FTSE Russell Islamic Index Series
 */

/**
 * Injected into the main streamUI system prompt.
 * Provides halal context and criteria ONLY — no "response format" section.
 * Keeping this free of output-format instructions prevents the model from
 * trying to add extra text alongside a tool call, which causes Groq to
 * return "Failed to call a function."
 */
export const HALAL_SYSTEM_PROMPT = `
## HALAL / SHARIAH-COMPLIANT INVESTING MODE

The user has selected Halal investment mode. Apply Shariah screening awareness to every stock discussion.
When a user asks directly about halal compliance, answer with text (do not call a tool).
When calling tools, call them normally — the educational caption will include halal analysis.

### Primary Screen: Business Activity

PROHIBITED sectors: Riba/interest (conventional banking, insurance, credit cards),
alcohol, tobacco, pork products, weapons, gambling/casinos, adult entertainment.

PERMISSIBLE sectors (subject to financial ratio check): Technology, healthcare, retail,
manufacturing, transportation, logistics, utilities, telecoms, education, food (non-pork),
real estate (non-interest REIT models), consumer goods (non-alcohol/tobacco).

### Secondary Screen: Financial Ratios (AAOIFI Standard)

1. Total interest-bearing debt / Market cap < 33%
2. (Cash + interest-bearing investments) / Market cap < 33%
3. Revenue from haram activities / Total revenue < 5%

### Language Rules

- Never say a stock "is halal" or "is haram" — say "passes standard AAOIFI screening" or "raises concerns"
- Always recommend verifying on Islamicly.com or Zoya.finance and consulting a certified Shariah advisor
- For direct halal questions: answer with text, cite sources, explain criteria
- For tool calls (charts, prices, news): call the tool normally; halal analysis appears in the caption below
`

/**
 * Appended to the generateCaption system prompt when halal mode is active.
 * This runs inside pure text generation (no tools), so it is safe to instruct
 * the model to add a halal screening section.
 */
export const HALAL_CAPTION_ADDITION = `

Since halal mode is active, add a brief halal screening note at the end:
**Halal Screening:** [Business activity: Permissible/Concerns/Unclear] | [Ratios: Pass/Verify] | Verify at Islamicly.com or Zoya.finance | Consult a certified Shariah advisor for personal decisions.`

export const HALAL_EMPTY_SCREEN_EXAMPLES = [
  'Is Apple (AAPL) considered halal under AAOIFI standards?',
  'Which technology stocks pass Shariah screening?',
  'Explain what makes a stock halal and how to verify it',
  'Show me the market heatmap and identify which sectors are generally halal',
]
