# Python Fallback Ad Generator - Implementation Summary

## Overview
A Python-based fallback system has been implemented to ensure proper ad generation for **services** and **products** when the main ad generation fails. This system properly differentiates between service-based and product-based businesses, generating appropriate ad copy for each.

## Files Created

### 1. `backend/ad_generator_fallback.py`
- **Purpose**: Core Python script for ad generation
- **Features**:
  - Automatic business type detection (product, service, emergency, local)
  - Service-specific ad copy generation
  - Product-specific ad copy generation
  - Emergency ad generation
  - Local ad generation
  - DKI (Dynamic Keyword Insertion) support
  - RSA (Responsive Search Ads) support
  - Call-Only ad support
  - URL generation and display path creation

### 2. `backend/ad_generator_api.py`
- **Purpose**: FastAPI server for ad generation
- **Features**:
  - RESTful API endpoint (`POST /generate`)
  - Health check endpoint
  - CORS support for frontend integration
  - Error handling and validation

### 3. `src/utils/adGeneratorFallback.ts`
- **Purpose**: TypeScript utility to call Python API
- **Features**:
  - Python API integration
  - Local fallback when Python API unavailable
  - Type conversion between Python and TypeScript formats
  - Business type detection

### 4. `backend/README_AD_GENERATOR.md`
- **Purpose**: Documentation for the Python fallback system
- **Contents**:
  - Usage instructions
  - API documentation
  - Integration guide
  - Testing instructions

## Integration Points

### Frontend Integration
The Python fallback is integrated into `src/components/AdsBuilder.tsx`:

1. **RSA Fallback** (`generateFallbackRSA`):
   - Tries Python API first
   - Falls back to local TypeScript generation if Python unavailable
   - Properly handles service vs product differentiation

2. **DKI Fallback** (`generateFallbackDKI`):
   - Uses Python API for proper DKI formatting
   - Falls back to local generation with DKI conversion
   - Maintains `{KeyWord:Default Text}` syntax

3. **Call-Only Fallback** (`generateFallbackCallOnly`):
   - Uses Python API for call-only ad generation
   - Falls back to local generation
   - Handles phone number formatting

## Business Type Detection

The system automatically detects business type based on:

### Product Indicators
- Keywords: "buy", "shop", "purchase", "product", "order", "cart", "price", "sale"
- Industries: "product", "products", "shop", "store", "retail", "ecommerce"

### Service Indicators
- Keywords: "service", "repair", "install", "fix", "hire", "book", "schedule"
- Industries: "plumbing", "electrical", "hvac", "legal", "medical", "cleaning"

### Emergency Indicators
- Keywords: "emergency", "24/7", "urgent", "now", "immediate", "asap"

### Local Indicators
- Keywords: "near me", "nearby", "local", "in", "around"

## Ad Copy Differences

### Service Ads
- **Headlines**: Professional, trust-focused, licensing emphasis
- **Descriptions**: Expertise, reliability, free estimates, local service
- **CTAs**: "Call Now", "Get Quote", "Book Online", "Schedule Service"

### Product Ads
- **Headlines**: Purchase-focused, price/value messaging
- **Descriptions**: Shipping, delivery, quality, reviews
- **CTAs**: "Shop Now", "Buy Today", "Order Now", "Add to Cart"

### Emergency Ads
- **Headlines**: Urgency, 24/7 availability, fast response
- **Descriptions**: Immediate help, rapid response, no extra fees
- **CTAs**: "Call Now", "Get Help Now", "Emergency Line"

## Usage

### Running the Python API

```bash
cd backend
python ad_generator_api.py
```

The API will be available at `http://localhost:8000`

### Environment Variable

Set `VITE_PYTHON_AD_API_URL` in your `.env` file to point to the Python API:

```
VITE_PYTHON_AD_API_URL=http://localhost:8000
```

If not set, defaults to `http://localhost:8000`

### Testing

```bash
# Test with sample input
python backend/ad_generator_fallback.py <<EOF
{
  "keywords": ["plumber near me"],
  "industry": "plumbing",
  "business_name": "ABC Plumbing",
  "base_url": "https://www.example.com",
  "ad_type": "RSA",
  "num_ads": 3
}
EOF
```

## Benefits

1. **Reliability**: Ensures ads are always generated, even when main API fails
2. **Proper Differentiation**: Correctly generates service vs product ads
3. **Google Ads Compliance**: Follows Google Ads formatting rules
4. **Fallback Chain**: Python API → Local TypeScript → Safe defaults
5. **Type Safety**: Full TypeScript integration with proper types

## Next Steps

1. Deploy Python API to production (Supabase Edge Function or standalone server)
2. Update environment variables in production
3. Monitor ad generation success rates
4. Fine-tune business type detection based on real-world data
5. Add more industry-specific templates

## Notes

- The Python fallback is designed to be a **safety net**, not the primary generation method
- It uses the same business logic as the TypeScript version for consistency
- All generated ads follow Google Ads character limits and formatting rules
- The system gracefully degrades: Python API → Local TypeScript → Safe defaults

