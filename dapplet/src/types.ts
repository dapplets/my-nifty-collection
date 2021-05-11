export interface INftMetadata {
  name: string;
  description: string;
  image: string;
  link: string;
  issued_at: string;
  program: string;
  cohort: string;
  owner: string;
}

export interface ITokenMetadata {
  metadata: {
    title: string;
    description: string;
    media: string;
    issued_at: string;
    extra: string;
  };
}

export interface overlayProps {
  user: string;
  current?: boolean;
  nfts: INftMetadata[];
  index: number;
  linkStateChanged?: boolean;
}
