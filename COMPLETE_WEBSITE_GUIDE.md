# ReStyle Website - Complete Page Guide

## 📖 Overview
ReStyle is a sustainable fashion marketplace that combines AI-powered features with secondhand clothing commerce. This guide covers every page, its purpose, features, and user workflows.

---

## 🏠 1. HOME PAGE (`/`)
**File**: `src/pages/Home.tsx`

### Purpose
Landing page that introduces users to ReStyle's core value proposition: sustainable, pre-loved fashion with smart AI features.

### Key Sections

#### Navigation
- **Top Header**: Login, Wishlist, Offers, Shopping Bag
- **Secondary Nav**: Women, Men, Designer, New In, Premium, Brand New, Clearance
- **Search Bar**: Quick search for quality pre-loved fashion
- **"Shop Men" Button**: Quick link to men's section

#### Hero Banner
- **Rotating carousel** with 2 banner images
- Auto-rotates every 5 seconds
- Manual navigation: left/right arrows
- Dot indicators for active slide
- CTA: "SHOP NOW" button
- Headline: "WE LOVE PRE-LOVED"

#### Women's Categories Grid
7 category cards with images:
- Jackets & Coats
- Dresses
- Sweatshirts
- Tops (clickable link)
- Trousers
- Jeans
- Skirts

#### Closet & Outfit Manager Section
Interactive glass card system with hover effects:

**Left Glass Cards** (appear on hover):
- Add Clothes: "Snap it. Upload it. Own it."
- AI Stylist: Get outfit suggestions

**Center Cards**:
1. **CLOSET**: Add Clothes button
2. **OUTFIT**: Create Idea, Schedule OOTD
3. **PRELOVED**: Sell an Item

**Right Glass Cards** (appear on hover):
- Schedule OOTD: Plan your outfits ahead
- Sell an Item: List from your closet

#### Trending Brands
- Calvin Klein, Tommy Hilfiger, Ganni, Reformation, Zara, H&M

#### Smart Features Section
3 feature cards:
1. **Virtual Try-On**: Try outfits virtually before buying
2. **Wardrobe Manager**: Plan outfits and track your style
3. **AI Stylist**: Get personalized styling recommendations

#### Call-to-Action
- Headline: "Got too many clothes?"
- "START CLEAROUT" button

#### Why Choose ReStyle
3 benefits:
- Quality Assured
- Hassle Free
- Eco Friendly

#### Service Information Bar
- Easy 30 day returns
- Express delivery available
- Every item is quality checked

#### Testimonial
Customer feedback: "Amazing quality and super easy shopping experience!"

#### Footer
- Shop (Women, Men, Clearance)
- Clearout (Sell Items, Brand Checker, Return Bag)
- Support (Help, Contact, Shipping)
- Copyright: © 2026 ReStyle

### User Journey
1. Land on page → See hero banner
2. Browse categories → Click "Tops" or category
3. Explore smart features → Click "Try Now"
4. OR use closet manager → Click "Add Clothes"
5. OR sell items → Click "Sell an Item"

---

## 👕 2. TOPS PAGE (Women's) (`/tops?gender=women`)
**File**: `src/pages/Tops.tsx`

### Purpose
Browse and purchase secondhand women's tops with filtering and sorting options.

### Layout

#### Breadcrumb
`Women > Tops`

#### Header
- **Title**: "Shop Secondhand Women's Tops"
- **Description**: "Dress it up. Dress it down. From everyday basics to statement pieces."

#### Filter Controls
- **Search Box**: Search the collection
- **SORT Dropdown**: Recommended, Newest, Price (Low to High), Price (High to Low)
- **FILTER Button**: Opens filter sidebar
- **Toggles**: Pre-loved, Brand new

#### Product Count
"X items found" (dynamically updates)

#### Product Grid
**8 Women's Products** (static):
1. Christian Siriano Top - L - ₹349 - NEW IN
2. Nike Loungewear - M - ₹299 - VERIFIED
3. All Access Loungewear - XS - ₹199
4. Monsoon Top - UK 18 - ₹149 - NEW IN
5. Fat Face Blouse - UK 10 - ₹449
6. Zara Casual Top - M - ₹379 - VERIFIED
7. Pink Bow Cami Top - S - ₹289 - NEW IN
8. Striped Cinched Blouse - M - ₹349 - VERIFIED

**Plus**: User-listed tops (from sellers)

