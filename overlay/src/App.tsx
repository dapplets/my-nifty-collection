import React from 'react';
import { Header, Menu, Dropdown, Input, Card, Button, Dimmer, Loader } from 'semantic-ui-react';
import { bridge } from './dappletBridge';
import { Nfts, INft } from './Nfts';

interface Props {}

interface State {
  user: string;
  current: boolean;
  nfts: INft[];
  searchQuery: string;
  isConnected: boolean;
  linkStateChanged: boolean;
  currentNearAccount: string;
  nearWalletLink: string;
  nftsLoading: boolean;
  index: number | undefined;
}

const defaultState = {
  user: '',
  current: true,
  nfts: [
    {
      name: '',
      description: '',
      image: '',
      link: '',
      issued_at: '',
      program: '',
      cohort: '',
      owner: '',
    },
  ],
  searchQuery: '',
  isConnected: true,
  linkStateChanged: false,
  currentNearAccount: '',
  nearWalletLink: '',
  index: undefined,
  nftsLoading: false,
};

export default class App extends React.Component<Props, State> {
  refs: any;

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
        const nearAccs = await bridge.getNearAccounts(user);
        const nfts = await bridge.getNftsByNearAccount(nearAccs);
        this.setState({
          isConnected: false,
          user,
          nfts: nfts.length ? nfts : defaultState.nfts,
          current,
          currentNearAccount,
          nearWalletLink,
        });
      } else {
        const nearAccs = await bridge.getNearAccounts(user);
        const nfts = await bridge.getNftsByNearAccount(nearAccs);
        this.setState({
          user,
          nfts: nfts.length ? nfts : defaultState.nfts,
          current,
          currentNearAccount,
        });
      }
    } else {
      const nearAccs = await bridge.getNearAccounts(user);
      const nfts = await bridge.getNftsByNearAccount(nearAccs);
      this.setState({ user, nfts, current });
    }
    this.setState({ nftsLoading: false });
  }

  componentDidMount() {
    bridge.onData((data) =>
      this.setState({ ...data, index: data.index ?? undefined, nftsLoading: true }, async () => {
        await this.getData();
        if (this.state.index !== undefined) {
          this.refs[`nft_${this.state.index}`].current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }),
    );
  }

  handleLink = async () => {
    await bridge.addExternalAccount(this.state.user);
    await this.setState({ isConnected: true, linkStateChanged: true });
    await this.getData();
    bridge.afterLinking();
  };

  handleUnlink = async () => {
    await bridge.removeExternalAccount(this.state.user);
    await this.setState({ isConnected: false, linkStateChanged: true });
    bridge.afterLinking();
  };

  render() {
    const {
      current,
      user,
      nfts,
      isConnected,
      searchQuery,
      currentNearAccount,
      linkStateChanged,
      nftsLoading,
      index,
    } = this.state;

    this.refs = nfts.reduce((acc: any, v, i) => {
      acc[`nft_${i}`] = React.createRef();
      return acc;
    }, {});

    return (
      user && (
        <div className="overlay-container">
          <Header as="h2" style={{ display: 'inline-block', marginTop: '20px' }}>
            {current ? 'My' : user} NFT Collection
          </Header>
          {current && isConnected && (
            <div style={{ display: 'inline-block', float: 'right', marginTop: '10px' }}>
              <Menu style={{ border: 'none', boxShadow: 'none' }}>
                <Menu.Menu position="right">
                  <Dropdown
                    item
                    simple
                    icon="ellipsis vertical"
                    style={{ fontSize: '1.2em' }}
                    direction="right"
                  >
                    <Dropdown.Menu>
                      <Dropdown.Item>
                        Connected to{' '}
                        <a href={this.state.nearWalletLink} target="_blank">
                          {currentNearAccount}
                        </a>
                      </Dropdown.Item>
                      <Dropdown.Item onClick={this.handleUnlink}>
                        Unlink account @{user}
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Menu.Menu>
              </Menu>
            </div>
          )}

          {!isConnected && current && (
            <Card style={{ width: 'auto', marginTop: '0' }}>
              {linkStateChanged && (
                <Card.Content className="notification">
                  <p>
                    Twitter account <b>@{user}</b> has been unlinked from{' '}
                    <b>{currentNearAccount}</b>
                  </p>
                </Card.Content>
              )}
              <Card.Content>
                <p>
                  Dapplet connected to{' '}
                  <a href={this.state.nearWalletLink} target="_blank">
                    {currentNearAccount}
                  </a>
                </p>
                <p>Current twitter account - @{user}</p>
                <Button primary onClick={this.handleLink}>
                  Link
                </Button>
              </Card.Content>
            </Card>
          )}

          {nfts[0].name !== '' && (
            <Input
              icon="search"
              placeholder="Search..."
              style={{ width: '-webkit-fill-available' }}
              onChange={(e: any) => this.setState({ searchQuery: e.target.value })}
              value={searchQuery}
            />
          )}

          <Card
            className="overlay-card"
            style={{
              maxHeight: `calc(100vh - ${
                !isConnected && current ? (linkStateChanged ? '326px' : '260px') : '130px'
              })`,
            }}
          >
            {linkStateChanged && current && isConnected && (
              <Card.Content className="notification">
                <p>
                  Twitter account <b>@{user}</b> has been linked to <b>{currentNearAccount}</b>
                </p>
              </Card.Content>
            )}

            {nfts[0].name === '' ? (
              <>
                {nftsLoading ? (
                  <div className="dimmer">
                    <Dimmer active inverted>
                      <Loader inverted content="Loading" />
                    </Dimmer>
                  </div>
                ) : (
                  <Card.Content description="You don't have NFTs yet." />
                )}
              </>
            ) : (
              <>
                {nftsLoading ? (
                  <div className="dimmer">
                    <Dimmer active inverted>
                      <Loader inverted content="Loading" />
                    </Dimmer>
                  </div>
                ) : (
                  <Nfts nfts={nfts} searchQuery={searchQuery} index={index} refs={this.refs} />
                )}
              </>
            )}
          </Card>
        </div>
      )
    );
  }
}
