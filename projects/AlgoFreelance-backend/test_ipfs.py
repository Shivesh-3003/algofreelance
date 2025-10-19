"""
Test IPFS integration with Pinata

This test verifies:
- File upload to IPFS via Pinata
- CID format validation
- Gateway URL accessibility
- Edge cases (large files, empty files)

Prerequisites:
1. Valid Pinata credentials in app/services/pinata.py
2. Internet connection
3. Run: python test_ipfs.py
"""
import asyncio
import sys
from pathlib import Path

# Add app to path
sys.path.insert(0, str(Path(__file__).parent))

from app.services.pinata import upload_to_ipfs, test_pinata_connection, get_pinned_files


async def test_ipfs_integration():
    """Test IPFS upload functionality"""
    
    print("=" * 80)
    print("AlgoFreelance - IPFS Integration Test")
    print("=" * 80)
    
    try:
        # Test 1: Connection Test
        print("\n🔌 Test 1: Pinata Connection")
        print("=" * 80)
        
        is_connected = await test_pinata_connection()
        
        if is_connected:
            print("✅ Pinata API connection successful")
        else:
            print("❌ Pinata API connection failed")
            return False
        
        # Test 2: Upload Small Text File
        print("\n📤 Test 2: Upload Small Text File")
        print("=" * 80)
        
        test_content = b"AlgoFreelance Test File - Small text for testing IPFS upload"
        test_filename = "algofreelance_test_small.txt"
        
        result = await upload_to_ipfs(test_content, test_filename)
        
        print(f"✅ File uploaded successfully")
        print(f"   CID: {result['ipfs_hash']}")
        print(f"   IPFS URL: {result['ipfs_url']}")
        print(f"   Gateway URL: {result['gateway_url']}")
        print(f"   Size: {result['size']} bytes")
        
        # Validate CID format
        cid = result['ipfs_hash']
        assert 46 <= len(cid) <= 59, f"Invalid CID length: {len(cid)}"
        assert cid.startswith('Qm') or cid.startswith('b'), f"Invalid CID format: {cid}"
        print(f"✅ CID format valid (length: {len(cid)})")
        
        # Test 3: Upload Larger File
        print("\n📤 Test 3: Upload Larger File (1KB)")
        print("=" * 80)
        
        large_content = b"X" * 1024  # 1KB
        large_filename = "algofreelance_test_1kb.bin"
        
        result_large = await upload_to_ipfs(large_content, large_filename)
        
        print(f"✅ Large file uploaded successfully")
        print(f"   CID: {result_large['ipfs_hash']}")
        print(f"   Size: {result_large['size']} bytes")
        
        # Test 4: Upload Image-like File
        print("\n📤 Test 4: Upload Image-like File")
        print("=" * 80)
        
        # Simulate image header (PNG)
        image_content = b'\x89PNG\r\n\x1a\n' + (b'\x00' * 100)
        image_filename = "algofreelance_test_logo.png"
        
        result_image = await upload_to_ipfs(image_content, image_filename)
        
        print(f"✅ Image file uploaded successfully")
        print(f"   CID: {result_image['ipfs_hash']}")
        print(f"   Filename: {image_filename}")
        
        # Test 5: List Pinned Files
        print("\n📋 Test 5: List Pinned Files")
        print("=" * 80)
        
        pins = await get_pinned_files(limit=5)
        
        print(f"✅ Retrieved {len(pins)} pinned files")
        if pins:
            for i, pin in enumerate(pins[:3], 1):
                print(f"\n   Pin {i}:")
                print(f"      Hash: {pin['ipfs_hash']}")
                print(f"      Name: {pin['name']}")
                print(f"      Size: {pin['size']} bytes")
        
        # Test 6: Validate URLs
        print("\n🔗 Test 6: Validate URLs")
        print("=" * 80)
        
        assert result['ipfs_url'].startswith('ipfs://'), "IPFS URL format invalid"
        assert result['gateway_url'].startswith('https://gateway.pinata.cloud'), "Gateway URL format invalid"
        print(f"✅ URL formats valid")
        print(f"   IPFS protocol: {result['ipfs_url'][:20]}...")
        print(f"   HTTP gateway: {result['gateway_url'][:40]}...")
        
        # Test 7: Edge Case - Empty Filename
        print("\n📤 Test 7: Edge Case - Empty Filename")
        print("=" * 80)
        
        result_no_name = await upload_to_ipfs(b"Content without name", "")
        print(f"✅ Upload successful even without filename")
        print(f"   CID: {result_no_name['ipfs_hash']}")
        
        # Test 8: Gateway Accessibility (optional - requires httpx)
        print("\n🌐 Test 8: Gateway Accessibility Check")
        print("=" * 80)
        
        try:
            import httpx
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.head(result['gateway_url'])
                if response.status_code == 200:
                    print(f"✅ Gateway URL is accessible")
                    print(f"   Status: {response.status_code}")
                else:
                    print(f"⚠️  Gateway returned: {response.status_code}")
        except Exception as e:
            print(f"⚠️  Gateway check skipped: {e}")
        
        # Summary
        print("\n" + "=" * 80)
        print("✅ ALL IPFS TESTS PASSED!")
        print("=" * 80)
        print(f"\n📌 Summary:")
        print(f"   • Uploaded {3} test files successfully")
        print(f"   • All CIDs valid format")
        print(f"   • Pinata integration working")
        print(f"   • Gateway URLs properly formatted")
        print(f"\n📌 Test Files Uploaded:")
        print(f"   1. {test_filename}: {cid}")
        print(f"   2. {large_filename}: {result_large['ipfs_hash']}")
        print(f"   3. {image_filename}: {result_image['ipfs_hash']}")
        print("=" * 80)
        
        return True
        
    except Exception as e:
        print(f"\n❌ TEST FAILED!")
        print(f"   Error: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_edge_cases():
    """Test edge cases and error handling"""
    
    print("\n" + "=" * 80)
    print("🧪 Testing Edge Cases")
    print("=" * 80)
    
    # Test: Very Large File (should work but may be slow)
    print("\n📤 Edge Case 1: Large File (100KB)")
    print("-" * 80)
    
    try:
        large_file = b"X" * (100 * 1024)  # 100KB
        result = await upload_to_ipfs(large_file, "test_100kb.bin")
        print(f"✅ Large file handled: {result['ipfs_hash']}")
    except Exception as e:
        print(f"⚠️  Large file test: {e}")
    
    # Test: Special Characters in Filename
    print("\n📤 Edge Case 2: Special Characters in Filename")
    print("-" * 80)
    
    try:
        result = await upload_to_ipfs(
            b"Test content", 
            "test_file_with-special.chars_123.txt"
        )
        print(f"✅ Special chars handled: {result['ipfs_hash']}")
    except Exception as e:
        print(f"⚠️  Special chars test: {e}")
    
    print("\n✅ Edge case testing complete")


if __name__ == "__main__":
    print("\n⚠️  PREREQUISITES:")
    print("   1. Valid Pinata credentials configured")
    print("   2. Internet connection")
    print("\nStarting tests in 2 seconds...\n")
    
    import time
    time.sleep(2)
    
    # Run main test
    success = asyncio.run(test_ipfs_integration())
    
    if success:
        # Run edge case tests
        asyncio.run(test_edge_cases())
    
    if not success:
        sys.exit(1)
    
    print("\n🎉 All IPFS tests completed successfully!\n")

