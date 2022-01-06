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
  return (
    <>
      {nfts
        .filter((nft) => {
          const reg = new RegExp(`${searchQuery.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}`, 'gi');
          return (
            reg.exec(nft.name) ||
            reg.exec(nft.description) ||
            reg.exec(new Date(nft.issued_at).toLocaleDateString()) ||
            (nft.program && reg.exec(nft.program)) ||
            (nft.cohort && reg.exec(nft.cohort)) ||
            reg.exec(nft.owner)
          );
        })
        .map((nft, i) => (
          <Nft
            key={`${nft.source}_nft_${i}`}
            nft={nft}
            current={current}
            avatarNftId={avatarNftId}
            handleToggleAvatar={handleToggleAvatar}
            avatarNftBadgeId={avatarNftBadgeId}
            handleToggleAvatarBadge={handleToggleAvatarBadge}
            theme={theme}
          />
        ))}
    </>
  );
}
