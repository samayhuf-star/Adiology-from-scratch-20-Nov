#!/usr/bin/env python3
"""
FastAPI endpoint for ad generation fallback
Can be deployed as a Supabase Edge Function or standalone API
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json

from ad_generator_fallback import generate_ads, detect_business_type

app = FastAPI(title="Adiology Ad Generator Fallback API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AdGenerationRequest(BaseModel):
    keywords: List[str]
    business_type: Optional[str] = None
    business_name: str = ""
    location: str = ""
    industry: str = ""
    base_url: str = ""
    ad_type: str = "RSA"  # RSA, DKI, or CALL_ONLY
    num_ads: int = 3


class AdGenerationResponse(BaseModel):
    success: bool
    business_type: str
    ads: List[dict]
    count: int
    message: Optional[str] = None


@app.post("/generate", response_model=AdGenerationResponse)
async def generate_ads_endpoint(request: AdGenerationRequest):
    """
    Generate ads based on keywords and business type
    """
    try:
        # Auto-detect business type if not provided
        detected_type = detect_business_type(request.keywords, request.industry)
        business_type = request.business_type or detected_type
        
        # Generate ads
        ads = generate_ads(
            keywords=request.keywords,
            business_type=business_type,
            business_name=request.business_name,
            location=request.location,
            industry=request.industry,
            base_url=request.base_url,
            ad_type=request.ad_type,
            num_ads=request.num_ads
        )
        
        return AdGenerationResponse(
            success=True,
            business_type=business_type,
            ads=ads,
            count=len(ads),
            message=f"Generated {len(ads)} {request.ad_type} ads for {business_type} business"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "ad_generator_fallback"}


@app.get("/")
async def root():
    """Root endpoint with API info"""
    return {
        "service": "Adiology Ad Generator Fallback API",
        "version": "1.0.0",
        "endpoints": {
            "POST /generate": "Generate ads for services or products",
            "GET /health": "Health check"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