#### Product Card Features
- Product image (hover: scale animation)
- Badge (NEW IN, VERIFIED, SOLD OUT)
- Product name
- Size
- Seller info (for user listings): "Sold by [name]"
- Price
- Heart icon (add to wishlist)
- "Add to Bag" button / "Sold Out" (disabled)

#### Filter Sidebar (right slide-in)
Filter options:
- Size
- Category
- Style
- Brand
- Brand Type
- Colour
- Condition
- Material
- Tags Attached

### Features
- **Click product** → Navigate to product detail page
- **Add to Bag** → Item added to cart (toast notification)
- **Wishlist** → Heart icon toggles red/outline
- **Sold Out Items**: Faded, disabled, red "SOLD OUT" badge
- **NEW IN**: Green pulsing badge for items < 7 days old

### User Journey
1. Browse product grid
2. Use filters/sort to narrow selection
3. Click product for details
4. Add to bag or wishlist
5. Continue shopping or checkout

---

## 👔 3. TOPS PAGE (Men's) (`/tops?gender=men`)
**File**: `src/pages/Tops.tsx`

### Purpose
**Unified men's shopping page** - displays ALL men's clothing items (tops, jackets, pants, accessories) with category filtering.

### Layout

#### Breadcrumb
`Men > All Items`

#### Header
- **Title**: "Shop Secondhand Men's Clothing"
- **Description**: "From T-shirts to jackets, find quality pre-loved men's fashion."

#### Category Filter Tabs
5 filter buttons (horizontal):
1. **All Items** (default)
2. **T-Shirts & Tops**
3. **Jackets & Coats**
4. **Pants & Jeans**
5. **Accessories**

Selected tab: burgundy background, white text, bold

#### Product Grid
**Current Products**:
- User-listed denim jacket (if listed)
- Marvel Spiderman Graphic Tee - L - ₹599 - VERIFIED
- Spiderman Logo Black Tee - M - ₹549

**Plus**: ALL user-listed men's items (any category)

#### Product Card Features
Same as women's tops page

### Key Difference from Women's
- **Women's**: Category-specific pages (separate for tops, dresses, etc.)
- **Men's**: Single unified page with client-side filtering

### Features
- **Category filtering**: Click tab to filter by category
- **All Items**: Shows everything
- **Client-side filtering**: Fast, no page reload
- **Same card layout**: Consistent sizing with women's page

### User Journey
1. View all men's items
2. Click category tab to filter (e.g., "Jackets & Coats")
3. Browse filtered products
4. Click product for details
5. Add to bag or wishlist

---

## 👗 4. DRESSES PAGE (`/dresses?gender=women`)
**File**: `src/pages/Dresses.tsx`

### Purpose
Browse and purchase secondhand women's dresses.

### Layout

#### Breadcrumb
`Women > Dresses`

#### Header
- **Title**: "Shop Secondhand Women's Dresses"
- **Description**: "From casual to formal, find your perfect pre-loved dress."

#### Product Grid
**3 Static Products**:
1. Floral Midi Dress - M - ₹499 - NEW IN
2. Summer Maxi Dress - L - ₹599 - VERIFIED
3. Casual Day Dress - S - ₹399

**Plus**: User-listed dresses

