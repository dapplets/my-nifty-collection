import React from 'react';
import { Header, Dimmer, Loader, Input, Card } from 'semantic-ui-react';
import { bridge } from './dappletBridge';
import { INft } from './Nft';
import NftContainer from './NftContainer';
import DropdownMenu from './DropdownMenu';

interface Props {}

interface State {
  user: string
  current: boolean
  nfts: INft[]
  searchQuery: string
  isConnected: boolean
  isLinked: boolean
  linkStateChanged: boolean
  currentNearAccount: string
  nearWalletLink: string
  index: number
  isDataLoading: boolean
  avatarNftId: string | null
  avatarNftBadgeId: string | null
}

const defaultNfts: INft[] = [
  {
    name: '',
    description: '',
    image: { LIGHT: '' },
    link: '',
    issued_at: '',
    program: '',
    cohort: '',
    owner: '',
    id: '',
    isAvatar: false,
    isAvatarBadge: false,
  },
];

const defaultState: State = {
  user: '',
  current: true,
  nfts: defaultNfts,
  searchQuery: '',
  isConnected: false,
  isLinked: false,
  linkStateChanged: false,
  currentNearAccount: '',
  nearWalletLink: '',
  index: -1,
  isDataLoading: true,
  avatarNftId: null,
  avatarNftBadgeId: null,
};

export default class App extends React.Component<Props, State> {
  refs: any;

  constructor(props: Props) {
    super(props);
    this.state = { ...defaultState };
  }

  tryIsLinked = async () => {
    const { user, currentNearAccount } = this.state;
    try {
      const currentExternalAccounts = await bridge.getExternalAccounts(currentNearAccount);
      this.setState({ isLinked: currentExternalAccounts.includes(user) });
    } catch (err) {
      console.log('The error in getExternalAccounts(): ', err);
    }
  };

