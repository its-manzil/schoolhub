'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faTimesCircle, 
  faExclamationTriangle,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import '../styles/page.css';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning';
  title?: string;
}

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const iconMap = {
  success: faCheckCircle,
  error: faTimesCircle,
  warning: faExclamationTriangle
};

const titleMap = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning'
};

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="toast-container">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={`toast ${toast.type}`}
          >
            <FontAwesomeIcon 
              icon={iconMap[toast.type]} 
              className="toast-icon"
            />
            <div className="toast-content">
              <div className="toast-title">{toast.title || titleMap[toast.type]}</div>
              <div className="toast-message">{toast.message}</div>
            </div>
            <button 
              className="toast-close"
              onClick={() => onDismiss(toast.id)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
