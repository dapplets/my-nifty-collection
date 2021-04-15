import React from 'react';
import { Header, Input, Card, Feed, Button } from 'semantic-ui-react';
import { bridge } from './dappletBridge';

let counter = 0;

interface Props {}

interface State {
  user: string;
  current: boolean;
  nfts: {
    name: string;
    type: string;
    image: string;
    link: string;
  }[];
  searchQuery: string;
  isConnected: boolean;
  currentNearAccount: string;
  nearWalletLink: string;
}

const defaultState = {
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
  searchQuery: '',
  isConnected: true,
  currentNearAccount: '',
  nearWalletLink: '',
};

export default class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { ...defaultState };
  }

  async getData() {
    const { current, user, nearWalletLink } = this.state;
    const currentNearAccount = await bridge.getCurrentNearAccount();
    const currentExternalAccounts = await bridge.getExternalAccounts(currentNearAccount);
    if (current) {
      if (!currentExternalAccounts.length) {
        this.setState({
          isConnected: false,
          user,
          current,
          currentNearAccount,
          nearWalletLink,
        });
      } else {
        const nfts = await bridge.getNftsByNearAccount(currentNearAccount);
        this.setState({ user, nfts, current });
      }
    } else {
      const nearAcc = await bridge.getNearAccounts(user);
      const nfts = await bridge.getNftsByNearAccount(nearAcc[0]);
      this.setState({ user, nfts, current });
    }
  }

  componentDidMount() {
    bridge.onData((data) => this.setState({ ...data }, () => this.getData()));
  }

  handleLink = async () => {
    await bridge.addExternalAccount(this.state.user);
    await this.setState({ isConnected: true });
    await this.getData();
    bridge.afterLinking();
  };

  render() {
    const { current, user, nfts, isConnected, searchQuery } = this.state;
    return (
      user && (
        <div className="overlay-container">
          <Header as="h2">{current ? 'My' : user} NFT Collection</Header>
          {!isConnected ? (
            <Card style={{ width: 'auto' }}>
              <Card.Content>
                <p>
                  Dapplet connected to{' '}
                  <a href={this.state.nearWalletLink} target="_blank">
                    {this.state.currentNearAccount}
                  </a>
                </p>
                <p>Current twitter account - @{user}</p>
                <Button primary onClick={this.handleLink}>
                  Link
                </Button>
              </Card.Content>
            </Card>
          ) : (
            <>
              <Input
                icon="search"
                placeholder="Search..."
                style={{ width: '-webkit-fill-available' }}
                onChange={(e: any) => this.setState({ searchQuery: e.target.value })}
                value={searchQuery}
              />
              <Card style={{ width: 'auto' }}>
                {nfts[0].name === '' ? (
                  <Card.Content description="You don't have NFTs yet." />
                ) : (
                  <Card.Content>
                    <Feed>
                      {nfts
                        .filter((nft) => {
                          const reg = new RegExp(
                            `${searchQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`,
                            'gi',
                          );
                          return reg.exec(nft.name) || reg.exec(nft.type);
                        })
                        .map((nft) => (
                          <Feed.Event style={{ margin: '10px 0' }} key={counter++}>
                            <Feed.Label image={nft.image} />
                            <Feed.Content>
                              <Feed.Summary>{nft.name}</Feed.Summary>
                              <Feed.Summary style={{ fontWeight: 'normal' }}>
                                {nft.type}
                              </Feed.Summary>
                            </Feed.Content>
                          </Feed.Event>
                        ))}
                    </Feed>
                  </Card.Content>
                )}
              </Card>
            </>
          )}
        </div>
      )
    );
  }
}
