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
  // Women's Products
  { id: 101, name: 'Christian Siriano Top', size: 'L', price: 349, badge: 'NEW IN', image: 'https://i.pinimg.com/1200x/2d/60/75/2d6075fca914f5ed7fdbd5ea838d8ef2.jpg', gender: 'women', color: 'Pink', condition: 'Excellent' },
  { id: 102, name: 'Nike Loungewear', size: 'M', price: 299, badge: 'VERIFIED', image: 'https://i.pinimg.com/736x/0a/24/83/0a24832a85b4aa488b9769baf266574a.jpg', gender: 'women', color: 'Beige', condition: 'Good' },
  { id: 103, name: 'All Access Loungewear', size: 'XS', price: 199, badge: '', image: 'https://i.pinimg.com/1200x/ca/25/cd/ca25cda8dfc99ec31f67e760ea64b851.jpg', gender: 'women', color: 'Pink', condition: 'Good' },
  { id: 104, name: 'Monsoon Top', size: 'UK 18', price: 149, badge: 'NEW IN', image: 'https://i.pinimg.com/736x/7e/94/e8/7e94e8c7d67c63df5c03c9e6c970fe9d.jpg', gender: 'women', color: 'Brown', condition: 'Good' },
  { id: 105, name: 'Fat Face Blouse', size: 'UK 10', price: 449, badge: '', image: 'https://i.pinimg.com/736x/55/a4/21/55a421b230cef9e8a66fef991574f129.jpg', gender: 'women', color: 'White', condition: 'Excellent' },
  { id: 106, name: 'Zara Casual Top', size: 'M', price: 379, badge: 'VERIFIED', image: 'https://i.pinimg.com/736x/86/34/df/8634df4fa2e459d19f245efdc046a82a.jpg', gender: 'women', color: 'Blue', condition: 'Good' },
  { id: 107, name: 'Pink Bow Cami Top', size: 'S', price: 289, badge: 'NEW IN', image: '/pinktop.png', gender: 'women', color: 'Pink', condition: 'Excellent' },
  { id: 108, name: 'Striped Cinched Blouse', size: 'M', price: 349, badge: 'VERIFIED', image: '/shirt.png', gender: 'women', color: 'White', condition: 'Good' },

  // Women's Tops (from products/tops)
  { id: 1000, name: 'Black Floral Embroidered Mesh Top', size: 'XS', price: 349, badge: 'NEW IN', image: '/products/tops/black-floral-embroidered-mesh-top.jpg', gender: 'women', color: 'Black', condition: 'Excellent', category: 'tops', description: 'A black floral embroidered mesh top, finished in a black shade with the natural character of a pre-loved, thrifted find. A versatile pick for layering under jackets, pairing with denim, or styling on its own for an easy everyday look, sourced through ReStyle\'s sustainable secondhand marketplace.' },
  { id: 1001, name: 'Brown Floral Wrap Top', size: 'S', price: 399, badge: 'VERIFIED', image: '/products/tops/brown-floral-wrap-top.jpg', gender: 'women', color: 'Brown', condition: 'Very Good', category: 'tops', description: 'A brown floral wrap top, finished in a brown shade with the natural character of a pre-loved, thrifted find. A versatile pick for layering under jackets, pairing with denim, or styling on its own for an easy everyday look, sourced through ReStyle\'s sustainable secondhand marketplace.' },
  { id: 1002, name: 'Brown Striped Layered Top', size: 'M', price: 319, badge: '', image: '/products/tops/brown-striped-layered-top.jpg', gender: 'women', color: 'Brown', condition: 'Good', category: 'tops', description: 'A brown striped layered top, finished in a brown shade with the natural character of a pre-loved, thrifted find. A versatile pick for layering under jackets, pairing with denim, or styling on its own for an easy everyday look, sourced through ReStyle\'s sustainable secondhand marketplace.' },
  { id: 1003, name: 'Cream Floral Puff Sleeve Blouse', size: 'L', price: 449, badge: '', image: '/products/tops/cream-floral-puff-sleeve-blouse.jpeg', gender: 'women', color: 'Cream', condition: 'Excellent', category: 'tops', description: 'A cream floral puff sleeve blouse, finished in a cream shade with the natural character of a pre-loved, thrifted find. A versatile pick for layering under jackets, pairing with denim, or styling on its own for an easy everyday look, sourced through ReStyle\'s sustainable secondhand marketplace.' },
  { id: 1004, name: 'Denim Mandarin Collar Fitted Top', size: 'XL', price: 299, badge: 'NEW IN', image: '/products/tops/denim-mandarin-collar-fitted-top.avif', gender: 'women', color: 'Denim', condition: 'Very Good', category: 'tops', description: 'A denim mandarin collar fitted top, finished in a denim shade with the natural character of a pre-loved, thrifted find. A versatile pick for layering under jackets, pairing with denim, or styling on its own for an easy everyday look, sourced through ReStyle\'s sustainable secondhand marketplace.' },
  { id: 1005, name: 'Magenta Textured Tie Front Top', size: 'XS', price: 499, badge: 'VERIFIED', image: '/products/tops/magenta-textured-tie-front-top.jpg', gender: 'women', color: 'Magenta', condition: 'Good', category: 'tops', description: 'A magenta textured tie front top, finished in a magenta shade with the natural character of a pre-loved, thrifted find. A versatile pick for layering under jackets, pairing with denim, or styling on its own for an easy everyday look, sourced through ReStyle\'s sustainable secondhand marketplace.' },
  { id: 1006, name: 'Navy Lace Trim Top', size: 'S', price: 379, badge: '', image: '/products/tops/navy-lace-trim-top.jpg', gender: 'women', color: 'Navy', condition: 'Excellent', category: 'tops', description: 'A navy lace trim top, finished in a navy shade with the natural character of a pre-loved, thrifted find. A versatile pick for layering under jackets, pairing with denim, or styling on its own for an easy everyday look, sourced through ReStyle\'s sustainable secondhand marketplace.' },
  { id: 1007, name: 'Pink And Cream Raglan Graphic Top', size: 'M', price: 329, badge: '', image: '/products/tops/pink-and-cream-raglan-graphic-top.jpg', gender: 'women', color: 'Pink', condition: 'Very Good', category: 'tops', description: 'A pink and cream raglan graphic top, finished in a pink shade with the natural character of a pre-loved, thrifted find. A versatile pick for layering under jackets, pairing with denim, or styling on its own for an easy everyday look, sourced through ReStyle\'s sustainable secondhand marketplace.' },
  { id: 1008, name: 'Pink Football Jersey Top', size: 'L', price: 429, badge: 'NEW IN', image: '/products/tops/pink-football-jersey-top.jpg', gender: 'women', color: 'Pink', condition: 'Good', category: 'tops', description: 'A pink football jersey top, finished in a pink shade with the natural character of a pre-loved, thrifted find. A versatile pick for layering under jackets, pairing with denim, or styling on its own for an easy everyday look, sourced through ReStyle\'s sustainable secondhand marketplace.' },
  { id: 1009, name: 'Pink Strawberry Embroidered Cami Top', size: 'XL', price: 369, badge: 'VERIFIED', image: '/products/tops/pink-strawberry-embroidered-cami-top.jpg', gender: 'women', color: 'Pink', condition: 'Excellent', category: 'tops', description: 'A pink strawberry embroidered cami top, finished in a pink shade with the natural character of a pre-loved, thrifted find. A versatile pick for layering under jackets, pairing with denim, or styling on its own for an easy everyday look, sourced through ReStyle\'s sustainable secondhand marketplace.' },
  { id: 1010, name: 'Pink Striped Layered Top', size: 'XS', price: 309, badge: '', image: '/products/tops/pink-striped-layered-top.jpg', gender: 'women', color: 'Pink', condition: 'Very Good', category: 'tops', description: 'A pink striped layered top, finished in a pink shade with the natural character of a pre-loved, thrifted find. A versatile pick for layering under jackets, pairing with denim, or styling on its own for an easy everyday look, sourced through ReStyle\'s sustainable secondhand marketplace.' },
  { id: 1011, name: 'Red White Striped Lace Trim Top', size: 'S', price: 409, badge: '', image: '/products/tops/red-white-striped-lace-trim-top.jpg', gender: 'women', color: 'Red', condition: 'Good', category: 'tops', description: 'A red white striped lace trim top, finished in a red shade with the natural character of a pre-loved, thrifted find. A versatile pick for layering under jackets, pairing with denim, or styling on its own for an easy everyday look, sourced through ReStyle\'s sustainable secondhand marketplace.' },
  { id: 1012, name: 'Yellow Cartoon Graphic T Shirt', size: 'M', price: 389, badge: 'NEW IN', image: '/products/tops/yellow-cartoon-graphic-t-shirt.jpg', gender: 'women', color: 'Yellow', condition: 'Excellent', category: 'tops', description: 'A yellow cartoon graphic t shirt, finished in a yellow shade with the natural character of a pre-loved, thrifted find. A versatile pick for layering under jackets, pairing with denim, or styling on its own for an easy everyday look, sourced through ReStyle\'s sustainable secondhand marketplace.' },

  // Men's Products
  { id: 201, name: 'Marvel Spiderman Graphic Tee', size: 'L', price: 599, badge: 'VERIFIED', image: '/spyshirt.png', gender: 'men', color: 'Red', condition: 'Excellent' },
  { id: 202, name: 'Spiderman Logo Black Tee', size: 'M', price: 549, badge: '', image: '/spidytshirt.png', gender: 'men', color: 'Black', condition: 'Good' },

  // Men's Products (from products/mens)
  { id: 1600, name: 'Black Striped Track Pants', size: 'M', price: 399, badge: 'NEW IN', image: '/products/mens/black-striped-track-pants.jpg', gender: 'men', color: 'Black', condition: 'Excellent', category: 'bottoms', description: 'A black striped track pants, finished in a black shade with the natural character of a pre-loved, thrifted find. A versatile pick for everyday casual styling and easy layering, sourced through ReStyle\'s sustainable secondhand marketplace.' },
  { id: 1601, name: 'Blue Striped Knit Sweater', size: 'L', price: 449, badge: 'VERIFIED', image: '/products/mens/blue-striped-knit-sweater.jpg', gender: 'men', color: 'Blue', condition: 'Very Good', category: 'tops', description: 'A blue striped knit sweater, finished in a blue shade with the natural character of a pre-loved, thrifted find. A versatile pick for everyday casual styling and easy layering, sourced through ReStyle\'s sustainable secondhand marketplace.' },
  { id: 1602, name: 'Blue Tan Striped Knit Sweater', size: 'XL', price: 369, badge: '', image: '/products/mens/blue-tan-striped-knit-sweater.jpg', gender: 'men', color: 'Blue tan', condition: 'Good', category: 'tops', description: 'A blue tan striped knit sweater, finished in a blue tan shade with the natural character of a pre-loved, thrifted find. A versatile pick for everyday casual styling and easy layering, sourced through ReStyle\'s sustainable secondhand marketplace.' },
  { id: 1603, name: 'Green Plaid Flannel Shirt', size: 'XXL', price: 499, badge: '', image: '/products/mens/green-plaid-flannel-shirt.jpg', gender: 'men', color: 'Green', condition: 'Excellent', category: 'tops', description: 'A green plaid flannel shirt, finished in a green shade with the natural character of a pre-loved, thrifted find. A versatile pick for everyday casual styling and easy layering, sourced through ReStyle\'s sustainable secondhand marketplace.' },
  { id: 1604, name: 'Green Striped Velour Long Sleeve Polo', size: 'M', price: 349, badge: 'NEW IN', image: '/products/mens/green-striped-velour-long-sleeve-polo.jpg', gender: 'men', color: 'Green', condition: 'Very Good', category: 'tops', description: 'A green striped velour long sleeve polo, finished in a green shade with the natural character of a pre-loved, thrifted find. A versatile pick for everyday casual styling and easy layering, sourced through ReStyle\'s sustainable secondhand marketplace.' },
  { id: 1605, name: 'Grey Cartoon Graphic Sweater', size: 'L', price: 549, badge: 'VERIFIED', image: '/products/mens/grey-cartoon-graphic-sweater.jpg', gender: 'men', color: 'Grey', condition: 'Good', category: 'tops', description: 'A grey cartoon graphic sweater, finished in a grey shade with the natural character of a pre-loved, thrifted find. A versatile pick for everyday casual styling and easy layering, sourced through ReStyle\'s sustainable secondhand marketplace.' },
  { id: 1606, name: 'Grey Sweatshirt With Green Stripe', size: 'XL', price: 429, badge: '', image: '/products/mens/grey-sweatshirt-with-green-stripe.jpg', gender: 'men', color: 'Grey', condition: 'Excellent', category: 'tops', description: 'A grey sweatshirt with green stripe, finished in a grey shade with the natural character of a pre-loved, thrifted find. A versatile pick for everyday casual styling and easy layering, sourced through ReStyle\'s sustainable secondhand marketplace.' },
  { id: 1607, name: 'Maroon Colorblock Knit Sweater', size: 'XXL', price: 379, badge: '', image: '/products/mens/maroon-colorblock-knit-sweater.jpg', gender: 'men', color: 'Maroon', condition: 'Very Good', category: 'tops', description: 'A maroon colorblock knit sweater, finished in a maroon shade with the natural character of a pre-loved, thrifted find. A versatile pick for everyday casual styling and easy layering, sourced through ReStyle\'s sustainable secondhand marketplace.' },
  { id: 1608, name: 'Navy Blue Plaid Flannel Shirt', size: 'M', price: 479, badge: 'NEW IN', image: '/products/mens/navy-blue-plaid-flannel-shirt.jpg', gender: 'men', color: 'Navy blue', condition: 'Good', category: 'tops', description: 'A navy blue plaid flannel shirt, finished in a navy blue shade with the natural character of a pre-loved, thrifted find. A versatile pick for everyday casual styling and easy layering, sourced through ReStyle\'s sustainable secondhand marketplace.' },
  { id: 1609, name: 'Navy Grey Striped Polo Shirt', size: 'L', price: 419, badge: 'VERIFIED', image: '/products/mens/navy-grey-striped-polo-shirt.jpg', gender: 'men', color: 'Navy grey', condition: 'Excellent', category: 'tops', description: 'A navy grey striped polo shirt, finished in a navy grey shade with the natural character of a pre-loved, thrifted find. A versatile pick for everyday casual styling and easy layering, sourced through ReStyle\'s sustainable secondhand marketplace.' },
  { id: 1610, name: 'Navy Ribbed Knit Sweater', size: 'XL', price: 359, badge: '', image: '/products/mens/navy-ribbed-knit-sweater.jpg', gender: 'men', color: 'Navy', condition: 'Very Good', category: 'tops', description: 'A navy ribbed knit sweater, finished in a navy shade with the natural character of a pre-loved, thrifted find. A versatile pick for everyday casual styling and easy layering, sourced through ReStyle\'s sustainable secondhand marketplace.' },
  { id: 1611, name: 'Olive Green Plaid Flannel Shirt Jacket', size: 'XXL', price: 459, badge: '', image: '/products/mens/olive-green-plaid-flannel-shirt-jacket.jpg', gender: 'men', color: 'Olive green', condition: 'Good', category: 'coats', description: 'A olive green plaid flannel shirt jacket, finished in an olive green shade with the natural character of a pre-loved, thrifted find. A versatile pick for everyday casual styling and easy layering, sourced through ReStyle\'s sustainable secondhand marketplace.' },
  { id: 1612, name: 'Red Black Striped Rugby Polo', size: 'M', price: 439, badge: 'NEW IN', image: '/products/mens/red-black-striped-rugby-polo.jpg', gender: 'men', color: 'Red black', condition: 'Excellent', category: 'tops', description: 'A red black striped rugby polo, finished in a red black shade with the natural character of a pre-loved, thrifted find. A versatile pick for everyday casual styling and easy layering, sourced through ReStyle\'s sustainable secondhand marketplace.' },
  { id: 1613, name: 'Red Graphic T Shirt', size: 'L', price: 389, badge: 'VERIFIED', image: '/products/mens/red-graphic-t-shirt.jpg', gender: 'men', color: 'Red', condition: 'Very Good', category: 'tops', description: 'A red graphic t shirt, finished in a red shade with the natural character of a pre-loved, thrifted find. A versatile pick for everyday casual styling and easy layering, sourced through ReStyle\'s sustainable secondhand marketplace.' },
  { id: 1614, name: 'Striped Button Up Shirt', size: 'XL', price: 519, badge: '', image: '/products/mens/striped-button-up-shirt.jpg', gender: 'men', color: 'Multicolor', condition: 'Good', category: 'tops', description: 'A striped button up shirt, finished in a multicolor shade with the natural character of a pre-loved, thrifted find. A versatile pick for everyday casual styling and easy layering, sourced through ReStyle\'s sustainable secondhand marketplace.' },
  { id: 1615, name: 'Tan Brown Striped T Shirt', size: 'XXL', price: 409, badge: '', image: '/products/mens/tan-brown-striped-t-shirt.jpg', gender: 'men', color: 'Tan brown', condition: 'Excellent', category: 'tops', description: 'A tan brown striped t shirt, finished in a tan brown shade with the natural character of a pre-loved, thrifted find. A versatile pick for everyday casual styling and easy layering, sourced through ReStyle\'s sustainable secondhand marketplace.' },
];

