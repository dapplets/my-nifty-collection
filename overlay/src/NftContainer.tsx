import React from 'react';
import { Nft, INft } from './Nft';

interface INftContainerProps {
  nfts: INft[]
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
  
  return (
    <>
      {nfts.map((nft, i) => {
        const isShow = reg.test(nft.name) ||
          reg.test(nft.description) ||
          reg.test(new Date(nft.issued_at).toLocaleDateString()) ||
          (nft.program && reg.test(nft.program)) ||
          (nft.cohort && reg.test(nft.cohort)) ||
          reg.test(nft.owner);
        return <Nft
          key={`${nft.source}_nft_${i}`}
          isShow={isShow}
          nft={nft}
          current={current}
          avatarNftId={avatarNftId}
          handleToggleAvatar={handleToggleAvatar}
          avatarNftBadgeId={avatarNftBadgeId}
          handleToggleAvatarBadge={handleToggleAvatarBadge}
          theme={theme}
        />
      })}
    </>
  );
}
