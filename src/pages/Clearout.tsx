import { useState } from 'react';
import Header from '../components/Header';

const Clearout = () => {
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleOrderBag = () => {
    showToast('Order a bag feature coming soon!');
  };

  const handleReturnBag = () => {
    showToast('Return bag feature coming soon!');
  };

  return (
    <>
      <Header />
      {toast && (
        <div className="toast-notification">
          <i className="fas fa-check-circle"></i> {toast}
        </div>
      )}

      {/* CLEAROUT HERO */}
      <section className="clearout-hero">
        <div className="clearout-text">
          <h1>YOUR CLEAROUT<br />STARTS HERE.</h1>
          <p>Send us your pre-loved clothes. We'll do the rest.</p>
          <button className="order-btn" onClick={handleOrderBag}>ORDER A BAG</button>
          <a href="#" className="return-link" onClick={(e) => { e.preventDefault(); handleReturnBag(); }}>Return a bag →</a>
        </div>

        <div className="clearout-img">
          <img src="/pink-basket.png" alt="Pink Basket" />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section clearout-section">
        <h2>HOW IT WORKS</h2>

        <div className="steps-grid">
          <div className="step-card">
            <img src="/Screenshot 2026-03-15 223517.png" alt="Pack" />
            <h3>PACK</h3>
            <p>Fill up your bag with clothes, accessories and shoes you no longer want.</p>
            <p>Check what resells <u>here</u>. We'll responsibly recirculate the rest.</p>
          </div>

          <div className="step-card">
            <img src="/Screenshot 2026-03-15 223535.png" alt="Post" />
            <h3>POST</h3>
            <p>Pick your free returns label. Choose from home collections, locker drop-offs and <u>more</u>.</p>
            <p>Then just send us your bag.</p>
          </div>

          <div className="step-card">
            <img src="/Screenshot 2026-03-15 221529.png" alt="Done" />
            <h3>DONE</h3>
            <p>We'll do the rest. We'll resell and recirculate your items.</p>
            <p>If an item resells, you can <u>earn cash</u>, credit to spend on pre-loved, or donate to charity.</p>
          </div>
        </div>

        <div className="center-btn">
          <button onClick={handleOrderBag}>ORDER A BAG</button>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="section clearout-section">
        <h2>BENEFITS</h2>

        {/* Stats Row */}
        <div className="benefits-stats">
          <div className="benefits-stat">
            <span className="stat-number">300K+</span>
            <span className="stat-label">wardrobe<br />clearouts.</span>
          </div>
          <div className="benefits-stat">
            <span className="stat-number">3M+</span>
            <span className="stat-label">items<br />recirculated.</span>
          </div>
          <div className="benefits-stat">
            <span className="stat-number">£2M+</span>
            <span className="stat-label">raised<br />for charity.</span>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="benefits-grid">
          <div className="benefit-card">
            <h3>ZERO HASSLE</h3>
            <p>More wardrobe space? Here for it. Hassle? Not so much.</p>
            <p>No dm drama. Skip the post-office queues. We handle everything.</p>
            <p>We've created a lean, green, reselling and recirculating machine.</p>
            <p>Just send us your ReStyle Bag. We'll take care of the rest.</p>
          </div>

          <div className="benefit-card">
            <h3>HELP END FASHION WASTE</h3>
            <p>We're on a mission to end fashion waste. One wardrobe at a time.</p>
            <p>Currently 49% of people in the UK bin no-longer-loved clothes. Think that needs to change? Us too.</p>
            <p>We do all we can to make giving your clothes a new life as easy as possible.</p>
          </div>

          <div className="benefit-card">
            <h3>REWARDING</h3>
            <p>Giving your clothes a new life should feel good. Which means when an item resells, you get a little something back.</p>
            <p>Opt to earn <strong>cash payouts</strong>, <strong>credits</strong> to spend on pre-loved, or <strong>donate</strong> to your favourite charity.</p>
            <p>A little extra can go a long way. So far our sellers have raised over £2M+ for charity.</p>
            <p>This is fashion for good.</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Clearout;
