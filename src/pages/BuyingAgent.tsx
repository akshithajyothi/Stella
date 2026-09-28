import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStella } from '../context/StellaContext';

// Stella is now a persistent side panel (see StellaPanel.tsx), not a full page. This route
// is kept only so any existing/bookmarked /buying-agent link still does something sensible:
// open the panel and land on the homepage.
const BuyingAgent = () => {
  const navigate = useNavigate();
  const { open } = useStella();

  useEffect(() => {
    open();
    navigate('/', { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default BuyingAgent;
