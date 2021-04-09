import React from 'react';
import { Header, Input, Card, Feed } from 'semantic-ui-react';
import { bridge } from './dappletBridge';

let counter = 0;

interface Props {}

interface State {
  data: {
    user: string;
    current: boolean;
    nfts: {
      name: string;
      type: string;
      image: string;
      link: string;
    }[];
  };
}

const defaultData = {
  user: '',
  current: true,
  nfts: [
    {
      name: '',
      type: '',
      image: '',
      link: '',
    },
  ],
};

export default class App extends React.Component<Props, State> {
  state = {
    data: defaultData,
  };

  componentDidMount() {
    bridge.onData(({ user, current, nfts }) =>
      nfts
        ? this.setState({ data: { user, nfts, current } })
        : this.setState({ data: { user, current: true, nfts: defaultData.nfts } }),
    );
  }

  render() {
    return (
      <div className="overlay-container">
        <Header as="h2">
          {this.state.data.current ? 'My' : this.state.data.user} NFT Collection
        </Header>
        <Input icon="search" placeholder="Search..." style={{ width: '-webkit-fill-available' }} />
        <Card style={{ width: 'auto' }}>
          {this.state.data.nfts[0].name === '' ? (
            <Card.Content description="You don't have NFTs yet." />
          ) : (
            <Card.Content>
              <Feed>
                {this.state.data.nfts.map((nft) => (
                  <Feed.Event style={{ margin: '10px 0' }} key={counter++}>
                    <Feed.Label image={nft.image} />
                    <Feed.Content>
                      <Feed.Summary>{nft.name}</Feed.Summary>
                      <Feed.Summary style={{ fontWeight: 'normal' }}>{nft.type}</Feed.Summary>
                    </Feed.Content>
                  </Feed.Event>
                ))}
              </Feed>
            </Card.Content>
          )}
        </Card>
      </div>
    );
  }
}
