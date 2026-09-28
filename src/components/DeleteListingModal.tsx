import { useState } from 'react';

interface DeleteListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sellerEmail: string;
  itemName: string;
}

const DeleteListingModal = ({ isOpen, onClose, onConfirm, sellerEmail, itemName }: DeleteListingModalProps) => {
  const [step, setStep] = useState<'confirm' | 'otp'>('confirm');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirmDelete = () => {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setStep('otp');
    
    // Simulate sending email (in real app, this would call backend API)
    console.log(`📧 Simulated Email sent to: ${sellerEmail}`);
    console.log(`OTP Code: ${otp}`);
    alert(`🔐 OTP Sent!\n\nSimulated email to: ${sellerEmail}\nYour OTP: ${otp}\n\n(In production, this would be sent via email)`);
  };

  const handleVerifyOtp = () => {
    if (enteredOtp === generatedOtp) {
      onConfirm();
      handleClose();
    } else {
      setError('Invalid OTP. Please try again.');
    }
  };

  const handleClose = () => {
    setStep('confirm');
    setGeneratedOtp('');
    setEnteredOtp('');
    setError('');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        maxWidth: '450px',
        width: '90%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}>
        {step === 'confirm' ? (
          <>
            <h2 style={{ marginTop: 0, color: '#8b1538' }}>
              <i className="fa-solid fa-triangle-exclamation"></i> Delete Listing?
            </h2>
            <p style={{ fontSize: '16px', lineHeight: '1.6' }}>
              Are you sure you want to delete <strong>"{itemName}"</strong>?
            </p>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
              An OTP will be sent to <strong>{sellerEmail}</strong> for verification.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleClose}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #ddd',
                  background: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  background: '#8b1538',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}
              >
                Send OTP
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 style={{ marginTop: 0, color: '#8b1538' }}>
              <i className="fa-solid fa-envelope"></i> Enter OTP
            </h2>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              A 6-digit OTP has been sent to <strong>{sellerEmail}</strong>
            </p>
            
            <input
              type="text"
              maxLength={6}
              value={enteredOtp}
              onChange={(e) => {
                setEnteredOtp(e.target.value.replace(/\D/g, ''));
                setError('');
              }}
              placeholder="Enter 6-digit OTP"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '18px',
                textAlign: 'center',
                letterSpacing: '8px',
                border: error ? '2px solid red' : '2px solid #ddd',
                borderRadius: '4px',
                marginBottom: '10px',
                fontWeight: 'bold',
              }}
            />
            
            {error && (
              <p style={{ color: 'red', fontSize: '14px', marginBottom: '16px' }}>
                <i className="fa-solid fa-circle-exclamation"></i> {error}
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={handleClose}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #ddd',
                  background: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyOtp}
                disabled={enteredOtp.length !== 6}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  background: enteredOtp.length === 6 ? '#8b1538' : '#ccc',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: enteredOtp.length === 6 ? 'pointer' : 'not-allowed',
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}
              >
                Verify & Delete
              </button>
            </div>

            <p style={{ fontSize: '12px', color: '#999', marginTop: '16px', textAlign: 'center' }}>
              Didn't receive OTP? Check the console or alert message above.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default DeleteListingModal;
