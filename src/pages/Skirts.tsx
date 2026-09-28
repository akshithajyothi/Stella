import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import { useCart } from '../context/CartContext';
import { useListings } from '../context/ListingsContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import Toast from '../components/Toast';
import Breadcrumb from '../components/Breadcrumb';
import EmptyState from '../components/EmptyState';
import IconButton from '../components/IconButton';

const staticProducts = [
  // Skirts (from products/skirts)
  { id: 1400, name: 'Blue Green Ombre Floral Denim Skirt', size: 'XS', price: 499, badge: 'NEW IN', image: '/products/skirts/blue-green-ombre-floral-denim-skirt.jpg', gender: 'women', color: 'Blue green', condition: 'Excellent', category: 'skirts', description: 'A blue green ombre floral denim skirt, finished in a blue green shade with the natural character of a pre-loved, thrifted find. A versatile pick for pairing with a fitted top or oversized sweater for a balanced silhouette, sourced through ReStyle\'s sustainable secondhand marketplace.' },
  { id: 1401, name: 'Brown Pinstripe Mini Skirt', size: 'S', price: 549, badge: 'VERIFIED', image: '/products/skirts/brown-pinstripe-mini-skirt.jpg', gender: 'women', color: 'Brown', condition: 'Very Good', category: 'skirts', description: 'A brown pinstripe mini skirt, finished in a brown shade with the natural character of a pre-loved, thrifted find. A versatile pick for pairing with a fitted top or oversized sweater for a balanced silhouette, sourced through ReStyle\'s sustainable secondhand marketplace.' },
  { id: 1402, name: 'Brown Ruffled Lace Trim Maxi Skirt', size: 'M', price: 469, badge: '', image: '/products/skirts/brown-ruffled-lace-trim-maxi-skirt.jpg', gender: 'women', color: 'Brown', condition: 'Good', category: 'skirts', description: 'A brown ruffled lace trim maxi skirt, finished in a brown shade with the natural character of a pre-loved, thrifted find. A versatile pick for pairing with a fitted top or oversized sweater for a balanced silhouette, sourced through ReStyle\'s sustainable secondhand marketplace.' },
  { id: 1403, name: 'Green Embroidered Denim Midi Skirt', size: 'L', price: 599, badge: '', image: '/products/skirts/green-embroidered-denim-midi-skirt.jpg', gender: 'women', color: 'Green', condition: 'Excellent', category: 'skirts', description: 'A green embroidered denim midi skirt, finished in a green shade with the natural character of a pre-loved, thrifted find. A versatile pick for pairing with a fitted top or oversized sweater for a balanced silhouette, sourced through ReStyle\'s sustainable secondhand marketplace.' },
  { id: 1404, name: 'Olive Green Tiered Maxi Skirt', size: 'XL', price: 449, badge: 'NEW IN', image: '/products/skirts/olive-green-tiered-maxi-skirt.jpg', gender: 'women', color: 'Olive green', condition: 'Very Good', category: 'skirts', description: 'A olive green tiered maxi skirt, finished in an olive green shade with the natural character of a pre-loved, thrifted find. A versatile pick for pairing with a fitted top or oversized sweater for a balanced silhouette, sourced through ReStyle\'s sustainable secondhand marketplace.' },
];

interface Filters {
  sizes: string[];
  colors: string[];
  conditions: string[];
  priceRange: { min: number; max: number };
}

