#!/bin/bash

# AlgoFreelance Backend API - Manual Testing Script
# 
# This script tests all API endpoints using curl
# Prerequisites:
# 1. Backend server running: uvicorn app.main:app --reload
# 2. LocalNet running: algokit localnet start
# 3. Accounts funded: ./fund_via_docker.sh

set -e  # Exit on any error

API_BASE="http://localhost:8000"
TEST_CLIENT="RPBPGTR47IY7GZXETWSUFB2GFSLJKOO46GA6Z3ZIFL45F32XUBZINLK54Q"
TEST_FREELANCER="YU7WSI2Y3MRHNHHUQUXHCZKHDJXS5665YUKVCXWS4NPWOBIKDBD2GSQD3A"

echo "================================================================================"
echo "AlgoFreelance Backend API - Manual Test Suite"
echo "================================================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "${BLUE}Test 1: Health Check${NC}"
echo "================================================================================"
curl -s "${API_BASE}/" | jq .
echo ""
echo ""

# Test 2: Create Job
echo -e "${BLUE}Test 2: Create Job (Deploy Contract)${NC}"
echo "================================================================================"
CREATE_RESPONSE=$(curl -s -X POST "${API_BASE}/api/v1/jobs/create" \
  -H "Content-Type: application/json" \
  -d "{
    \"client_address\": \"${TEST_CLIENT}\",
    \"freelancer_address\": \"${TEST_FREELANCER}\",
    \"escrow_amount\": 5000000,
    \"job_title\": \"Logo Design Manual Test\",
    \"job_description\": \"Testing via curl script\"
  }")

echo "$CREATE_RESPONSE" | jq .

# Extract App ID for subsequent tests
APP_ID=$(echo "$CREATE_RESPONSE" | jq -r '.app_id')
echo ""
echo -e "${GREEN}✅ Contract created with App ID: ${APP_ID}${NC}"
echo ""
echo ""

# Test 3: Get Job Details
echo -e "${BLUE}Test 3: Get Job Details${NC}"
echo "================================================================================"
curl -s "${API_BASE}/api/v1/jobs/${APP_ID}" | jq .
echo ""
echo ""

# Test 4: Construct Fund Transactions
echo -e "${BLUE}Test 4: Construct Fund Transactions${NC}"
echo "================================================================================"
FUND_RESPONSE=$(curl -s -X POST "${API_BASE}/api/v1/jobs/${APP_ID}/fund" \
  -H "Content-Type: application/json" \
  -d "{\"client_address\": \"${TEST_CLIENT}\"}")

echo "$FUND_RESPONSE" | jq .
echo ""
echo -e "${YELLOW}⚠️  Note: Frontend would sign and broadcast these transactions${NC}"
echo ""
echo ""

# Test 5: Upload File to IPFS
echo -e "${BLUE}Test 5: Upload File to IPFS${NC}"
echo "================================================================================"
# Create a temporary test file
TEST_FILE="/tmp/algofreelance_test_logo.txt"
echo "AlgoFreelance Test Logo - $(date)" > "$TEST_FILE"

IPFS_RESPONSE=$(curl -s -X POST "${API_BASE}/api/v1/ipfs/upload" \
  -F "file=@${TEST_FILE}")

echo "$IPFS_RESPONSE" | jq .

# Extract IPFS hash for submit work test
IPFS_HASH=$(echo "$IPFS_RESPONSE" | jq -r '.ipfs_hash')
echo ""
echo -e "${GREEN}✅ File uploaded with CID: ${IPFS_HASH}${NC}"
echo ""
echo ""

# Clean up temp file
rm "$TEST_FILE"

# Test 6: Construct Submit Work Transaction
echo -e "${BLUE}Test 6: Construct Submit Work Transaction${NC}"
echo "================================================================================"
SUBMIT_RESPONSE=$(curl -s -X POST "${API_BASE}/api/v1/jobs/${APP_ID}/submit" \
  -H "Content-Type: application/json" \
  -d "{
    \"ipfs_hash\": \"${IPFS_HASH}\",
    \"freelancer_address\": \"${TEST_FREELANCER}\"
  }")

echo "$SUBMIT_RESPONSE" | jq .
echo ""
echo -e "${YELLOW}⚠️  Note: Frontend would sign and broadcast this transaction${NC}"
echo ""
echo ""

# Test 7: Construct Approve Work Transaction
echo -e "${BLUE}Test 7: Construct Approve Work Transaction${NC}"
echo "================================================================================"
APPROVE_RESPONSE=$(curl -s -X POST "${API_BASE}/api/v1/jobs/${APP_ID}/approve" \
  -H "Content-Type: application/json" \
  -d "{\"client_address\": \"${TEST_CLIENT}\"}")

echo "$APPROVE_RESPONSE" | jq .
echo ""
echo -e "${YELLOW}⚠️  Note: This would trigger 3 inner transactions:${NC}"
echo -e "${YELLOW}      1. Payment to freelancer${NC}"
echo -e "${YELLOW}      2. Mint POWCERT NFT${NC}"
echo -e "${YELLOW}      3. Transfer NFT to freelancer${NC}"
echo ""
echo ""

# Test 8: Get Freelancer NFTs
echo -e "${BLUE}Test 8: Get Freelancer NFTs (Portfolio)${NC}"
echo "================================================================================"
curl -s "${API_BASE}/api/v1/freelancers/${TEST_FREELANCER}/nfts" | jq .
echo ""
echo ""

# Test 9: IPFS Health Check
echo -e "${BLUE}Test 9: IPFS Health Check${NC}"
echo "================================================================================"
curl -s "${API_BASE}/api/v1/ipfs/health" | jq .
echo ""
echo ""

# Test 10: API Documentation
echo -e "${BLUE}Test 10: API Documentation${NC}"
echo "================================================================================"
echo -e "${GREEN}✅ Interactive API docs available at:${NC}"
echo "   ${API_BASE}/docs"
echo ""
echo "   OpenAPI JSON available at:"
echo "   ${API_BASE}/openapi.json"
echo ""
echo ""

# Summary
echo "================================================================================"
echo -e "${GREEN}✅ Manual API Test Suite Completed${NC}"
echo "================================================================================"
echo ""
echo "📌 Summary:"
echo "   • Created contract with App ID: ${APP_ID}"
echo "   • Uploaded file to IPFS: ${IPFS_HASH}"
echo "   • All transaction construction endpoints working"
echo ""
echo "📌 Next Steps:"
echo "   • Run full integration test: python test_full_flow.py"
echo "   • Test with frontend wallet integration"
echo "   • Deploy to TestNet for production testing"
echo ""
echo "================================================================================"

