import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const FilterPanel = ({ 
  positions = [], 
  stages = [], 
  onFiltersChange,
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPositions, setSelectedPositions] = useState([]);
  const [selectedStages, setSelectedStages] = useState([]);

  const handlePositionChange = (position) => {
    const updated = selectedPositions.includes(position)
      ? selectedPositions.filter(p => p !== position)
      : [...selectedPositions, position];
    
    setSelectedPositions(updated);
    onFiltersChange?.({
      positions: updated,
      stages: selectedStages
    });
  };

  const handleStageChange = (stage) => {
    const updated = selectedStages.includes(stage)
      ? selectedStages.filter(s => s !== stage)
      : [...selectedStages, stage];
    
    setSelectedStages(updated);
    onFiltersChange?.({
      positions: selectedPositions,
      stages: updated
    });
  };

  const clearFilters = () => {
    setSelectedPositions([]);
    setSelectedStages([]);
    onFiltersChange?.({
      positions: [],
      stages: []
    });
  };

  const hasActiveFilters = selectedPositions.length > 0 || selectedStages.length > 0;

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="secondary"
        icon="Filter"
        onClick={() => setIsOpen(!isOpen)}
        className={`${hasActiveFilters ? 'ring-2 ring-primary-200' : ''}`}
      >
        Filters
        {hasActiveFilters && (
          <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-white rounded-full">
            {selectedPositions.length + selectedStages.length}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-30"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ApperIcon name="X" className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Positions Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Positions</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {positions.map((position) => (
                    <label key={position} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedPositions.includes(position)}
                        onChange={() => handlePositionChange(position)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-sm text-gray-700">{position}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Stages Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Stages</h4>
                <div className="space-y-2">
                  {stages.map((stage) => (
                    <label key={stage} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedStages.includes(stage)}
                        onChange={() => handleStageChange(stage)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-sm text-gray-700">{stage}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
              >
                Clear All
              </Button>
              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterPanel;