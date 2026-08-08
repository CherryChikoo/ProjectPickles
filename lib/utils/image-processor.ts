export const processImage = (file: File, maxSize = 800): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      reject(new Error('Invalid image format. Please use JPEG, PNG, or WebP.'));
      return;
    }

    // Limit original file size to ~5MB before processing
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('Image is too large. Please select an image under 5MB.'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to create canvas context'));
          return;
        }

        // Draw and compress
        // Fill white background in case of transparent PNG being converted to JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Export to highly compressed WebP or JPEG to save Firestore space
        const dataUrl = canvas.toDataURL('image/webp', 0.8);
        
        // Final sanity check for Base64 length (Firestore limit is 1MB, let's keep image under 500KB)
        // Base64 size = (characters * 3) / 4
        const sizeInBytes = (dataUrl.length * 3) / 4;
        if (sizeInBytes > 700 * 1024) {
          // If still too big, try harder compression
          const smallerDataUrl = canvas.toDataURL('image/webp', 0.5);
          resolve(smallerDataUrl);
        } else {
          resolve(dataUrl);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};