### Features
- Gender filtering support (women's only currently)
- Sold out tracking
- NEW IN badges for recent listings
- Same filtering/sorting as Tops page

### User Journey
Same as Tops page but for dresses specifically

---

## 🛒 5. PRODUCT DETAIL PAGE (`/product`)
**File**: `src/pages/Product.tsx`

### Purpose
Display detailed information about a specific product with purchase and seller contact options.

### Layout

#### Image Section (Left)
- **Single product image** (600px height, contain fit)
- **"Try On" badge button** (overlaid on image)
  - Click → Redirects to Virtual Try-On page with garment image

#### Details Section (Right)

**Product Information**:
- USER LISTING badge (if applicable)
- Product name (H2)
- Size
- Price (large, bold)

**Action Buttons**:
1. **ADD TO BAG**: Primary burgundy button
2. **ADD TO WISHLIST**: Outlined button with heart icon

**Service Info Bar**:
- Easy 30 day returns
- Express delivery available
- Every item is quality checked

**Seller Information** (User Listings Only):
- **Seller Name**: "Sold by [name]"
- **Show Contact Details Button**
  - Click → Reveals:
    - Email (clickable mailto link)
    - Phone (clickable tel link if provided)

**Delete Listing Section** (Seller Access):
- Info text: "Are you the seller? You can delete this listing."
- **"Delete This Listing" Button** (red)
  - Click → Opens OTP verification modal

**Description Section**:
- Product description
- Fabric details
- Condition notes

**Details Section**:
- Size: [size]
- Condition: [condition]
- Materials: Polyester, Elastane, Viscose (for static products)

### Features

#### Virtual Try-On Integration
- Click "Try On" → Navigate to `/virtual-tryon`
- Passes garment image and name via state

#### Purchase Flow
1. Click "Add to Bag"
2. Item added to cart
3. Toast notification appears
4. User listings → Marked as SOLD OUT

#### Seller Contact
1. Click "Show Contact Details"
2. Email and phone revealed
3. Click email → Opens mail client
4. Click phone → Opens phone dialer

#### Delete Listing (OTP Flow)
1. Click "Delete This Listing"
2. Confirmation modal opens
3. Click "Send OTP"
4. 6-digit OTP generated and shown in alert
5. Enter OTP
6. Click "Verify & Delete"
7. Item deleted from marketplace
8. Redirect to previous page

### User Journey

**Buyer**:
1. Click product from category page
2. View product details
3. Use Virtual Try-On (optional)
4. Click "Add to Bag"
5. Continue shopping or checkout

**Seller**:
1. View their listed product
2. See seller information
3. Option to delete listing (OTP verified)

---

## 🛍️ 6. CLEAROUT PAGE (`/clearout`)
**File**: `src/pages/Clearout.tsx`

### Purpose
Inform users about ReStyle's clearout (selling) service and guide them to list items.

### Layout

#### Hero Section
**Left Side**:
- **Title**: "WE LOVE PRE-LOVED"
- Subtitle: "Your old clothes deserve a new life"
- **"SELL AN ITEM" Button** → Redirects to Sell page
- "Return a bag" link

**Right Side**:
- Promotional image (pink shopping basket)

#### How It Works (3 Steps)

**Step 1: Order a Return Bag**
- Image: Pink basket icon
- Description: Request a free returns bag
- Click "request returns bag" → Triggers action

**Step 2: Fill It & Send It**
- Image: Packing illustration
- Description: Pack pre-loved items and ship

**Step 3: Get Paid**
- Image: Payment illustration
- Description: We price and sell, you get paid

**Center CTA**: "START CLEAROUT" button

#### Benefits Stats
3 statistics:
- **90%**: Earnings rate
- **14**: Days average turnaround
- **100K+**: Items cleared

#### Benefits Grid (6 Cards)

1. **QUALITY FIRST**
   - We check every item
   - Only the best make it to sale

2. **EASY PROCESS**
   - Free returns bag
   - We do the hard work

3. **INSTANT PAYMENT**
   - Get paid as soon as items sell
   - Secure bank transfer

4. **ECO FRIENDLY**
   - Give clothes a second life
   - Reduce landfill waste

5. **PREMIUM BRANDS**
   - We love designer & high street
   - Better brands, better earnings

6. **NO HASSLE**
   - No photos or listings needed
   - We handle everything

### User Journey
1. Learn about clearout process
2. Click "SELL AN ITEM" or "START CLEAROUT"
3. Redirect to Sell page
4. Fill out listing form
5. Submit item to marketplace

---

## 📝 7. SELL PAGE (`/clearout` → Sell Form)
**File**: `src/pages/Sell.tsx`

### Purpose
Allow sellers to list their pre-loved clothing items on the marketplace.

### Layout

#### Header
- **Title**: "List an Item"
- Description: "Fill in the details below to list your pre-loved piece on ReStyle."

#### Form Sections

### 1. Photos Section (Required)
**5 Image Upload Slots**:
1. Front
2. Back
3. Left Side
4. Right Side
5. Detail / Label

**Upload Process**:
- Click slot → Opens file picker
- Select image → Preview shown
- Click again → Replace image

**Minimum**: 2 images required

### 2. Item Details Section

**Required Fields**:
- **Item Title**: Product name (e.g., "Zara Floral Midi Dress")
- **Gender**: Dropdown
  - Women's
  - Men's
- **Category**: Dropdown
  - Tops
  - Dresses
  - Bottoms (Jeans, Trousers, Skirts)
  - Coats & Jackets
  - Accessories
- **Price (₹)**: Number input (decimal allowed)
- **Description**: Textarea (fabric, fit, flaws)
- **Size**: Dropdown
  - XS, S, M, L, XL, XXL, One Size
- **Condition**: Dropdown
  - Brand New
  - Like New
  - Good
  - Fair
  - Well Worn

### 3. Seller Details Section

**Required Fields**:
- **Full Name**: Seller's name
- **Email**: Contact email

**Optional Fields**:
- **Phone**: Contact number

### Submission

**"Submit Listing" Button**:
- Validates all required fields
- Checks minimum 2 images
- Creates listing with:
  - Unique ID (timestamp)
  - Current date/time
  - "NEW IN" badge
  - isSold: false

**Navigation Logic**:
- **Men's items** → `/tops?gender=men` (unified men's page)
- **Women's items** → `/{category}?gender=women` (specific category page)

