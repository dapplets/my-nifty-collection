export interface INftMetadata {
  name: string;
  description: string;
  image: { DARK: string; LIGHT: string };
  link: string;
  issued_at: string;
  program: string;
  cohort: string;
  owner: string;
  id: string;
  isAvatar?: boolean;
  isAvatarBadge?: boolean;
}

export interface ITokenMetadata {
  metadata: {
    title: string;
    description: string;
    media: string;
    issued_at: string;
    extra: string;
  };
  token_id?: string;
}

export interface overlayProps {
  user: string;
  current?: boolean;
  nfts: INftMetadata[];
  index: number;
  linkStateChanged?: boolean;
  theme: 'DARK' | 'LIGHT'
}
