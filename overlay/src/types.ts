interface INftMedia {
  mediaType?: string | null
  mediaUrl?: string
}

export interface INftMetadata {
  name: string
  description: string
  image: { DARK: string; LIGHT: string }
  link: string
  issued_at: string
  program?: string
  cohort?: string
  owner?: string
  id: string
  isAvatar?: boolean
  isAvatarBadge?: boolean
  source: 'ncd' | 'paras' | 'mintbase'
  contract: string
}

export interface INftMetaMedia extends INftMetadata, INftMedia { }

export interface IDappletApi {
  connectWallet: () => Promise<string>
  isWalletConnected: () => Promise<boolean>
  getCurrentNearAccount: () => Promise<string>

  getExternalAccounts: (near: string) => Promise<string[]>
  getNearAccounts: (account: string) => Promise<string[]>
  addExternalAccount: (account: string) => Promise<void>
  removeExternalAccount: (account: string) => Promise<void>

  getNftId: (twitterAcc: string) => Promise<string[] | null>
  setNftId: (twitterAcc: string, id: string, source: string, contract: string) => Promise<void>
  removeNftId: (twitterAcc: string) => Promise<void>
  
  getNftBadgeId: (twitterAcc: string) => Promise<string[] | null>
  setNftBadgeId: (twitterAcc: string, id: string, source: string, contract: string) => Promise<void>
  removeNftBadgeId: (twitterAcc: string) => Promise<void>

  getNCDCertificates: (user: string) => Promise<INftMetadata[] | INftMetadata | undefined | null>
  getParasNFTs: (user: string, page: number, limit: number) => Promise<INftMetadata[] | undefined>
  getMintbaseNFTs: (user: string, page: number, limit: number) => Promise<INftMetadata[] | undefined>
  showNfts: (prevUser?: string) => Promise<void>

  afterLinking: () => Promise<void>
  afterAvatarChanging: () => Promise<void>
  afterAvatarBadgeChanging: () => Promise<void>
}

export type Nums = 0 | 1 | 2 | 3;

export interface IDappState {
  username?: string
  current: boolean
  theme: 'DARK' | 'LIGHT'
  avatarNft?: INftMetaMedia
  avatarNftBadge?: INftMetaMedia
  linkStateChanged: boolean
}

export interface IOverlayState {
  parasNfts?: INftMetadata[]
  mintbaseNfts?: INftMetadata[]
  nCDCertificates?: INftMetadata[] | INftMetadata | null
  searchQuery: string
  isConnected: boolean
  isLinked: boolean
  currentNearAccount: string
  isDataLoading: boolean
  parasPage: number
  mintbasePage: number
  hasMoreOnParas: boolean
  hasMoreOnMintbase: boolean
  prevUser: string[]
  inProp: boolean
  selectedSource?: string
  nftsLoading: boolean
}