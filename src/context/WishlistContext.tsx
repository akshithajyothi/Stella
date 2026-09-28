import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface WishlistItem {
  id: number;
  name: string;
  price: number;
  image: string;
  size?: string;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  isWishlisted: (id: number) => boolean;
  toggleWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: number) => void;
}

const STORAGE_KEY = 'restyle_wishlist';

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistItems));
    } catch (error) {
      console.error('Failed to save wishlist to localStorage:', error);
    }
  }, [wishlistItems]);

  const isWishlisted = (id: number) => wishlistItems.some(i => i.id === id);

  const toggleWishlist = (item: WishlistItem) => {
    setWishlistItems(prev =>
      prev.some(i => i.id === item.id)
        ? prev.filter(i => i.id !== item.id)
        : [...prev, item]
    );
  };

  const removeFromWishlist = (id: number) => {
    setWishlistItems(prev => prev.filter(i => i.id !== id));
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, isWishlisted, toggleWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
