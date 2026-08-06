import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Loading } from '../components/common/Loading';

export const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <Loading />;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};