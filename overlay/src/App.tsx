import React from 'react';
import { Header, Menu, Dropdown, Input, Card, Feed, Button, Dimmer, Loader, Ref } from 'semantic-ui-react';
import { bridge } from './dappletBridge';

interface Props {}

interface State {
  user: string;
  current: boolean;
  nfts: {
    name: string;
    description: string;
    image: string;
    link: string;
    issued_at: string;
    program: string;
    cohort: string;
    owner: string;
  }[];
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
    }
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

  refs: any

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
        this.setState({
          user,
          nfts: nfts.length ? nfts : defaultState.nfts,
          current,
          currentNearAccount,
        });
      }
    } else {
      const nearAcc = await bridge.getNearAccounts(user);
      const nfts = await bridge.getNftsByNearAccount(nearAcc[0]);
      this.setState({ user, nfts, current });
    }
    this.setState({ nftsLoading: false });
  }

  componentDidMount() {
    bridge.onData(
      (data) => this.setState({ ...data, index: data.index ?? undefined, nftsLoading: true },
      async () => {
        await this.getData();
        if (this.state.index !== undefined) {
          this.refs[`nft_${this.state.index}`].current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      },
    ));
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
    const { current, user, nfts, isConnected, searchQuery, currentNearAccount, linkStateChanged, nftsLoading, index } = this.state;

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
                <Menu.Menu position='right'>
                  <Dropdown
                    item
                    simple
                    icon="ellipsis vertical"
                    style={{ fontSize: '1.2em' }}
                    direction='right'
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
          {!isConnected && current ? (
            <Card style={{ width: 'auto' }}>
              {linkStateChanged && (
                <Card.Content style={{ color: 'forestgreen' }}>
                  <p>
                    Twitter account <b>@{user}</b> has been unlinked from <b>{currentNearAccount}</b>
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
          ) : (
            <>
              <Input
                icon="search"
                placeholder="Search..."
                style={{ width: '-webkit-fill-available' }}
                onChange={(e: any) => this.setState({ searchQuery: e.target.value })}
                value={searchQuery}
              />
              <Card className="overlay-card">
                {linkStateChanged && current && (
                  <Card.Content style={{ color: 'forestgreen' }}>
                    <p>
                      Twitter account <b>@{user}</b> has been linked to <b>{currentNearAccount}</b>
                    </p>
                  </Card.Content>
                )}
                {nfts[0].name === '' ? (
                  <>
                    {nftsLoading ? (
                        <Dimmer active inverted>
                          <Loader inverted content='Loading' />
                        </Dimmer>
                    ) : <Card.Content description="You don't have NFTs yet." />}
                  </>
                ) : (
                  <>
                    {nftsLoading ? (
                        <Dimmer active inverted>
                          <Loader inverted content='Loading' />
                        </Dimmer>
                    ) : (
                      <Card.Content style={{ padding: '1em 0' }}>
                        <Feed>
                          {nfts
                            .reverse()
                            .filter((nft) => {
                              const reg = new RegExp(
                                `${searchQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`,
                                'gi',
                              );
                              return reg.exec(nft.name)
                                || reg.exec(nft.description)
                                || reg.exec((new Date(nft.issued_at)).toLocaleDateString())
                                || reg.exec(nft.program)
                                || reg.exec(nft.cohort)
                                || reg.exec(nft.owner);
                            })
                            .map((nft, i) => (
                              <Ref
                                key={`nft_${i}`}
                                innerRef={this.refs[`nft_${i}`]}
                              >
                                <Feed.Event
                                  style={{
                                    padding: '.6em 1em',
                                    backgroundColor: `${i === index ? 'hsl(185deg 19% 43% / 10%)' : 'none'}`,
                                  }}
                                >
                                  <Feed.Label image={nft.image} />
                                  <Feed.Content>
                                    <Feed.Summary>
                                      {nft.name}
                                    </Feed.Summary>
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
                                      {(new Date(nft.issued_at)).toLocaleDateString()}
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
                        <div className="nft_counter">
                          {nfts.length} NFTs
                        </div>
                      </Card.Content>
                    )}
                  </>
                )}
              </Card>
            </>
          )}
        </div>
      )
    );
  }
}
