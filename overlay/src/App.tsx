import React from 'react';
import { Card, Dimmer, Feed, Header, Icon, Input, Loader, Menu, MenuItemProps } from 'semantic-ui-react';
import { CSSTransition, Transition, TransitionGroup } from 'react-transition-group';
import InfiniteScroll from 'react-infinite-scroll-component';
import Bridge, { IDappStateProps } from '@dapplets/dapplet-overlay-bridge';

import { IDappState, IOverlayState, Nums, IDappletApi, INftMetadata  } from './types';
import NftContainer from './NftContainer';
import DropdownMenu from './DropdownMenu';

const defaultState: IOverlayState = {
  searchQuery: '',
  isConnected: false,
  isLinked: false,
  currentNearAccount: '',
  isDataLoading: true,
  parasPage: 1,
  mintbasePage: 1,
  hasMoreOnParas: false,
  hasMoreOnMintbase: false,
  prevUser: [],
  inProp: true,
  selectedSource: '',
  nftsLoading: false,
};

const dapplet = new Bridge<IDappletApi>();

const limit = 10; // customized

export default class App extends React.Component<IDappStateProps<IDappState>, IOverlayState> {

  private _notificationTimer: any

  constructor(props: IDappStateProps<IDappState>) {
    super(props);
    this.state = { ...defaultState };
  }

