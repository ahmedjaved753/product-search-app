# Common Issues & Solutions

## 🔧 Development Issues

### **1. Hydration Mismatch Errors**

**Issue**: React hydration warnings caused by browser extensions (Grammarly, etc.)

```
Warning: Extra attributes from the server: data-new-gr-c-s-check-loaded
```

**Solution**: Add `suppressHydrationWarning={true}` to body element in layout.tsx
**Files**: `src/app/layout.tsx`
**Why**: Browser extensions modify DOM after SSR, causing harmless differences

### **2. Price Display Issues**

**Issue**: All products showing "Price not available"
**Root Cause**: CSV contains Shopify-formatted prices in `PRICE_RANGE_V2` field
**Solution**: Enhanced `parsePriceRange()` function to handle JSON price objects
**Files**: `src/lib/csv-processor.ts`
**Example**: `{"min_variant_price": {"amount": 18.55, "currency_code": "GBP"}}`

### **3. Stock Status Problems**

**Issue**: All products showing as "Out of Stock"
**Root Cause**: Missing inventory field parsing in CSV processor
**Solution**: Added `totalInventory`, `hasOutOfStockVariants` fields with proper parsing
**Files**: `src/lib/csv-processor.ts`, `src/lib/types.ts`
**Result**: 46.9% In Stock, 13.0% Low Stock, 40.2% Out of Stock

### **4. Image Loading Errors**

**Issue**: `TypeError: Invalid URL` from Next.js Image component
**Root Cause**: `featuredImage` field contained JSON strings instead of URLs
**Solution**: Created `parseFeaturedImage()` to extract URLs from Shopify metadata
**Files**: `src/lib/csv-processor.ts`, `next.config.ts`
**Fix**: Added `cdn.shopify.com` to allowed image domains

## 🎨 UI/UX Issues

### **5. Search Input Clear Button Conflicts**

**Issue**: AI badge overlapping with clear (X) button on hover
**Root Cause**: Both elements positioned at `right-2` causing z-index conflicts
**Solution**: Removed AI badge completely from search input
**Files**: `src/components/search/SearchBar.tsx`
**Result**: Clean, accessible clear button functionality

### **6. Poor Price Sorting UX**

**Issue**: Products without prices appearing first in "price low to high" sorting
**Root Cause**: Default value of `0` for missing prices
**Solution**: Modified sorting logic to push no-price products to end
**Files**: `src/lib/search-engine.ts`
**Behavior**: Products with valid prices sort first, then no-price products

### **7. Bulky Header Stats**

**Issue**: Header stats using full Card components looked cramped
**Solution**: Replaced with clean stat items (icon + number + label)
**Files**: `src/app/page.tsx`
**Result**: Better spacing, consistent typography, cleaner appearance

## 🔄 Performance Issues

### **8. Pagination Caching Problems**

**Issue**: Only page 1 cached, other pages making fresh API calls
**Root Cause**: Using old `useSearch` hook instead of `useSearchWithQuery`
**Solution**: Updated page.tsx to use TanStack Query hook
**Files**: `src/app/page.tsx`
**Result**: All pages properly cached with instant navigation

### **9. First Request Latency**

**Issue**: Slow initial search due to CSV processing on demand
**Solution**: Pre-built search index at build time
**Files**: `data/search-index.json`, build scripts
**Result**: Eliminated first-request latency

### **10. Memory Usage During CSV Processing**

**Issue**: Large CSV files causing memory spikes
**Solution**: Chunked processing with 2K chunk size
**Files**: `src/lib/csv-processor.ts`
**Result**: Constant ~50MB memory usage

## 🔍 Search Issues

### **11. Empty Search Results**

**Issue**: No results for valid search terms
**Root Cause**: Incorrect Fuse.js configuration or missing data
**Solution**: Verify search index contains expected fields
**Debug**: Check `data/search-index.json` for proper data structure
**Files**: `src/lib/search-engine.ts`

### **12. Slow Search Performance**

**Issue**: Search taking >500ms
**Root Cause**: Large dataset without proper indexing
**Solution**: Pre-built search index with optimized Fuse.js config
**Files**: `src/lib/search-engine.ts`
**Config**: 0.4 threshold, weighted fields, includeScore: true

### **13. Filter Conflicts**

**Issue**: Filters not working together properly
**Root Cause**: Filter logic conflicts in search engine
**Solution**: Proper filter combination in `applyFilters()` method
**Files**: `src/lib/search-engine.ts`

## 🛠️ Build Issues

### **14. TypeScript Errors**

**Issue**: Type errors during build
**Common Causes**:

- Missing type definitions
- Incorrect interface usage
- Null/undefined handling
  **Solution**: Proper type guards and optional chaining
  **Files**: `src/lib/types.ts`, component files

### **15. Next.js Build Failures**

**Issue**: Build failing on production
**Common Causes**:

- Large bundle size
- Memory issues during build
- Missing dependencies
  **Solution**: Optimize imports, check memory limits, verify package.json

## 📱 Mobile Issues

### **16. Touch Target Issues**

**Issue**: Buttons too small for mobile tapping
**Solution**: Ensure minimum 44px touch targets
**Files**: All component files
**Standard**: Follow iOS/Android accessibility guidelines

### **17. Sheet Modal Problems**

**Issue**: Mobile filter sheet not opening/closing properly
**Root Cause**: Radix UI Sheet component configuration
**Solution**: Proper trigger and content setup
**Files**: `src/components/search/SearchFilters.tsx`

## 🔒 Security Considerations

### **18. XSS Prevention**

**Issue**: User input not properly sanitized
**Solution**: React's built-in XSS protection + proper escaping
**Files**: All components handling user input
**Best Practice**: Never use `dangerouslySetInnerHTML` with user data

### **19. CORS Issues**

**Issue**: API calls blocked by CORS policy
**Solution**: Proper Next.js API route configuration
**Files**: API route files in `src/app/api/`
**Note**: Next.js handles CORS for same-origin requests

## 📊 Debugging Tools

### **20. React Query DevTools**

**Tool**: `@tanstack/react-query-devtools`
**Usage**: Inspect cache, queries, and mutations
**Access**: Available in development mode
**Files**: `src/components/providers/QueryProvider.tsx`

### **21. Network Tab Debugging**

**Tool**: Browser DevTools Network tab
**Usage**: Monitor API calls, response times, payload sizes
**Look for**: Slow requests, failed requests, large payloads

### **22. Performance Profiling**

**Tool**: React DevTools Profiler
**Usage**: Identify slow components and re-renders
**Focus**: Search results rendering, filter updates
