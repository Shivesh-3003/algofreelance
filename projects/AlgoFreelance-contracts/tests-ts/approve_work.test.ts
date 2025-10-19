import { describe, test, beforeEach, expect } from 'vitest';
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing';
import { AlgoFreelanceClient, AlgoFreelanceFactory } from './contracts/algo_freelanceClient';
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount';
import algosdk from 'algosdk';

const VALID_IPFS_HASH = 'Qmaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

describe('AlgoFreelance - approve_work', () => {
  const fixture = algorandFixture();
  
  beforeEach(fixture.beforeEach);

  test('should approve work, pay freelancer, and mint NFT', async () => {
    const { algorand, testAccount } = fixture.context;
    
    // Create additional test accounts
    const client = testAccount;
    const freelancer = await fixture.context.generateAccount({ initialFunds: AlgoAmount.Algo(10) });
    
    const escrowAmount = 1_000_000;
    const jobTitle = 'Test Job';

    // Deploy the contract 
    const factory = new AlgoFreelanceFactory({
      algorandClient: algorand,
      defaultSender: client.addr,
    });

    const { appClient } = await factory.deploy({
      createParams: {
        method: 'initialize',
        args: [client.addr, freelancer.addr, BigInt(escrowAmount), jobTitle],
      },
      deployTimeParams: {},
    });

    const appAddress = (await appClient.appClient.getAppReference()).appAddress;

    // Fund the contract
    await algorand.send.payment({
      sender: client.addr,
      receiver: appAddress,
      amount: AlgoAmount.MicroAlgo(escrowAmount), // escrowAmount is already in microAlgos
    });

    await appClient.fund({}, {
      sender: client,
    });

    // Verify funded status
    let globalState = await appClient.appClient.getGlobalState();
    expect(Number(globalState.jobStatus?.asNumber())).toBe(1);

    // Submit work
    await appClient.submitWork({
      args: { ipfsHash: VALID_IPFS_HASH },
      sender: freelancer,
    });

    // Verify submitted status
    globalState = await appClient.appClient.getGlobalState();
    expect(Number(globalState.jobStatus?.asNumber())).toBe(2);
    expect(globalState.workHash?.asString()).toBe(VALID_IPFS_HASH);

    // Get freelancer balance before approval
    const freelancerInfoBefore = await algorand.client.algod.accountInformation(freelancer.addr).do();
    const freelancerBalanceBefore = BigInt(freelancerInfoBefore.amount);

    // Approve work
    const approveResult = await appClient.approveWork({
      sender: client,
      sendParams: { fee: AlgoAmount.MicroAlgo(3000) }, // Higher fee for inner transactions (0.003 ALGO)
    });

    // Verify status is completed
    globalState = await appClient.appClient.getGlobalState();
    expect(Number(globalState.jobStatus?.asNumber())).toBe(3);

    // Check freelancer received payment
    const freelancerInfoAfter = await algorand.client.algod.accountInformation(freelancer.addr).do();
    const freelancerBalanceAfter = BigInt(freelancerInfoAfter.amount);
    expect(freelancerBalanceAfter).toBeGreaterThanOrEqual(freelancerBalanceBefore + BigInt(escrowAmount) - BigInt(1000)); // Allow for fees

    // Verify NFT was created
    const createdAssets = freelancerInfoAfter.assets || [];
    expect(createdAssets.length).toBeGreaterThan(0);
    
    // Get the created asset ID from the last created asset
    const createdAssetId = createdAssets[createdAssets.length - 1]['asset-id'];
    expect(createdAssetId).toBeGreaterThan(0);

    // Verify NFT properties
    const assetInfo = await algorand.client.algod.getAssetByID(createdAssetId).do();
    expect(assetInfo.params.total).toBe(1);
    expect(assetInfo.params.decimals).toBe(0);
    expect(assetInfo.params['unit-name']).toBe('POWCERT');
    expect(assetInfo.params.name).toBe(`AlgoFreelance: ${jobTitle}`);
    expect(assetInfo.params.url).toBe(`ipfs://${VALID_IPFS_HASH}`);
    
    // Verify NFT is immutable
    expect(assetInfo.params.manager).toBeUndefined();
    expect(assetInfo.params.freeze).toBeUndefined();
    expect(assetInfo.params.clawback).toBeUndefined();
    expect(assetInfo.params.reserve).toBeUndefined();

    // Verify freelancer owns the NFT
    const freelancerAsset = createdAssets.find((a: any) => a['asset-id'] === createdAssetId);
    expect(freelancerAsset?.amount).toBe(1);
  }, 20000); // Increase timeout for blockchain operations

  test('should fail if not in Submitted status', async () => {
    const { algorand, testAccount } = fixture.context;
    const client = testAccount;
    const freelancer = await fixture.context.generateAccount({ initialFunds: AlgoAmount.Algo(10) });
    
    const escrowAmount = 1_000_000;

    // Deploy and initialize
    const factory = new AlgoFreelanceFactory({
      algorandClient: algorand,
      defaultSender: client.addr,
    });

    const { appClient } = await factory.deploy({
      createParams: {
        method: 'initialize',
        args: [client.addr, freelancer.addr, BigInt(escrowAmount), 'Test Job'],
      },
      deployTimeParams: {},
    });

    const appAddress = (await appClient.appClient.getAppReference()).appAddress;

    // Fund the contract
    await algorand.send.payment({
      sender: client.addr,
      receiver: appAddress,
      amount: AlgoAmount.MicroAlgo(escrowAmount),
    });

    await appClient.fund({}, { sender: client });

    // Try to approve without submitting work
    await expect(
      appClient.approveWork({ sender: client })
    ).rejects.toThrow();
  }, 15000);

  test('should fail if called by non-client', async () => {
    const { algorand, testAccount } = fixture.context;
    const client = testAccount;
    const freelancer = await fixture.context.generateAccount({ initialFunds: AlgoAmount.Algo(10) });
    
    const escrowAmount = 1_000_000;

    // Deploy, initialize, fund, and submit work
    const factory = new AlgoFreelanceFactory({
      algorandClient: algorand,
      defaultSender: client.addr,
    });

    const { appClient } = await factory.deploy({
      createParams: {
        method: 'initialize',
        args: [client.addr, freelancer.addr, BigInt(escrowAmount), 'Test Job'],
      },
      deployTimeParams: {},
    });

    const appAddress = (await appClient.appClient.getAppReference()).appAddress;

    await algorand.send.payment({
      sender: client.addr,
      receiver: appAddress,
      amount: AlgoAmount.MicroAlgo(escrowAmount),
    });

    await appClient.fund({}, { sender: client });
    await appClient.submitWork({
      args: { ipfsHash: VALID_IPFS_HASH },
      sender: freelancer,
    });

    // Try to approve as freelancer
    await expect(
      appClient.approveWork({ sender: freelancer })
    ).rejects.toThrow();
  }, 15000);
});