const Skirts = () => {
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [addedIds, setAddedIds] = useState<number[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { getListingsByCategory, markAsSold } = useListings();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  // Filter states
  const [filters, setFilters] = useState<Filters>({
    sizes: [],
    colors: [],
    conditions: [],
    priceRange: { min: 0, max: 10000 }
  });
  
  const [sortType, setSortType] = useState<'recommended' | 'newest' | 'low-high' | 'high-low'>('recommended');
  const [search, setSearch] = useState(searchParams.get('q') || '');

  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    size: false,
    color: false,
    condition: false,
    priceRange: false
  });

  // Get gender filter from URL or default to 'women'
  const currentGender = searchParams.get('gender') || 'women';

  // Get user-submitted listings for skirts category with gender filter
  const userListings = getListingsByCategory('skirts', currentGender);

  // Check if item is NEW IN (created within last 7 days)
  const isNewItem = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  };

  // Combine static products with user listings
  const allProductsBeforeFilter = [
    ...userListings.map(listing => ({
      id: listing.id,
      name: listing.name,
      size: listing.size,
      price: listing.price,
      badge: listing.isSold ? 'SOLD OUT' : (isNewItem(listing.createdAt) ? 'NEW IN' : listing.badge || ''),
      image: listing.image,
      sellerName: listing.sellerName,
      sellerEmail: listing.sellerEmail,
      sellerPhone: listing.sellerPhone,
      description: listing.description,
      condition: listing.condition || 'Good',
      isUserListing: true,
      isSold: listing.isSold,
      gender: listing.gender,
      color: listing.color || 'N/A',
    })),
    ...staticProducts
      .filter(p => p.gender === currentGender)
      .map(p => ({ ...p, isUserListing: false, sellerName: undefined, sellerEmail: undefined, sellerPhone: undefined, description: p.description, isSold: false })),
  ];
  
  // Apply filters
  const allProducts = allProductsBeforeFilter.filter(product => {
    // Size filter
    if (filters.sizes.length > 0 && !filters.sizes.includes(product.size)) {
      return false;
    }
    
    // Color filter
    if (filters.colors.length > 0 && product.color && !filters.colors.includes(product.color)) {
      return false;
    }
    
    // Condition filter
    if (filters.conditions.length > 0 && product.condition && !filters.conditions.includes(product.condition)) {
      return false;
    }
    
    // Price range filter
    if (product.price < filters.priceRange.min || product.price > filters.priceRange.max) {
      return false;
    }

    // Search filter
    if (search && !product.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    return true;
  });

  const sortedProducts = [...allProducts].sort((a, b) => {
    if (sortType === 'low-high') return a.price - b.price;
    if (sortType === 'high-low') return b.price - a.price;
    if (sortType === 'newest') return b.id - a.id;
    return 0;
  });
  
  // Available filter options based on current products
  const availableSizes = Array.from(new Set(allProductsBeforeFilter.map(p => p.size))).sort();
  const availableColors = Array.from(new Set(allProductsBeforeFilter.map(p => p.color).filter(Boolean))).sort();
  const availableConditions = Array.from(new Set(allProductsBeforeFilter.map(p => p.condition).filter(Boolean))).sort();
  
  // Toggle filter section
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  // Handle filter changes
  const toggleFilter = (type: keyof Filters, value: string) => {
    setFilters(prev => {
      const currentArray = prev[type] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(v => v !== value)
        : [...currentArray, value];
      return { ...prev, [type]: newArray };
    });
  };
  
  const handlePriceRangeChange = (min: number, max: number) => {
    setFilters(prev => ({ ...prev, priceRange: { min, max } }));
  };
  
  const clearAllFilters = () => {
    setFilters({
      sizes: [],
      colors: [],
      conditions: [],
      priceRange: { min: 0, max: 10000 }
    });
  };
  
  const hasActiveFilters = filters.sizes.length > 0 || filters.colors.length > 0 || 
                          filters.conditions.length > 0 ||
                          filters.priceRange.min > 0 || filters.priceRange.max < 10000;

  const toggleSort = () => setSortOpen(!sortOpen);
  const applySort = (type: typeof sortType) => { setSortType(type); setSortOpen(false); };
  const openFilter = () => setFilterOpen(true);
  const closeFilter = () => setFilterOpen(false);

  const handleAddToBag = (e: React.MouseEvent, product: typeof allProducts[0]) => {
    e.stopPropagation();
    
    if (product.isSold) {
      alert('This item is sold out');
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      sku: `RST-${product.id}`,
      price: product.price,
      image: product.image,
      inStock: true,
      size: product.size,
    });

    // Mark user listing as sold
    if (product.isUserListing) {
      markAsSold(product.id);
    }

    setAddedIds(prev => [...prev, product.id]);
    setTimeout(() => setAddedIds(prev => prev.filter(id => id !== product.id)), 2500);
    showToast('Added to bag');
  };

  const openProduct = (product: typeof allProducts[0]) => navigate('/product', { state: product });

  return (
    <>
      <Header />

      <Toast />

      <div className="page">
        <Breadcrumb items={[{ label: currentGender === 'women' ? 'Women' : 'Men', to: currentGender === 'women' ? '/' : '/tops?gender=men' }, { label: 'Skirts' }]} />

        <h1>Shop Secondhand {currentGender === 'women' ? "Women's" : "Men's"} Skirts</h1>
        <p className="desc">
          From minis to maxis, find your perfect pre-loved skirt.
        </p>

        <div className="filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search the collection"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search the collection"
            />
            <button type="button" aria-label="Search"><i className="fa-solid fa-magnifying-glass"></i></button>
          </div>

          <div className="sort-wrapper">
            <button className="sort-btn" onClick={toggleSort}>
              SORT <i className="fa-solid fa-chevron-down"></i>
            </button>

            <div className={`sort-dropdown ${sortOpen ? 'show' : ''}`}>
              <div onClick={() => applySort('recommended')}>RECOMMENDED</div>
              <div onClick={() => applySort('newest')}>NEWEST</div>
              <div onClick={() => applySort('low-high')}>PRICE (LOW TO HIGH)</div>
              <div onClick={() => applySort('high-low')}>PRICE (HIGH TO LOW)</div>
            </div>
          </div>

          <button className="filter-btn" onClick={openFilter}>
            FILTER <i className="fa-solid fa-sliders"></i>
          </button>
        </div>

        <div className="count">{allProducts.length} items found</div>
        
        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '10px', 
            padding: '10px 20px',
            background: '#f9f9f9',
            borderRadius: '4px',
            margin: '0 20px 20px'
          }}>
            <span style={{ fontWeight: 'bold', marginRight: '10px' }}>Active Filters:</span>
            {filters.sizes.map(size => (
              <span key={size} style={{
                padding: '4px 12px',
                background: '#8b1538',
                color: 'white',
                borderRadius: '20px',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                Size: {size}
                <i 
                  className="fa-solid fa-xmark" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleFilter('sizes', size)}
                ></i>
              </span>
            ))}
            {filters.colors.map(color => (
              <span key={color} style={{
                padding: '4px 12px',
                background: '#8b1538',
                color: 'white',
                borderRadius: '20px',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                Color: {color}
                <i 
                  className="fa-solid fa-xmark" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleFilter('colors', color)}
                ></i>
              </span>
            ))}
            {filters.conditions.map(cond => (
              <span key={cond} style={{
                padding: '4px 12px',
                background: '#8b1538',
                color: 'white',
                borderRadius: '20px',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                Condition: {cond}
                <i 
                  className="fa-solid fa-xmark" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleFilter('conditions', cond)}
                ></i>
              </span>
            ))}
            {(filters.priceRange.min > 0 || filters.priceRange.max < 10000) && (
              <span style={{
                padding: '4px 12px',
                background: '#8b1538',
                color: 'white',
                borderRadius: '20px',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                ₹{filters.priceRange.min} - ₹{filters.priceRange.max}
                <i 
                  className="fa-solid fa-xmark" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handlePriceRangeChange(0, 10000)}
                ></i>
              </span>
            )}
            <button 
              onClick={clearAllFilters}
              style={{
                padding: '4px 12px',
                background: 'transparent',
                color: '#8b1538',
                border: '1px solid #8b1538',
                borderRadius: '20px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Clear All
            </button>
          </div>
        )}

        {allProducts.length === 0 && (
          <EmptyState
            icon="fa-solid fa-magnifying-glass"
            title="No items found"
            message="Try adjusting your search or filters."
          />
        )}

        <div className="products">
          {sortedProducts.map(product => (
            <div 
              className={`product ${product.isSold ? 'sold-out' : ''}`}
              key={product.id} 
              onClick={() => openProduct(product)}
            >
              {product.badge && <span className={`badge ${product.badge === 'SOLD OUT' ? 'badge-sold' : product.badge === 'NEW IN' ? 'badge-new' : ''}`}>{product.badge}</span>}
              <img src={product.image} alt={product.name} style={{ opacity: product.isSold ? 0.5 : 1 }} />
              <h4>{product.name}</h4>
              <p>Size {product.size}</p>
              {product.isUserListing && (
                <p className="seller-info">
                  <i className="fa-solid fa-user"></i> Sold by {product.sellerName}
                </p>
              )}
              <div className="product-bottom-row">
                <div className="price">₹{product.price}</div>
                <IconButton
                  icon={isWishlisted(product.id) ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}
                  aria-label={isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  className={`wishlist-icon ${isWishlisted(product.id) ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); toggleWishlist({ id: product.id, name: product.name, price: product.price, image: product.image, size: product.size }); }}
                />
              </div>
              <button
                className="add-bag-btn"
                onClick={(e) => handleAddToBag(e, product)}
                disabled={product.isSold}
              >
                {product.isSold ? 'Sold Out' : (addedIds.includes(product.id) ? '✓ Added' : '+ Add to Bag')}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className={`filter-overlay ${filterOpen ? 'show' : ''}`} onClick={closeFilter}></div>
      <div className={`filter-panel ${filterOpen ? 'open' : ''}`}>
        <div className="filter-header">
          <h3>Filter By</h3>
          <IconButton icon="fa-solid fa-xmark" aria-label="Close filters" onClick={closeFilter} />
        </div>
        
        {/* Size Filter */}
        <div className="filter-section">
          <div 
            className="filter-item" 
            onClick={() => toggleSection('size')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            aria-expanded={expandedSections.size}
            role="button"
            tabIndex={0}
          >
            <span>Size {filters.sizes.length > 0 && `(${filters.sizes.length})`}</span>
            <i className={`fa-solid fa-chevron-${expandedSections.size ? 'up' : 'down'}`}></i>
          </div>
          {expandedSections.size && (
            <div style={{ padding: '10px', background: '#f9f9f9' }}>
              {availableSizes.map(size => (
                <label key={size} style={{ display: 'block', marginBottom: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={filters.sizes.includes(size)}
                    onChange={() => toggleFilter('sizes', size)}
                    style={{ marginRight: '8px' }}
                  />
                  {size}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Color Filter */}
        <div className="filter-section">
          <div 
            className="filter-item" 
            onClick={() => toggleSection('color')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            aria-expanded={expandedSections.color}
            role="button"
            tabIndex={0}
          >
            <span>Colour {filters.colors.length > 0 && `(${filters.colors.length})`}</span>
            <i className={`fa-solid fa-chevron-${expandedSections.color ? 'up' : 'down'}`}></i>
          </div>
          {expandedSections.color && (
            <div style={{ padding: '10px', background: '#f9f9f9' }}>
              {availableColors.map(color => (
                <label key={color} style={{ display: 'block', marginBottom: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={filters.colors.includes(color)}
                    onChange={() => toggleFilter('colors', color)}
                    style={{ marginRight: '8px' }}
                  />
                  {color}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Condition Filter */}
        <div className="filter-section">
          <div 
            className="filter-item" 
            onClick={() => toggleSection('condition')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            aria-expanded={expandedSections.condition}
            role="button"
            tabIndex={0}
          >
            <span>Condition {filters.conditions.length > 0 && `(${filters.conditions.length})`}</span>
            <i className={`fa-solid fa-chevron-${expandedSections.condition ? 'up' : 'down'}`}></i>
          </div>
          {expandedSections.condition && (
            <div style={{ padding: '10px', background: '#f9f9f9' }}>
              {availableConditions.map(condition => (
                <label key={condition} style={{ display: 'block', marginBottom: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={filters.conditions.includes(condition)}
                    onChange={() => toggleFilter('conditions', condition)}
                    style={{ marginRight: '8px' }}
                  />
                  {condition}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price Range Filter */}
        <div className="filter-section">
          <div 
            className="filter-item" 
            onClick={() => toggleSection('priceRange')}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            aria-expanded={expandedSections.priceRange}
            role="button"
            tabIndex={0}
          >
            <span>Price Range</span>
            <i className={`fa-solid fa-chevron-${expandedSections.priceRange ? 'up' : 'down'}`}></i>
          </div>
          {expandedSections.priceRange && (
            <div style={{ padding: '10px', background: '#f9f9f9' }}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>
                  Min Price: ₹{filters.priceRange.min}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="50"
                  value={filters.priceRange.min}
                  onChange={(e) => handlePriceRangeChange(Number(e.target.value), filters.priceRange.max)}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>
                  Max Price: ₹{filters.priceRange.max}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="50"
                  value={filters.priceRange.max}
                  onChange={(e) => handlePriceRangeChange(filters.priceRange.min, Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}
        </div>

        <button className="filter-apply" onClick={closeFilter}>VIEW {allProducts.length} ITEMS</button>
        
        {hasActiveFilters && (
          <button 
            onClick={clearAllFilters}
            style={{
              width: '100%',
              marginTop: '10px',
              padding: '12px',
              background: 'transparent',
              color: '#a4133c',
              border: '2px solid #a4133c',
              fontWeight: '700',
              cursor: 'pointer',
              transition: '0.3s'
            }}
          >
            CLEAR ALL FILTERS
          </button>
        )}
      </div>
    </>
  );
};

export default Skirts;
