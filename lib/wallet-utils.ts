import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'

export interface EphemeralKeypair {
  privateKey: `0x${string}`
  address: `0x${string}`
}

export function generateEphemeralKeypair(): EphemeralKeypair {
  const privateKey = generatePrivateKey()
  const account = privateKeyToAccount(privateKey)
  return {
    privateKey,
    address: account.address
  }
}
