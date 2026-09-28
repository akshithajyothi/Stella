import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCarousel from './ProductCarousel';
import QuickReplies from './QuickReplies';
import AgentAddressForm from './AgentAddressForm';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useWardrobe } from '../context/WardrobeContext';
import { useStella } from '../context/StellaContext';
import { sendBuyingAgentMessage, type AgentProduct, type ChatHistoryMessage } from '../lib/api/agent';
import type { ShippingAddress } from '../lib/api/orders';

// The persistent right-side Stella panel — mounted once in App.tsx so it survives navigation.
// Reuses the same send/action-handling logic the old full-page BuyingAgent.tsx had; just
// relocated into a slide-in shell instead of a full route.
const StellaPanel = () => {
  const { isOpen, close, messages, setMessages, currentProduct } = useStella();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState<ShippingAddress | undefined>(undefined);
  const { cartItems, addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { items: wardrobeItems } = useWardrobe();
  const navigate = useNavigate();

  const history: ChatHistoryMessage[] = messages
    .filter((m) => m.text)
    .map((m) => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.text }));

  // Every product shown so far this conversation, deduped by id, capped small — gives the
  // backend enough to resolve "this dress"/"that pant" and to exclude already-shown items
  // when the buyer asks for more, without the model having to guess from raw chat text alone.
  const recentProducts = useMemo(() => {
    const byId = new Map<number, AgentProduct>();
    for (const m of messages) {
      for (const p of m.products ?? []) byId.set(p.id, p);
    }
    return [...byId.values()].slice(-15);
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || isLoading) return;
    setMessages((prev) => [...prev, { type: 'user', text }]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await sendBuyingAgentMessage({
        message: text,
        history,
        cart: cartItems.map((i) => ({ id: i.id, name: i.name, price: i.price, image: i.image, quantity: i.quantity })),
        address,
        wardrobe: wardrobeItems.map((i) => ({ id: i.id, name: i.name, category: i.category, color: i.color })),
        currentProduct,
        recentProducts,
      });
      setMessages((prev) => [...prev, { type: 'bot', text: res.reply, products: res.products, quickReplies: res.quickReplies, action: res.action }]);

      if (res.action?.type === 'add_to_cart') {
        const { product, quantity } = res.action;
        for (let i = 0; i < quantity; i++) {
          addToCart({ id: product.id, name: product.name, sku: `RST-${product.id}`, price: product.price, image: product.image, inStock: true, size: product.size });
        }
      }
      if (res.action?.type === 'add_to_wishlist') {
        const { product } = res.action;
        if (!isWishlisted(product.id)) {
          toggleWishlist({ id: product.id, name: product.name, price: product.price, image: product.image, size: product.size });
        }
      }
      if (res.action?.type === 'try_on') {
        navigate('/virtual-tryon', { state: { garmentImage: res.action.garmentImage, garmentName: res.action.garmentName } });
        close();
      }
    } catch (err: any) {
      setMessages((prev) => [...prev, { type: 'bot', text: err.message || "Sorry, I couldn't reach the AI agent. Is GROQ_API_KEY set?" }]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleAddToCart(product: AgentProduct) {
    addToCart({ id: product.id, name: product.name, sku: `RST-${product.id}`, price: product.price, image: product.image, inStock: true, size: product.size });
  }

  function handleAddressSubmit(addr: ShippingAddress) {
    setAddress(addr);
    send(`My delivery address is confirmed: ${addr.name}, ${addr.line1}, ${addr.city}, ${addr.state} ${addr.postalCode}, phone ${addr.phone}. Please generate the payment link.`);
  }

  return (
    <>
      <div className={`stella-overlay ${isOpen ? 'show' : ''}`} onClick={close}></div>
      <div className={`stella-panel ${isOpen ? 'open' : ''}`}>
        <div className="stella-header">
          <div className="stella-header-identity">
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            <div>
              <strong>Stella</strong>
              <span>Your AI fashion &amp; shopping assistant</span>
            </div>
          </div>
          <button className="icon-btn-bare" aria-label="Close Stella" onClick={close}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="stella-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`stella-message ${msg.type}`}>
              {msg.text && <div className="stella-bubble">{msg.text}</div>}
              {msg.products && (
                <ProductCarousel
                  products={msg.products}
                  onAddToCart={handleAddToCart}
                  onNegotiate={(p) => send(`I'd like to negotiate on the ${p.name}.`)}
                />
              )}
              {msg.action?.type === 'show_checkout_form' && <AgentAddressForm onSubmit={handleAddressSubmit} />}
              {msg.action?.type === 'payment_link' && (
                <a href={msg.action.url} className="btn-primary" style={{ display: 'inline-block', marginTop: 8 }}>
                  Pay now
                </a>
              )}
              {msg.action?.type === 'negotiation' && (
                <div className="stella-negotiation-card">
                  <div className="stella-negotiation-row"><span>Listing price</span><span>₹{msg.action.listingPrice}</span></div>
                  <div className="stella-negotiation-row highlight"><span>Stella's offer</span><span>₹{msg.action.offer}</span></div>
                  <div className="stella-negotiation-status">{msg.action.status}</div>
                </div>
              )}
              {msg.quickReplies && <QuickReplies options={msg.quickReplies} onPick={send} />}
            </div>
          ))}
          {isLoading && (
            <div className="stella-message bot">
              <div className="stella-bubble">…</div>
            </div>
          )}
        </div>

        <div className="stella-input">
          <input
            type="text"
            placeholder={isLoading ? 'Stella is thinking…' : 'Ask Stella anything…'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(inputText)}
            disabled={isLoading}
          />
          <button onClick={() => send(inputText)} disabled={isLoading || !inputText.trim()} aria-label="Send">
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </>
  );
};

export default StellaPanel;
