# TypeScript Testing for Python Algorand Contracts

## Overview

This project uses **TypeScript tests** to test **Python smart contracts**. This is the recommended approach for testing Python contracts on Algorand.

## Why TypeScript Tests for Python Contracts?

1. **Python testing framework limitations**: The `algopy_testing` framework has issues with grouped transactions and complex transaction patterns
2. **Better tooling**: AlgoKit Utils provides robust testing utilities with better LocalNet integration
3. **Official recommendation**: This is the officially supported cross-language testing approach

## Architecture

```
Python Contract → Compile → ARC-56 Spec → Generate Client → TypeScript Tests
```

### Steps:

1. **Compile Python Contract**:
   ```bash
   poetry run python -m smart_contracts build
   ```
   This generates `AlgoFreelance.arc56.json` in the artifacts directory.

2. **Generate TypeScript Client** (if needed):
   ```bash
   algokit generate client smart_contracts/artifacts/algo_freelance/AlgoFreelance.arc56.json --output tests-ts/contracts/algo_freelanceClient.ts
   ```

3. **Write TypeScript Tests**:
   Use the generated client with AlgoKit Utils testing fixtures.

## Test Structure

### Using AlgoKit Utils Fixture

```typescript
import { describe, test, beforeEach } from 'vitest';
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing';
import { AlgoFreelanceClient } from './contracts/algo_freelanceClient';

describe('My Contract', () => {
  const fixture = algorandFixture();
  
  beforeEach(fixture.beforeEach);

  test('should work', async () => {
    const { algorand, testAccount } = fixture.context;
    
    // Deploy contract
    const appClient = new AlgoFreelanceClient(
      { sender: testAccount, resolveBy: 'id', id: 0 },
      algorand.client.algod
    );

    await appClient.create.initialize({
      args: { /* your args */ },
    });

    // Test contract methods
    await appClient.myMethod({ /* args */ });
    
    // Assertions
    const state = await appClient.appClient.getGlobalState();
    expect(state.myValue?.asNumber()).toBe(123);
  });
});
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- approve_work.test.ts

# Run with watch mode
npm test -- --watch
```

## Key Differences from Python Tests

| Aspect | Python Tests | TypeScript Tests |
|--------|-------------|------------------|
| Framework | `algopy_testing` | `@algorandfoundation/algokit-utils` |
| Network | Simulated | Real LocalNet |
| Transaction Groups | Buggy | Fully supported |
| State Access | Direct | Via client methods |
| Speed | Fast | Slower (real network) |
| Reliability | Limited | Production-ready |

## Benefits

1. **Real blockchain simulation**: Tests run against actual LocalNet
2. **Better transaction handling**: Grouped transactions work correctly
3. **Production-like**: Tests behave like mainnet deployment
4. **Cross-language**: Same tests can verify Python, TypeScript, or other contracts
5. **Better debugging**: Clear error messages from real network

## Test Patterns

### Testing Inner Transactions

```typescript
test('approve_work creates NFT', async () => {
  // ... setup ...
  
  const result = await appClient.approveWork({ sender: client });
  
  // Verify inner transactions executed
  const freelancerInfo = await algorand.client.algod
    .accountInformation(freelancer.addr)
    .do();
  
  expect(freelancerInfo.assets.length).toBeGreaterThan(0);
});
```

### Testing Grouped Transactions

```typescript
test('fund requires payment', async () => {
  const appAddress = (await appClient.appClient.getAppReference()).appAddress;
  
  // Send payment
  await algorand.send.payment({
    sender: client.addr,
    receiver: appAddress,
    amount: algosdk.microAlgosToAlgos(escrowAmount),
  });
  
  // Call fund method
  await appClient.fund({}, { sender: client });
});
```

### Testing Errors

```typescript
test('should reject unauthorized caller', async () => {
  await expect(
    appClient.approveWork({ sender: wrongAccount })
  ).rejects.toThrow();
});
```

## Troubleshooting

### Tests timeout
- Increase `testTimeout` in `vitest.config.ts`
- Ensure LocalNet is running: `algokit localnet start`

### Client generation fails
- Ensure contract is compiled: `poetry run python -m smart_contracts build`
- Check ARC-56 spec exists in artifacts directory

### Transaction failures
- Check account has sufficient funds
- Verify transaction fees are adequate
- Use higher fees for inner transactions

## Migration from Python Tests

If you have existing Python tests:

1. Keep Python tests for simple unit tests (initialize, getters)
2. Migrate complex tests (grouped transactions, inner transactions) to TypeScript
3. Use TypeScript tests as integration tests
4. Python tests remain useful for quick validation during development

## Further Reading

- [AlgoKit TypeScript Utils](https://github.com/algorandfoundation/algokit-utils-ts)
- [Testing Documentation](https://developer.algorand.org/docs/get-details/algokit/utils/typescript/testing/)
- [ARC-56 Standard](https://github.com/algorandfoundation/ARCs/pull/258)

