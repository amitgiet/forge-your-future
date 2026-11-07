# QA Test & Verification Plan: SEO-1-QA

## 1. Overview & Verification Scope
- **Subtask ID:** `SEO-1-QA`
- **Parent Story:** `SEO-1` (Missing Head Static Assets & Social Graph Media Resolution)
- **Target Acceptance Criteria:** AC-1.1, AC-1.2, AC-1.3, AC-1.4, AC-1.5
- **Goal:** Verify that all head media assets exist as valid static files, return proper HTTP status and Content-Type headers, match specified pixel dimensions, and never return the HTML shell fallback.

---

## 2. Pre-Requisites & Environment
- **Local Dev / Preview:** `npm run build && npm run preview` (or local file inspection).
- **Staging / Production:** `https://neetforge.in` or Vercel preview deployment URL.
- **Required Tools:** `curl`, `file`, `identify` (ImageMagick) or Node.js image-size inspection script, `jq`.

---

## 3. Concrete Test Scripts & Commands

### Test 1: File Existence & Integrity Check (Local Build)
Run directly against the `/public` folder:
```bash
# 1. Verify existence of all four static assets
ls -lh public/og-image.png public/favicon.svg public/apple-touch-icon.png public/manifest.json

# 2. Check file size limits (< 250 KB for og-image.png)
OG_SIZE=$(wc -c < public/og-image.png)
echo "OG Image Size: $OG_SIZE bytes"
test "$OG_SIZE" -lt 256000 && echo "PASS: og-image.png is under 250 KB" || echo "FAIL: og-image.png exceeds 250 KB"

# 3. Validate manifest.json is valid JSON
jq empty public/manifest.json && echo "PASS: manifest.json is valid JSON" || echo "FAIL: manifest.json syntax error"
```

### Test 2: HTTP Status & MIME Type Inspection (Preview / Edge)
Run via `curl`:
```bash
TARGET_URL="${1:-http://localhost:8080}"

# 1. Check og-image.png
curl -sI "$TARGET_URL/og-image.png" | grep -iE 'HTTP/|content-type:|content-length:'
# Assertion:
# HTTP/1.1 200 OK (or HTTP/2 200)
# content-type: image/png

# 2. Check favicon.svg
curl -sI "$TARGET_URL/favicon.svg" | grep -iE 'HTTP/|content-type:'
# Assertion:
# content-type: image/svg+xml

# 3. Check apple-touch-icon.png
curl -sI "$TARGET_URL/apple-touch-icon.png" | grep -iE 'HTTP/|content-type:'
# Assertion:
# content-type: image/png

# 4. Check manifest.json
curl -sI "$TARGET_URL/manifest.json" | grep -iE 'HTTP/|content-type:'
# Assertion:
# content-type: application/json (or application/manifest+json)
```

### Test 3: Anti-Fallback Verification (No HTML in Responses)
Verify that asset bodies never start with `<!doctype html>`:
```bash
for asset in og-image.png favicon.svg apple-touch-icon.png manifest.json; do
  FIRST_LINE=$(curl -s "$TARGET_URL/$asset" | head -n 1)
  if [[ "$FIRST_LINE" =~ "<!doctype" || "$FIRST_LINE" =~ "<html" ]]; then
    echo "CRITICAL FAIL: $asset returned HTML fallback!"
    exit 1
  else
    echo "PASS: $asset is not an HTML fallback"
  fi
done
```

### Test 4: Social Crawler Simulation (User-Agent Scrapers)
```bash
# Simulate WhatsApp scraper
curl -s -A "WhatsApp/2.21.12.21 i" "$TARGET_URL/og-image.png" -o /tmp/og-test.png
file /tmp/og-test.png | grep -i "PNG image data, 1200 x 630"

# Simulate TwitterBot scraper
curl -s -A "Twitterbot/1.0" -I "$TARGET_URL/og-image.png" | grep -i "200"
```

---

## 4. Failure Criteria & Regression Triggers
- Any asset returning `content-type: text/html` triggers **IMMEDIATE REJECTION**.
- `og-image.png` file size exceeding 256,000 bytes triggers **FAIL**.
- `manifest.json` failing JSON schema parsing triggers **FAIL**.
- Missing `<link rel="apple-touch-icon">` tag in `/index.html` triggers **FAIL**.
