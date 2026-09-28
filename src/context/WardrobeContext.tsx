import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface WardrobeItem {
  id: number;
  name: string;
  image: string;
  category: string;
  color?: string;
}

interface WardrobeContextType {
  items: WardrobeItem[];
  addItem: (item: Omit<WardrobeItem, 'id'>) => void;
  removeItem: (id: number) => void;
}

const STORAGE_KEY = 'restyle_wardrobe';

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

export const WardrobeProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<WardrobeItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save wardrobe to localStorage:', error);
    }
  }, [items]);

  const addItem = (item: Omit<WardrobeItem, 'id'>) => {
    setItems((prev) => [...prev, { ...item, id: Date.now() }]);
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <WardrobeContext.Provider value={{ items, addItem, removeItem }}>
      {children}
    </WardrobeContext.Provider>
  );
};

export const useWardrobe = () => {
  const ctx = useContext(WardrobeContext);
  if (!ctx) throw new Error('useWardrobe must be used within WardrobeProvider');
  return ctx;
};
