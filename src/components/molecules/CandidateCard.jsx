import { motion } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Avatar from '@/components/atoms/Avatar';
import Badge from '@/components/atoms/Badge';
import candidateService from '@/services/api/candidateService';

const CandidateCard = ({ 
  candidate, 
  showActions = true, 
  onUpdate, 
  onSelect,
  className = '' 
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const getStageColor = (stage) => {
    const colors = {
      'Applied': 'default',
      'Screening': 'info',
      'Interview': 'warning',
      'Offer': 'accent',
      'Hired': 'success'
    };
    return colors[stage] || 'default';
  };

  const handleStageUpdate = async (newStage) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      const updated = await candidateService.updateStage(candidate.Id, newStage);
      onUpdate?.(updated);
      toast.success(`Moved ${candidate.name} to ${newStage}`);
    } catch (error) {
      toast.error('Failed to update candidate stage');
    } finally {
      setIsUpdating(false);
    }
  };

  const stages = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'];
  const currentStageIndex = stages.indexOf(candidate.stage);
  const nextStage = currentStageIndex < stages.length - 1 ? stages[currentStageIndex + 1] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
      className={`bg-white rounded-lg border border-gray-200 p-4 cursor-pointer transition-all duration-150 ${className}`}
      onClick={() => onSelect?.(candidate)}
    >
      {/* Stage Indicator Bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${
        candidate.stage === 'Applied' ? 'bg-gray-400' :
        candidate.stage === 'Screening' ? 'bg-info' :
        candidate.stage === 'Interview' ? 'bg-warning' :
        candidate.stage === 'Offer' ? 'bg-accent' :
        'bg-success'
      }`} />

      <div className="flex items-start gap-3">
        <Avatar 
          name={candidate.name} 
          size="md"
          className="flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {candidate.name}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                {candidate.position}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {candidate.email}
              </p>
            </div>
            
            <Badge 
              variant={getStageColor(candidate.stage)}
              size="xs"
              className="flex-shrink-0"
            >
              {candidate.stage}
            </Badge>
          </div>

          {/* Skills */}
          {candidate.skills && candidate.skills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {candidate.skills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                >
                  {skill}
                </span>
              ))}
              {candidate.skills.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{candidate.skills.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="mt-3 flex items-center gap-2">
              {nextStage && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStageUpdate(nextStage);
                  }}
                  disabled={isUpdating}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary-600 disabled:opacity-50"
                >
                  {isUpdating ? (
                    <ApperIcon name="Loader2" className="w-3 h-3 animate-spin" />
                  ) : (
                    <ApperIcon name="ArrowRight" className="w-3 h-3" />
                  )}
                  Move to {nextStage}
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle add note action
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                <ApperIcon name="MessageSquare" className="w-3 h-3" />
                Note
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CandidateCard;