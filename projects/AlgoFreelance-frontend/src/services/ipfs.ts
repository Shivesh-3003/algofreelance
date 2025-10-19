// IPFS utilities for file handling

import { api } from './api'
import type { IPFSUploadResponse } from '../types/job'

export const ipfs = {
  async uploadFile(file: File): Promise<IPFSUploadResponse> {
    return api.uploadToIPFS(file)
  },

  getGatewayUrl(ipfsHash: string): string {
    // Remove ipfs:// prefix if present
    const hash = ipfsHash.replace('ipfs://', '')
    return `https://gateway.pinata.cloud/ipfs/${hash}`
  },

  isValidIPFSHash(hash: string): boolean {
    // Basic validation for IPFS CID
    const cleanHash = hash.replace('ipfs://', '')
    return cleanHash.length >= 46 && cleanHash.length <= 59
  },
}
