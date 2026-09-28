import { useState } from 'react';
import type { ShippingAddress } from '../lib/api/orders';

const EMPTY: ShippingAddress = { name: '', line1: '', line2: '', city: '', state: '', postalCode: '', phone: '' };

const AgentAddressForm = ({ onSubmit }: { onSubmit: (address: ShippingAddress) => void }) => {
  const [address, setAddress] = useState<ShippingAddress>(EMPTY);
  const filled = address.name && address.line1 && address.city && address.state && address.postalCode && address.phone;

  const set = (key: keyof ShippingAddress, value: string) => setAddress((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="agent-address-form">
      <input placeholder="Full name" value={address.name} onChange={(e) => set('name', e.target.value)} />
      <input placeholder="Phone number" value={address.phone} onChange={(e) => set('phone', e.target.value)} />
      <input placeholder="Address line 1" value={address.line1} onChange={(e) => set('line1', e.target.value)} />
      <input placeholder="City" value={address.city} onChange={(e) => set('city', e.target.value)} />
      <input placeholder="State" value={address.state} onChange={(e) => set('state', e.target.value)} />
      <input placeholder="PIN code" value={address.postalCode} onChange={(e) => set('postalCode', e.target.value)} />
      <button className="add-bag-btn" disabled={!filled} onClick={() => onSubmit(address)}>
        Confirm address
      </button>
    </div>
  );
};

export default AgentAddressForm;
