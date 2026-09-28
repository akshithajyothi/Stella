import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import Breadcrumb from '../components/Breadcrumb';
import IconButton from '../components/IconButton';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import Toast from '../components/Toast';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleAddToBag = (item: (typeof wishlistItems)[0]) => {
    addToCart({
      id: item.id,
      name: item.name,
      sku: `RST-${item.id}`,
      price: item.price,
      image: item.image,
      inStock: true,
      size: item.size,
    });
    showToast('Added to bag');
  };

  return (
    <>
      <Header />
      <Toast />
      <div className="page">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Wishlist' }]} />
        <h1>Your Wishlist</h1>

        {wishlistItems.length === 0 ? (
          <EmptyState
            icon="fa-solid fa-heart"
            title="Your wishlist is empty"
            message="Save items you love and come back to them later."
            actionLabel="Explore Shop"
            actionTo="/tops"
          />
        ) : (
          <div className="products">
            {wishlistItems.map(item => (
              <div className="product" key={item.id} onClick={() => navigate('/product', { state: item })}>
                <img src={item.image} alt={item.name} />
                <h4>{item.name}</h4>
                {item.size && <p>Size {item.size}</p>}
                <div className="product-bottom-row">
                  <div className="price">₹{item.price}</div>
                  <IconButton
                    icon="fa-solid fa-trash"
                    aria-label="Remove from wishlist"
                    onClick={(e) => { e.stopPropagation(); removeFromWishlist(item.id); }}
                  />
                </div>
                <button className="add-bag-btn" onClick={(e) => { e.stopPropagation(); handleAddToBag(item); }}>
                  + Add to Bag
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Wishlist;
