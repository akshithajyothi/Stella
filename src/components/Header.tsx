import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useStella } from '../context/StellaContext';

const Header = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { wishlistItems } = useWishlist();
  const { currentUser } = useAuth();
  const { toggle: toggleStella } = useStella();

  const handleLoginClick = (e: React.MouseEvent) => {
    if (currentUser) {
      e.preventDefault();
      navigate('/profile');
    }
  };

  return (
    <header className="top-header">
      <div className="left-menu">
        <button type="button" className="icon-btn-bare browse-btn" onClick={() => navigate('/tops')}>
          <i className="fa-solid fa-bars" aria-hidden="true"></i> Browse
        </button>
        <Link to="/sell">Sell</Link>
        <Link to="/clearout">Clearout</Link>
        <button type="button" className="icon-btn-bare browse-btn" onClick={toggleStella}>
          <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i> Ask Stella
        </button>
      </div>

      <div className="logo-center">
        <Link to="/">
          <img src="/logo.jpg" alt="ReStyle Logo" className="header-logo" />
          ReStyle
        </Link>
      </div>

      <div className="right-menu">
        <Link to="/login" onClick={handleLoginClick}>
          <i className="fa-regular fa-user"></i> {currentUser ? '' : 'Login'}
        </Link>
        <Link to="/wishlist" className="cart-link">
          <i className="fa-regular fa-heart"></i> Wishlist
          {wishlistItems.length > 0 && <span className="cart-badge">{wishlistItems.length}</span>}
        </Link>
        <Link to="#"><i className="fa-solid fa-tag"></i> Offers</Link>
        <Link to="/cart" className="cart-link">
          <i className="fa-solid fa-bag-shopping"></i> Bag
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>
      </div>
    </header>
  );
};

export default Header;
