interface INftMedia {
  mediaType: string | null
  mediaUrl: string
}

export interface ICashedNft {
  avatar?: INftMedia
  badge?: INftMedia
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

export interface ITokenMetadata {
  metadata: {
    title: string;
    description: string;
    media: string;
    issued_at: string;
    extra: string;
  };
  token_id: string;
}

export interface IOverlayProps {
  user: string
  current?: boolean
  avatarNft: INftMetadata | null
  badgeNft: INftMetadata | null
  index: number
  linkStateChanged?: boolean
  theme: 'DARK' | 'LIGHT'
}

export interface ParasResult {
  data: ParasData
}

interface ParasData {
  results: PResult[]
  skip:    number
  limit:   number
}

export interface PResult {
  _id:             string;
  contract_id:     string;
  token_id:        string;
  owner_id:        string;
  token_series_id: string;
  edition_id:      string;
  metadata:        Metadata;
  royalty:         Royalty;
  price:           null | string;
  categories:      Category[];
  approval_id?:    number;
  ft_token_id?:    string;
}

interface Category {
  name:        string;
  isPinned:    boolean;
  category_id: string;
}

interface Metadata {
  title:          string;
  description:    string;
  media:          string;
  media_hash:     null;
  copies:         number;
  issued_at:      string | null;
  expires_at:     null;
  starts_at:      null;
  updated_at:     null;
  extra:          null;
  reference:      string;
  reference_hash: null;
  collection:     string;
  collection_id:  string;
  creator_id:     string;
  blurhash:       string;
  attributes?:    Attribute[];
}

interface Attribute {
  trait_type: string;
  value:      string;
}

interface Royalty {
  [name: string]:    number;
}
