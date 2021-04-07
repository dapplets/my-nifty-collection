import React from 'react';
import { Header, Input, Card, Feed } from 'semantic-ui-react';
import { bridge } from './dappletBridge';

interface Props {}

interface State {
  data: string | null;
}

export default class App extends React.Component<Props, State> {
  state = {
    data: null,
  };

  componentDidMount() {
    bridge.onData((data) => this.setState({ data }));
  }

  render() {
    return (
      <div className="overlay-container">
        <Header as="h1">My NFT Collection</Header>
        <Input icon="search" placeholder="Search..." style={{ width: '-webkit-fill-available' }} />
        <Card style={{ width: 'auto' }}>
          <Card.Content>
            <Feed>
              <Feed.Event style={{ margin: '10px 0' }}>
                <Feed.Label image="/near.svg" />
                <Feed.Content>
                  <Feed.Summary>NEAR Certified Developer Program</Feed.Summary>
                  <Feed.Summary style={{ fontWeight: 'normal' }}>NEAR certificate</Feed.Summary>
                </Feed.Content>
              </Feed.Event>

              <Feed.Event style={{ margin: '10px 0' }}>
                <Feed.Label image="/nft.png" />
                <Feed.Content>
                  <Feed.Summary>
                    Zhoucong-Tropical betta by <a>aj.near</a>
                  </Feed.Summary>
                  <Feed.Summary style={{ fontWeight: 'normal' }}>Digital Art</Feed.Summary>
                </Feed.Content>
              </Feed.Event>

              <Feed.Event style={{ margin: '10px 0' }}>
                <Feed.Label image="/green-nft.png" />
                <Feed.Content>
                  <Feed.Summary>
                    Moonloght by <a>sanidwhalecrypto.near</a>
                  </Feed.Summary>
                  <Feed.Summary style={{ fontWeight: 'normal' }}>Digital Art</Feed.Summary>
                </Feed.Content>
              </Feed.Event>

              <Feed.Event style={{ margin: '10px 0' }}>
                <Feed.Label image="/blue-nft.png" />
                <Feed.Content>
                  <Feed.Summary>
                    Hyuga Neiji by <a>zhoumi.near</a>
                  </Feed.Summary>
                  <Feed.Summary style={{ fontWeight: 'normal' }}>Digital Art</Feed.Summary>
                </Feed.Content>
              </Feed.Event>
            </Feed>
          </Card.Content>
        </Card>
      </div>
    );
  }
}
