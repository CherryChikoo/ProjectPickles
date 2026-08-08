import React, { useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface DeleteConfirmDialogProps {
  productName: string;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteConfirmDialog({ productName, onCancel, onConfirm }: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white border-4 border-black shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="p-4 border-b-2 border-black flex items-center justify-between bg-red-600 text-white">
          <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-sm">
            <AlertTriangle className="w-5 h-5" />
            Delete Product?
          </div>
          <button 
            onClick={onCancel}
            disabled={isDeleting}
            className="p-1 hover:bg-black/20 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 text-center space-y-6">
          <p className="text-sm font-medium leading-relaxed">
            Are you sure you want to permanently delete:
          </p>
          <p className="font-sans text-2xl font-bold uppercase">
            "{productName}"
          </p>
          <div className="bg-red-50 border border-red-200 p-4">
            <p className="text-xs font-bold text-red-700 uppercase tracking-widest">
              This action cannot be undone.
            </p>
            <p className="text-xs text-red-600 mt-2">
              Note: Historical customer orders containing this item will remain untouched.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex border-t-2 border-black">
          <button 
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 p-4 text-sm font-bold uppercase tracking-widest hover:bg-black/5 transition-colors disabled:opacity-50 border-r-2 border-black"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 p-4 bg-red-600 text-white text-sm font-bold uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Delete Product'}
          </button>
        </div>

      </div>
    </div>
  );
}
