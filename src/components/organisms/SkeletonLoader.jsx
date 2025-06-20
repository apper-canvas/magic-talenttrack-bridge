import { motion } from 'framer-motion';

const SkeletonLoader = ({ count = 3, type = 'card', className = '' }) => {
  const skeletonVariants = {
    card: (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
            <div className="flex gap-2 mt-3">
              <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    ),
    list: (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse" />
          </div>
          <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
        </div>
      </div>
    ),
    metric: (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
        </div>
      </div>
    )
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {[...Array(count)].map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {skeletonVariants[type]}
        </motion.div>
      ))}
    </div>
  );
};

export default SkeletonLoader;