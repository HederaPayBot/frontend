import React, { useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeCardProps {
  url: string;
  title: string;
  description?: string;
}

export function QRCodeCard({ url, title, description }: QRCodeCardProps) {
  const fullUrl = useMemo(() => {
    // If URL doesn't start with http, assume it's a relative path and construct full URL
    if (!url.startsWith('http')) {
      return `${typeof window !== 'undefined' ? window.location.origin : ''}${url}`;
    }
    return url;
  }, [url]);

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="bg-white p-3 rounded-lg">
          <QRCodeSVG value={fullUrl} size={150} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{title}</h3>
          {description && <p className="text-muted-foreground">{description}</p>}
          <div className="pt-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
            >
              Open URL
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 