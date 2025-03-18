import { useSelector, useDispatch } from 'react-redux';
import { login, signup, forgotPassword, logout } from '../slices/authSlice';

export const useAuth = () => {
  const auth = useSelector(state => state.auth);
  const dispatch = useDispatch();

  return {
    ...auth,
    login: (credentials) => dispatch(login(credentials)),
    signup: (userData) => dispatch(signup(userData)),
    forgotPassword: (email) => dispatch(forgotPassword(email)),
    logout: () => dispatch(logout()),
  };
};