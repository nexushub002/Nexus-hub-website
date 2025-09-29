import React, { useState, useEffect } from 'react';
import './LoginPopup.css';

const LoginPopup = ({ isOpen, onClose, onLoginSuccess }) => {
  const [step, setStep] = useState(1); // 1: Mobile, 2: OTP
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Reset state when popup opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setMobileNumber('');
      setOtp(['', '', '', '', '', '']);
      setError('');
      setResendTimer(0);
    }
  }, [isOpen]);

  // Resend timer countdown
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const validateMobileNumber = (number) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(number);
  };

  const handleMobileSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateMobileNumber(mobileNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: mobileNumber }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setStep(2);
        setResendTimer(30); // 30 seconds resend timer
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          phone: mobileNumber, 
          otp: otpString 
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: mobileNumber }),
      });

      if (response.ok) {
        setResendTimer(30);
        setError('');
      } else {
        setError('Failed to resend OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToMobile = () => {
    setStep(1);
    setOtp(['', '', '', '', '', '']);
    setError('');
    setResendTimer(0);
  };

  if (!isOpen) return null;

  return (
    <div className="login-popup-overlay" onClick={onClose}>
      <div className="login-popup-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="login-popup-header">
          <div className="login-popup-logo">
            <div className="logo-icon">🚀</div>
            <h2>Welcome to NexusHub</h2>
          </div>
          <button className="login-popup-close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="login-progress">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <span>Mobile</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <span>Verify</span>
          </div>
        </div>

        {/* Content */}
        <div className="login-popup-content">
          {step === 1 ? (
            // Mobile Number Step
            <div className="login-step">
              <div className="step-icon">📱</div>
              <h3>Enter your mobile number</h3>
              <p>We'll send you a verification code</p>
              
              <form onSubmit={handleMobileSubmit}>
                <div className="input-group">
                  <div className="country-code">+91</div>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) {
                        setMobileNumber(value);
                      }
                    }}
                    placeholder="Enter 10-digit mobile number"
                    className="mobile-input"
                    maxLength="10"
                    required
                  />
                </div>
                
                {error && <div className="error-message">{error}</div>}
                
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={loading || mobileNumber.length !== 10}
                >
                  {loading ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <>
                      <span>Send OTP</span>
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            // OTP Verification Step
            <div className="login-step">
              <div className="step-icon">🔐</div>
              <h3>Enter verification code</h3>
              <p>We've sent a 6-digit code to +91 {mobileNumber}</p>
              
              <form onSubmit={handleOtpSubmit}>
                <div className="otp-inputs">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="otp-input"
                      maxLength="1"
                      pattern="[0-9]"
                    />
                  ))}
                </div>
                
                {error && <div className="error-message">{error}</div>}
                
                <div className="otp-actions">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="resend-button"
                    disabled={resendTimer > 0 || loading}
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleBackToMobile}
                    className="back-button"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Change Number
                  </button>
                </div>
                
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={loading || otp.join('').length !== 6}
                >
                  {loading ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <>
                      <span>Verify & Login</span>
                      <span className="material-symbols-outlined">check_circle</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="login-popup-footer">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPopup;
