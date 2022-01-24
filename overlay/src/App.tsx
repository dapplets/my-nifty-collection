import React from 'react';
import { Button, Card, Dimmer, Divider, Feed, Header, Icon, Input, Loader } from 'semantic-ui-react';
import { CSSTransition, Transition, TransitionGroup } from 'react-transition-group';
import cn from 'classnames';
import { bridge } from './dappletBridge';
import { INft } from './Nft';
import NftContainer from './NftContainer';
import DropdownMenu from './DropdownMenu';

interface Props {}

interface State {
  user: string
  current: boolean
  parasNfts?: INft[]
  mintbaseNfts?: INft[]
  nCDCertificates?: INft[]
  avatar?: INft,
  badge?: INft,
  searchQuery: string
  isConnected: boolean
  isLinked: boolean
  linkStateChanged: boolean
  currentNearAccount: string
  index: number
  isDataLoading: boolean
  avatarNftId: string | null
  avatarNftBadgeId: string | null
  theme: 'DARK' | 'LIGHT'
  avatarNft?: INft
  badgeNft?: INft
  parasPage: number
  mintbasePage: number
  hasMoreOnParas: boolean
  hasMoreOnMintbase: boolean
  prevUser: string[]
  inProp: boolean
}

const defaultState: State = {
  user: '',
  current: true,
  searchQuery: '',
  isConnected: false,
  isLinked: false,
  linkStateChanged: false,
  currentNearAccount: '',
  index: -1,
  isDataLoading: true,
  avatarNftId: null,
  avatarNftBadgeId: null,
  theme: 'LIGHT',
  parasPage: 1,
  mintbasePage: 1,
  hasMoreOnParas: false,
  hasMoreOnMintbase: false,
  prevUser: [],
  inProp: true,
};

const limit = 7; // may customize

