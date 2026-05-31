export type StocatesMode = 'standard' | 'halal'

export interface ModeConfig {
  id: StocatesMode
  label: string
  description: string
  icon: string
}

export const MODES: ModeConfig[] = [
  {
    id: 'standard',
    label: 'Standard',
    description: 'General market education using historical patterns',
    icon: '📈',
  },
  {
    id: 'halal',
    label: 'Halal',
    description: 'Shariah-compliant investing with certified source references',
    icon: '📿',
  },
]
