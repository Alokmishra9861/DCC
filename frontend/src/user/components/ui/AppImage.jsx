import React, { useState, useEffect } from 'react';

const STOREFRONT_PLACEHOLDER = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'/%3E%3Cpolyline points='9 22 9 12 15 12 15 22'/%3E%3C/svg%3E";

const AppImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  onClick,
  fallbackSrc = STOREFRONT_PLACEHOLDER,
  ...props
}) => {
  const [prevSrc, setPrevSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setHasError(false);
    setIsLoading(true);
  }

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  const isInvalidSrc = !src || src === 'null' || src === 'undefined';
  const currentSrc = hasError || isInvalidSrc ? fallbackSrc : src;
  const commonClassName = `${className} ${isLoading ? 'bg-gray-200' : ''} ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`;

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={commonClassName}
      onError={handleError}
      onLoad={handleLoad}
      onClick={onClick}
      style={style}
      {...props}
    />
  );
};

export default AppImage;