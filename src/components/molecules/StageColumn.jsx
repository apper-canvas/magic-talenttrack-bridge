import { motion } from 'framer-motion';
import { useState } from 'react';
import ApperIcon from '@/components/ApperIcon';
import CandidateCard from './CandidateCard';

const StageColumn = ({ 
  stage, 
  candidates = [], 
  onCandidateUpdate,
  onCandidateSelect,
  className = '' 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const getStageColor = (stage) => {
    const colors = {
      'Applied': 'bg-gray-50 border-gray-200',
      'Screening': 'bg-blue-50 border-blue-200',
      'Interview': 'bg-yellow-50 border-yellow-200',
      'Offer': 'bg-purple-50 border-purple-200',
      'Hired': 'bg-green-50 border-green-200'
    };
    return colors[stage] || 'bg-gray-50 border-gray-200';
  };

  const getStageIcon = (stage) => {
    const icons = {
      'Applied': 'FileText',
      'Screening': 'Phone',
      'Interview': 'Users',
      'Offer': 'HandHeart',
      'Hired': 'CheckCircle'
    };
    return icons[stage] || 'Circle';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    // Handle candidate drop logic here
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex flex-col h-full min-w-80 ${className}`}
    >
      {/* Column Header */}
      <div className={`p-4 rounded-t-lg border-2 ${getStageColor(stage)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ApperIcon name={getStageIcon(stage)} className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">{stage}</h3>
          </div>
          <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
            {candidates.length}
          </span>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-1 p-4 border-l-2 border-r-2 border-b-2 rounded-b-lg transition-all duration-200 ${
          getStageColor(stage)
        } ${isDragOver ? 'border-dashed border-primary-400 bg-primary-50' : ''}`}
      >
        {/* Candidates List */}
        <div className="space-y-3 h-full overflow-y-auto">
          {candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              <ApperIcon name="Users" className="w-8 h-8 mb-2" />
              <p className="text-sm">No candidates</p>
            </div>
          ) : (
            candidates.map((candidate) => (
              <motion.div
                key={candidate.Id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <CandidateCard
                  candidate={candidate}
                  showActions={false}
                  onUpdate={onCandidateUpdate}
                  onSelect={onCandidateSelect}
                  className="cursor-move"
                  draggable
                />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StageColumn;