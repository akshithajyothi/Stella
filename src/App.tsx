import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ListingsProvider } from './context/ListingsContext';
import { WishlistProvider } from './context/WishlistContext';
import { WardrobeProvider } from './context/WardrobeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { StellaProvider } from './context/StellaContext';
import ErrorBoundary from './components/ErrorBoundary';
import StellaPanel from './components/StellaPanel';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Clearout from './pages/Clearout';
import Tops from './pages/Tops';
import Dresses from './pages/Dresses';
import Bottoms from './pages/Bottoms';
import CoatsJackets from './pages/CoatsJackets';
import Skirts from './pages/Skirts';
import Sweatshirts from './pages/Sweatshirts';
import Product from './pages/Product';
import VirtualTryOn from './pages/VirtualTryOn';
import Wardrobe from './pages/Wardrobe';
import AIStylistChat from './pages/AIStylistChat';
import Sell from './pages/Sell';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import BuyingAgent from './pages/BuyingAgent';
import Negotiate from './pages/Negotiate';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <ListingsProvider>
        <CartProvider>
          <WishlistProvider>
            <WardrobeProvider>
              <ToastProvider>
                <AuthProvider>
                  <StellaProvider>
                    <Router>
                      <StellaPanel />
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/edit-profile" element={<EditProfile />} />
                        <Route path="/clearout" element={<Clearout />} />
                        <Route path="/tops" element={<Tops />} />
                        <Route path="/dresses" element={<Dresses />} />
                        <Route path="/bottoms" element={<Bottoms />} />
                        <Route path="/coats" element={<CoatsJackets />} />
                        <Route path="/skirts" element={<Skirts />} />
                        <Route path="/sweatshirts" element={<Sweatshirts />} />
                        <Route path="/accessories" element={<Tops />} />
                        <Route path="/product" element={<Product />} />
                        <Route path="/virtual-tryon" element={<VirtualTryOn />} />
                        <Route path="/wardrobe" element={<Wardrobe />} />
                        <Route path="/ai-stylist-chat" element={<AIStylistChat />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                        <Route path="/sell" element={<Sell />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/buying-agent" element={<BuyingAgent />} />
                        <Route path="/negotiate" element={<Negotiate />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Router>
                  </StellaProvider>
                </AuthProvider>
              </ToastProvider>
            </WardrobeProvider>
          </WishlistProvider>
        </CartProvider>
      </ListingsProvider>
    </ErrorBoundary>
  );
}

export default App;
