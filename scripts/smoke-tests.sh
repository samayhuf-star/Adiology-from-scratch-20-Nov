#!/bin/bash

# Smoke Tests for Adiology Campaign Dashboard
# Run this after deployment to verify everything works

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get deployment URL from argument or use default
DEPLOYMENT_URL="${1:-http://localhost:3000}"

echo -e "${YELLOW}Running smoke tests against: ${DEPLOYMENT_URL}${NC}\n"

# Test counter
PASSED=0
FAILED=0

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $name... "
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    
    if [ "$HTTP_CODE" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $HTTP_CODE)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected HTTP $expected_status, got $HTTP_CODE)"
        ((FAILED++))
        return 1
    fi
}

# Test Supabase Edge Function
test_edge_function() {
    local endpoint=$1
    local name=$2
    
    echo -n "Testing Edge Function: $name... "
    
    # Get anon key from info.tsx (you may need to adjust this)
    ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZG5ucndoem9mdHR6YWpud2xqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Njk2ODAsImV4cCI6MjA3OTA0NTY4MH0.IVIEaP0Stc0AieekxDFMG_q76vu6KRRMsI_yIjOfmZM"
    URL="https://kkdnnrwhzofttzajnwlj.supabase.co/functions/v1/make-server-6757d0ca$endpoint"
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $ANON_KEY" \
        "$URL" || echo "000")
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $HTTP_CODE)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $HTTP_CODE)"
        ((FAILED++))
        return 1
    fi
}

echo "=== Frontend Tests ==="
test_endpoint "Homepage" "$DEPLOYMENT_URL"
test_endpoint "Dashboard" "$DEPLOYMENT_URL"

echo -e "\n=== Supabase Edge Function Tests ==="
test_edge_function "/health" "Health Check"

echo -e "\n=== Test Summary ==="
echo -e "${GREEN}Passed: $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Failed: $FAILED${NC}"
    exit 1
else
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
fi