### Features

#### Image Management
- Click to upload
- Preview thumbnails
- Replace functionality
- Validation (min 2 images)

#### Form Validation
- All required fields checked
- Toast notification for errors
- Success toast on submission

#### Auto-Navigation
- 1.5 second delay after submission
- Redirect to appropriate category page
- Item appears with "NEW IN" badge

### User Journey
1. Navigate from Clearout page
2. Upload at least 2 product images
3. Fill in all required fields
4. Select gender and category
5. Enter seller contact info
6. Click "Submit Listing"
7. See success toast
8. Auto-redirect to category page
9. View listed item with "NEW IN" badge

---

## 🛒 8. CART PAGE (`/cart`)
**File**: `src/pages/Cart.tsx`

### Purpose
Review items in shopping cart, adjust quantities, and proceed to checkout.

### Layout

#### Header
- **Title**: "Shopping Bag"
- Item count: "(X items)"

#### Cart Items List

**Each Item Card Shows**:
- Product image (square, 120px)
- Product name
- SKU code
- Size
- Price per unit
- Quantity selector (- / number / +)
- Subtotal
- Remove button (X icon)

#### Empty Cart State
- Icon: Empty bag illustration
- Message: "Your bag is empty"
- "Continue Shopping" button

#### Cart Summary (Right Sidebar)

**Subtotal Breakdown**:
- Subtotal: ₹XXX
- Delivery: ₹50 (or FREE if > ₹1000)
- **Total**: ₹XXX (bold, large)

**Action Buttons**:
1. **"PROCEED TO CHECKOUT"** (primary)
2. **"CONTINUE SHOPPING"** (secondary)

#### Promo Code Section
- Input field: "Enter promo code"
- "APPLY" button

### Features

#### Quantity Management
- **Increase (+)**: Add one more item
- **Decrease (-)**: Remove one item
- **Minimum**: 1 item
- Auto-updates subtotal

#### Remove Item
- Click X icon
- Item removed from cart
- Cart count updates
- Total recalculates

#### Free Delivery Threshold
- Orders ≥ ₹1000: FREE delivery
- Orders < ₹1000: ₹50 delivery fee

#### Cart Persistence
- Items stored in React Context
- Survives page navigation
- Cleared on browser refresh (session-based)

### User Journey
1. View all cart items
2. Adjust quantities
3. Remove unwanted items
4. Review total
5. Click "Proceed to Checkout"
6. OR continue shopping

---

## 👤 9. LOGIN PAGE (`/login`)
**File**: `src/pages/Login.tsx`

### Purpose
User authentication portal for accessing account features.

### Layout

#### Header
- **Title**: "Welcome Back"
- Description: "Log in to access your account"

#### Login Form (Burgundy Box)

**Input Fields**:
1. **Email Address**
   - Type: email
   - Placeholder: "you@example.com"

2. **Password**
   - Type: password
   - Placeholder: "••••••••"

**Links**:
- "Forgot password?" (underlined)

**Login Button**:
- Full width
- Cream/beige background
- Text: "LOG IN"

#### Error Handling
- Red error message for invalid credentials
- Field validation

#### Create Account Section
- Text: "Don't have an account? Create one"
- "Create one" is emphasized

### Features
- Form validation
- Error display
- "Remember me" functionality (planned)
- Password reset link

### User Journey
1. Enter email
2. Enter password
3. Click "LOG IN"
4. If success → Redirect to home/profile
5. If error → Show error message
6. OR click "Create one" → Registration flow

