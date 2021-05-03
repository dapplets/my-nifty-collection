import React from 'react';
import { Card, Feed, Ref } from 'semantic-ui-react';

export interface INft {
  name: string;
  description: string;
  image: string;
  link: string;
  issued_at: string;
  program: string;
  cohort: string;
  owner: string;
}

interface INftProps {
  nft: INft;
  i: number;
  refs: any;
  index?: number;
}

interface INftsProps {
  nfts: INft[];
  searchQuery: string;
  index?: number;
  refs: any;
}

function ShowNft(props: INftProps) {
  const { nft, i, index, refs } = props;
  const { name, description, image, link, issued_at, program, cohort, owner } = nft;
  return (
    <Ref innerRef={refs[`nft_${i}`]}>
      <Feed.Event
        style={{
          padding: '.6em 1em',
          backgroundColor: `${i === index ? 'hsl(185deg 19% 43% / 10%)' : 'inherit'}`,
        }}
      >
        <Feed.Label image={image} />
        <Feed.Content>
          <Feed.Summary>{name}</Feed.Summary>
          <Feed.Summary style={{ fontWeight: 'normal' }}>
            <b>Description: </b>
            {description}
          </Feed.Summary>
          <Feed.Summary style={{ fontWeight: 'normal' }}>
            <b>Link: </b>
            <a href={link} target="_blank" rel="noreferrer">
              view certificate
            </a>
          </Feed.Summary>
          <Feed.Summary style={{ fontWeight: 'normal' }}>
            <b>Issued at: </b>
            {new Date(issued_at).toLocaleDateString()}
          </Feed.Summary>
          <Feed.Summary style={{ fontWeight: 'normal' }}>
            <b>Program: </b>
            {program}
          </Feed.Summary>
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
        </Feed.Content>
      </Feed.Event>
    </Ref>
  );
}

export function Nfts(props: INftsProps) {
  const { nfts, searchQuery, index, refs } = props;
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
            <ShowNft nft={nft} i={i} index={index} refs={refs} key={`nft_${i}`} />
          ))}
      </Feed>
      <div className="nft_counter">{nfts.length} NFTs</div>
    </Card.Content>
  );
}
