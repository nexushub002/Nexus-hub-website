// Test script to check inquiry functionality
import fetch from 'node-fetch';

const testInquiry = async () => {
  try {
    console.log('Testing inquiry API...');
    
    // Test data
    const inquiryData = {
      productId: "test-product-123",
      productName: "Test Product",
      sellerId: "test-seller-123",
      sellerCompanyName: "Test Company",
      buyerId: "test-buyer-123",
      buyerName: "Test Buyer",
      buyerEmail: "buyer@test.com",
      buyerPhone: "1234567890",
      quantity: "10",
      unit: "pieces",
      message: "I am interested in this product",
      requirements: "No special requirements"
    };
    
    console.log('Sending inquiry:', inquiryData);
    
    // Send inquiry
    const response = await fetch('http://localhost:3000/api/inquiries/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inquiryData)
    });
    
    const result = await response.json();
    console.log('Response:', result);
    
    if (result.success) {
      console.log('✅ Inquiry sent successfully!');
      
      // Now test fetching inquiries for the seller
      console.log('\nFetching inquiries for seller...');
      const fetchResponse = await fetch(`http://localhost:3000/api/inquiries/seller/test-seller-123`);
      const fetchResult = await fetchResponse.json();
      
      console.log('Fetch response:', fetchResult);
      
      if (fetchResult.success && fetchResult.inquiries.length > 0) {
        console.log('✅ Inquiry found in seller dashboard!');
      } else {
        console.log('❌ Inquiry not found in seller dashboard');
      }
    } else {
      console.log('❌ Failed to send inquiry:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testInquiry();