---

## 👤 10. PROFILE PAGE (`/profile`)
**File**: `src/pages/Profile.tsx`

### Purpose
View and manage user account information, orders, and saved items.

### Layout

#### Profile Header
- User avatar/icon
- Username
- Email address
- Member since date

#### Profile Sections

### 1. My Orders
- Order history list
- Order number, date, status
- View order details button
- Track shipment

### 2. My Listings
- Items user has listed for sale
- Active listings
- Sold items
- Pending items
- Edit/delete listing options

### 3. Wishlist
- Saved/favorited items
- Quick add to cart
- Remove from wishlist

### 4. Saved Addresses
- Delivery addresses
- Edit/delete addresses
- Set default address

### 5. Payment Methods
- Saved cards
- Add new payment method

### 6. Account Settings
- Edit profile button
- Change password
- Email preferences
- Privacy settings
- Logout button

### User Journey
1. View account dashboard
2. Check orders
3. Manage listings
4. Review wishlist
5. Update settings
6. Logout

---

## ✏️ 11. EDIT PROFILE PAGE (`/edit-profile`)
**File**: `src/pages/EditProfile.tsx`

### Purpose
Update user account information and preferences.

### Layout

#### Form Sections

### Personal Information
- **Full Name**: Text input
- **Email**: Email input (disabled if verified)
- **Phone**: Phone number input
- **Date of Birth**: Date picker

### Profile Photo
- Current photo preview
- Upload new photo button
- Remove photo option

### Delivery Address
- Address line 1
- Address line 2
- City
- State/Province
- Postal code
- Country

### Size Preferences
- Top size
- Bottom size
- Dress size
- Shoe size

### Style Preferences
- Favorite brands
- Preferred styles (checkboxes)
- Color preferences

### Notification Preferences
- Email notifications toggle
- SMS notifications toggle
- Push notifications toggle

**Action Buttons**:
- "SAVE CHANGES" (primary)
- "CANCEL" (secondary)

### User Journey
1. Update personal info
2. Upload profile photo
3. Set size preferences
4. Configure notifications
5. Click "Save Changes"
6. Confirmation toast
7. Return to profile page

---

## 🎨 12. AI STYLIST PAGE (`/ai-stylist`)
**File**: `src/pages/AIStylist.tsx`

### Purpose
Get AI-powered outfit recommendations based on user's wardrobe and preferences.

### Layout

#### Header
- **Title**: "AI Stylist"
- Subtitle: "Let AI create the perfect outfit from your wardrobe"

#### Occasion Selector
Buttons for different occasions:
- Casual
- Work
- Date Night
- Party
- Gym
- Formal

#### Mood/Vibe Selector
Style preferences:
- Minimalist
- Bold & Colorful
- Vintage
- Sporty
- Elegant
- Edgy

#### Weather Integration
- Current weather display
- Temperature
- Outfit suggestions adjusted for weather

#### "Generate Outfit" Button
- Primary action
- Triggers AI recommendation

#### Outfit Display

**Generated Outfit Shows**:
- 3-5 clothing items from wardrobe
- Top, bottom, shoes, accessories
- Item images in outfit layout
- Styling tips text

**Actions**:
- Save outfit
- Try in virtual try-on
- Add items to cart (if shopping)
- Regenerate new outfit

### Features
- Wardrobe integration
- Occasion-based styling
- Weather-aware recommendations
- Save favorite outfits
- Share outfit

### User Journey
1. Select occasion (e.g., "Work")
2. Choose mood (e.g., "Minimalist")
3. Click "Generate Outfit"
4. View AI-styled outfit
5. Save or regenerate
6. Try items via virtual try-on

---

## 💬 13. AI STYLIST CHAT (`/ai-stylist-chat`)
**File**: `src/pages/AIStylistChat.tsx`

### Purpose
Conversational AI interface for personalized styling advice and fashion questions.

### Layout

#### Chat Header
- "AI Stylist Chat"
- Status: "Online"
- Minimize/close buttons

#### Chat Window

**Welcome Message**:
"Hi! I'm your AI fashion assistant. How can I help you today?"

**Sample Prompts**:
- "What should I wear to a wedding?"
- "Help me style these jeans"
- "Color matching advice"
- "Capsule wardrobe ideas"

#### Chat Interface

