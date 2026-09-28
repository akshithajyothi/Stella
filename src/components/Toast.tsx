import { useToast } from '../context/ToastContext';

const Toast = () => {
  const { message } = useToast();
  if (!message) return null;

  return (
    <div className="toast-notification" role="status" aria-live="polite">
      <i className="fa-solid fa-circle-check"></i> {message}
    </div>
  );
};

export default Toast;
