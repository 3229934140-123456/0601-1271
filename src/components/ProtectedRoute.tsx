import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '@/stores/useStore';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useStore();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
