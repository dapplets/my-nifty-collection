import React from 'react';
import { Card, Dimmer, Feed, Header, Icon, Input, Loader, Menu, MenuItemProps } from 'semantic-ui-react';
import { CSSTransition, Transition, TransitionGroup } from 'react-transition-group';
import { bridge } from './dappletBridge';
import { INft } from './Nft';
import NftContainer from './NftContainer';
import DropdownMenu from './DropdownMenu';
import InfiniteScroll from 'react-infinite-scroll-component';

type Nums = 0 | 1 | 2 | 3;

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
  selectedSource?: string
  nftsLoading: boolean
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
  selectedSource: '',
  nftsLoading: false,
};

const limit = 10; // customized

export default class App extends React.Component<Props, State> {

  constructor(props: Props) {
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
    await this.setState({ isConnected: true, linkStateChanged: true, isDataLoading: true });
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
    await this.setState({ isConnected: false, linkStateChanged: true, isDataLoading: true });
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
    e.stopPropagation();
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
    e.stopPropagation();
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

  addNfts = async (source: 'Paras' | 'Mintbase') => {
    const nextPage = this.state[source === 'Paras' ? 'parasPage' : 'mintbasePage'] + 1;
    const newNfts: INft[] = await bridge[source === 'Paras' ? 'getParasNFTs' : 'getMintbaseNFTs'](this.state.user, nextPage, limit);
    const hasMore = !!newNfts && newNfts.length === limit + 1;
    if (hasMore) newNfts.pop();
    const filteredNewNfts = newNfts?.filter((nft: any) => nft.id !== this.state.avatar?.id && nft.id !== this.state.badge?.id);
    return { newNfts: filteredNewNfts, hasMore, nextPage };
  };

  addParasNfts = async () => {
    this.setState({ nftsLoading: true });
    const { newNfts, hasMore, nextPage } = await this.addNfts('Paras');
    this.setState({
        parasNfts: this.state.parasNfts ? [...this.state.parasNfts, ...newNfts]: newNfts,
        parasPage: nextPage,
        hasMoreOnParas: hasMore,
        nftsLoading: false,
    });
  };

  addMintbaseNfts = async () => {
    this.setState({ nftsLoading: true });
    const { newNfts, hasMore, nextPage } = await this.addNfts('Paras');
    this.setState({
        mintbaseNfts: this.state.mintbaseNfts ? [...this.state.mintbaseNfts, ...newNfts]: newNfts,
        mintbasePage: nextPage,
        hasMoreOnMintbase: hasMore,
        nftsLoading: false,
    });
  };

  async componentDidUpdate() {
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
  }

  componentDidMount() {
    bridge.onData(async (data) => {
      const { avatarNft, badgeNft } = data;
      const isConnected = await bridge.isWalletConnected();
      let currentNearAccount: string = '';
      let isLinked: boolean = false;
      if (isConnected) {
        currentNearAccount = await bridge.getCurrentNearAccount();
        const { user } = data;
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

      const selectedSource = parasNfts?.length
        ? 'Paras'
        : mintbaseNfts?.length
          ? 'Mintbase'
          : nCDCertificates?.length
            ? 'NCD'
            : '';

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
        isLinked,
        selectedSource,
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
      nftsLoading,
      hasMoreOnParas,
      hasMoreOnMintbase,
      selectedSource,
    } = this.state;

    const usedSources = [parasNfts, mintbaseNfts, nCDCertificates]
      .filter((s) => s?.length !== 0);
    let usedSourcesNumber: Nums = 0;
    if (usedSources.length === 1 || usedSources.length === 2 || usedSources.length === 3) usedSourcesNumber = usedSources.length;

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
      addMethod?: any,
      hasMore?: boolean
    ) => {
      if (sourseNfts && !!sourseNfts.length) {
        return (<>
          {addMethod !== undefined && hasMore !== undefined ? (
            <>
              <InfiniteScroll
                dataLength={sourseNfts.length}
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

        <Card className="overlay-card" id='nft-list'>
          {
            // ------- Notifications -------
            linkStateChanged && current && !isDataLoading && (
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
              : usedSourcesNumber === 0 && !avatarNft && !badgeNft
                ? <Card.Content description="You don't have NFTs yet." />
                : (
                  <Card.Content style={{ padding: '1em 0' }}>
                    <Feed>
                      {avatarNft && addNftsContainer([avatarNft])}
                      {badgeNft && avatarNft?.link !== badgeNft.link && addNftsContainer([badgeNft])}
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
                          {!!nCDCertificates?.length && <Menu.Item
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
