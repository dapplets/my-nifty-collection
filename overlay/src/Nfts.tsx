import React from 'react';
import { Card, Feed, Ref } from 'semantic-ui-react';

interface IProps {
  nfts: INft[];
  searchQuery: string;
  index: number | undefined;
  refs: any;
}

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

export function Nfts(props: IProps) {
  return (
    <Card.Content style={{ padding: '1em 0' }}>
      <Feed>
        {props.nfts
          .reverse()
          .filter((nft) => {
            const reg = new RegExp(
              `${props.searchQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`,
              'gi',
            );
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
            <Ref key={`nft_${i}`} innerRef={props.refs[`nft_${i}`]}>
              <Feed.Event
                style={{
                  padding: '.6em 1em',
                  backgroundColor: `${i === props.index ? 'hsl(185deg 19% 43% / 10%)' : 'none'}`,
                }}
              >
                <Feed.Label image={nft.image} />
                <Feed.Content>
                  <Feed.Summary>{nft.name}</Feed.Summary>
                  <Feed.Summary style={{ fontWeight: 'normal' }}>
                    <b>Description: </b>
                    {nft.description}
                  </Feed.Summary>
                  <Feed.Summary style={{ fontWeight: 'normal' }}>
                    <b>Link: </b>
                    <a href={nft.link} target="_blank">
                      view certificate
                    </a>
                  </Feed.Summary>
                  <Feed.Summary style={{ fontWeight: 'normal' }}>
                    <b>Issued at: </b>
                    {new Date(nft.issued_at).toLocaleDateString()}
                  </Feed.Summary>
                  <Feed.Summary style={{ fontWeight: 'normal' }}>
                    <b>Program: </b>
                    {nft.program}
                  </Feed.Summary>
                  {nft.cohort && (
                    <Feed.Summary style={{ fontWeight: 'normal' }}>
                      <b>Cohort: </b>
                      {nft.cohort}
                    </Feed.Summary>
                  )}
                  <Feed.Summary style={{ fontWeight: 'normal' }}>
                    <b>Owner: </b>
                    {nft.owner}
                  </Feed.Summary>
                </Feed.Content>
              </Feed.Event>
            </Ref>
          ))}
      </Feed>
      <div className="nft_counter">{props.nfts.length} NFTs</div>
    </Card.Content>
  );
}
