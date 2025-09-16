import { useState } from 'react';
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
  const [successMessage, setSuccessMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await apiService.login(credentials);
      console.log('Login response:', response);
      
      if (response.success) {
        setSuccessMessage(response.message || 'OTP sent successfully!');
        setStep('otp');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.message) {
        setError(err.message);
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await apiService.verifyOtp({ otp });
      console.log('OTP verification response:', response);
      
      if (response.token && response.user) {
        await login(response.token);
        setSuccessMessage('Login successful! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        setError('Invalid response from server');
      }
    } catch (err: any) {
      console.error('OTP verification error:', err);
      if (err.message) {
        setError(err.message);
      } else {
        setError(err.response?.data?.message || 'OTP verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isEmail = credentials.phoneOrEmail.includes('@');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
            <LockClosedIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-secondary-900">
            Civic Admin Portal
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            {step === 'credentials' ? 'Sign in to your account' : 'Enter verification code'}
          </p>
        </div>

        {/* Development Testing Info */}
        <div className="text-center text-sm text-secondary-500 bg-secondary-50 p-3 rounded-lg">
          <p className="font-medium">🧪 Development Mode</p>
          <p>Use: admin@civic.com, superadmin@civic.com, or worker@civic.com</p>
          <p>OTP: 123456</p>
        </div>

        {step === 'credentials' ? (
          <form className="mt-8 space-y-6" onSubmit={handleCredentialsSubmit}>
            <div className="card">
              <div className="space-y-4">
                <div>
                  <label htmlFor="phoneOrEmail" className="block text-sm font-medium text-secondary-700">
                    Phone Number or Email
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {isEmail ? (
                        <EnvelopeIcon className="h-5 w-5 text-secondary-400" />
                      ) : (
                        <PhoneIcon className="h-5 w-5 text-secondary-400" />
                      )}
                    </div>
                    <input
                      id="phoneOrEmail"
                      name="phoneOrEmail"
                      type="text"
                      required
                      className="input-field pl-10"
                      placeholder="Enter phone number or email"
                      value={credentials.phoneOrEmail}
                      onChange={(e) => setCredentials({ phoneOrEmail: e.target.value })}
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-danger-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </div>
                  </div>
                )}

                {successMessage && (
                  <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-success-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {successMessage}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !credentials.phoneOrEmail}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="loading-spinner h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
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
          <form className="mt-8 space-y-6" onSubmit={handleOtpSubmit}>
            <div className="card">
              <div className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-secondary-700">
                    Verification Code
                  </label>
                  <div className="mt-1">
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      required
                      className="input-field text-center text-lg tracking-widest"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                    />
                  </div>
                  <p className="mt-2 text-sm text-secondary-600">
                    Code sent to {credentials.phoneOrEmail}
                  </p>
                </div>

                {error && (
                  <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-danger-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </div>
                  </div>
                )}

                {successMessage && (
                  <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-success-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {successMessage}
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('credentials');
                      setOtp('');
                      setError('');
                      setSuccessMessage('');
                    }}
                    className="btn-secondary flex-1"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="loading-spinner h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
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

        <div className="text-center">
          <p className="text-xs text-secondary-500">
            Civic Issue Reporting Admin Portal v1.0
          </p>
        </div>
      </div>
    </div>
  );
}