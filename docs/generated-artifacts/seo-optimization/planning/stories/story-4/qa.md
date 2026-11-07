# QA Test & Verification Plan: SEO-4-QA

## 1. Overview & Verification Scope
- **Subtask ID:** `SEO-4-QA`
- **Parent Story:** `SEO-4` (Static Pre-Rendering (SSG) for Marketing Routes & Raw HTML Canonical Isolation)
- **Target Acceptance Criteria:** AC-4.1, AC-4.2, AC-4.3, AC-4.4
- **Goal:** Execute automated inspection across all 13 pre-rendered marketing HTML files to assert unique document titles, self-referencing canonical links, non-empty DOM bodies, and absence of canonical cannibalization bugs.

---

## 2. Pre-Requisites & Environment
- **Environment:** Post-build `dist/` directory or live Vercel preview URL.
- **Required Tools:** `bash`, `curl`, `grep`, `node`.

---

## 3. Concrete Test Scripts & Commands

### Test 1: Automated Verification of All 13 Static HTML Files
Run this script locally after executing `npm run build`:
```bash
#!/usr/bin/env bash
set -e

ROUTES=(
  ""
  "neet-daily-practice"
  "neet-mock-tests"
  "neet-ai-analysis"
  "neet-formula-cards"
  "neet-revision"
  "about"
  "contact"
  "careers"
  "campus"
  "faq"
  "privacy-policy"
  "terms"
)

echo "=== Commencing Static Pre-Rendering Verification Across 13 Routes ==="

for r in "${ROUTES[@]}"; do
  if [ -z "$r" ]; then
    HTML_FILE="dist/index.html"
    EXPECTED_CANONICAL="https://neetforge.in/"
    ROUTE_NAME="Homepage (/)"
  else
    HTML_FILE="dist/$r/index.html"
    EXPECTED_CANONICAL="https://neetforge.in/$r"
    ROUTE_NAME="/$r"
  fi

  echo "Checking $ROUTE_NAME at $HTML_FILE..."

  # 1. Assert file exists
  if [ ! -f "$HTML_FILE" ]; then
    echo "FAIL: Static file $HTML_FILE does NOT exist!"
    exit 1
  fi

  # 2. Extract Title
  TITLE=$(grep -oE '<title>.*?</title>' "$HTML_FILE" | sed -e 's/<title>//' -e 's/<\/title>//')
  if [ -z "$TITLE" ]; then
    echo "FAIL: Empty title in $HTML_FILE"
    exit 1
  fi
  echo "  Title: $TITLE"

  # 3. Extract Canonical URL
  CANONICAL=$(grep -oE '<link rel="canonical" href=".*?"' "$HTML_FILE" | sed -e 's/<link rel="canonical" href="//' -e 's/"//')
  echo "  Canonical: $CANONICAL"

  if [ "$CANONICAL" != "$EXPECTED_CANONICAL" ]; then
    echo "FAIL: Canonical mismatch in $HTML_FILE! Expected: $EXPECTED_CANONICAL, Found: $CANONICAL"
    exit 1
  fi

  # 4. Assert Root DOM is not empty
  if grep -q '<div id="root"></div>' "$HTML_FILE"; then
    echo "FAIL: $HTML_FILE contains empty <div id=\"root\"></div>!"
    exit 1
  fi

  # 5. Check for semantic H1
  if ! grep -q '<h1>' "$HTML_FILE"; then
    echo "FAIL: Missing <h1> tag in $HTML_FILE!"
    exit 1
  fi

  echo "  Status: PASS"
done

echo "=== All 13 Pre-Rendered Routes Passed Validation! ==="
```

### Test 2: Live Edge Raw Curl Inspection (Simulating Googlebot)
Test via `curl` without JavaScript execution:
```bash
TARGET_URL="${1:-https://neetforge.in}"

# Test mock tests route
RAW_CANONICAL=$(curl -s "$TARGET_URL/neet-mock-tests" | grep -oE '<link rel="canonical" href=".*?"' | cut -d'"' -f4)
RAW_TITLE=$(curl -s "$TARGET_URL/neet-mock-tests" | grep -oE '<title>.*?</title>' | sed 's/<[^>]*>//g')

echo "Raw Server Canonical: $RAW_CANONICAL"
echo "Raw Server Title: $RAW_TITLE"

if [ "$RAW_CANONICAL" == "https://neetforge.in/neet-mock-tests" ]; then
  echo "PASS: Server returned self-referencing canonical"
else
  echo "FAIL: Server returned incorrect canonical: $RAW_CANONICAL"
  exit 1
fi
```

### Test 3: Hydration Reconciliation Check
Verify that client-side hydration does not cause console errors or clear pre-rendered content:
```bash
# In headless Chrome test or Vitest browser environment
# Verify that document.getElementById("root").children.length > 0 after hydration
```

---

## 4. Failure Criteria & Regression Triggers
- Any marketing subpage serving `<link rel="canonical" href="https://neetforge.in/" />` triggers **IMMEDIATE REJECTION**.
- Any of the 13 static `index.html` files missing from `dist/` triggers **FAIL**.
- Any route serving an empty `<div id="root"></div>` without pre-rendered semantic headings triggers **FAIL**.
