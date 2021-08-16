import 'regenerator-runtime/runtime';

let near;
let contract;
let accountId;

beforeAll(async function () {
  near = await nearlib.connect(nearConfig);
  accountId = nearConfig.contractName;
  contract = await near.loadContract(nearConfig.contractName, {
    viewMethods: ['getNftId', 'getNftBadgeId'],
    changeMethods: ['setNftId', 'removeNftId', 'clearAll', 'setNftBadgeId', 'removeNftBadgeId', 'clearAllBadges'],
    sender: accountId,
  });
});

it('Adds NFT ID for Twitter Account ID', async () => {
  await contract.setNftId({ twitterAcc: 'twitter.com:tester1', id: '3' });
  await contract.setNftId({ twitterAcc: 'twitter.com:tester2', id: '5' });

  const avaNftId1 = await contract.getNftId({ twitterAcc: 'twitter.com:tester1' });
  const avaNftId2 = await contract.getNftId({ twitterAcc: 'twitter.com:tester2' });

  expect(avaNftId1).toBe('3');
  expect(avaNftId2).toBe('5');
});

it('Adds Badge NFT ID for Twitter Account ID', async () => {
  await contract.setNftBadgeId({ twitterAcc: 'twitter.com:tester1', id: '3' });
  await contract.setNftBadgeId({ twitterAcc: 'twitter.com:tester2', id: '5' });

  const avaNftId1 = await contract.getNftBadgeId({ twitterAcc: 'twitter.com:tester1' });
  const avaNftId2 = await contract.getNftBadgeId({ twitterAcc: 'twitter.com:tester2' });

  expect(avaNftId1).toBe('3');
  expect(avaNftId2).toBe('5');
});

it('Removes NFT ID for Twitter Account ID', async () => {
  await contract.setNftId({ twitterAcc: 'twitter.com:tester1', id: '3' });
  await contract.setNftId({ twitterAcc: 'twitter.com:tester2', id: '5' });

  await contract.removeNftId({ twitterAcc: 'twitter.com:tester1' });
  await contract.removeNftId({ twitterAcc: 'twitter.com:tester2' });

  const avaNftId1 = await contract.getNftId({ twitterAcc: 'twitter.com:tester1' });
  const avaNftId2 = await contract.getNftId({ twitterAcc: 'twitter.com:tester2' });

  expect(avaNftId1).toBeNull();
  expect(avaNftId2).toBeNull();
});

it('Removes Badge NFT ID for Twitter Account ID', async () => {
  await contract.setNftBadgeId({ twitterAcc: 'twitter.com:tester1', id: '3' });
  await contract.setNftBadgeId({ twitterAcc: 'twitter.com:tester2', id: '5' });

  await contract.removeNftBadgeId({ twitterAcc: 'twitter.com:tester1' });
  await contract.removeNftBadgeId({ twitterAcc: 'twitter.com:tester2' });

  const avaNftId1 = await contract.getNftBadgeId({ twitterAcc: 'twitter.com:tester1' });
  const avaNftId2 = await contract.getNftBadgeId({ twitterAcc: 'twitter.com:tester2' });

  expect(avaNftId1).toBeNull();
  expect(avaNftId2).toBeNull();
});

it('clears all', async () => {
  await contract.setNftId({ twitterAcc: 'twitter.com:tester1', id: '3' });
  await contract.setNftId({ twitterAcc: 'twitter.com:tester2', id: '5' });

  await contract.clearAll();

  const avaNftId1 = await contract.getNftId({ twitterAcc: 'twitter.com:tester1' });
  const avaNftId2 = await contract.getNftId({ twitterAcc: 'twitter.com:tester2' });

  expect(avaNftId1).toBeNull();
  expect(avaNftId2).toBeNull();
});

it('clears all Badges', async () => {
  await contract.setNftBadgeId({ twitterAcc: 'twitter.com:tester1', id: '3' });
  await contract.setNftBadgeId({ twitterAcc: 'twitter.com:tester2', id: '5' });

  await contract.clearAllBadges();

  const avaNftId1 = await contract.getNftBadgeId({ twitterAcc: 'twitter.com:tester1' });
  const avaNftId2 = await contract.getNftBadgeId({ twitterAcc: 'twitter.com:tester2' });

  expect(avaNftId1).toBeNull();
  expect(avaNftId2).toBeNull();
});
