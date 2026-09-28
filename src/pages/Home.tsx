import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useStella } from '../context/StellaContext';

const Home = () => {
  const bannerImages = [
    "/banner1.jpg",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d"
  ];

  const [currentBanner, setCurrentBanner] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const { open: openStella } = useStella();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentBanner(index);
  };

  const nextSlide = () => {
    setCurrentBanner((prev) => (prev + 1) % bannerImages.length);
  };

  const prevSlide = () => {
    setCurrentBanner((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
  };

  return (
    <>
      <Header />

      {/* SECOND NAVIGATION */}
      <nav className="sub-nav">
        <Link to="/tops?gender=women">Women</Link>
        <Link to="/tops?gender=men">Men</Link>
        <a href="#">Designer</a>
        <a href="#">New In</a>
        <a href="#">Premium</a>
        <a href="#">Brand New</a>
        <a href="#">Clearance</a>
      </nav>

      {/* SEARCH SECTION */}
      <section className="search-bar">
        <h2>WOMEN</h2>

        <div className="search-box">
          <input type="text" placeholder="Search for quality pre-loved fashion" />
          <button aria-label="Search">
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>

        <Link to="/tops?gender=men" className="shop-men">
          Shop Men <i className="fa-solid fa-arrow-right"></i>
        </Link>
      </section>

      {/* HERO */}
      <section className="hero">
        <img src={bannerImages[currentBanner]} className="hero-img" alt="ReStyle Banner" />
        <div className="hero-overlay"></div>
        
        {/* Navigation Arrows */}
        <div className="banner-arrow banner-arrow-left" onClick={prevSlide}>
          <i className="fa-solid fa-chevron-left"></i>
        </div>
        <div className="banner-arrow banner-arrow-right" onClick={nextSlide}>
          <i className="fa-solid fa-chevron-right"></i>
        </div>

        {/* Dots Indicator */}
        <div className="banner-dots">
          {bannerImages.map((_, index) => (
            <span
              key={index}
              className={`banner-dot ${currentBanner === index ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            ></span>
          ))}
        </div>

        <div className="hero-content">
          <h1>WE LOVE PRE-LOVED</h1>
          <p>Shop quality second-hand fashion</p>
          <a href="#" className="btn">SHOP NOW</a>
        </div>
      </section>

      {/* IMAGE CATEGORIES */}
      <section className="section categories-section">
        <h2>WOMEN'S CATEGORIES</h2>

        <div className="category-grid">
          <div className="category-card">
            <img src="https://i.pinimg.com/1200x/a6/84/89/a684897fc592bd30f76626a4406d6aba.jpg" alt="Jackets & Coats" />
            <p><Link to="/coats" style={{textDecoration:'none',color:'inherit'}}>Jackets & Coats</Link></p>
          </div>

          <div className="category-card">
            <img src="https://i.pinimg.com/1200x/25/2a/0d/252a0d87c71ed4b187dd7d3451447e51.jpg" alt="Dresses" />
            <p><Link to="/dresses" style={{textDecoration:'none',color:'inherit'}}>Dresses</Link></p>
          </div>

          <div className="category-card">
            <img src="https://i.pinimg.com/736x/9e/89/ad/9e89ad8075b8f24357adb71c7a901d09.jpg" alt="Jumpers" />
            <p><Link to="/sweatshirts" style={{textDecoration:'none',color:'inherit'}}>Sweatshirts</Link></p>
          </div>

          <div className="category-card">
            <img src="https://i.pinimg.com/736x/8e/06/fe/8e06fedd9f92e83b0901812c03b1dd83.jpg" alt="Tops" />
            <p><Link to="/tops" style={{textDecoration:'none',color:'inherit'}}>Tops</Link></p>
          </div>

          <div className="category-card">
            <img src="https://i.pinimg.com/736x/1b/7f/6c/1b7f6ce41319b52ccebe58d95f103a21.jpg" alt="Trousers" />
            <p><Link to="/bottoms" style={{textDecoration:'none',color:'inherit'}}>Trousers</Link></p>
          </div>

          <div className="category-card">
            <img src="https://i.pinimg.com/1200x/23/d2/17/23d217e3397d6dba6e1e441dfda973a0.jpg" alt="Jeans" />
            <p><Link to="/bottoms" style={{textDecoration:'none',color:'inherit'}}>Jeans</Link></p>
          </div>

          <div className="category-card">
            <img src="https://i.pinimg.com/736x/b5/61/80/b561809a3150c1952f57730d8774d622.jpg" alt="Skirts" />
            <p><Link to="/skirts" style={{textDecoration:'none',color:'inherit'}}>Skirts</Link></p>
          </div>
        </div>
      </section>

      {/* CLOSET SECTION WITH GLASS CARDS */}
      <section className="closet-section">
        <div className="closet-with-glass-container">

          {/* Left Glass Cards */}
          <div className="glass-cards-column glass-cards-left">
            <div className={`glass-card ${hoveredCard === 'add-clothes' ? 'glass-card-visible' : 'glass-card-hidden'}`}>
              <h3>Snap it. Upload it. Own it.</h3>
              <p>Turn your wardrobe into a digital space where every top, dress, and "I forgot I had this?!" moment lives. Organize, tag, and track your fits, and finally see what you actually wear.</p>
              <blockquote className="glass-card-quote">"No more 'I have nothing to wear' drama."</blockquote>
            </div>
            <div className={`glass-card ${hoveredCard === 'create-idea' ? 'glass-card-visible' : 'glass-card-hidden'}`}>
              <h3>AI Stylist</h3>
              <p>Get cute, mood-based outfit suggestions from your own clothes for any vibe or occasion.</p>
              <blockquote className="glass-card-quote">"Your personal AI fashion assistant."</blockquote>
            </div>
          </div>

          {/* Center Closet Cards */}
          <div className="closet-wrapper">
            <div className="closet-card">
              <h4>CLOSET</h4>
              <Link
                to="/wardrobe"
                className="closet-action add-clothes"
                onMouseEnter={() => setHoveredCard('add-clothes')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <i className="fa-solid fa-shirt"></i>
                Add Clothes
              </Link>
            </div>

            <div className="closet-card">
              <h4>OUTFIT</h4>
              <button
                type="button"
                className="closet-action action-normal"
                onMouseEnter={() => setHoveredCard('create-idea')}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={openStella}
              >
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                Create Idea
              </button>
              <Link
                to="/wardrobe"
                className="closet-action action-normal"
                onMouseEnter={() => setHoveredCard('schedule-ootd')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <i className="fa-solid fa-calendar-days"></i>
                Schedule OOTD
              </Link>
            </div>

            <div className="closet-card">
              <h4>PRELOVED</h4>
              <Link
                to="/clearout"
                className="closet-action action-normal"
                onMouseEnter={() => setHoveredCard('sell-item')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <i className="fa-solid fa-bag-shopping"></i>
                Sell an Item
              </Link>
            </div>
          </div>

          {/* Right Glass Cards */}
          <div className="glass-cards-column glass-cards-right">
            <div className={`glass-card ${hoveredCard === 'schedule-ootd' ? 'glass-card-visible' : 'glass-card-hidden'}`}>
              <h3>Plan Your Slay</h3>
              <p>Plan your outfits ahead so mornings feel calm, not chaotic. Pick your looks for the week, match them to events, and step out knowing the vibe is already handled.</p>
              <blockquote className="glass-card-quote">"Wake up. Get dressed. Glow."</blockquote>
            </div>
            <div className={`glass-card ${hoveredCard === 'sell-item' ? 'glass-card-visible' : 'glass-card-hidden'}`}>
              <h3>Closet Clean Girl Move</h3>
              <p>That dress you wore once? She deserves a second life. List directly from your closet, earn extra cash, and make space for new energy — sustainably.</p>
              <blockquote className="glass-card-quote">"Declutter your closet. Upgrade your wallet."</blockquote>
            </div>
          </div>

        </div>
      </section>

      {/* BRANDS */}
      <section className="section">
        <h2>Trending Brands</h2>
        <div className="brands">
          <span>Calvin Klein</span>
          <span>Tommy Hilfiger</span>
          <span>Ganni</span>
          <span>Reformation</span>
          <span>Zara</span>
          <span>H&M</span>
        </div>
      </section>

      {/* SMART FEATURES SECTION */}
      <section className="section restyle-features">
        <h2>SMART FEATURES YOU CAN'T RESIST</h2>

        <div className="features-grid">
          <div className="feature-card">
            <img src="https://i.pinimg.com/736x/f3/e5/a2/f3e5a281a4bd81001baabf053f3545b6.jpg" alt="Virtual Fitting Room" />
            <h3>Virtual try-on</h3>
            <p>Try outfits virtually before buying. Find your perfect fit instantly.</p>
            <Link to="/virtual-tryon" className="feature-btn">Try Now</Link>
          </div>

          <div className="feature-card">
            <img src="https://i.pinimg.com/1200x/b5/25/75/b52575dab0670fb1ed07dbd8fd50f01c.jpg" alt="Wardrobe Manager" />
            <h3>Wardrobe Manager</h3>
            <p>Your wardrobe, reimagined. Plan outfits and track your style.</p>
            <Link to="/wardrobe" className="feature-btn">Try Now</Link>
          </div>

          <div className="feature-card">
            <img src="https://i.pinimg.com/736x/ba/92/c3/ba92c3aaab14d0d9d91d32467e96e8ae.jpg" alt="AI Stylist" />
            <h3>AI Stylist</h3>
            <p>Let AI style you. Discover looks that match your vibe.</p>
            <button type="button" className="feature-btn" onClick={openStella}>Try Now</button>
          </div>
        </div>
      </section>

      {/* CTA SELL */}
      <section className="cta">
        <h2>Got too many clothes?</h2>
        <p>Clear space and earn money by selling your items</p>
        <a href="#">START CLEAROUT</a>
      </section>

      {/* FEATURES */}
      <section className="section">
        <h2>WHY CHOOSE ReStyle?</h2>
        <div className="features">
          <div className="feature-box">
            <h3>Quality Assured</h3>
            <p>Every item is checked before sale.</p>
          </div>
          <div className="feature-box">
            <h3>Hassle Free</h3>
            <p>We handle photos, pricing & shipping.</p>
          </div>
          <div className="feature-box">
            <h3>Eco Friendly</h3>
            <p>Give clothes a second life.</p>
          </div>
        </div>
      </section>

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

      {/* TESTIMONIAL */}
      <section className="testimonial">
        <h2>What Our Customers Say</h2>
        <p>"Amazing quality and super easy shopping experience!"</p>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-grid">
          <div>
            <h4>Shop</h4>
            <a href="#">Women</a>
            <a href="#">Men</a>
            <a href="#">Clearance</a>
          </div>
          <div>
            <h4>Clearout</h4>
            <a href="#">Sell Items</a>
            <a href="#">Brand Checker</a>
            <a href="#">Return Bag</a>
          </div>
          <div>
            <h4>Support</h4>
            <a href="#">Help</a>
            <a href="#">Contact</a>
            <a href="#">Shipping</a>
          </div>
        </div>
        <p className="copy">© 2026 ReStyle | For Educational Use</p>
      </footer>
    </>
  );
};

export default Home;