**Message Types**:
1. **User Messages**: Right-aligned, blue bubble
2. **AI Messages**: Left-aligned, gray bubble
3. **System Messages**: Center-aligned, italic

**Input Area**:
- Text input field
- Send button
- Attach image button (share outfit photo)
- Emoji picker

#### AI Capabilities
- Outfit suggestions
- Color matching advice
- Trend information
- Shopping recommendations
- Styling tips
- Wardrobe organization help

### Features
- Real-time chat
- Image sharing
- Context awareness
- Fashion trend knowledge
- Personal style memory
- Product recommendations

### User Journey
1. Type fashion question
2. AI responds with advice
3. Share outfit photo (optional)
4. Get specific recommendations
5. Save conversation
6. Apply advice

---

## 👗 14. WARDROBE MANAGER (`/wardrobe`)
**File**: `src/pages/Wardrobe.tsx`

### Purpose
Digital closet management - upload, organize, and track clothing items.

### Layout

#### Header
- **Title**: "My Wardrobe"
- **Stats Bar**:
  - Total items: XX
  - Most worn: [item name]
  - Least worn: [item name]
  - Cost per wear: ₹XX

#### Filter/Sort Bar
- Category filter (All, Tops, Bottoms, Dresses, etc.)
- Color filter
- Season filter
- Brand filter
- Sort by: Date added, Most worn, Least worn

#### Wardrobe Grid

**Each Item Card Shows**:
- Item photo
- Item name
- Category
- Times worn counter
- Last worn date
- Edit button
- Delete button

#### Add Item Button (FAB)
- Floating action button (bottom right)
- Plus icon
- Opens add item modal

### Add Item Modal

**Upload Methods**:
1. **Take Photo**: Camera access
2. **Choose from Gallery**: File picker
3. **Scan Receipt**: Auto-extract details

**Item Details**:
- Category dropdown
- Brand name
- Color
- Size
- Season (Spring, Summer, Fall, Winter)
- Price (optional)
- Purchase date
- Notes

**Save Button**: Adds item to wardrobe

### Item Detail View (Click Card)

**Information Displayed**:
- Full-size photo
- All item details
- Wear history (dates worn)
- Outfit combinations (items worn together)
- Cost per wear calculation

**Actions**:
- Edit details
- Add to outfit
- Mark as worn
- Delete item
- Sell item (list on marketplace)

### Features

#### Wear Tracking
- Tap item → Mark as worn today
- Automatic wear history
- Cost per wear calculation

#### Outfit Creation
- Select multiple items
- Save as outfit
- Schedule OOTD (outfit of the day)

#### Analytics
- Most worn items
- Least worn items (sell suggestions)
- Seasonal wardrobe insights
- Cost analysis

#### Integration
- Export item to marketplace (sell)
- Use in AI Stylist
- Virtual try-on combinations

### User Journey

**Add Items**:
1. Click + button
2. Upload photo
3. Fill in details
4. Save to wardrobe

**Track Wear**:
1. Browse wardrobe
2. Click item worn today
3. Automatic logging

**Organize**:
1. Filter by category/season
2. Sort by usage
3. Review least worn items

**Monetize**:
1. Find unworn items
2. Click "Sell"
3. Auto-fill sell form
4. List on marketplace

---

## 🔄 15. VIRTUAL TRY-ON PAGE (`/virtual-tryon`)
**File**: `src/pages/VirtualTryOn.tsx`

### Purpose
AI-powered virtual fitting room - visualize how clothing looks on you before purchasing.

### Layout

#### Header
- Badge: "AI POWERED"
- **Title**: "Virtual Try-On Studio"
- Subtitle: "See how items look on you before you buy"

#### How It Works Section
3 cards explaining the process:

1. **Upload Your Photo**
   - Icon: User photo
   - Description: Take or upload a photo of yourself

2. **Select Clothing**
   - Icon: Shirt
   - Description: Choose items from marketplace

3. **See the Magic**
   - Icon: Sparkles
   - Description: AI generates realistic try-on

#### Try-On Studio

**Two Input Panels**:

### Panel 1: Your Photo
- **Step 1** badge
- Title: "Upload Your Photo"
- Dropzone area
- "Upload Photo" button
- "Use Sample" button (demo image)
- Accepted formats: JPG, PNG
- File size limit: 5MB