  handleConnect = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const currentNearAccount = await bridge.connectWallet();
      this.setState({ currentNearAccount, isConnected: true });
    } catch (err) {
      console.log('The error in connectWallet(): ', err);
    }
    this.tryIsLinked();
  };

  handleLink = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await bridge.addExternalAccount(this.state.user);
    } catch (err) {
      console.log('The error in addExternalAccount(): ', err);
    }
    await this.setState({ isConnected: true, linkStateChanged: true });
    bridge.afterLinking();
  };

  handleUnlink = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await bridge.removeExternalAccount(this.state.user);
    } catch (err) {
      console.log('The error in removeExternalAccount(): ', err);
    }
    await this.setState({ isConnected: false, linkStateChanged: true });
    bridge.afterLinking();
  };

  updateNearAccount = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.isConnected === false) return;
    const updatedNearAcount = await bridge.getCurrentNearAccount();
    if (updatedNearAcount !== this.state.currentNearAccount) {
      this.setState({ currentNearAccount: updatedNearAcount, isConnected: false });
    }
  }

  handleToggleAvatar = (nftId: string) => async (e: any) => {
    e.preventDefault();
    if (this.state.avatarNftId === nftId) {
      try {
        await bridge.removeNftId(this.state.user);
      } catch (err) {
        console.log('The error in removeNftId(): ', err);
      }
    } else if (this.state.avatarNftId === null) {
      try {
        await bridge.setNftId(this.state.user, nftId);
      } catch (err) {
        console.log('The error in setNftId(): ', err);
      }
    } else {
      try {
        await bridge.setNftId(this.state.user, nftId);
        this.setState({ avatarNftId: null });
      } catch (err) {
        console.log('The error in setNftId(): ', err);
      }
    }
    bridge.afterAvatarChanging();
  };

  handleToggleAvatarBadge = (nftBadgeId: string) => async (e: any) => {
    e.preventDefault();
    if (this.state.avatarNftBadgeId === nftBadgeId) {
      try {
        await bridge.removeNftBadgeId(this.state.user);
      } catch (err) {
        console.log('The error in removeNftBadgeId(): ', err);
      }
    } else if (this.state.avatarNftBadgeId === null) {
      try {
        await bridge.setNftBadgeId(this.state.user, nftBadgeId);
      } catch (err) {
        console.log('The error in setNftBadgeId(): ', err);
      }
    } else {
      try {
        await bridge.setNftBadgeId(this.state.user, nftBadgeId);
        this.setState({ avatarNftBadgeId: null });
      } catch (err) {
        console.log('The error in setNftBadgeId(): ', err);
      }
    }
    bridge.afterAvatarChanging();
  };

  componentDidMount() {
    bridge.onData((data) =>
      this.setState({ ...defaultState, ...data, isDataLoading: false }, async () => {
        const isConnected = await bridge.isWalletConnected();
        this.setState({ isConnected });
        if (isConnected) {
          const currentNearAccount = await bridge.getCurrentNearAccount();
          this.setState({ currentNearAccount });
          this.tryIsLinked();
        }
        if (this.state.index >= 0) {
          this.refs[`nft_${this.state.index}`].current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
        this.setState({ avatarNftId: null });
        this.state.nfts.forEach((nft) => {
          if (nft.isAvatar) this.setState({ avatarNftId: nft.id });
          if (nft.isAvatarBadge) this.setState({ avatarNftBadgeId: nft.id });
        });
      }),
    );
  }

  render() {
    const {
      current,
      user,
      nfts,
      isConnected,
      isLinked,
      searchQuery,
      currentNearAccount,
      linkStateChanged,
      index,
      nearWalletLink,
      isDataLoading,
      avatarNftId,
      avatarNftBadgeId,
    } = this.state;

    this.refs = nfts.reduce((acc: any, v, i) => {
      acc[`nft_${i}`] = React.createRef();
      return acc;
    }, {});

    return (
      <div className="overlay-container">
        <Header as="h2" style={{ display: 'inline-block', marginTop: '20px' }}>
          {current ? 'My' : user} Nifty Collection
        </Header>

        {
          // ------- MENU -------
          current && (
            <DropdownMenu
              isConnected={isConnected}
              nearWalletLink={nearWalletLink}
              currentNearAccount={currentNearAccount}
              isLinked={isLinked}
              user={user}
              handleLink={this.handleLink}
              handleUnlink={this.handleUnlink}
              handleConnect={this.handleConnect}
              updateNearAccount={this.updateNearAccount}
            />
          )
        }

        {
          // ------- SEARCH -------
          nfts[0].name !== '' && (
            <Input
              icon="search"
              placeholder="Search..."
              style={{ width: '-webkit-fill-available' }}
              onChange={(e: any) => this.setState({ searchQuery: e.target.value })}
              value={searchQuery}
            />
          )
        }

        <Card className="overlay-card">
          {
            // ------- Notifications -------
            linkStateChanged && current && (
              <Card.Content className="notification">
                Twitter account <b>@{user}</b> has been {isLinked ? 'linked to' : 'unlinked from'}{' '}
                <b>{currentNearAccount}</b>
              </Card.Content>
            )
          }
          {
            // ------- NFTs -------
            isDataLoading ? (
              <div style={{ display: 'block', height: '100px' }}>
                <Dimmer active inverted>
                  <Loader inverted content="Loading" />
                </Dimmer>
              </div>
            ) : nfts[0].name === '' ? (
              <Card.Content description="You don't have NFTs yet." />
            ) : (
              <NftContainer
                nfts={nfts}
                searchQuery={searchQuery}
                index={index}
                refs={this.refs}
                handleToggleAvatar={this.handleToggleAvatar}
                handleToggleAvatarBadge={this.handleToggleAvatarBadge}
                current={current}
                avatarNftId={avatarNftId}
                avatarNftBadgeId={avatarNftBadgeId}
              />
            )
          }
        </Card>
      </div>
    );
  }
}
