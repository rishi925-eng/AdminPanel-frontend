import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import apiService from '../services/api';
import { LockClosedIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [credentials, setCredentials] = useState({ phoneOrEmail: '' });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiService.login(credentials);
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiService.verifyOtp({ otp });
      await login(response.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const isEmail = credentials.phoneOrEmail.includes('@');

  return (
    <div className=\"min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8\">
      <div className=\"max-w-md w-full space-y-8\">
        <div className=\"text-center\">
          <div className=\"mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center\">
            <LockClosedIcon className=\"h-8 w-8 text-white\" />
          </div>
          <h2 className=\"mt-6 text-3xl font-bold text-secondary-900\">
            Civic Admin Portal
          </h2>
          <p className=\"mt-2 text-sm text-secondary-600\">
            {step === 'credentials' ? 'Sign in to your account' : 'Enter verification code'}
          </p>
        </div>

        {step === 'credentials' ? (
          <form className=\"mt-8 space-y-6\" onSubmit={handleCredentialsSubmit}>
            <div className=\"card\">
              <div className=\"space-y-4\">
                <div>
                  <label htmlFor=\"phoneOrEmail\" className=\"block text-sm font-medium text-secondary-700\">
                    Phone Number or Email
                  </label>
                  <div className=\"mt-1 relative\">
                    <div className=\"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none\">
                      {isEmail ? (
                        <EnvelopeIcon className=\"h-5 w-5 text-secondary-400\" />
                      ) : (
                        <PhoneIcon className=\"h-5 w-5 text-secondary-400\" />
                      )}
                    </div>
                    <input
                      id=\"phoneOrEmail\"
                      name=\"phoneOrEmail\"
                      type=\"text\"
                      required
                      className=\"input-field pl-10\"
                      placeholder=\"Enter phone number or email\"
                      value={credentials.phoneOrEmail}
                      onChange={(e) => setCredentials({ phoneOrEmail: e.target.value })}
                    />
                  </div>
                </div>

                {error && (
                  <div className=\"bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg\">
                    {error}
                  </div>
                )}

                <button
                  type=\"submit\"
                  disabled={loading || !credentials.phoneOrEmail}
                  className=\"btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed\"
                >
                  {loading ? (
                    <div className=\"flex items-center justify-center\">
                      <div className=\"loading-spinner h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2\" />
                      Sending Code...
                    </div>
                  ) : (
                    'Send Verification Code'
                  )}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form className=\"mt-8 space-y-6\" onSubmit={handleOtpSubmit}>
            <div className=\"card\">
              <div className=\"space-y-4\">
                <div>
                  <label htmlFor=\"otp\" className=\"block text-sm font-medium text-secondary-700\">
                    Verification Code
                  </label>
                  <div className=\"mt-1\">
                    <input
                      id=\"otp\"
                      name=\"otp\"
                      type=\"text\"
                      required
                      className=\"input-field text-center text-lg tracking-widest\"
                      placeholder=\"Enter 6-digit code\"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                    />
                  </div>
                  <p className=\"mt-2 text-sm text-secondary-600\">
                    Code sent to {credentials.phoneOrEmail}
                  </p>
                </div>

                {error && (
                  <div className=\"bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg\">
                    {error}
                  </div>
                )}

                <div className=\"flex space-x-3\">
                  <button
                    type=\"button\"
                    onClick={() => {
                      setStep('credentials');
                      setOtp('');
                      setError('');
                    }}
                    className=\"btn-secondary flex-1\"
                  >
                    Back
                  </button>
                  <button
                    type=\"submit\"
                    disabled={loading || otp.length !== 6}
                    className=\"btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed\"
                  >
                    {loading ? (
                      <div className=\"flex items-center justify-center\">
                        <div className=\"loading-spinner h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2\" />
                        Verifying...
                      </div>
                    ) : (
                      'Verify & Sign In'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        <div className=\"text-center\">
          <p className=\"text-xs text-secondary-500\">
            Civic Issue Reporting Admin Portal v1.0
          </p>
        </div>
      </div>
    </div>
  );
}