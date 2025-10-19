#!/bin/bash
# Fund test accounts using goal CLI inside the LocalNet container

echo "Funding test accounts via LocalNet container..."
echo "================================================================"

DEPLOYER="RPBPGTR47IY7GZXETWSUFB2GFSLJKOO46GA6Z3ZIFL45F32XUBZINLK54Q"
FREELANCER="YU7WSI2Y3MRHNHHUQUXHCZKHDJXS5665YUKVCXWS4NPWOBIKDBD2GSQD3A"

# Get the first account from LocalNet (should be pre-funded)
echo "Getting dispenser account from LocalNet..."
DISPENSER=$(docker exec algokit_sandbox_algod goal account list | grep -oE '[A-Z2-7]{58}' | head -1)

if [ -z "$DISPENSER" ]; then
    echo "❌ Could not find dispenser account in LocalNet"
    echo "Try running: algokit localnet reset"
    exit 1
fi

echo "✓ Dispenser: $DISPENSER"

# Fund deployer
echo ""
echo "Funding deployer ($DEPLOYER)..."
docker exec algokit_sandbox_algod goal clerk send \
    --from "$DISPENSER" \
    --to "$DEPLOYER" \
    --amount 100000000 \
    --datadir /algod/data

# Fund freelancer  
echo ""
echo "Funding freelancer ($FREELANCER)..."
docker exec algokit_sandbox_algod goal clerk send \
    --from "$DISPENSER" \
    --to "$FREELANCER" \
    --amount 10000000 \
    --datadir /algod/data

echo ""
echo "================================================================"
echo "✓ Funding complete!"
echo "Run the integration tests with: cd projects/AlgoFreelance-backend && python test_integration.py"

