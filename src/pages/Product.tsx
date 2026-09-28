import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useCart } from '../context/CartContext';
import { useListings } from '../context/ListingsContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { useStella } from '../context/StellaContext';
import Toast from '../components/Toast';
import DeleteListingModal from '../components/DeleteListingModal';

const Product = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state as {
    id: number; name: string; size: string; price: number; image: string;
    sellerName?: string; sellerEmail?: string; sellerPhone?: string;
    description?: string; condition?: string; isUserListing?: boolean;
  } | null;

  const image = product?.image || 'https://i.pinimg.com/736x/55/a4/21/55a421b230cef9e8a66fef991574f129.jpg';
  const name = product?.name || "Nobody's Child Top";
  const size = product?.size || 'UK 12';
  const price = product?.price || 449;
  const id = product?.id || 1001;
  const description = product?.description || 'Quality pre-loved item in great condition.';
  const condition = product?.condition || 'Good';
  const isUserListing = product?.isUserListing || false;
  const sellerName = product?.sellerName;
  const sellerEmail = product?.sellerEmail;
  const sellerPhone = product?.sellerPhone;

  const [showContact, setShowContact] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { addToCart } = useCart();
  const { deleteListing } = useListings();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const { setCurrentProduct } = useStella();
  const isInWishlist = isWishlisted(id);

  // Let Stella know what the buyer is looking at, so "it"/"this" resolves without them
  // having to repeat themselves. Cleared on unmount so a stale product doesn't linger.
  useEffect(() => {
    setCurrentProduct({ id, name, price });
    return () => setCurrentProduct(null);
  }, [id, name, price, setCurrentProduct]);

  const addToBag = () => {
    addToCart({ id, name, sku: `RST-${id}`, price, image, inStock: true, size });
    showToast('Added to bag');
  };

  const handleDeleteListing = () => {
    deleteListing(id);
    showToast('Listing deleted');
    setTimeout(() => {
      navigate(-1); // Go back to previous page
    }, 1500);
  };

  return (
    <>
      <Header />
      <Toast />

      <div className="container product-page">
        <div className="product-wrapper">

          {/* Single image — no carousel */}
          <div className="image-gallery single-image">
            <img src={image} alt={name} />
            {/* Try-On button */}
            <button 
              className="tryon-badge" 
              onClick={() => navigate('/virtual-tryon', { state: { garmentImage: image, garmentName: name } })} 
              title="Virtual Try-On"
            >
              <i className="fa-solid fa-shirt"></i> Try On
            </button>
          </div>

          <div className="details">
            {isUserListing && (
              <span className="badge" style={{ marginBottom: '10px', display: 'inline-block' }}>
                USER LISTING
              </span>
            )}
            <h2>{name}</h2>
            <p>Size {size}</p>
            <div className="price">₹{price}</div>

            <div className="button-row">
              <button className="btn btn-primary" onClick={addToBag}>ADD TO BAG</button>
              <button className="btn wishlist-btn" onClick={() => toggleWishlist({ id, name, price, image, size })}>
                <i className={isInWishlist ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}></i>
                {isInWishlist ? ' REMOVE ITEM' : ' ADD TO WISHLIST'}
              </button>
              {price > 300 && (
                <button className="btn btn-secondary" onClick={() => navigate('/negotiate', { state: { id, name, price, image } })}>
                  <i className="fa-solid fa-comments"></i> NEGOTIATE
                </button>
              )}
            </div>

            <div className="service-info">
              <div className="service-item">
                <i className="fa-solid fa-rotate-left"></i>
                <span>Easy 30 day returns</span>
              </div>
              <div className="divider"></div>
              <div className="service-item">
                <i className="fa-solid fa-truck"></i>
                <span>Express delivery available</span>
              </div>
              <div className="divider"></div>
              <div className="service-item">
                <i className="fa-solid fa-shield-halved"></i>
                <span>Every item is quality checked</span>
              </div>
            </div>

            {isUserListing && sellerName && (
              <div className="info seller-contact-section">
                <strong>SELLER INFORMATION</strong>
                <div style={{ marginTop: '10px' }}>
                  <p><i className="fa-solid fa-user"></i> <strong>Seller:</strong> {sellerName}</p>
                  {!showContact ? (
                    <button 
                      className="btn btn-secondary"
                      style={{ marginTop: '10px', width: '100%' }}
                      onClick={() => setShowContact(true)}
                    >
                      <i className="fa-solid fa-envelope"></i> Show Contact Details
                    </button>
                  ) : (
                    <div style={{ marginTop: '10px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                      <p style={{ marginBottom: '8px' }}>
                        <i className="fa-solid fa-envelope"></i> <strong>Email:</strong>{' '}
                        <a href={`mailto:${sellerEmail}`} style={{ color: '#d4737e' }}>{sellerEmail}</a>
                      </p>
                      {sellerPhone && (
                        <p style={{ marginBottom: '0' }}>
                          <i className="fa-solid fa-phone"></i> <strong>Phone:</strong>{' '}
                          <a href={`tel:${sellerPhone}`} style={{ color: '#d4737e' }}>{sellerPhone}</a>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Delete Listing Button - Only for sellers */}
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>
                    <i className="fa-solid fa-info-circle"></i> Are you the seller? You can delete this listing.
                  </p>
                  <button
                    className="btn"
                    style={{
                      width: '100%',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <i className="fa-solid fa-trash"></i> Delete This Listing
                  </button>
                </div>
              </div>
            )}

            <div className="info">
              <strong>DESCRIPTION</strong>
              <p style={{ marginTop: '10px', lineHeight: '1.6' }}>{description}</p>
            </div>

            <div className="info">
              <strong>DETAILS</strong>
              Size: {size}<br />
              Condition: {condition}<br />
              {!isUserListing && 'Materials: Polyester, Elastane, Viscose'}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Listing Modal */}
      {isUserListing && sellerEmail && (
        <DeleteListingModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteListing}
          sellerEmail={sellerEmail}
          itemName={name}
        />
      )}
    </>
  );
};

export default Product;
