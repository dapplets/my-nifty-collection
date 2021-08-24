import React from 'react';
import { Card, Feed, Divider } from 'semantic-ui-react';
import { Nft, INft } from './Nft';

interface INftContainerProps {
  nfts: INft[]
  searchQuery: string
  index?: number
  refs: any
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
    index,
    refs,
    current,
    avatarNftId,
    handleToggleAvatar,
    avatarNftBadgeId,
    handleToggleAvatarBadge,
    theme,
  } = props;
  return (
    <Card.Content style={{ padding: '1em 0' }}>
      <Feed>
        {nfts
          .filter((nft) => {
            const reg = new RegExp(`${searchQuery.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}`, 'gi');
            return (
              reg.exec(nft.name) ||
              reg.exec(nft.description) ||
              reg.exec(new Date(nft.issued_at).toLocaleDateString()) ||
              reg.exec(nft.program) ||
              reg.exec(nft.cohort) ||
              reg.exec(nft.owner)
            );
          })
          .map((nft, i) => (
            <React.Fragment key={`nft_${i}`}>
              <Nft
                key={`nft_${i}`}
                nft={nft}
                i={i}
                index={index}
                refs={refs}
                current={current}
                avatarNftId={avatarNftId}
                handleToggleAvatar={handleToggleAvatar}
                avatarNftBadgeId={avatarNftBadgeId}
                handleToggleAvatarBadge={handleToggleAvatarBadge}
                theme={theme}
              />
              <Divider />
            </React.Fragment>
          ))}
      </Feed>
      <div className="nft_counter">
        {nfts.length} {nfts.length === 1 ? 'NFT' : 'NFTs'}
      </div>
    </Card.Content>
  );
}
