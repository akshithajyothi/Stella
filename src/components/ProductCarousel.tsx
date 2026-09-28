import { useNavigate } from 'react-router-dom';
import type { AgentProduct } from '../lib/api/agent';
import { useStella } from '../context/StellaContext';

interface ProductCarouselProps {
  products: AgentProduct[];
  onAddToCart: (product: AgentProduct) => void;
  onNegotiate: (product: AgentProduct) => void;
}

const ProductCarousel = ({ products, onAddToCart, onNegotiate }: ProductCarouselProps) => {
  const navigate = useNavigate();
  const { close } = useStella();
  if (!products.length) return null;

  function tryOn(product: AgentProduct) {
    // Try-On takes over the page view, so minimize the panel — matches the chat-triggered
    // try_on tool path, which already does this. Conversation state persists regardless.
    close();
    navigate('/virtual-tryon', { state: { garmentImage: product.image, garmentName: product.name } });
  }

  return (
    <div className="agent-carousel">
      {products.map((product) => (
        <div className="agent-carousel-card" key={product.id}>
          <img
            src={product.image}
            alt={product.name}
            onClick={() => navigate('/product', { state: product })}
          />
          <h4 onClick={() => navigate('/product', { state: product })}>{product.name}</h4>
          <p className="agent-carousel-price">₹{product.price}</p>
          <div className="agent-carousel-actions">
            <button className="add-bag-btn" onClick={() => onAddToCart(product)}>+ Add to Bag</button>
            <button className="agent-tryon-btn" onClick={() => tryOn(product)}>Try On</button>
            <button className="agent-tryon-btn" onClick={() => onNegotiate(product)}>Negotiate</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductCarousel;
