import 'regenerator-runtime/runtime';

let near;
let contract;
let accountId;

beforeAll(async function () {
  near = await nearlib.connect(nearConfig);
  accountId = nearConfig.contractName;
  contract = await near.loadContract(nearConfig.contractName, {
    viewMethods: ['getExternalAccounts', 'getNearAccounts'],
    changeMethods: ['addExternalAccount', 'removeExternalAccount', 'clearAll'],
    sender: accountId,
  });
});

it('adds external account', async () => {
  await contract.addExternalAccount({ account: 'twitter.com:tester1' });
  await contract.addExternalAccount({ account: 'twitter.com:tester2' });

  const externals = await contract.getExternalAccounts({ near: accountId });
  const internals1 = await contract.getNearAccounts({ account: 'twitter.com:tester1' });
  const internals2 = await contract.getNearAccounts({ account: 'twitter.com:tester2' });

  expect(externals).toMatchObject(['twitter.com:tester1', 'twitter.com:tester2']);
  expect(internals1).toMatchObject([accountId]);
  expect(internals2).toMatchObject([accountId]);
});

it('removes external account', async () => {
  await contract.removeExternalAccount({ account: 'twitter.com:tester1' });
  await contract.removeExternalAccount({ account: 'twitter.com:tester2' });

  const externals = await contract.getExternalAccounts({ near: accountId });
  const internals1 = await contract.getNearAccounts({ account: 'twitter.com:tester1' });
  const internals2 = await contract.getNearAccounts({ account: 'twitter.com:tester2' });

  expect(externals).toMatchObject([]);
  expect(internals1).toMatchObject([]);
  expect(internals2).toMatchObject([]);
});

it('clears all', async () => {
  await contract.addExternalAccount({ account: 'twitter.com:tester1' });
  await contract.addExternalAccount({ account: 'twitter.com:tester2' });

  await contract.clearAll();

  const externals = await contract.getExternalAccounts({ near: accountId });
  const internals1 = await contract.getNearAccounts({ account: 'twitter.com:tester1' });
  const internals2 = await contract.getNearAccounts({ account: 'twitter.com:tester2' });

  expect(externals).toMatchObject([]);
  expect(internals1).toMatchObject([]);
  expect(internals2).toMatchObject([]);
});
