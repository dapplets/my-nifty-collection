import React from 'react';
import { Feed, Checkbox } from 'semantic-ui-react';

export interface INft {
  name: string
  description: string
  image: { LIGHT: string, DARK: string }
  link: string
  issued_at: string
  program?: string
  cohort?: string
  owner: string
  id: string
  isAvatar: boolean
  isAvatarBadge: boolean
  source: string
  contract: string
}

interface INftProps {
  nft: INft
  current: boolean
  avatarNftId: string | null
  handleToggleAvatar: any
  avatarNftBadgeId: string | null
  handleToggleAvatarBadge: any
  theme: 'DARK' | 'LIGHT'
}

export function Nft(props: INftProps) {
  const {
    nft,
    handleToggleAvatar,
    current,
    avatarNftId,
    avatarNftBadgeId,
    handleToggleAvatarBadge,
    theme,
  } = props;
  const {
    name,
    description,
    image,
    link,
    issued_at,
    program,
    cohort,
    owner,
    id,
    source,
    contract,
  } = nft;
  return (
    <Feed.Event style={{ padding: '.6em 1em' }} >
      <Feed.Label image={image[theme]} />
      <Feed.Content>
        <Feed.Summary className='nft-title'>{name}</Feed.Summary>
        <a href={link} target="_blank" rel="noreferrer" className={`nft-link ${source}-icon`} />
        <Feed.Summary style={{ fontWeight: 'normal' }}>
          <b>Description: </b>
          {description}
        </Feed.Summary>
        {program && (<Feed.Summary style={{ fontWeight: 'normal' }}>
            <b>Issued at: </b>
            {new Date(issued_at).toLocaleDateString()}
          </Feed.Summary>
        )}
        {program && (<Feed.Summary style={{ fontWeight: 'normal' }}>
            <b>Program: </b>
            {program}
          </Feed.Summary>
        )}
        {cohort && (
          <Feed.Summary style={{ fontWeight: 'normal' }}>
            <b>Cohort: </b>
            {cohort}
          </Feed.Summary>
        )}
        <Feed.Summary style={{ fontWeight: 'normal' }}>
          <b>Owner: </b>
          {owner}
        </Feed.Summary>
        {current && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            position: 'relative',
            marginTop: '1em',
          }}>
            <Feed.Summary style={{ fontWeight: 'normal' }}>
              <Checkbox
                slider
                label='Avatar'
                checked={id === avatarNftId}
                onChange={handleToggleAvatar(id, source, contract)}
              />
            </Feed.Summary>
            <Feed.Summary style={{ fontWeight: 'normal' }}>
              <Checkbox
                slider
                label='Badge'
                checked={id === avatarNftBadgeId}
                onChange={handleToggleAvatarBadge(id, source, contract)}
              />
            </Feed.Summary>
          </div>
        )}
      </Feed.Content>
    </Feed.Event>
  );
}
