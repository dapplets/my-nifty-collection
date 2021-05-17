import { INftMetadata, ITokenMetadata } from './types';

export const contract = Core.contract('near', 'dev-1618391705030-8760988', {
  viewMethods: ['getExternalAccounts', 'getNearAccounts'],
  changeMethods: ['addExternalAccount', 'removeExternalAccount', 'clearAll'],
});

// https://github.com/dapplets/core-contracts/tree/ncd/nft-simple
const nftContract = Core.contract('near', 'dev-1619612403093-1786669', {
  viewMethods: ['nft_metadata', 'nft_tokens_for_owner', 'nft_token'],
  changeMethods: [],
});

const fetchNftsByNearAcc = async (
  accounts: string | string[],
  _nftContract: any,
): Promise<INftMetadata[]> => {
  let tokenIds: string[];
  try {
    if (typeof accounts === 'string') {
      tokenIds = await _nftContract.nft_tokens_for_owner({ account_id: accounts });
    } else {
      const accountsTokenIds = await Promise.all(
        accounts.map(
          (account: string): Promise<string[]> =>
            _nftContract.nft_tokens_for_owner({ account_id: account }),
        ),
      );
      tokenIds = accountsTokenIds.flat();
    }
  } catch (err) {
    console.log(
      'Cannot get tokens of NEAR accounts:',
      accounts,
      'in method _fetchNftsByNearAcc.',
      err,
    );
    tokenIds = [];
  }
  if (!tokenIds.length) return [];

  let tokenMetadatas: ITokenMetadata[];
  try {
    tokenMetadatas = await Promise.all(
      tokenIds.map((x) => _nftContract.nft_token({ token_id: x })),
    );
  } catch (err) {
    console.log('Cannot get tokenMetadatas from _nftContract by method nft_token().', err);
    tokenMetadatas = [];
  }

  let image: { DARK: string; LIGHT: string };
  try {
    const { icon, reference } = await _nftContract.nft_metadata();
    const res = await fetch(reference);
    const parsedImages = await res.json();
    image = {
      DARK: parsedImages.icon_dark,
      LIGHT: parsedImages.icon_light,
    };
  } catch (err) {
    console.log('Cannot get icon from NFTMetadata of nftContract in method nft_metadata().', err);
  }

  return tokenMetadatas
    .map(
      (tokenMetadata: ITokenMetadata): INftMetadata => {
        const { title, description, media, issued_at, extra } = tokenMetadata.metadata;
        let parsedExtra: {
          program: string;
          cohort: string;
          owner: string;
        };
        try {
          parsedExtra = JSON.parse(extra);
        } catch (e) {
          console.error('Cannot parse tokenMetadatas in method _fetchNftsByNearAcc.', e);
        }
        return {
          name: title,
          description,
          image,
          link: media,
          issued_at,
          program: parsedExtra?.program,
          cohort: parsedExtra?.cohort,
          owner: parsedExtra?.owner,
        };
      },
    )
    .sort((a: { issued_at: string }, b: { issued_at: string }): number => {
      const x = new Date(a.issued_at);
      const y = new Date(b.issued_at);
      return y.valueOf() - x.valueOf();
    });
};

export default async (authorUsername?: string): Promise<INftMetadata[]> => {
  if (!authorUsername) return;

  let nearAccounts: string[];
  try {
    nearAccounts = await contract.getNearAccounts({ account: authorUsername });
  } catch (err) {
    console.log(
      'Cannot get NEAR accounts by authorUsername:',
      authorUsername,
      'in method _getNfts.',
      err,
    );
  }
  if (nearAccounts === undefined || !nearAccounts.length) return;
  let nfts: INftMetadata[];
  try {
    nfts = await fetchNftsByNearAcc(nearAccounts, nftContract);
  } catch (err) {
    console.log('Cannot get NFTs of NEAR accounts:', nearAccounts, 'in method _getNfts.', err);
  }
  if (nfts === undefined || !nfts.length) return;
  return nfts;
};
