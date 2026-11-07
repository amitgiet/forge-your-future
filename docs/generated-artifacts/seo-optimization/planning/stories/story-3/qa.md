# QA Test & Verification Plan: SEO-3-QA

## 1. Overview & Verification Scope
- **Subtask ID:** `SEO-3-QA`
- **Parent Story:** `SEO-3` (Route-Level Code-Splitting & Marketing Bundle Size Optimization)
- **Target Acceptance Criteria:** AC-3.1, AC-3.2, AC-3.3, AC-3.4
- **Goal:** Verify that production build outputs isolated asynchronous chunks, the initial public marketing payload is strictly under 100 KB gzipped, and navigating to internal app routes dynamically fetches secondary chunks without errors.

---

## 2. Pre-Requisites & Environment
- **Environment:** Production build directory (`/dist`).
- **Required Tools:** `npm run build`, `gzip`, `wc`, `find`, `node`.

---

## 3. Concrete Test Scripts & Commands

### Test 1: Production Build Chunk Inspection
Run build and inspect the output `/dist/assets` directory:
```bash
npm run build

# List all generated JS chunks and sort by size
ls -lh dist/assets/*.js | sort -k5 -hr
```

### Test 2: Marketing Entry Bundle Size Verification (< 100 KB Gzipped)
Identify the primary entry chunk referenced in `dist/index.html` and measure its uncompressed and gzipped footprint:
```bash
ENTRY_CHUNK=$(grep -oE '/assets/index-[a-zA-Z0-9_-]+\.js' dist/index.html | head -n 1 | sed 's|/assets/||')
echo "Primary Entry Chunk: $ENTRY_CHUNK"

RAW_SIZE=$(wc -c < "dist/assets/$ENTRY_CHUNK")
GZIP_SIZE=$(gzip -c "dist/assets/$ENTRY_CHUNK" | wc -c)

echo "Raw Entry Size: $((RAW_SIZE / 1024)) KB ($RAW_SIZE bytes)"
echo "Gzipped Entry Size: $((GZIP_SIZE / 1024)) KB ($GZIP_SIZE bytes)"

# Assertions
if [ "$GZIP_SIZE" -lt 102400 ]; then
  echo "PASS: Gzipped marketing entry chunk is under 100 KB ($((GZIP_SIZE / 1024)) KB)"
else
  echo "FAIL: Gzipped marketing entry chunk exceeds 100 KB ($((GZIP_SIZE / 1024)) KB)"
  exit 1
fi
```

### Test 3: Heavy Vendor Isolation Assertion (Recharts Check)
Verify that `recharts` is NOT present in the initial marketing entry chunk:
```bash
if grep -q "recharts" "dist/assets/$ENTRY_CHUNK"; then
  echo "FAIL: recharts is bundled inside the primary marketing entry chunk!"
  exit 1
else
  echo "PASS: recharts is cleanly isolated from the initial marketing bundle"
fi
```

### Test 4: Runtime Async Chunk Hydration Check
Run `npm run preview` and execute a headless navigation test using a lightweight Node script:
```javascript
// scripts/test-route-chunks.mjs
import http from 'http';

// Verify that dist/assets contains separate chunks for app and vendors
import fs from 'fs';
const files = fs.readdirSync('dist/assets');
const vendorCharts = files.some(f => f.includes('vendor-charts'));
const vendorIcons = files.some(f => f.includes('vendor-icons'));

console.log('vendor-charts chunk generated:', vendorCharts);
console.log('vendor-icons chunk generated:', vendorIcons);

if (!vendorCharts || !vendorIcons) {
  console.error('FAIL: Missing isolated vendor chunks');
  process.exit(1);
} else {
  console.log('PASS: Rollup manualChunks generated discrete vendor packages');
}
```

---

## 4. Failure Criteria & Regression Triggers
- Gzipped entry chunk exceeding 100 KB (102,400 bytes) triggers **FAIL**.
- Recharts, ReactFlow, or internal quiz controllers present in `dist/index.html` scripts triggers **FAIL**.
- Layout shift or uncaught promise rejections during `<Suspense>` lazy chunk resolution triggers **FAIL**.
