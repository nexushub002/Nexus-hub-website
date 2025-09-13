// LoginModal.jsx
import React, { useState } from 'react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import './LoginModel.css';

export default function LoginModel({ onClose, onLoginSuccess }) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  // Send OTP
  const sendOtp = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
        credentials: 'include' // important for cookies
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to send OTP');
      }

      setStep(2);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    try {
      console.log("🔔 Verifying OTP for phone:", phone, "otp:", otp);
      const res = await fetch('http://localhost:3000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
        credentials: 'include' // ensures session cookie is sent back
      });
      console.log("🔔 OTP verification response status:", res.status);
      

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'OTP verification failed');
      }

      setError('');
      onLoginSuccess(); // hide modal & refresh user state
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">

        <div className="close-icon" onClick={onClose}>
          <CloseRoundedIcon />
        </div>

        {step === 1 && (
          <>
            <h2>Enter your mobile number</h2>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
            <button onClick={sendOtp} disabled={!phone}>Send OTP</button>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Enter OTP</h2>
            <input
              type="text"
              placeholder="6-digit code"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              maxLength={6}
            />
            <button onClick={verifyOtp} disabled={otp.length < 6}>
              Verify & Login
            </button>
            <p className="resend" onClick={sendOtp}>Resend OTP</p>
          </>
        )}

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
