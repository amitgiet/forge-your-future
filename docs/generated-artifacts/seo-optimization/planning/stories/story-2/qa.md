# QA Test & Verification Plan: SEO-2-QA

## 1. Overview & Verification Scope
- **Subtask ID:** `SEO-2-QA`
- **Parent Story:** `SEO-2` (Production HTTP Security & Immutable Cache-Control Headers)
- **Target Acceptance Criteria:** AC-2.1, AC-2.2, AC-2.3
- **Goal:** Verify that Vercel edge configuration delivers 1-year immutable caching on build assets, enforces all 5 security headers on document responses, and returns genuine HTTP 404 responses for dead URLs.

---

## 2. Pre-Requisites & Environment
- **Test Target:** Vercel deployment preview URL or local Vercel CLI runner (`npx vercel dev` / staging environment).
- **Required Tools:** `curl`, `jq`, `grep`.

---

## 3. Concrete Test Scripts & Commands

### Test 1: Immutable Static Asset Caching (`/assets/(.*)`)
```bash
DEPLOY_URL="${1:-https://neetforge.in}"

# Fetch an actual asset path from HTML or dist
SAMPLE_ASSET=$(curl -s "$DEPLOY_URL" | grep -oE '/assets/[a-zA-Z0-9_-]+\.(js|css)' | head -n 1)
echo "Testing asset: $DEPLOY_URL$SAMPLE_ASSET"

CACHE_HEADER=$(curl -sI "$DEPLOY_URL$SAMPLE_ASSET" | grep -i '^cache-control:')
echo "Received Cache-Control: $CACHE_HEADER"

# Assertion: Cache-Control must contain "max-age=31536000" and "immutable"
if [[ "$CACHE_HEADER" =~ "31536000" && "$CACHE_HEADER" =~ "immutable" ]]; then
  echo "PASS: Static asset cached with 1-year immutable directive"
else
  echo "FAIL: Static asset cache control is incorrect or missing immutable flag"
  exit 1
fi
```

### Test 2: Mandatory Security Headers Stack
```bash
# Query the homepage or marketing route
HEADERS=$(curl -sI "$DEPLOY_URL/")

check_header() {
  local header_name="$1"
  local expected_val="$2"
  if echo "$HEADERS" | grep -i "^$header_name:" | grep -iq "$expected_val"; then
    echo "PASS: $header_name is present and matches '$expected_val'"
  else
    echo "FAIL: $header_name is MISSING or does not match '$expected_val'"
    echo "Raw headers:"
    echo "$HEADERS"
    exit 1
  fi
}

check_header "x-content-type-options" "nosniff"
check_header "x-frame-options" "SAMEORIGIN"
check_header "referrer-policy" "strict-origin-when-cross-origin"
check_header "permissions-policy" "camera=(), microphone=(), geolocation=()"
check_header "strict-transport-security" "max-age=63072000"
```

### Test 3: Elimination of Soft 404 (True 404 Status Code)
```bash
# Test random non-existent public URL
STATUS_DEAD_PAGE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL/this-route-does-not-exist-404-test")
echo "Dead Page HTTP Status: $STATUS_DEAD_PAGE"

if [ "$STATUS_DEAD_PAGE" -eq 404 ]; then
  echo "PASS: Non-existent page returns true HTTP 404"
else
  echo "FAIL: Non-existent page returned HTTP $STATUS_DEAD_PAGE (Soft 404 detected!)"
  exit 1
fi

# Test non-existent asset URL
STATUS_DEAD_ASSET=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL/assets/non-existent-bundle.js")
echo "Dead Asset HTTP Status: $STATUS_DEAD_ASSET"

if [ "$STATUS_DEAD_ASSET" -eq 404 ]; then
  echo "PASS: Non-existent asset returns true HTTP 404"
else
  echo "FAIL: Non-existent asset returned HTTP $STATUS_DEAD_ASSET"
  exit 1
fi
```

### Test 4: Legacy Route Edge Redirects
```bash
# Verify legacy path redirecting to /app/*
REDIRECT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL/dashboard")
REDIRECT_LOC=$(curl -sI "$DEPLOY_URL/dashboard" | grep -i '^location:' | tr -d '\r')

echo "Legacy /dashboard status: $REDIRECT_STATUS, destination: $REDIRECT_LOC"

if [[ "$REDIRECT_STATUS" =~ 30[178] && "$REDIRECT_LOC" =~ "/app/dashboard" ]]; then
  echo "PASS: Edge redirect cleanly forwards legacy /dashboard to /app/dashboard"
else
  echo "FAIL: Legacy redirect not functioning as expected"
  exit 1
fi
```

---

## 4. Failure Criteria & Regression Triggers
- Any document response missing `nosniff` or `SAMEORIGIN` triggers **FAIL**.
- Static `/assets/` returning `max-age=0` or `must-revalidate` triggers **FAIL**.
- `/this-route-does-not-exist-404-test` returning `HTTP 200` triggers **IMMEDIATE REJECTION**.
