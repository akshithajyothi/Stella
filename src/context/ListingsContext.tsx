import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface ListingItem {
  id: number;
  name: string;
  size: string;
  price: number;
  badge?: string;
  image: string;
  category: 'tops' | 'dresses' | 'bottoms' | 'coats' | 'accessories';
  gender: 'women' | 'men';
  description: string;
  condition: string;
  color?: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone?: string;
  images: { [key: string]: string | null };
  createdAt: string;
  isSold: boolean;
}

interface ListingsContextType {
  listings: ListingItem[];
  addListing: (listing: Omit<ListingItem, 'id' | 'createdAt' | 'isSold'>) => void;
  getListingsByCategory: (category: string, gender?: string) => ListingItem[];
  markAsSold: (id: number) => void;
  markAsAvailable: (id: number) => void;
  deleteListing: (id: number) => void;
}

const STORAGE_KEY = 'restyle_listings';

const ListingsContext = createContext<ListingsContextType | undefined>(undefined);

export const ListingsProvider = ({ children }: { children: ReactNode }) => {
  // Load from localStorage on init
  const [listings, setListings] = useState<ListingItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage whenever listings change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
    } catch (error) {
      console.error('Failed to save listings to localStorage:', error);
    }
  }, [listings]);

  const addListing = (listing: Omit<ListingItem, 'id' | 'createdAt' | 'isSold'>) => {
    const newListing: ListingItem = {
      ...listing,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      isSold: false,
    };
    setListings(prev => [newListing, ...prev]);
  };

  const getListingsByCategory = (category: string, gender?: string): ListingItem[] => {
    return listings.filter(item => {
      // If category is 'all', return all items for the gender
      const matchesCategory = category === 'all' ? true : item.category === category;
      const matchesGender = gender ? item.gender === gender : true;
      return matchesCategory && matchesGender;
    });
  };

  const markAsSold = (id: number) => {
    setListings(prev => prev.map(item => 
      item.id === id ? { ...item, isSold: true } : item
    ));
  };

  const markAsAvailable = (id: number) => {
    setListings(prev => prev.map(item => 
      item.id === id ? { ...item, isSold: false } : item
    ));
  };

  const deleteListing = (id: number) => {
    setListings(prev => prev.filter(item => item.id !== id));
  };

  return (
    <ListingsContext.Provider value={{ listings, addListing, getListingsByCategory, markAsSold, markAsAvailable, deleteListing }}>
      {children}
    </ListingsContext.Provider>
  );
};

export const useListings = () => {
  const ctx = useContext(ListingsContext);
  if (!ctx) throw new Error('useListings must be used within ListingsProvider');
  return ctx;
};
