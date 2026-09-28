import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import QuickReplies from '../components/QuickReplies';
import { startNegotiation, sendNegotiationMessage } from '../lib/api/agent';

interface Message {
  type: 'bot' | 'user';
  text: string;
}

const Negotiate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state as { id: number; name: string; price: number; image: string } | null;

  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<'active' | 'accepted' | 'rejected' | 'final'>('active');
  const [currentOffer, setCurrentOffer] = useState(product?.price ?? 0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!product) return;
    startNegotiation(product.id)
      .then((res) => {
        setSessionId(res.sessionId);
        setMessages([{ type: 'bot', text: res.reply }]);
        setCurrentOffer(res.offer);
      })
      .catch((err) => setMessages([{ type: 'bot', text: err.message || "Couldn't start the negotiation." }]))
      .finally(() => setIsLoading(false));
  }, [product]);

  if (!product) {
    return (
      <>
        <Header />
        <div className="page"><p>No product selected.</p></div>
      </>
    );
  }

  async function send(text: string) {
    if (!text.trim() || isLoading || !sessionId || status !== 'active') return;
    setMessages((prev) => [...prev, { type: 'user', text }]);
    setInputText('');
    setIsLoading(true);
    try {
      const res = await sendNegotiationMessage(sessionId, text);
      setMessages((prev) => [...prev, { type: 'bot', text: res.reply }]);
      setCurrentOffer(res.offer);
      setStatus(res.status);
    } catch (err: any) {
      setMessages((prev) => [...prev, { type: 'bot', text: err.message || 'The negotiation agent hit an error.' }]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleAccept() {
    send('I accept this offer.');
  }

  return (
    <>
      <Header />
      <div className="page">
        <div className="breadcrumb">Negotiating: {product.name} (originally ₹{product.price})</div>
        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.type}`}>
                <div className="message-content"><div className="message-bubble">{msg.text}</div></div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot"><div className="message-content"><div className="message-bubble">…</div></div></div>
            )}
            {status === 'active' && !isLoading && (
              <QuickReplies
                options={[`Accept ₹${currentOffer}`, 'Offer a lower price', 'No thanks']}
                onPick={(opt) => {
                  if (opt.startsWith('Accept')) return handleAccept();
                  // "Offer a lower price" has no number in it — sending it as-is gives the
                  // negotiation engine nothing to act on, so it just re-states the same offer.
                  // Focus the input instead so the buyer types an actual amount.
                  if (opt === 'Offer a lower price') return inputRef.current?.focus();
                  send(opt);
                }}
              />
            )}
            {status !== 'active' && (
              <div className="message bot">
                <div className="message-content">
                  <div className="message-bubble">
                    {status === 'accepted' && (
                      <button className="btn-primary" onClick={() => navigate('/product', { state: { ...product, price: currentOffer } })}>
                        Buy at ₹{currentOffer}
                      </button>
                    )}
                    {status !== 'accepted' && 'This negotiation has ended.'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {status === 'active' && (
            <div className="chat-input">
              <input
                ref={inputRef}
                type="text"
                placeholder="Make an offer…"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send(inputText)}
                disabled={isLoading}
              />
              <button onClick={() => send(inputText)} disabled={isLoading || !inputText.trim()}>
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Negotiate;
