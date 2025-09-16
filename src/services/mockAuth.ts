import type { User } from '../types';

// Mock users for testing
const MOCK_USERS: User[] = [
  {
    id: 1,
    name: 'John Admin',
    phone: '+1234567890',
    email: 'admin@civic.com',
    role: 'admin',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Jane Super Admin',
    phone: '+0987654321',
    email: 'superadmin@civic.com',
    role: 'super_admin',
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Bob Worker',
    phone: '+1122334455',
    email: 'worker@civic.com',
    role: 'worker',
    created_at: new Date().toISOString()
  }
];

// Mock OTP storage
let pendingOtpSession: { phoneOrEmail: string; otp: string; timestamp: number } | null = null;

export class MockAuthService {
  
  // Mock login - accepts any email/phone and generates a mock OTP
  async login(credentials: { phoneOrEmail: string }): Promise<{ message: string; success: boolean }> {
    console.log('🧪 MOCK: Login request for:', credentials.phoneOrEmail);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find user by phone or email
    const user = MOCK_USERS.find(u => 
      u.email === credentials.phoneOrEmail || u.phone === credentials.phoneOrEmail
    );
    
    if (!user) {
      throw new Error('User not found. Try: admin@civic.com, superadmin@civic.com, or worker@civic.com');
    }
    
    // Generate mock OTP
    const otp = '123456'; // Fixed OTP for easy testing
    pendingOtpSession = {
      phoneOrEmail: credentials.phoneOrEmail,
      otp,
      timestamp: Date.now()
    };
    
    console.log(`🧪 MOCK: OTP sent! Use: ${otp}`);
    
    return {
      message: `OTP sent to ${credentials.phoneOrEmail}. Use: ${otp}`,
      success: true
    };
  }
  
  // Mock OTP verification
  async verifyOtp(data: { otp: string }): Promise<{ token: string; user: User }> {
    console.log('🧪 MOCK: OTP verification for:', data.otp);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (!pendingOtpSession) {
      throw new Error('No pending OTP session. Please request OTP first.');
    }
    
    // Check if OTP session is expired (5 minutes)
    if (Date.now() - pendingOtpSession.timestamp > 5 * 60 * 1000) {
      pendingOtpSession = null;
      throw new Error('OTP expired. Please request a new one.');
    }
    
    // Verify OTP
    if (data.otp !== pendingOtpSession.otp) {
      throw new Error('Invalid OTP. Try: 123456');
    }
    
    // Find user
    const user = MOCK_USERS.find(u => 
      u.email === pendingOtpSession?.phoneOrEmail || u.phone === pendingOtpSession?.phoneOrEmail
    );
    
    if (!user) {
      throw new Error('User session expired');
    }
    
    // Clear OTP session
    pendingOtpSession = null;
    
    // Generate mock JWT token
    const token = `mock-jwt-token-${user.id}-${Date.now()}`;
    
    console.log('🧪 MOCK: Authentication successful for:', user.name);
    
    return {
      token,
      user
    };
  }
  
  // Mock get current user
  async getCurrentUser(token: string): Promise<User> {
    console.log('🧪 MOCK: Getting current user with token:', token);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Extract user ID from mock token
    const tokenParts = token.split('-');
    const userId = parseInt(tokenParts[3]);
    
    const user = MOCK_USERS.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('Invalid token or user not found');
    }
    
    console.log('🧪 MOCK: Current user:', user.name);
    
    return user;
  }
}

export const mockAuthService = new MockAuthService();