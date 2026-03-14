import React, { useState } from 'react'

const AppImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  onClick,
  fallbackSrc = '/assets/images/no_image.png',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(true);
    }
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const commonClassName = `${className} ${isLoading ? 'bg-gray-200' : ''} ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`;

  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;
  return (
    <img
      src={imageSrc}
      alt={alt}
      className={commonClassName}
      onError={handleError}
      onLoad={handleLoad}
      onClick={onClick}
      style={style}
      {...props}
    />
  )
}

export default AppImage