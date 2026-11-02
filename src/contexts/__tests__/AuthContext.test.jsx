import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import toast from 'react-hot-toast';

// Mock Firebase modules
vi.mock('../../lib/firebase', () => ({
  auth: { currentUser: null }
}));

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn()
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('../../utils/firebaseErrorHandler', () => ({
  handleFirebaseError: vi.fn((error) => error.message || 'An error occurred'),
  logFirebaseError: vi.fn()
}));

describe('AuthContext - Complete Authentication Flow', () => {
  let signInWithEmailAndPassword;
  let signOut;
  let onAuthStateChanged;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Import mocked modules
    const authModule = await import('firebase/auth');

    signInWithEmailAndPassword = authModule.signInWithEmailAndPassword;
    signOut = authModule.signOut;
    onAuthStateChanged = authModule.onAuthStateChanged;

    // Default mock implementation for onAuthStateChanged
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null); // No user initially
      return vi.fn(); // Return unsubscribe function
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Context Hook Validation', () => {
    it('should throw an error when useAuth is used outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
    });
  });

  describe('Authentication State Management', () => {
    it('should initialize with unauthenticated state', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
    });

    it('should set authenticated state when Firebase user exists', async () => {
      const mockUser = { email: 'admin@nrq.no', uid: 'test-uid' };

      onAuthStateChanged.mockImplementation((auth, callback) => {
        callback(mockUser);
        return vi.fn();
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });
  });

  describe('Login Flow - Successful Authentication', () => {
    it('should successfully login user with email and password', async () => {
      signInWithEmailAndPassword.mockResolvedValue({ user: { email: 'admin@nrq.no' } });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('admin@nrq.no', 'password123');
      });

      expect(loginResult).toBe(true);
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'admin@nrq.no',
        'password123'
      );
      expect(toast.success).toHaveBeenCalledWith('Login successful!');
    });
  });

  describe('Login Flow - Failed Authentication', () => {
    it('should reject login with invalid credentials', async () => {
      signInWithEmailAndPassword.mockRejectedValue({
        code: 'auth/invalid-credential',
        message: 'Invalid credentials'
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('invalid@example.com', 'wrong');
      });

      expect(loginResult).toBe(false);
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials');
    });

    it('should handle Firebase authentication errors', async () => {
      signInWithEmailAndPassword.mockRejectedValue({
        code: 'auth/too-many-requests',
        message: 'Too many requests'
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('admin@nrq.no', 'password123');
      });

      expect(loginResult).toBe(false);
      expect(toast.error).toHaveBeenCalledWith('Too many requests');
    });
  });

  describe('Logout Flow', () => {
    it('should successfully logout user', async () => {
      const mockUser = { email: 'admin@nrq.no', uid: 'test-uid' };

      onAuthStateChanged.mockImplementation((auth, callback) => {
        callback(mockUser);
        return vi.fn();
      });

      signOut.mockResolvedValue();

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(signOut).toHaveBeenCalled();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
      expect(toast.success).toHaveBeenCalledWith('Logged out successfully');
    });

    it('should handle logout errors', async () => {
      const mockUser = { email: 'admin@nrq.no', uid: 'test-uid' };

      onAuthStateChanged.mockImplementation((auth, callback) => {
        callback(mockUser);
        return vi.fn();
      });

      signOut.mockRejectedValue({ code: 'auth/network-request-failed', message: 'Network error' });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(signOut).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Network error');
    });
  });

  describe('Session Persistence', () => {
    it('should maintain session across page refreshes', async () => {
      const mockUser = { email: 'admin@nrq.no', uid: 'test-uid' };

      onAuthStateChanged.mockImplementation((auth, callback) => {
        // Simulate Firebase restoring session
        setTimeout(() => callback(mockUser), 100);
        return vi.fn();
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      // Initially loading
      expect(result.current.loading).toBe(true);

      // Wait for session to be restored
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it('should cleanup auth listener on unmount', async () => {
      const unsubscribe = vi.fn();
      onAuthStateChanged.mockReturnValue(unsubscribe);

      const { unmount } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      unmount();

      expect(unsubscribe).toHaveBeenCalled();
    });
  });
});
