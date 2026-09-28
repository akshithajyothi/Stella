# Men's Unified Listing Structure

## Overview
All men's clothing items are displayed on a single unified page (`/tops?gender=men`) regardless of their subcategory. Users can filter by subcategory using filter tabs.

## Implementation Details

### 1. **Sell Page Logic**
- **Women's items**: Navigate to specific category pages
  - Tops → `/tops?gender=women`
  - Dresses → `/dresses?gender=women`
  - Coats → `/coats?gender=women`
  - etc.

- **Men's items**: ALL navigate to unified men's page
  - Any category → `/tops?gender=men`

### 2. **Men's Page (`/tops?gender=men`)**
Shows ALL men's items with category filtering:

**Filter Options:**
- All Items (default)
- T-Shirts & Tops
- Jackets & Coats
- Pants & Jeans
- Accessories

**How it works:**
- `getListingsByCategory('all', 'men')` retrieves ALL men's items
- Filter tabs apply client-side filtering by `category` field
- Each item retains its original category (tops, coats, bottoms, etc.)

### 3. **Women's Page Structure**
Women's items maintain separate category pages:
- `/tops?gender=women` - Only tops
- `/dresses?gender=women` - Only dresses
- `/bottoms?gender=women` - Only bottoms/jeans
- etc.

## User Experience

### For Sellers:
1. Select gender: Men's or Women's
2. Select category: Tops, Dresses, Coats, Bottoms, or Accessories
3. Fill in details and submit
4. **Men's items** → Redirected to unified men's page
5. **Women's items** → Redirected to specific category page

### For Buyers:
**Men's Section:**
- Visit `/tops?gender=men` to see ALL men's items
- Use filter tabs to narrow by category
- All items show "NEW IN", "SOLD OUT", seller info, etc.

**Women's Section:**
- Visit specific category pages
- Each category shows only that type of item

## File Changes

### Modified Files:
1. `src/pages/Sell.tsx`
   - Updated navigation logic for men's items

2. `src/pages/Tops.tsx`
   - Added category filter state
   - Added filter tabs UI for men's section
   - Updated to fetch ALL men's items (not just tops)
   - Client-side filtering by category

3. `src/context/ListingsContext.tsx`
   - Updated `getListingsByCategory()` to support `category='all'`
   - Returns all items for specified gender when category is 'all'

## Benefits

✅ **Unified browsing** for men's fashion
✅ **Easy filtering** by subcategory
✅ **Consistent experience** - all men's items in one place
✅ **Scalable** - easy to add new men's categories
✅ **Clean URLs** - single entry point for men's section
