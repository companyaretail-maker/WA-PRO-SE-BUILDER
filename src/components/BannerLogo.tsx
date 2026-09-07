import React from 'react';
// Move download.jpg into a src/assets folder so the bundler processes it
import waProSeLogo from '../assets/images/regenerated_image_1788617328269.png'; 

interface BannerLogoProps {
  className?: string;
  opacity?: number;
}

export const BannerLogo: React.FC<BannerLogoProps> = ({ className = '', opacity = 0.9 }) => {
  return (
    <div className={`w-full relative overflow-hidden rounded-sm border border-accent/20 bg-black flex justify-center ${className}`}>
      <img
        src={waProSeLogo}
        alt="WA Pro Se Builder Banner"
        className="w-full h-auto max-h-[220px] object-contain transition-opacity duration-500 hover:opacity-100"
        style={{ opacity }}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (!target.src.endsWith('/download.png')) {
            target.src = '/download.png';
          }
        }}
      />
      {/* Terminal Overlay effect */}
      <div className="absolute inset-0 bg-accent/5 pointer-events-none mix-blend-overlay"></div>
    </div>
  );
};
