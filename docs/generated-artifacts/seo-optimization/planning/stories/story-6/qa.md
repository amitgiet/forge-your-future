# QA Test & Verification Plan: SEO-6-QA

## 1. Overview & Verification Scope
- **Subtask ID:** `SEO-6-QA`
- **Parent Story:** `SEO-6` (Search Crawl Budget Optimization, Robots.txt & Clean Sitemap Hygiene)
- **Target Acceptance Criteria:** AC-6.1, AC-6.2, AC-6.3
- **Goal:** Verify that `public/sitemap.xml` contains strictly the 13 canonical URLs without syntax errors or auth pages, `public/robots.txt` disallows `/app/`, and student authentication views inject `noindex, nofollow` metadata.

---

## 2. Pre-Requisites & Environment
- **Environment:** Local filesystem or build preview.
- **Required Tools:** `xmllint` or Python `xml.etree.ElementTree`, `grep`, `curl`.

---

## 3. Concrete Test Scripts & Commands

### Test 1: Sitemap URL Count & Content Validation
Run against `public/sitemap.xml`:
```bash
SITEMAP_FILE="public/sitemap.xml"

# 1. Assert XML is well-formed
python3 -c "import xml.etree.ElementTree as ET; ET.parse('$SITEMAP_FILE'); print('PASS: sitemap.xml is valid XML')"

# 2. Count total URLs in sitemap
URL_COUNT=$(grep -c '<loc>' "$SITEMAP_FILE")
echo "Total URLs in sitemap.xml: $URL_COUNT"

if [ "$URL_COUNT" -eq 13 ]; then
  echo "PASS: Exactly 13 canonical URLs cataloged in sitemap.xml"
else
  echo "FAIL: Expected 13 URLs in sitemap, found $URL_COUNT"
  exit 1
fi

# 3. Assert auth routes are completely excluded
if grep -qE '/app/login|/app/signup' "$SITEMAP_FILE"; then
  echo "FAIL: Authentication URLs detected in sitemap.xml!"
  exit 1
else
  echo "PASS: No authentication routes present in sitemap.xml"
fi
```

### Test 2: Robots.txt Rules Validation
```bash
ROBOTS_FILE="public/robots.txt"

# 1. Assert Disallow: /app/ is present
if grep -q "Disallow: /app/" "$ROBOTS_FILE"; then
  echo "PASS: Disallow: /app/ is configured"
else
  echo "FAIL: Missing Disallow: /app/ directive in robots.txt"
  exit 1
fi

# 2. Assert Sitemap directive is present and canonical
if grep -q "Sitemap: https://neetforge.in/sitemap.xml" "$ROBOTS_FILE"; then
  echo "PASS: Correct canonical sitemap URL declared"
else
  echo "FAIL: Sitemap declaration missing or incorrect in robots.txt"
  exit 1
fi
```

### Test 3: Auth Screen `noindex` Metadata Verification
Test that `/app/login` and `/app/signup` components inject the `noindex` tag when mounted:
```bash
# Verify source code wiring in Login.tsx and Signup.tsx
for auth_file in src/pages/Login.tsx src/pages/Signup.tsx; do
  if grep -q "noindex, nofollow" "$auth_file"; then
    echo "PASS: $auth_file contains noindex, nofollow metadata hook"
  else
    echo "FAIL: $auth_file is missing noindex, nofollow metadata directive"
    exit 1
  fi
done
```

---

## 4. Failure Criteria & Regression Triggers
- Any presence of `/app/login` or `/app/signup` in `sitemap.xml` triggers **FAIL**.
- Total URL count in `sitemap.xml` not equal to 13 triggers **FAIL**.
- Missing `Disallow: /app/` in `robots.txt` triggers **FAIL**.
- Authentication views exposing indexable robot tags trigger **FAIL**.
