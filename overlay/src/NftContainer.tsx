import React from 'react';
import { INftMetadata } from './types';
import { Nft } from './Nft';

interface INftContainerProps {
  nfts: INftMetadata | INftMetadata[]
  searchQuery: string
  current: boolean
  avatarNftId: string | null
  handleToggleAvatar: any
  avatarNftBadgeId: string | null
  handleToggleAvatarBadge: any
  theme: 'DARK' | 'LIGHT'
}

export default function NftContainer(props: INftContainerProps) {
  const {
    nfts,
    searchQuery,
    current,
    avatarNftId,
    handleToggleAvatar,
    avatarNftBadgeId,
    handleToggleAvatarBadge,
    theme,
  } = props;
  
  const reg = new RegExp(`${searchQuery.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}`, 'gi');
  
  const isShow = (nft: INftMetadata) => reg.test(nft.name) ||
    reg.test(nft.description) ||
    (nft.program && reg.test(nft.program)) ||
    (nft.cohort && reg.test(nft.cohort)) ||
    (nft.owner && reg.test(nft.owner)) ||
    reg.test(new Date(nft.issued_at).toLocaleDateString());
  
  return (
    <>
      {Array.isArray(nfts) ? nfts.map((nft, i) => {
        return <Nft
          key={`${nft.source}_nft_${i}`}
          isShow={isShow(nft)}
          nft={nft}
          current={current}
          avatarNftId={avatarNftId}
          handleToggleAvatar={handleToggleAvatar}
          avatarNftBadgeId={avatarNftBadgeId}
          handleToggleAvatarBadge={handleToggleAvatarBadge}
          theme={theme}
        />
      }) : <Nft
        isShow={isShow(nfts)}
        nft={nfts}
        current={current}
        avatarNftId={avatarNftId}
        handleToggleAvatar={handleToggleAvatar}
        avatarNftBadgeId={avatarNftBadgeId}
        handleToggleAvatarBadge={handleToggleAvatarBadge}
        theme={theme}
      />}
    </>
  );
}