export default class App extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = { ...defaultState };
  }

  handleConnect = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const currentNearAccount = await bridge.connectWallet();
      this.setState({ currentNearAccount, isConnected: true });
    } catch (err) {
      console.log('The error in connectWallet(): ', err);
    }
    const { user, currentNearAccount } = this.state;
    try {
      const currentExternalAccounts = await bridge.getExternalAccounts(currentNearAccount);
      this.setState({ isLinked: currentExternalAccounts.includes(user) });
    } catch (err) {
      console.log('The error in getExternalAccounts(): ', err);
    }
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

  handleToggleAvatar = (nftId: string, source: string, contract: string) => async (e: any) => {
    e.preventDefault();
    if (this.state.avatarNftId === nftId) {
      try {
        await bridge.removeNftId(this.state.user);
      } catch (err) {
        console.log('The error in removeNftId(): ', err);
      }
    } else if (this.state.avatarNftId === null) {
      try {
        await bridge.setNftId(this.state.user, nftId, source, contract);
      } catch (err) {
        console.log('The error in setNftId(): ', err);
      }
    } else {
      try {
        await bridge.setNftId(this.state.user, nftId, source, contract);
        this.setState({ avatarNftId: null });
      } catch (err) {
        console.log('The error in setNftId(): ', err);
      }
    }
    bridge.afterAvatarChanging();
  };

  handleToggleAvatarBadge = (nftBadgeId: string, source: string, contract: string) => async (e: any) => {
    e.preventDefault();
    if (this.state.avatarNftBadgeId === nftBadgeId) {
      try {
        await bridge.removeNftBadgeId(this.state.user);
      } catch (err) {
        console.log('The error in removeNftBadgeId(): ', err);
      }
    } else if (this.state.avatarNftBadgeId === null) {
      try {
        await bridge.setNftBadgeId(this.state.user, nftBadgeId, source, contract);
      } catch (err) {
        console.log('The error in setNftBadgeId(): ', err);
      }
    } else {
      try {
        await bridge.setNftBadgeId(this.state.user, nftBadgeId, source, contract);
        this.setState({ avatarNftBadgeId: null });
      } catch (err) {
        console.log('The error in setNftBadgeId(): ', err);
      }
    }
    bridge.afterAvatarBadgeChanging();
  };

  addParasNfts = async (e: any) => {
    e.preventDefault();
    const nextPage = this.state.parasPage + 1;
    const newNfts: INft[] = await bridge.getParasNFTs(this.state.user, nextPage, limit);
    const hasMoreOnParas = !!newNfts && newNfts.length === limit + 1;
    if (hasMoreOnParas) newNfts.pop();
    const filteredNewNfts = newNfts?.filter((nft: any) => nft.id !== this.state.avatar?.id && nft.id !== this.state.badge?.id);
    this.state.parasNfts
      ? this.setState({ parasNfts: [...this.state.parasNfts, ...filteredNewNfts], parasPage: nextPage, hasMoreOnParas })
      : this.setState({ parasNfts: filteredNewNfts, parasPage: nextPage, hasMoreOnParas });
  };

  addMintbaseNfts = async (e: any) => {
    e.preventDefault();
    const nextPage = this.state.mintbasePage + 1;
    const newNfts: INft[] = await bridge.getMintbaseNFTs(this.state.user, nextPage, limit);
    const hasMoreOnMintbase = !!newNfts && newNfts.length === limit + 1;
    if (hasMoreOnMintbase) newNfts.pop();
    const filteredNewNfts = newNfts?.filter((nft: any) => nft.id !== this.state.avatar?.id && nft.id !== this.state.badge?.id);
    this.state.mintbaseNfts
      ? this.setState({ mintbaseNfts: [...this.state.mintbaseNfts, ...filteredNewNfts], mintbasePage: nextPage, hasMoreOnMintbase })
      : this.setState({ mintbaseNfts: filteredNewNfts, mintbasePage: nextPage, hasMoreOnMintbase });
  };

  componentDidMount() {
    bridge.onData(async (data) => {
      const { avatarNft, badgeNft } = data;
      const isConnected = await bridge.isWalletConnected();
      let currentNearAccount: string = '';
      let isLinked: boolean = false;
      if (isConnected) {
        currentNearAccount = await bridge.getCurrentNearAccount();
        const { user } = this.state;
        try {
          const currentExternalAccounts = await bridge.getExternalAccounts(currentNearAccount);
          isLinked = currentExternalAccounts.includes(user);
        } catch (err) {
          console.log('The error in getExternalAccounts(): ', err);
        }
      }
      const nCDCertificates: INft[] | undefined = await bridge.getNCDCertificates(data.user);
      const filteredNCDCertificates = nCDCertificates?.filter((nft: any) => nft.id !== avatarNft?.id && nft.id !== badgeNft?.id);

      const parasNfts: INft[] | undefined = await bridge.getParasNFTs(data.user, 1, limit);
      const hasMoreOnParas = !!parasNfts && parasNfts.length === limit + 1;
      if (hasMoreOnParas) parasNfts.pop();
      const filteredParasNfts = parasNfts?.filter((nft: any) => nft.id !== avatarNft?.id && nft.id !== badgeNft?.id);

      const mintbaseNfts: INft[] | undefined = await bridge.getMintbaseNFTs(data.user, 1, limit);
      const hasMoreOnMintbase = !!mintbaseNfts && mintbaseNfts.length === limit + 1;
      if (hasMoreOnMintbase) mintbaseNfts.pop();
      const filteredMintbaseNfts = mintbaseNfts?.filter((nft: any) => nft.id !== avatarNft?.id && nft.id !== badgeNft?.id);

      this.setState({
        ...data,
        avatarNftId: avatarNft?.id,
        avatarNftBadgeId: badgeNft?.id,
        isConnected,
        parasNfts: filteredParasNfts,
        nCDCertificates: filteredNCDCertificates,
        mintbaseNfts: filteredMintbaseNfts,
        isDataLoading: false,
        hasMoreOnParas,
        hasMoreOnMintbase,
        currentNearAccount,
      });
    });
  }

  render() {
    const {
      current,
      user,
      avatarNft,
      badgeNft,
      parasNfts,
      mintbaseNfts,
      nCDCertificates,
      isConnected,
      isLinked,
      searchQuery,
      currentNearAccount,
      linkStateChanged,
      isDataLoading,
      theme,
      prevUser,
      inProp,
    } = this.state;

    if (theme === 'DARK') document.body.style.background = '#15202B';

    const addNftsContainer = (nfts: INft[]) => <NftContainer
      nfts={nfts}
      searchQuery={searchQuery}
      current={current}
      theme={theme}
      handleToggleAvatar={this.handleToggleAvatar}
      handleToggleAvatarBadge={this.handleToggleAvatarBadge}
      avatarNftId={this.state.avatarNftId}
      avatarNftBadgeId={this.state.avatarNftBadgeId}
    />;

    const addNftsSection = (
      sourseNfts: INft[] | undefined,
      title: string,
      addMethod?: any
    ) => sourseNfts && !!sourseNfts.length && (<>
      <h2
        style={{
          textAlign: 'center',
          paddingTop: '1rem',
        }}
      >
        {title}
      </h2>
      {addNftsContainer(sourseNfts)}
      {addMethod && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            primary
            className={cn('button-more', { none: title === 'Paras' ? !this.state.hasMoreOnParas : !this.state.hasMoreOnMintbase })}
            onClick={addMethod}
            content={`More from ${title}`}
          />
        </div>
      )}
      <Divider />
    </>);

    const duration = 200;
    const defaultStyle = {
      transition: `opacity ${duration}ms ease-in-out`,
      opacity: '0 !important',
    };
    const transitionStyles = {
      entering: { opacity: '1 !important' },
      entered:  { opacity: '1 !important' },
      exiting:  { opacity: '0 !important' },
      exited:  { opacity: '0 !important' },
    };

    return (
      <div className={theme === 'DARK' ? 'overlay-container dpp-dark' : 'overlay-container'}>
        {/* ------- MENU ------- */}
        <TransitionGroup className="todo-list">
          <Transition
            timeout={duration}
            in={inProp}
          >
            {(state: 'entering' | 'entered' | 'exiting' | 'exited') => (
              <Header as="h2" style={{ display: 'inline-block', marginTop: '20px', marginBottom: '14px', ...defaultStyle, ...transitionStyles[state] }}>
                {current ? 'My' : user} Nifty Collection
              </Header>
            )}
          </Transition>
          {((current && prevUser.length !== 0) || (!current && prevUser.length === 0)) && (
          <CSSTransition
            key='title-button'
            timeout={duration}
            classNames="item"
          ><button
              className={!current ? 'title-button' : 'title-button prev'}
              onClick={async (e) => {
                e.preventDefault();
                if (current) {
                  const lastUser = prevUser.pop();
                  await bridge.showNfts(lastUser);
                } else {
                  await bridge.showNfts();
                  prevUser.push(user);
                }
                this.setState({ prevUser, isDataLoading: true, inProp: !inProp })
              }}
            >
              <Icon
                size='large'
                inverted={theme === 'DARK'}
                name={current ? 'arrow left' : 'home'}
              />
            </button>
          </CSSTransition>)}
          {current && !isDataLoading && (<CSSTransition
            key='menu-button'
            timeout={duration}
            classNames="item"
          >
            <DropdownMenu
              isConnected={isConnected}
              currentNearAccount={currentNearAccount}
              isLinked={isLinked}
              user={user}
              handleLink={this.handleLink}
              handleUnlink={this.handleUnlink}
              handleConnect={this.handleConnect}
              updateNearAccount={this.updateNearAccount}
            />
          </CSSTransition>)}
        </TransitionGroup>
        {
          // ------- SEARCH -------
          (parasNfts || nCDCertificates || mintbaseNfts) && (
            <Input
              icon={{ name: 'search', inverted: theme === 'DARK' }}
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
            isDataLoading
              ? (
                <div style={{ display: 'block', height: '100px' }}>
                  <Dimmer active inverted={theme === 'LIGHT'} >
                    <Loader inverted={theme === 'LIGHT'} content="Loading" />
                  </Dimmer>
                </div>
              )
              : !parasNfts && !nCDCertificates && !mintbaseNfts
                ? <Card.Content description="You don't have NFTs yet." />
                : (
                  <Card.Content style={{ padding: '1em 0' }}>
                    <Feed>
                      {avatarNft && addNftsContainer([avatarNft])}
                      {badgeNft && avatarNft?.link !== badgeNft.link && addNftsContainer([badgeNft])}
                      {(avatarNft || badgeNft) && <Divider />}

                      {/* NCD Certificates */
                      addNftsSection(nCDCertificates, 'NCD Certificates')}

                      {/* PARAS */
                      addNftsSection(parasNfts, 'Paras', this.addParasNfts)}

                      {/* MINTBASE */
                      addNftsSection(mintbaseNfts, 'Mintbase', this.addMintbaseNfts)}
                    </Feed>
                  </Card.Content>)
          }
        </Card>
      </div>
    );
  }
}
