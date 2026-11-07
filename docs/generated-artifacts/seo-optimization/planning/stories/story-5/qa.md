# QA Test & Verification Plan: SEO-5-QA

## 1. Overview & Verification Scope
- **Subtask ID:** `SEO-5-QA`
- **Parent Story:** `SEO-5` (Schema.org Structured Data Consolidation & FAQPage Rich Snippets)
- **Target Acceptance Criteria:** AC-5.1, AC-5.2, AC-5.3, AC-5.4, AC-5.5
- **Goal:** Verify that the homepage contains exactly one Schema.org graph without duplicate script tags, conforms to Google Rich Results guidelines (no fictitious SearchAction or unverified aggregateRating), and the FAQ page delivers valid `FAQPage` rich snippet markup matching visible DOM copy.

---

## 2. Pre-Requisites & Environment
- **Environment:** Local build preview or live staging deployment.
- **Required Tools:** `node`, `jq`, `curl`, Google Rich Results Test (online validator).

---

## 3. Concrete Test Scripts & Commands

### Test 1: Single Schema Block Assertion (Homepage)
Extract all JSON-LD blocks from the pre-rendered homepage and count occurrences:
```bash
TARGET_URL="${1:-http://localhost:8080}"

# Count occurrences of ld+json script tags
SCHEMA_COUNT=$(curl -s "$TARGET_URL/" | grep -c 'application/ld+json')
echo "Number of JSON-LD scripts on homepage: $SCHEMA_COUNT"

if [ "$SCHEMA_COUNT" -eq 1 ]; then
  echo "PASS: Exactly one structured data block found on homepage"
else
  echo "FAIL: Found $SCHEMA_COUNT structured data blocks (expected 1)"
  exit 1
fi
```

### Test 2: Schema Guidelines Compliance Assertion
Inspect the JSON-LD payload on the homepage:
```bash
# Extract JSON-LD content and parse with jq
SCHEMA_CONTENT=$(curl -s "$TARGET_URL/" | sed -n 's/.*<script id="route-schema-jsonld" type="application\/ld+json">\([^<]*\)<\/script>.*/\1/p')

if [ -z "$SCHEMA_CONTENT" ]; then
  # Fallback extraction if id is different
  SCHEMA_CONTENT=$(curl -s "$TARGET_URL/" | grep -oE '<script[^>]*type="application/ld\+json"[^>]*>.*?</script>' | sed -e 's/<script[^>]*>//' -e 's/<\/script>//')
fi

echo "$SCHEMA_CONTENT" | jq . > /tmp/home-schema.json

# 1. Assert SearchAction is absent
if grep -q "SearchAction" /tmp/home-schema.json; then
  echo "FAIL: Fictitious SearchAction is still present in schema!"
  exit 1
else
  echo "PASS: Fictitious SearchAction successfully removed"
fi

# 2. Assert aggregateRating is absent
if grep -q "aggregateRating" /tmp/home-schema.json; then
  echo "FAIL: Unverified aggregateRating is still present in schema!"
  exit 1
else
  echo "PASS: Unverified aggregateRating successfully removed"
fi

# 3. Assert sameAs contains verified social links
SAMEAS_COUNT=$(jq '.. | objects | select(.sameAs?) | .sameAs | length' /tmp/home-schema.json)
if [ "$SAMEAS_COUNT" -ge 3 ]; then
  echo "PASS: Organization contains $SAMEAS_COUNT verified social profiles in sameAs"
else
  echo "FAIL: sameAs is empty or missing profiles"
  exit 1
fi
```

### Test 3: FAQPage Schema Conformance Assertion
Extract and validate `FAQPage` schema on `/faq`:
```bash
FAQ_SCHEMA=$(curl -s "$TARGET_URL/faq" | grep -oE '<script[^>]*type="application/ld\+json"[^>]*>.*?</script>' | sed -e 's/<script[^>]*>//' -e 's/<\/script>//')
echo "$FAQ_SCHEMA" | jq . > /tmp/faq-schema.json

# Assert @type is FAQPage
FAQ_TYPE=$(jq -r '."@type"' /tmp/faq-schema.json)
echo "FAQ Schema Type: $FAQ_TYPE"

if [ "$FAQ_TYPE" == "FAQPage" ]; then
  echo "PASS: @type equals FAQPage"
else
  echo "FAIL: @type is not FAQPage"
  exit 1
fi

# Assert all 12 questions are defined in mainEntity
QUESTION_COUNT=$(jq '.mainEntity | length' /tmp/faq-schema.json)
echo "Number of FAQ Questions in Schema: $QUESTION_COUNT"

if [ "$QUESTION_COUNT" -eq 12 ]; then
  echo "PASS: All 12 FAQ questions are present in structured data"
else
  echo "FAIL: Found $QUESTION_COUNT questions in schema (expected 12)"
  exit 1
fi
```

---

## 4. Failure Criteria & Regression Triggers
- More than 1 JSON-LD script tag on the homepage triggers **FAIL**.
- Presence of fictitious `SearchAction` or unverified `aggregateRating` triggers **FAIL**.
- `FAQPage` schema missing or containing fewer than 12 questions triggers **FAIL**.
- Mismatch between FAQ schema strings and visible DOM text triggers **FAIL**.
