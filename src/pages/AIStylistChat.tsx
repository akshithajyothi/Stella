import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { sendChatMessage, checkBackendAvailable } from '../lib/api/aiStylist';

interface Message {
  type: 'bot' | 'user';
  text: string;
  images: string[];
}

const AIStylistChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot',
      text: 'Hi! I\'m your AI stylist. How can I help you today?',
      images: []
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);
  const userId = 1; // TODO: Get from actual user session/context

  // Check if backend is available on mount
  useEffect(() => {
    checkBackendAvailable().then(setBackendAvailable);
  }, []);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    // Add user message immediately
    const userMessage: Message = {
      type: 'user',
      text: inputText,
      images: []
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Show chatbot animation
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 2000);

    try {
      // Check if backend is available
      if (backendAvailable === false) {
        // Show demo response if backend is down
        setTimeout(() => {
          setMessages(prev => [...prev, {
            type: 'bot',
            text: '⚠️ Demo Mode: AI Stylist backend is not running.\n\nTo enable real AI responses, please start the Python backend server.\n\nSee AI_STYLIST_BACKEND_SETUP.md for instructions.',
            images: []
          }]);
          setIsLoading(false);
        }, 1000);
        return;
      }

      // Call real AI backend
      const response = await sendChatMessage(userId, inputText);
      
      // Add AI response
      setMessages(prev => [...prev, {
        type: 'bot',
        text: response.reply,
        images: []
      }]);
    } catch (error: any) {
      // Handle error gracefully
      console.error('AI Stylist error:', error);
      
      setMessages(prev => [...prev, {
        type: 'bot',
        text: error.message.includes('backend is not running') 
          ? '⚠️ AI Stylist backend is not running. Please start the Python server to get real AI responses.\n\nSee AI_STYLIST_BACKEND_SETUP.md for setup instructions.'
          : 'Sorry, I encountered an error. Please try again.',
        images: []
      }]);
      
      // Mark backend as unavailable
      setBackendAvailable(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      
      <div className="chat-container">
        {/* Chatbot Popup */}
        {showPopup && (
          <div className="chatbot-popup">
            <img src="/chatbot.png" alt="AI Stylist" />
          </div>
        )}

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.type}`}>
              <div className="message-content">
                {msg.images.length > 0 && (
                  <div className="message-images">
                    {msg.images.map((img, i) => (
                      <div key={i} className="message-image">
                        <img src={img} alt={`Outfit ${i + 1}`} />
                      </div>
                    ))}
                  </div>
                )}
                {msg.text && (
                  <div className="message-bubble">
                    {msg.text}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="chat-input">
          <input
            type="text"
            placeholder={isLoading ? "AI is thinking..." : "Ask me anything about style..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            disabled={isLoading}
          />
          <button onClick={handleSend} disabled={isLoading || !inputText.trim()}>
            {isLoading ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : (
              <i className="fa-solid fa-paper-plane"></i>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default AIStylistChat;
