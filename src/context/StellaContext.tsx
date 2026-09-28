import { createContext, useContext, useState, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import type { AgentProduct, AgentAction } from '../lib/api/agent';

export interface StellaMessage {
  type: 'bot' | 'user';
  text: string;
  products?: AgentProduct[];
  quickReplies?: string[];
  action?: AgentAction;
}

export interface StellaProductContext {
  id: number;
  name: string;
  price: number;
}

interface StellaContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  messages: StellaMessage[];
  setMessages: Dispatch<SetStateAction<StellaMessage[]>>;
  currentProduct: StellaProductContext | null;
  setCurrentProduct: (product: StellaProductContext | null) => void;
}

const GREETING: StellaMessage = {
  type: 'bot',
  text: "Hi, I'm Stella! Tell me what you're looking for, ask for styling advice, or tap an option below.",
  quickReplies: ['Show me tops', 'Show me dresses', "What's on sale?", 'Help me style an outfit'],
};

const StellaContext = createContext<StellaContextType | undefined>(undefined);

// Mounted once in App.tsx, above <Routes>, so isOpen/messages/currentProduct all survive
// route changes — closing and reopening the panel (or navigating between pages) doesn't
// reset the conversation, per the "persist across navigation" requirement.
export const StellaProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<StellaMessage[]>([GREETING]);
  const [currentProduct, setCurrentProduct] = useState<StellaProductContext | null>(null);

  return (
    <StellaContext.Provider
      value={{
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen((v) => !v),
        messages,
        setMessages,
        currentProduct,
        setCurrentProduct,
      }}
    >
      {children}
    </StellaContext.Provider>
  );
};

export const useStella = () => {
  const ctx = useContext(StellaContext);
  if (!ctx) throw new Error('useStella must be used within StellaProvider');
  return ctx;
};