### Panel 2: Select Garment
- **Step 2** badge
- Title: "Choose Garment"
- Dropzone area
- "Upload Garment" button
- OR browse from products
- Accepted formats: JPG, PNG
- File size limit: 5MB

**Center Connector**: Plus icon in circle

#### Generate Button
- Large primary button
- Text: "Generate Try-On"
- Disabled until both images uploaded
- Click → Starts AI processing

#### Processing State
- Loading spinner
- Status: "Generating your virtual try-on..."
- Progress indicator
- Estimated time: ~10-15 seconds

#### Result Display

**Result Card Shows**:
- ✓ Success badge
- Title: "Your Virtual Try-On"
- Download button

**Main Image**:
- Generated try-on photo
- High resolution
- Realistic rendering

**Sidebar Breakdown**:
1. **Your Photo**: Thumbnail preview
2. **Selected Garment**: Thumbnail preview
3. **Result**: Final combined image

**Tips Section**:
- Best practices for photos
- Lighting suggestions
- Pose recommendations

**Action Buttons**:
1. **Download Result**: Save to device
2. **Try Another**: Reset and start over
3. **Add to Cart**: Purchase the item

#### Trending Catalog
Scrollable carousel of popular items to try:
- Product thumbnails
- Click to auto-load in garment slot
- Quick try-on functionality

### Technical Details

#### AI Service
- **Provider**: Puter.com AI API
- **Model**: Gemini 3 Pro Image (nano-banana-pro)
- **Process**: Cloud-based AI processing
- **Privacy**: Images not stored permanently

#### Image Requirements
- **Person Photo**: 
  - Clear, well-lit photo
  - Facing camera
  - Standing position
  - Full body or upper body
  
- **Garment Photo**:
  - Product image on white background
  - Clear, high resolution
  - Front-facing view

#### Error Handling
- Invalid image format → Error message
- File too large → Size warning
- API failure → Retry option
- Network error → Connection message

### Features

#### Sample Images
- Demo person photo
- Demo garment image
- Quick test without upload

#### Result Management
- Download HD image
- Share on social media
- Save to wardrobe
- Add item to cart

#### Product Integration
- Click product → Auto-load in try-on
- Seamless shopping flow
- Direct add to cart

### User Journey

**Standard Flow**:
1. Upload personal photo
2. Select garment from marketplace
3. Click "Generate Try-On"
4. Wait for AI processing (~10s)
5. View realistic result
6. Download or add to cart
7. Try another or purchase

**Quick Test Flow**:
1. Click "Use Sample" photos
2. Generate demo try-on
3. See how it works
4. Then upload real photos

**Shopping Integration**:
1. Browse products
2. Click "Try On" badge
3. Auto-navigate to virtual try-on
4. Garment pre-loaded
5. Upload your photo
6. Generate and decide
7. Add to cart if satisfied

---

## 📊 FEATURE SUMMARY TABLE

| Page | Route | Main Purpose | Key Actions |
|------|-------|--------------|-------------|
| Home | `/` | Landing & discovery | Browse, navigate categories |
| Women's Tops | `/tops?gender=women` | Shop women's tops | Filter, sort, add to cart |
| Men's Clothing | `/tops?gender=men` | Shop all men's items | Filter by category, purchase |
| Dresses | `/dresses?gender=women` | Shop dresses | Browse, purchase |
| Product Detail | `/product` | View product info | Try on, buy, contact seller |
| Clearout Info | `/clearout` | Learn about selling | Navigate to sell form |
| Sell/List Item | `/clearout` (form) | List items for sale | Upload, fill form, submit |
| Shopping Cart | `/cart` | Review cart | Adjust quantity, checkout |
| Login | `/login` | User authentication | Login, create account |
| Profile | `/profile` | Account management | View orders, listings, settings |
| Edit Profile | `/edit-profile` | Update account | Edit info, preferences |
| AI Stylist | `/ai-stylist` | Get outfit ideas | Select occasion, generate |
| AI Chat | `/ai-stylist-chat` | Fashion advice chat | Ask questions, get tips |
| Wardrobe | `/wardrobe` | Manage digital closet | Add items, track wear |
| Virtual Try-On | `/virtual-tryon` | Try clothes virtually | Upload photo, generate |

---

## 🔗 PAGE NAVIGATION FLOW

