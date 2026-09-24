import { useNotification } from '../../../context/NotificationContext';

// Custom, in-app toast stack - deliberately not the browser's native
// Notification API or a bare window.alert(). Reads the same
// NotificationContext every page already calls success()/error()/
// warning()/info() on; this is the one place that actually renders it.
const TYPE_CLASSES: Record<string, string> = {
  success: 'bg-success-light text-success border-success',
  error: 'bg-error-light text-error border-error',
  warning: 'bg-warning-light text-warning border-warning',
  info: 'bg-primary-50 text-primary-700 border-primary-200',
};

const NotificationToast = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {notifications.map((n: any) => (
        <div
          key={n.id}
          role="alert"
          className={`flex items-start justify-between gap-3 rounded-md border px-3 py-2 text-xs shadow-sm ${TYPE_CLASSES[n.type] || TYPE_CLASSES.info}`}
        >
          <span className="flex-1">{n.message}</span>
          <button
            onClick={() => removeNotification(n.id)}
            className="shrink-0 opacity-60 hover:opacity-100"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