interface Filters {
  sizes: string[];
  categories: string[];
  colors: string[];
  conditions: string[];
  priceRange: { min: number; max: number };
}

const Tops = () => {
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [addedIds, setAddedIds] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { getListingsByCategory, markAsSold } = useListings();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  
  // Filter states
  const [filters, setFilters] = useState<Filters>({
    sizes: [],
    categories: [],
    colors: [],
    conditions: [],
    priceRange: { min: 0, max: 10000 }
  });
  
  const [sortType, setSortType] = useState<'recommended' | 'newest' | 'low-high' | 'high-low'>('recommended');
  const [search, setSearch] = useState(searchParams.get('q') || '');

  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    size: false,
    category: false,
    color: false,
    condition: false,
    priceRange: false
  });

  // Get gender filter from URL or default to 'women'
  const currentGender = searchParams.get('gender') || 'women';

  // Get user-submitted listings:
  // - For women: only 'tops' category
  // - For men: ALL categories (tops, coats, bottoms, accessories, dresses)
  const userListings = currentGender === 'men' 
    ? getListingsByCategory('all', currentGender) // Get ALL men's items
    : getListingsByCategory('tops', currentGender); // Get only women's tops
  
  // Debug logging
  console.log('Tops page - Current gender:', currentGender);
  console.log('Tops page - User listings:', userListings);

  // Check if item is NEW IN (created within last 7 days)
  const isNewItem = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  };

  // Combine static products with user listings
  const allProductsBeforeFilter = [
    ...userListings
      .filter(listing => selectedCategory === 'all' || listing.category === selectedCategory)
      .map(listing => ({
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
        category: listing.category,
        color: listing.color || 'N/A',
      })),
    ...staticProducts
      .filter(p => p.gender === currentGender)
      .filter(p => selectedCategory === 'all' || (p.category ?? 'tops') === selectedCategory)
      .map(p => ({ ...p, isUserListing: false, sellerName: undefined, sellerEmail: undefined, sellerPhone: undefined, description: p.description, isSold: false, category: p.category ?? ('tops' as const) })),
  ];
  
  // Apply filters
  const allProducts = allProductsBeforeFilter.filter(product => {
    // Size filter
    if (filters.sizes.length > 0 && !filters.sizes.includes(product.size)) {
      return false;
    }
    
    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
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
  const availableCategories = currentGender === 'men' 
    ? ['tops', 'coats', 'bottoms', 'accessories'] 
    : ['tops'];
  
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
      categories: [],
      colors: [],
      conditions: [],
      priceRange: { min: 0, max: 10000 }
    });
  };
  
  const hasActiveFilters = filters.sizes.length > 0 || filters.categories.length > 0 || 
                          filters.colors.length > 0 || filters.conditions.length > 0 ||
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
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: currentGender === 'women' ? 'Women' : 'Men', to: currentGender === 'women' ? '/' : '/tops?gender=men' }, { label: currentGender === 'women' ? 'Tops' : 'All Items' }]} />

        <h1>Shop Secondhand {currentGender === 'women' ? "Women's Tops" : "Men's Clothing"}</h1>
        <p className="desc">
          {currentGender === 'women' 
            ? 'Dress it up. Dress it down. From everyday basics to statement pieces. Shop pre-loved women\'s tops.'
            : 'From T-shirts to jackets, find quality pre-loved men\'s fashion.'
          }
        </p>

        {/* Category Filter for Men's Section */}
        {currentGender === 'men' && (
          <div className="category-filter-tabs" style={{ 
            display: 'flex', 
            gap: '10px', 
            marginBottom: '20px', 
            flexWrap: 'wrap',
            padding: '0 20px'
          }}>
            <button 
              onClick={() => setSelectedCategory('all')}
              style={{
                padding: '8px 16px',
                border: selectedCategory === 'all' ? '2px solid #8b1538' : '1px solid #ddd',
                background: selectedCategory === 'all' ? '#8b1538' : 'white',
                color: selectedCategory === 'all' ? 'white' : '#333',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: selectedCategory === 'all' ? 'bold' : 'normal'
              }}
            >
              All Items
            </button>
            <button 
              onClick={() => setSelectedCategory('tops')}
              style={{
                padding: '8px 16px',
                border: selectedCategory === 'tops' ? '2px solid #8b1538' : '1px solid #ddd',
                background: selectedCategory === 'tops' ? '#8b1538' : 'white',
                color: selectedCategory === 'tops' ? 'white' : '#333',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: selectedCategory === 'tops' ? 'bold' : 'normal'
              }}
            >
              T-Shirts & Tops
            </button>
            <button 
              onClick={() => setSelectedCategory('coats')}
              style={{
                padding: '8px 16px',
                border: selectedCategory === 'coats' ? '2px solid #8b1538' : '1px solid #ddd',
                background: selectedCategory === 'coats' ? '#8b1538' : 'white',
                color: selectedCategory === 'coats' ? 'white' : '#333',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: selectedCategory === 'coats' ? 'bold' : 'normal'
              }}
            >
              Jackets & Coats
            </button>
            <button 
              onClick={() => setSelectedCategory('bottoms')}
              style={{
                padding: '8px 16px',
                border: selectedCategory === 'bottoms' ? '2px solid #8b1538' : '1px solid #ddd',
                background: selectedCategory === 'bottoms' ? '#8b1538' : 'white',
                color: selectedCategory === 'bottoms' ? 'white' : '#333',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: selectedCategory === 'bottoms' ? 'bold' : 'normal'
              }}
            >
              Pants & Jeans
            </button>
            <button 
              onClick={() => setSelectedCategory('accessories')}
              style={{
                padding: '8px 16px',
                border: selectedCategory === 'accessories' ? '2px solid #8b1538' : '1px solid #ddd',
                background: selectedCategory === 'accessories' ? '#8b1538' : 'white',
                color: selectedCategory === 'accessories' ? 'white' : '#333',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: selectedCategory === 'accessories' ? 'bold' : 'normal'
              }}
            >
              Accessories
            </button>
          </div>
        )}

        {/* Filters */}
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

          <div className="toggle">
            <input type="checkbox" defaultChecked /> Pre-loved
          </div>

          <div className="toggle">
            <input type="checkbox" /> Brand new
          </div>
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
            {filters.categories.map(cat => (
              <span key={cat} style={{
                padding: '4px 12px',
                background: '#8b1538',
                color: 'white',
                borderRadius: '20px',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                Category: {cat}
                <i 
                  className="fa-solid fa-xmark" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleFilter('categories', cat)}
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

        {/* PRODUCTS */}
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

      {/* Filter Panel */}
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

        {/* Category Filter (for men's section) */}
        {currentGender === 'men' && (
          <div className="filter-section">
            <div 
              className="filter-item" 
              onClick={() => toggleSection('category')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span>Category {filters.categories.length > 0 && `(${filters.categories.length})`}</span>
              <i className={`fa-solid fa-chevron-${expandedSections.category ? 'up' : 'down'}`}></i>
            </div>
            {expandedSections.category && (
              <div style={{ padding: '10px', background: '#f9f9f9' }}>
                {availableCategories.map(cat => (
                  <label key={cat} style={{ display: 'block', marginBottom: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(cat)}
                      onChange={() => toggleFilter('categories', cat)}
                      style={{ marginRight: '8px' }}
                    />
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

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

export default Tops;
