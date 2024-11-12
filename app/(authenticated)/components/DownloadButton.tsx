'use client';

import { Download } from 'lucide-react';

interface DownloadButtonProps {
  url: string | undefined;
  filename: string;
}

export default function DownloadButton({ url, filename }: DownloadButtonProps) {
  const downloadImage = async () => {
    if (!url) return;
    
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Błąd podczas pobierania obrazu:', error);
    }
  };

  return (
    <button
      onClick={downloadImage}
      className="self-end p-2 bg-white/20 rounded-full hover:bg-white/40 transition-colors"
    >
      <Download className="w-5 h-5 text-white" />
    </button>
  );
} 