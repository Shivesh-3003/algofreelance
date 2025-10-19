import { describe, it, beforeEach, expect } from 'vitest';
import { TestExecutionContext, Account } from '@algorandfoundation/algorand-typescript-testing';
import { AlgoFreelance } from './contracts/algo_freelanceClient';

const VALID_IPFS_HASH = 'Qmaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

describe('approve_work', () => {
  let ctx: TestExecutionContext;
  let client: Account;
  let freelancer: Account;
  let contract: AlgoFreelance;
  const escrowAmount = 1_000_000;
  const jobTitle = 'Test Job';

  beforeEach(() => {
    ctx = new TestExecutionContext();
    client = ctx.any.account();
    freelancer = ctx.any.account();
    contract = new AlgoFreelance({
      appId: 1,
      sender: client,
      algod: ctx.algod,
      indexer: ctx.indexer,
    });
  });

  it('should approve work, pay freelancer, and mint NFT', async () => {
    // Step 1: Initialize the contract
    await contract.appClient.create.initialize(
      {
        client_address: client.addr,
        freelancer_address: freelancer.addr,
        escrow_amount: BigInt(escrowAmount),
        job_title: jobTitle,
      },
      { sendParams: { fee: 1000 } }
    );

    // Step 2: Fund the contract
    const appAddress = contract.appClient.appAddress;
    const payment = ctx.any.txn.payment({
      sender: client,
      receiver: appAddress,
      amount: escrowAmount,
    });
    
    await contract.fund(payment, { sender: client });

    // Verify funded status
    let globalState = await contract.appClient.getGlobalState();
    expect(globalState.job_status?.asNumber()).toEqual(1);

    // Step 3: Submit work
    await contract.submit_work(
      { ipfs_hash: VALID_IPFS_HASH },
      { sender: freelancer }
    );

    // Verify submitted status
    globalState = await contract.appClient.getGlobalState();
    expect(globalState.job_status?.asNumber()).toEqual(2);
    expect(globalState.work_hash?.asString()).toEqual(VALID_IPFS_HASH);

    // Step 4: Get freelancer balance before approval
    const freelancerBalanceBefore = await ctx.ledger.getAccount(freelancer.addr).amount;

    // Step 5: Approve work
    const approveResult = await contract.approve_work({ sender: client });

    // Step 6: Verify the results
    // Check status is completed
    globalState = await contract.appClient.getGlobalState();
    expect(globalState.job_status?.asNumber()).toEqual(3);

    // Check freelancer received payment
    const freelancerBalanceAfter = await ctx.ledger.getAccount(freelancer.addr).amount;
    expect(freelancerBalanceAfter).toEqual(freelancerBalanceBefore + BigInt(escrowAmount));

    // Check NFT was created
    const createdAssetId = approveResult.tx.createdAssetId;
    expect(createdAssetId).toBeGreaterThan(0);

    // Verify NFT properties
    const assetInfo = await ctx.ledger.getAsset(createdAssetId);
    expect(assetInfo.total).toEqual(1);
    expect(assetInfo.decimals).toEqual(0);
    expect(assetInfo.unitName).toEqual('POWCERT');
    expect(assetInfo.name).toEqual(`AlgoFreelance: ${jobTitle}`);
    expect(assetInfo.url).toEqual(`ipfs://${VALID_IPFS_HASH}`);
    
    // Verify NFT is immutable (no manager, freeze, clawback, reserve)
    expect(assetInfo.manager).toBeUndefined();
    expect(assetInfo.freeze).toBeUndefined();
    expect(assetInfo.clawback).toBeUndefined();
    expect(assetInfo.reserve).toBeUndefined();

    // Verify freelancer owns the NFT
    const freelancerAssets = await ctx.ledger.getAccountAssets(freelancer.addr);
    expect(freelancerAssets[createdAssetId]).toEqual(1);
  });

  it('should fail if not in Submitted status', async () => {
    // Initialize and fund the contract
    await contract.appClient.create.initialize(
      {
        client_address: client.addr,
        freelancer_address: freelancer.addr,
        escrow_amount: BigInt(escrowAmount),
        job_title: jobTitle,
      },
      { sendParams: { fee: 1000 } }
    );

    const appAddress = contract.appClient.appAddress;
    const payment = ctx.any.txn.payment({
      sender: client,
      receiver: appAddress,
      amount: escrowAmount,
    });
    
    await contract.fund(payment, { sender: client });

    // Try to approve without submitting work first
    await expect(
      contract.approve_work({ sender: client })
    ).rejects.toThrow(/Job not in Submitted status/);
  });

  it('should fail if called by non-client', async () => {
    // Setup: Initialize, fund, and submit work
    await contract.appClient.create.initialize(
      {
        client_address: client.addr,
        freelancer_address: freelancer.addr,
        escrow_amount: BigInt(escrowAmount),
        job_title: jobTitle,
      },
      { sendParams: { fee: 1000 } }
    );

    const appAddress = contract.appClient.appAddress;
    const payment = ctx.any.txn.payment({
      sender: client,
      receiver: appAddress,
      amount: escrowAmount,
    });
    
    await contract.fund(payment, { sender: client });
    await contract.submit_work(
      { ipfs_hash: VALID_IPFS_HASH },
      { sender: freelancer }
    );

    // Try to approve as freelancer instead of client
    await expect(
      contract.approve_work({ sender: freelancer })
    ).rejects.toThrow(/Only client can approve work/);
  });

  it('should fail on double approval', async () => {
    // Setup: Initialize, fund, submit, and approve once
    await contract.appClient.create.initialize(
      {
        client_address: client.addr,
        freelancer_address: freelancer.addr,
        escrow_amount: BigInt(escrowAmount),
        job_title: jobTitle,
      },
      { sendParams: { fee: 1000 } }
    );

    const appAddress = contract.appClient.appAddress;
    const payment = ctx.any.txn.payment({
      sender: client,
      receiver: appAddress,
      amount: escrowAmount,
    });
    
    await contract.fund(payment, { sender: client });
    await contract.submit_work(
      { ipfs_hash: VALID_IPFS_HASH },
      { sender: freelancer }
    );
    
    // First approval should succeed
    await contract.approve_work({ sender: client });

    // Verify status is completed
    const globalState = await contract.appClient.getGlobalState();
    expect(globalState.job_status?.asNumber()).toEqual(3);

    // Second approval should fail
    await expect(
      contract.approve_work({ sender: client })
    ).rejects.toThrow(/Job not in Submitted status/);
  });
});