```
HOME
├─→ Women → Tops → Product → Cart → Checkout
├─→ Men → Men's Clothing → Product → Cart → Checkout
├─→ Virtual Try-On → (with garment) → Product → Cart
├─→ AI Stylist → Generate Outfit → Virtual Try-On
├─→ Wardrobe → Add Items → Track Wear → Sell Item
├─→ Clearout → Sell Form → Submit → Product Listed
└─→ Login → Profile → Edit Profile → Logout
```

---

## 🎯 KEY USER WORKFLOWS

### 1. BUYING WORKFLOW
```
Home → Browse Category → Product Detail → Add to Cart → Cart → Checkout
```

### 2. SELLING WORKFLOW
```
Home → Clearout → Sell Form → Upload Photos → Fill Details → Submit → Listed
```

### 3. VIRTUAL TRY-ON WORKFLOW
```
Product → Try On Button → Virtual Try-On → Upload Photo → Generate → Add to Cart
```

### 4. WARDROBE WORKFLOW
```
Home → Wardrobe → Add Item → Upload Photo → Track Wear → Sell (optional)
```

### 5. AI STYLING WORKFLOW
```
Home → AI Stylist → Select Occasion → Generate Outfit → Virtual Try-On → Purchase
```

### 6. DELETE LISTING WORKFLOW
```
Product Detail → Delete Button → Confirm → Send OTP → Enter OTP → Delete → Redirect
```

---

## 🔒 AUTHENTICATION & SECURITY

### Public Pages (No Login Required)
- Home
- Category pages (Tops, Dresses)
- Product detail
- Virtual Try-On
- Clearout info
- Login page

### Protected Pages (Login Required)
- Profile
- Edit Profile
- Cart (session-based)
- Wardrobe
- AI Stylist (personalized)
- Sell form (requires seller info)

### Seller-Only Features
- Delete own listings (OTP verified)
- View seller contact info
- Manage listings

---

## 📱 RESPONSIVE DESIGN

All pages are responsive with:
- **Desktop**: Full layout, sidebar filters
- **Tablet**: Adjusted grid, collapsible sections
- **Mobile**: Single column, bottom navigation, drawer menus

---

## 🎨 DESIGN SYSTEM

### Colors
- **Primary**: #a4133c (Burgundy)
- **Secondary**: #fffcf2 (Cream)
- **Background**: #fffcf2 (Light cream)
- **Text**: #111 (Black)
- **Success**: #4caf50 (Green)
- **Error**: #dc3545 (Red)

### Typography
- **Headers**: Arial, bold, 900 weight
- **Body**: Arial, regular
- **Size**: 14-16px base

### Components
- **Buttons**: Rounded, 8px radius, burgundy primary
- **Cards**: White, 1px border, 6-14px radius
- **Badges**: Small, uppercase, colored backgrounds
- **Toast**: Bottom-right, auto-dismiss

---

## 🚀 PERFORMANCE FEATURES

### State Management
- **React Context**: Cart, Listings, User
- **Local Storage**: Persistent listings
- **Session Storage**: Cart items

### Image Optimization
- **Lazy loading**: Off-screen images
- **Object-fit**: Contain/cover for consistency
- **Max dimensions**: 600px height for products

### API Integration
- **Puter.com**: Virtual try-on AI
- **Future**: Payment gateway, email service

---

## 📈 FUTURE ENHANCEMENTS

### Planned Features
1. **Backend Integration**: Real database, user accounts
2. **Payment Gateway**: Secure checkout
3. **Email Service**: Real OTP emails
4. **Order Tracking**: Shipment status
5. **Reviews & Ratings**: Product feedback
6. **Chat System**: Buyer-seller messaging
7. **Social Sharing**: Share outfits, products
8. **Size Recommendations**: AI-powered sizing
9. **AR Try-On**: Mobile AR integration
10. **Subscription Model**: Premium features

---

## 🎯 CONCLUSION

ReStyle combines traditional e-commerce with innovative AI features to create a comprehensive sustainable fashion platform. Each page serves a specific purpose in the user journey, from discovery to purchase to wardrobe management.

**Core Value Proposition**:
- ♻️ Sustainable fashion (pre-loved items)
- 🤖 AI-powered features (Virtual Try-On, Styling)
- 📱 Modern UX (Responsive, intuitive)
- 🛍️ Seamless shopping (Easy listing & purchasing)
- 👔 Smart wardrobe management

This documentation provides a complete overview for developers, designers, stakeholders, and users to understand the full scope and functionality of the ReStyle platform.
