#!/usr/bin/env python3
"""
CSV Export Adapter - Mapping Functions
Converts Campaign Builder 1 frontend data format to backend export request format
"""

from typing import Dict, List, Any, Optional
from export_csv_fix import CampaignExportRequest


def map_frontend_to_backend(
    campaign_name: str,
    ad_groups: List[Dict[str, Any]],
    generated_ads: List[Dict[str, Any]],
    all_ad_groups_value: str = "ALL_AD_GROUPS",
    location_targeting: Optional[Dict[str, Any]] = None,
    budget: Optional[float] = None,
    bidding_strategy: str = "MANUAL_CPC",
    negative_keywords: Optional[List[str]] = None
) -> CampaignExportRequest:
    """
    Map Campaign Builder 1 frontend data structure to backend export request
    
    Args:
        campaign_name: Campaign name
        ad_groups: List of ad groups with keywords
        generated_ads: List of all generated ads (may reference ad groups or ALL_AD_GROUPS)
        all_ad_groups_value: Value used to indicate ads apply to all groups
        location_targeting: Location targeting data
        budget: Campaign budget
        bidding_strategy: Bidding strategy type
        negative_keywords: Global negative keywords
    
    Returns:
        CampaignExportRequest ready for export
    """
    
    # Map ad groups with their ads
    mapped_ad_groups = []
    
    for ad_group in ad_groups:
        ad_group_name = ad_group.get('name', '').strip()
        if not ad_group_name:
            continue
        
        # Get keywords for this ad group
        keywords = ad_group.get('keywords', [])
        if isinstance(keywords, str):
            # If keywords is a string, split by newline
            keywords = [k.strip() for k in keywords.split('\n') if k.strip()]
        elif not isinstance(keywords, list):
            keywords = []
        
        # Get ads for this ad group
        # Ads can be assigned to specific group or ALL_AD_GROUPS
        group_ads = [
            ad for ad in generated_ads
            if ad.get('adGroup') == ad_group_name or ad.get('adGroup') == all_ad_groups_value
        ]
        
        # Filter out extension-only ads (they have extensionType)
        group_ads = [ad for ad in group_ads if not ad.get('extensionType')]
        
        # Map ads to backend format
        mapped_ads = []
        for ad in group_ads:
            mapped_ad = {
                'type': ad.get('type', 'rsa').lower(),
                'headline1': (ad.get('headline1') or '').strip(),
                'headline2': (ad.get('headline2') or '').strip(),
                'headline3': (ad.get('headline3') or '').strip(),
                'headline4': (ad.get('headline4') or '').strip(),
                'headline5': (ad.get('headline5') or '').strip(),
                'headline6': (ad.get('headline6') or '').strip(),
                'headline7': (ad.get('headline7') or '').strip(),
                'headline8': (ad.get('headline8') or '').strip(),
                'headline9': (ad.get('headline9') or '').strip(),
                'headline10': (ad.get('headline10') or '').strip(),
                'headline11': (ad.get('headline11') or '').strip(),
                'headline12': (ad.get('headline12') or '').strip(),
                'headline13': (ad.get('headline13') or '').strip(),
                'headline14': (ad.get('headline14') or '').strip(),
                'headline15': (ad.get('headline15') or '').strip(),
                'description1': (ad.get('description1') or '').strip(),
                'description2': (ad.get('description2') or '').strip(),
                'description3': (ad.get('description3') or '').strip(),
                'description4': (ad.get('description4') or '').strip(),
                'finalUrl': (ad.get('finalUrl') or ad.get('final_url') or '').strip(),
                'path1': (ad.get('path1') or '').strip(),
                'path2': (ad.get('path2') or '').strip(),
            }
            mapped_ads.append(mapped_ad)
        
        # Get negative keywords for this ad group
        group_negative_keywords = ad_group.get('negativeKeywords', [])
        if isinstance(group_negative_keywords, str):
            group_negative_keywords = [k.strip() for k in group_negative_keywords.split('\n') if k.strip()]
        elif not isinstance(group_negative_keywords, list):
            group_negative_keywords = []
        
        # Add global negative keywords if provided
        if negative_keywords:
            group_negative_keywords.extend(negative_keywords)
        
        mapped_ad_groups.append({
            'name': ad_group_name,
            'keywords': keywords,
            'ads': mapped_ads,
            'negativeKeywords': list(set(group_negative_keywords)),  # Remove duplicates
            'defaultMaxCPC': ad_group.get('defaultMaxCPC') or ad_group.get('default_max_cpc')
        })
    
    # Map location targeting
    mapped_location_targeting = None
    if location_targeting:
        locations = []
        
        # Country
        if location_targeting.get('country'):
            locations.append({
                'type': 'COUNTRY',
                'code': location_targeting['country']
            })
        
        # States
        if location_targeting.get('states'):
            for state in location_targeting['states']:
                if state and str(state).strip():
                    locations.append({
                        'type': 'STATE',
                        'code': str(state).strip()
                    })
        
        # Cities
        if location_targeting.get('cities'):
            for city in location_targeting['cities']:
                if city and str(city).strip():
                    locations.append({
                        'type': 'CITY',
                        'code': str(city).strip()
                    })
        
        # ZIP codes
        if location_targeting.get('zipCodes') or location_targeting.get('zip_codes'):
            zips = location_targeting.get('zipCodes') or location_targeting.get('zip_codes', [])
            for zip_code in zips:
                if zip_code and str(zip_code).strip():
                    locations.append({
                        'type': 'ZIP',
                        'code': str(zip_code).strip()
                    })
        
        if locations:
            mapped_location_targeting = {'locations': locations}
    
    return CampaignExportRequest(
        campaign_name=campaign_name or 'Campaign 1',
        ad_groups=mapped_ad_groups,
        location_targeting=mapped_location_targeting,
        budget=budget,
        bidding_strategy=bidding_strategy or 'MANUAL_CPC'
    )


def map_simple_format(
    campaign_name: str,
    ad_groups_data: List[Dict[str, Any]],
    location_data: Optional[Dict[str, Any]] = None
) -> CampaignExportRequest:
    """
    Simplified mapping for direct API calls
    
    Expected format:
    {
        "campaign_name": "My Campaign",
        "ad_groups": [
            {
                "name": "Ad Group 1",
                "keywords": ["plumber", "electrician"],
                "ads": [...],
                "negativeKeywords": ["free", "cheap"]
            }
        ],
        "location_targeting": {
            "locations": [
                {"type": "COUNTRY", "code": "US"},
                {"type": "CITY", "code": "New York"}
            ]
        }
    }
    """
    return CampaignExportRequest(
        campaign_name=campaign_name,
        ad_groups=ad_groups_data,
        location_targeting=location_data,
        budget=None,
        bidding_strategy="MANUAL_CPC"
    )

