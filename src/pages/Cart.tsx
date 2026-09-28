import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useCart } from '../context/CartContext';
import '../styles/Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const handlePromo = () => {
    if (promoCode.trim()) setPromoApplied(true);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 39 ? 0 : 4.99;
  const shippingDiscount = subtotal >= 39 ? -4.99 : 0;
  const total = subtotal + shipping + shippingDiscount;

  return (
    <>
      <Header />
      <div className="cart-page">
        <h1 className="cart-title">Your Cart</h1>

        <div className="cart-meta">
          <Link to="/" className="continue-shopping">← Continue Shopping</Link>
          <span className="cart-count">{cartItems.length} Item{cartItems.length !== 1 ? 's' : ''}</span>
          <span className="cart-help">Need Help? Call (800) 946-3482</span>
        </div>

        <div className="cart-layout">
          {/* LEFT - Cart Items */}
          <div className="cart-items">
            {cartItems.length === 0 ? (
              <div className="cart-empty">
                <i className="fa-solid fa-bag-shopping"></i>
                <p>Your cart is empty.</p>
                <Link to="/" className="btn-primary-cart">Start Shopping</Link>
              </div>
            ) : (
              cartItems.map(item => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-top">
                    <span className="cart-item-name">{item.name}</span>
                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}>✕</button>
                  </div>
                  <div className="cart-item-body">
                    <img src={item.image} alt={item.name} className="cart-item-img" />
                    <div className="cart-item-details">
                      <p className="cart-sku">SKU: {item.sku}</p>
                      <p className={`cart-stock ${item.inStock ? 'in-stock' : 'out-stock'}`}>
                        {item.inStock ? 'In Stock' : 'Out of Stock'}
                      </p>
                      <p className="cart-edit">Edit</p>
                    </div>
                    <div className="cart-item-price">
                      <span className="price-label">Each</span>
                      {item.originalPrice && (
                        <span className="original-price">₹{item.originalPrice.toFixed(2)}</span>
                      )}
                      <span className="sale-price">₹{item.price.toFixed(2)}</span>
                    </div>
                    <div className="cart-item-qty">
                      <span className="price-label">Quantity</span>
                      <div className="qty-control">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                    </div>
                    <div className="cart-item-total">
                      <span className="price-label">Total</span>
                      <span className="total-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* RIGHT - Order Summary */}
          <div className="cart-summary">
            <div className="promo-section">
              <p className="promo-label">Enter Promo Code</p>
              <div className="promo-row">
                <input
                  type="text"
                  placeholder="Promo Code"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                  className="promo-input"
                />
                <button className="promo-btn" onClick={handlePromo}>Submit</button>
              </div>
              {promoApplied && <p className="promo-success">Promo code applied!</p>}
              <p className="promo-hint"><Link to="/login">Sign in</Link> to your account to see available Rewards.</p>
            </div>

            <div className="promotions-section">
              <h4>Promotions</h4>
              <div className="promo-line">
                <span>Free Shipping on Orders ₹39+</span>
                <span className="discount-val">-₹4.99</span>
              </div>
            </div>

            <div className="summary-lines">
              <div className="summary-line">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-line">
                <span>Shipping cost</span>
                <span>₹{(shipping === 0 ? 4.99 : shipping).toFixed(2)}</span>
              </div>
              <div className="summary-line discount">
                <span>Shipping Discount</span>
                <span>- ₹{Math.abs(shippingDiscount === 0 ? 4.99 : shippingDiscount).toFixed(2)}</span>
              </div>
              <div className="summary-line">
                <span>Estimated Sales Tax</span>
                <span>TBD</span>
              </div>
              <div className="summary-line total">
                <span>Estimated Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button className="checkout-btn">
              <Link to="/checkout" style={{ color: 'inherit', textDecoration: 'none', display: 'block', width: '100%', height: '100%' }}>
                CHECKOUT
              </Link>
            </button>
          </div>
        </div>

        {/* YOU MAY ALSO LIKE */}
        <div className="you-may-like">
          <h2>YOU MAY ALSO LIKE</h2>
          <div className="suggested-grid">
            {[
              { img: 'https://i.pinimg.com/736x/9e/89/ad/9e89ad8075b8f24357adb71c7a901d09.jpg', name: 'Cozy Knit Sweatshirt', price: '₹18.00' },
              { img: 'https://i.pinimg.com/736x/8e/06/fe/8e06fedd9f92e83b0901812c03b1dd83.jpg', name: 'Flowy Crop Top', price: '₹12.50' },
              { img: 'https://i.pinimg.com/736x/1b/7f/6c/1b7f6ce41319b52ccebe58d95f103a21.jpg', name: 'Wide Leg Trousers', price: '₹22.00' },
              { img: 'https://i.pinimg.com/736x/b5/61/80/b561809a3150c1952f57730d8774d622.jpg', name: 'Mini Pleated Skirt', price: '₹15.99' },
            ].map((item, i) => (
              <div className="suggested-card" key={i}>
                <img src={item.img} alt={item.name} />
                <p className="suggested-name">{item.name}</p>
                <p className="suggested-price">{item.price}</p>
                <button className="add-to-cart-btn">Add to Cart</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
