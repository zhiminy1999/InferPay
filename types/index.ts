export interface ActivityLog {
  time: string
  emoji: string
  title: string
  desc: string
  type: 'success' | 'warning' | 'danger' | 'info' | 'default'
}

export interface Invoice {
  id: string
  agentName: string
  description: string
  achievements: string[]
  amount: number
  currency: 'USDC' | 'EURC'
  status: 'PENDING' | 'PAID'
}

export interface ConsensusProposal {
  id: number
  amount: number
  purpose: string
  votes: { proposer: string; compliance: string; auditor: string }
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BYPASSED'
}
