import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, logoutUser, checkAuthStatus } from '../slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, loading, error, isAuthenticated } = useSelector((state) => state.auth);


  const login = useCallback(async (credentials) => {
    try {
      const resultAction = await dispatch(loginUser(credentials));
      if (loginUser.rejected.match(resultAction)) {
        throw new Error(resultAction.payload);
      }
      return resultAction.payload;
    } catch (err) {
      console.error('Login Error:', err.message);
      throw new Error(err.message || 'Login failed. Please try again.');
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    try {
      await dispatch(logoutUser());
    } catch (err) {
      console.error('Logout failed:', err.message);
    }
  }, [dispatch]);

  const checkAuth = useCallback(async () => {
    try {
      await dispatch(checkAuthStatus());
    } catch (err) {
      console.error('Auth check failed:', err.message);
    }
  }, [dispatch]);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    checkAuth
  };
};