  handleSourceSelect = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, data: MenuItemProps): void => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ selectedSource: data.name });
  }

  handleConnect = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const currentNearAccount = await dapplet.connectWallet();
      this.setState({ currentNearAccount, isConnected: true });
    } catch (err) {
      console.log('The error in connectWallet(): ', err);
    }
    const { currentNearAccount } = this.state;
    try {
      const currentExternalAccounts = await dapplet.getExternalAccounts(currentNearAccount);
      this.setState({ isLinked: currentExternalAccounts.includes(this.props.sharedState.global!.username!) });
    } catch (err) {
      console.log('The error in getExternalAccounts(): ', err);
    }
  };

  handleLink = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await dapplet.addExternalAccount(this.props.sharedState.global!.username!);
    } catch (err) {
      console.log('The error in addExternalAccount(): ', err);
    }
    await this.setState({ isConnected: true, isDataLoading: true });
    dapplet.afterLinking();
  };

  handleUnlink = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await dapplet.removeExternalAccount(this.props.sharedState.global!.username!);
    } catch (err) {
      console.log('The error in removeExternalAccount(): ', err);
    }
    await this.setState({ isConnected: false, isDataLoading: true });
    dapplet.afterLinking();
  };

  updateNearAccount = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.isConnected === false) return;
    const updatedNearAcount = await dapplet.getCurrentNearAccount();
    if (updatedNearAcount !== this.state.currentNearAccount) {
      this.setState({ currentNearAccount: updatedNearAcount, isConnected: false });
    }
  }

  handleToggleAvatar = (nftId: string, source: string, contract: string) => async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    const username = this.props.sharedState.global!.username!;
    if (!this.props.sharedState[username]?.avatarNft) {
      try {
        await dapplet.setNftId(username, nftId, source, contract);
      } catch (err) {
        console.log('The error in setNftId(): ', err);
      }
    } else if (this.props.sharedState[username]?.avatarNft!.id === nftId) {
      try {
        await dapplet.removeNftId(username);
      } catch (err) {
        console.log('The error in removeNftId(): ', err);
      }
    } else {
      try {
        await dapplet.setNftId(username, nftId, source, contract);
      } catch (err) {
        console.log('The error in setNftId(): ', err);
      }
    }
    dapplet.afterAvatarChanging();
  };

  handleToggleAvatarBadge = (nftBadgeId: string, source: string, contract: string) => async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    const username = this.props.sharedState.global!.username!;
    if (!this.props.sharedState[username]?.avatarNftBadge) {
      try {
        await dapplet.setNftBadgeId(username, nftBadgeId, source, contract);
      } catch (err) {
        console.log('The error in setNftBadgeId(): ', err);
      }
    } else if (this.props.sharedState[username]?.avatarNftBadge!.id === nftBadgeId) {
      try {
        await dapplet.removeNftBadgeId(username);
      } catch (err) {
        console.log('The error in removeNftBadgeId(): ', err);
      }
    } else {
      try {
        await dapplet.setNftBadgeId(username, nftBadgeId, source, contract);
      } catch (err) {
        console.log('The error in setNftBadgeId(): ', err);
      }
    }
    dapplet.afterAvatarBadgeChanging();
  };

  addNfts = async (source: 'Paras' | 'Mintbase') => {
    const username = this.props.sharedState.global!.username!;
    const nextPage = this.state[source === 'Paras' ? 'parasPage' : 'mintbasePage'] + 1;
    let newNfts: INftMetadata[] | undefined
    try {
      newNfts = await dapplet[source === 'Paras' ? 'getParasNFTs' : 'getMintbaseNFTs'](username, nextPage, limit);
    } catch (err: any) {
      console.log(`The error in dapplet.${[source === 'Paras' ? 'getParasNFTs' : 'getMintbaseNFTs']}():`, err);
    }
    const hasMore = !!newNfts && newNfts.length === limit + 1;
    if (newNfts && hasMore) newNfts.pop();
    const filteredNewNfts = newNfts?.filter((nft: any) => nft.id !== this.props.sharedState[username]?.avatarNft?.id && nft.id !== this.props.sharedState[username]?.avatarNftBadge?.id);
    return { newNfts: filteredNewNfts, hasMore, nextPage };
  };

  addParasNfts = async () => {
    this.setState({ nftsLoading: true });
    const { newNfts, hasMore, nextPage } = await this.addNfts('Paras');
    if (newNfts !== undefined) this.setState({
      parasNfts: this.state.parasNfts ? [...this.state.parasNfts, ...newNfts]: newNfts,
      parasPage: nextPage,
      hasMoreOnParas: hasMore,
      nftsLoading: false,
    });
  };

  addMintbaseNfts = async () => {
    this.setState({ nftsLoading: true });
    const { newNfts, hasMore, nextPage } = await this.addNfts('Mintbase');
    if (newNfts !== undefined) this.setState({
        mintbaseNfts: this.state.mintbaseNfts ? [...this.state.mintbaseNfts, ...newNfts]: newNfts,
        mintbasePage: nextPage,
        hasMoreOnMintbase: hasMore,
        nftsLoading: false,
    });
  };
  
  getNfts = async () => {
    if (!this.props.sharedState.global || !this.props.sharedState.global.username) return;
    const { username } = this.props.sharedState.global;
    const avatarNft = this.props.sharedState[username]?.avatarNft;
    const avatarNftBadge = this.props.sharedState[username]?.avatarNftBadge;
    const isConnected = await dapplet.isWalletConnected();
    let currentNearAccount: string = '';
    let isLinked: boolean = false;
    if (isConnected) {
      currentNearAccount = await dapplet.getCurrentNearAccount();
      try {
        const currentExternalAccounts = await dapplet.getExternalAccounts(currentNearAccount);
        isLinked = currentExternalAccounts.includes(username);
      } catch (err) {
        console.log('The error in getExternalAccounts(): ', err);
      }
    }
    const nCDCertificates = await dapplet.getNCDCertificates(username);
    const filteredNCDCertificates = Array.isArray(nCDCertificates)
      ? nCDCertificates?.filter((nft: any) => nft.id !== avatarNft?.id && nft.id !== avatarNftBadge?.id)
      : nCDCertificates;

    const parasNfts = await dapplet.getParasNFTs(username, 1, limit);
    const hasMoreOnParas = !!parasNfts && parasNfts.length === limit + 1;
    if (hasMoreOnParas) parasNfts.pop();
    const filteredParasNfts = parasNfts?.filter((nft: any) => nft.id !== avatarNft?.id && nft.id !== avatarNftBadge?.id);

    const mintbaseNfts = await dapplet.getMintbaseNFTs(username, 1, limit);
    const hasMoreOnMintbase = !!mintbaseNfts && mintbaseNfts.length === limit + 1;
    if (hasMoreOnMintbase) mintbaseNfts.pop();
    const filteredMintbaseNfts = mintbaseNfts?.filter((nft: any) => nft.id !== avatarNft?.id && nft.id !== avatarNftBadge?.id);

    const selectedSource = parasNfts?.length
      ? 'Paras'
      : mintbaseNfts?.length
        ? 'Mintbase'
        : nCDCertificates && !(Array.isArray(nCDCertificates) && nCDCertificates.length === 0)
          ? 'NCD'
          : '';

    if (this.props.sharedState.global.linkStateChanged) { 
      this._notificationTimer = setTimeout(() => this.props.changeSharedState?.({ linkStateChanged: false }), 5000);
    }

    this.setState({
      isConnected,
      parasNfts: filteredParasNfts,
      nCDCertificates: filteredNCDCertificates,
      mintbaseNfts: filteredMintbaseNfts,
      isDataLoading: false,
      hasMoreOnParas,
      hasMoreOnMintbase,
      currentNearAccount,
      isLinked,
      selectedSource,
      nftsLoading: false,
    });
  };

  componentDidMount() {
    this.getNfts();
  }

  componentDidUnount() {
    clearTimeout(this._notificationTimer);
  }

  async componentDidUpdate(prevProps: IDappStateProps<IDappState>) {
    if (!this.state.nftsLoading && this.state.searchQuery !== '' && (this.state.hasMoreOnParas ||  this.state.hasMoreOnMintbase)) {
      this.setState({ nftsLoading: true });
      const a = this.state.hasMoreOnParas
        ? await this.addNfts('Paras')
        : { newNfts: this.state.parasNfts, hasMore: this.state.hasMoreOnParas, nextPage: this.state.parasPage };
      const b = this.state.hasMoreOnMintbase
        ? await this.addNfts('Mintbase')
        : { newNfts: this.state.mintbaseNfts, hasMore: this.state.hasMoreOnMintbase, nextPage: this.state.mintbasePage };
      this.setState({
          parasNfts: this.state.hasMoreOnParas ? [...this.state.parasNfts!, ...a.newNfts!] : a.newNfts,
          parasPage: a.nextPage,
          hasMoreOnParas: a.hasMore,
          mintbaseNfts: this.state.hasMoreOnMintbase ? [...this.state.mintbaseNfts!, ...b.newNfts!] : b.newNfts,
          mintbasePage: b.nextPage,
          hasMoreOnMintbase: b.hasMore,
          nftsLoading: false,
      });
    }
    if (
      !prevProps.sharedState.global
      || !this.props.sharedState.global
      || !prevProps.sharedState.global.username
      || !this.props.sharedState.global.username
      || prevProps.sharedState.global.username !== this.props.sharedState.global.username
      || prevProps.sharedState.global.current !== this.props.sharedState.global.current
      || prevProps.sharedState.global.theme !== this.props.sharedState.global.theme
      || prevProps.sharedState.global.linkStateChanged !== this.props.sharedState.global.linkStateChanged
      || prevProps.sharedState[this.props.sharedState.global.username]?.avatarNft?.id !== this.props.sharedState[this.props.sharedState.global.username]?.avatarNft?.id
      || prevProps.sharedState[this.props.sharedState.global.username]?.avatarNftBadge?.id !== this.props.sharedState[this.props.sharedState.global.username]?.avatarNftBadge?.id
    ) {
      this.getNfts();
    }
  }

  render() {
    if (!this.props.sharedState.global) return <></>;

    const {
      current,
      username,
      theme,
      linkStateChanged,
    } = this.props.sharedState.global;

    if (!username) return <></>;

    const avatarNft = this.props.sharedState[username]?.avatarNft;
    const avatarNftBadge = this.props.sharedState[username]?.avatarNftBadge;
    const {
      parasNfts,
      mintbaseNfts,
      nCDCertificates,
      isConnected,
      isLinked,
      searchQuery,
      currentNearAccount,
      isDataLoading,
      prevUser,
      inProp,
      nftsLoading,
      hasMoreOnParas,
      hasMoreOnMintbase,
      selectedSource,
    } = this.state;

    const usedSources = [parasNfts, mintbaseNfts, nCDCertificates]
      .filter((s) => (s && !(Array.isArray(s) && s.length === 0)));
    let usedSourcesNumber: Nums = 0;
    if (usedSources.length === 1 || usedSources.length === 2 || usedSources.length === 3) usedSourcesNumber = usedSources.length;

    document.body.style.background = theme === 'DARK' ? '#15202B' : '#ffffff';

    const addNftsContainer = (nfts: INftMetadata | INftMetadata[]) => <NftContainer
      nfts={nfts}
      searchQuery={searchQuery}
      current={current}
      theme={theme}
      handleToggleAvatar={this.handleToggleAvatar}
      handleToggleAvatarBadge={this.handleToggleAvatarBadge}
      avatarNftId={avatarNft ? avatarNft.id : undefined}
      avatarNftBadgeId={avatarNftBadge ? avatarNftBadge.id : undefined}
    />;

    const addNftsSection = (
      sourseNfts: INftMetadata | INftMetadata[] | null | undefined,
      addMethod?: any,
      hasMore?: boolean
    ) => {
      if (Array.isArray(sourseNfts) && sourseNfts.length !== 0 || sourseNfts !== undefined && sourseNfts !== null) {
        return (<>
          {addMethod !== undefined && hasMore !== undefined ? (
            <>
              <InfiniteScroll
                dataLength={Array.isArray(sourseNfts) ? sourseNfts.length : 1}
                next={addMethod}
                hasMore={!nftsLoading && hasMore}
                loader=''
                scrollableTarget="nft-list"
                className='ui feed'
              >
                {addNftsContainer(sourseNfts)}
              </InfiniteScroll>
              {hasMore && <Loader style={{ display: 'block', position: 'relative', marginTop: '40px' }} inverted={theme === 'DARK'} />}
            </>
          ) : <Feed>{addNftsContainer(sourseNfts)}</Feed>}
        </>);
      }
    };

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
                {current ? 'My' : username} Nifty Collection
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
                  await dapplet.showNfts(lastUser);
                } else {
                  await dapplet.showNfts();
                  prevUser.push(username);
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
              username={username}
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

        <Card className="overlay-card" id='nft-list'>
          {
            // ------- Notifications -------
            linkStateChanged && current && !isDataLoading && (
              <Card.Content className="notification">
                Twitter account <b>@{username}</b> has been {isLinked ? 'linked to' : 'unlinked from'}{' '}
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
              : usedSourcesNumber === 0 && !avatarNft && !avatarNftBadge
                ? <Card.Content description="You don't have NFTs yet." />
                : (
                  <Card.Content style={{ padding: '1em 0' }}>
                    <Feed>
                      {avatarNft && addNftsContainer([avatarNft])}
                      {avatarNftBadge && avatarNft?.link !== avatarNftBadge.link && addNftsContainer([avatarNftBadge])}
                    </Feed>

                      {usedSourcesNumber !== 0
                        && (<Menu widths={usedSourcesNumber}>
                          {!!parasNfts?.length && <Menu.Item
                            name='Paras'
                            active={selectedSource === 'Paras'}
                            onClick={this.handleSourceSelect}
                          />}
                          {!!mintbaseNfts?.length && <Menu.Item
                            name='Mintbase'
                            active={selectedSource === 'Mintbase'}
                            onClick={this.handleSourceSelect}
                          />}
                          {(nCDCertificates && !(Array.isArray(nCDCertificates) && nCDCertificates.length === 0)) && <Menu.Item
                            name='NCD'
                            active={selectedSource === 'NCD'}
                            onClick={this.handleSourceSelect}
                          />}
                        </Menu>)}

                       <div style={{ display: this.state.selectedSource === 'Paras' ? 'block' : 'none' }}>{addNftsSection(parasNfts, this.addParasNfts, hasMoreOnParas)}</div>
                       <div style={{ display: this.state.selectedSource === 'Mintbase' ? 'block' : 'none' }}>{addNftsSection(mintbaseNfts, this.addMintbaseNfts, hasMoreOnMintbase)}</div>
                       <div style={{ display: this.state.selectedSource === 'NCD' ? 'block' : 'none' }}>{addNftsSection(nCDCertificates)}</div>

                  </Card.Content>)
          }
        </Card>
      </div>
    );
  }
}
