import { useState } from 'react';
import ApperIcon from '@/components/ApperIcon';

const Avatar = ({ 
  src, 
  alt, 
  name, 
  size = 'md',
  className = '',
  ...props 
}) => {
  const [imageError, setImageError] = useState(false);

  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const baseClasses = `inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-600 overflow-hidden ${sizes[size]} ${className}`;

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={alt || name}
        className={baseClasses}
        onError={() => setImageError(true)}
        {...props}
      />
    );
  }

  if (name) {
    return (
      <div className={`${baseClasses} font-medium`} {...props}>
        {getInitials(name)}
      </div>
    );
  }

  return (
    <div className={baseClasses} {...props}>
      <ApperIcon name="User" className="w-1/2 h-1/2" />
    </div>
  );
};

export default Avatar;