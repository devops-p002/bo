import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnClickOutside = true,
  closeOnEsc = true,
  showCloseButton = true,
}: any) => {
  const modalRef = useRef<any>(null);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: any) => {
      if (closeOnEsc && e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent body scroll when modal is open
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = ''; // Restore body scroll when modal is closed
    };
  }, [isOpen, onClose, closeOnEsc]);
  
  // Handle outside click
  const handleOutsideClick = (e: any) => {
    if (closeOnClickOutside && modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full',
  };
  
  // Don't render if not open
  if (!isOpen) return null;
  
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-900 bg-opacity-50 p-4" onClick={handleOutsideClick}>
      <div className={`relative w-full ${sizeClasses[size] || sizeClasses.md} bg-white rounded-lg shadow-xl`} ref={modalRef}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          {showCloseButton && (
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Body */}
        <div className="p-6">{children}</div>
        
        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            {footer}
          </div>
        )}
        
        {/* Default footer with close button if no custom footer provided */}
        {!footer && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal; 