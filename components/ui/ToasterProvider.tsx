'use client';

import { Toaster } from 'react-hot-toast';

export function ToasterProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: '#ef4444',
          color: '#ffffff',
          fontWeight: 'bold',
          borderRadius: '0px',
          border: '2px solid black',
          padding: '16px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontSize: '14px',
        },
        iconTheme: {
          primary: '#ffffff',
          secondary: '#ef4444',
        },
      }}
    />
  );
}
