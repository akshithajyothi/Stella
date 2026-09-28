import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useListings } from '../context/ListingsContext';

const CONDITIONS = ['Brand New', 'Like New', 'Good', 'Fair', 'Well Worn'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];
const CATEGORIES = [
  { value: 'tops', label: 'Tops' },
  { value: 'dresses', label: 'Dresses' },
  { value: 'bottoms', label: 'Bottoms (Jeans, Trousers, Skirts)' },
  { value: 'coats', label: 'Coats & Jackets' },
  { value: 'accessories', label: 'Accessories' },
];
const GENDERS = [
  { value: 'women', label: "Women's" },
  { value: 'men', label: "Men's" },
];
const ANGLES = ['Front', 'Back', 'Left Side', 'Right Side', 'Detail / Label'];

const Sell = () => {
  const navigate = useNavigate();
  const { addListing } = useListings();
  const [images, setImages] = useState<{ [key: string]: string | null }>({
    Front: null, Back: null, 'Left Side': null, 'Right Side': null, 'Detail / Label': null,
  });
  const [form, setForm] = useState({
    title: '', price: '', description: '',
    size: '', condition: '', category: '', gender: '',
    sellerName: '', sellerEmail: '', sellerPhone: '',
  });
  const [toast, setToast] = useState('');
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleImageUpload = (angle: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImages(prev => ({ ...prev, [angle]: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const uploadedCount = Object.values(images).filter(Boolean).length;
    if (uploadedCount < 2) { showToast('Please upload at least 2 images.'); return; }
    if (!form.title || !form.price || !form.condition || !form.size || !form.category || !form.gender || !form.sellerName || !form.sellerEmail) {
      showToast('Please fill in all required fields.'); return;
    }

    // Get the primary image (first non-null image)
    const primaryImage = images.Front || Object.values(images).find(img => img !== null) || '';

    // Add the listing
    addListing({
      name: form.title,
      size: form.size,
      price: parseFloat(form.price),
      badge: 'NEW IN',
      image: primaryImage,
      category: form.category as any,
      gender: form.gender as any,
      description: form.description,
      condition: form.condition,
      sellerName: form.sellerName,
      sellerEmail: form.sellerEmail,
      sellerPhone: form.sellerPhone,
      images: images,
    });

    showToast('✓ Listing submitted successfully!');
    
    // Navigate logic:
    // - For men's items: ALL go to /tops?gender=men (unified men's page)
    // - For women's items: go to specific category page
    setTimeout(() => {
      if (form.gender === 'men') {
        navigate('/tops?gender=men');
      } else {
        navigate(`/${form.category}?gender=${form.gender}`);
      }
    }, 1500);
  };

  return (
    <>
      <Header />
      {toast && (
        <div className="toast-notification">
          <i className="fas fa-check-circle"></i> {toast}
        </div>
      )}

      <div className="sell-page">
        <div className="sell-header">
          <h1>List an Item</h1>
          <p>Fill in the details below to list your pre-loved piece on ReStyle.</p>
        </div>

        <form className="sell-form" onSubmit={handleSubmit}>

          {/* IMAGE UPLOAD */}
          <div className="sell-section">
            <h2>Photos <span className="sell-required">*</span></h2>
            <p className="sell-hint">Upload clear images from all angles. At least 2 required.</p>
            <div className="sell-image-grid">
              {ANGLES.map(angle => (
                <div
                  key={angle}
                  className={`sell-image-slot ${images[angle] ? 'has-image' : ''}`}
                  onClick={() => inputRefs.current[angle]?.click()}
                >
                  {images[angle]
                    ? <img src={images[angle]!} alt={angle} />
                    : (
                      <div className="sell-image-placeholder">
                        <i className="fa-solid fa-camera"></i>
                        <span>{angle}</span>
                      </div>
                    )
                  }
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={el => { inputRefs.current[angle] = el; }}
                    onChange={e => handleImageUpload(angle, e)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ITEM DETAILS */}
          <div className="sell-section">
            <h2>Item Details</h2>
            <div className="sell-fields">
              <div className="sell-field">
                <label>Item Title <span className="sell-required">*</span></label>
                <input name="title" placeholder="e.g. Zara Floral Midi Dress" value={form.title} onChange={handleChange} />
              </div>
              <div className="sell-field">
                <label>Gender <span className="sell-required">*</span></label>
                <select name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">Select gender</option>
                  {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
              <div className="sell-field">
                <label>Category <span className="sell-required">*</span></label>
                <select name="category" value={form.category} onChange={handleChange}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                </select>
              </div>
              <div className="sell-field">
                <label>Price (₹) <span className="sell-required">*</span></label>
                <input name="price" type="number" placeholder="0.00" min="0" step="0.01" value={form.price} onChange={handleChange} />
              </div>
              <div className="sell-field sell-field-full">
                <label>Description <span className="sell-required">*</span></label>
                <textarea name="description" rows={4} placeholder="Describe the item — fabric, fit, any flaws..." value={form.description} onChange={handleChange} />
              </div>
              <div className="sell-field">
                <label>Size <span className="sell-required">*</span></label>
                <select name="size" value={form.size} onChange={handleChange}>
                  <option value="">Select size</option>
                  {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="sell-field">
                <label>Condition <span className="sell-required">*</span></label>
                <select name="condition" value={form.condition} onChange={handleChange}>
                  <option value="">Select condition</option>
                  {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* SELLER DETAILS */}
          <div className="sell-section">
            <h2>Seller Details</h2>
            <p className="sell-hint">Buyers will be able to contact you if they have questions about this item.</p>
            <div className="sell-fields">
              <div className="sell-field">
                <label>Full Name <span className="sell-required">*</span></label>
                <input name="sellerName" placeholder="Your name" value={form.sellerName} onChange={handleChange} />
              </div>
              <div className="sell-field">
                <label>Email <span className="sell-required">*</span></label>
                <input name="sellerEmail" type="email" placeholder="you@email.com" value={form.sellerEmail} onChange={handleChange} />
              </div>
              <div className="sell-field">
                <label>Phone (optional)</label>
                <input name="sellerPhone" type="tel" placeholder="+44 000 000 0000" value={form.sellerPhone} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="sell-submit">
            <button type="submit" className="order-btn">Submit Listing</button>
          </div>

        </form>
      </div>
    </>
  );
};

export default Sell;
