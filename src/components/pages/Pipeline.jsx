import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import StageColumn from '@/components/molecules/StageColumn';
import CandidateDetail from '@/components/organisms/CandidateDetail';
import SkeletonLoader from '@/components/organisms/SkeletonLoader';
import ErrorState from '@/components/organisms/ErrorState';
import EmptyState from '@/components/organisms/EmptyState';
import candidateService from '@/services/api/candidateService';

const Pipeline = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const stages = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'];

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await candidateService.getAll();
      setCandidates(result);
    } catch (err) {
      setError(err.message || 'Failed to load pipeline data');
      toast.error('Failed to load pipeline data');
    } finally {
      setLoading(false);
    }
  };

  const getCandidatesByStage = (stage) => {
    return candidates.filter(candidate => candidate.stage === stage);
  };

  const handleCandidateUpdate = (updatedCandidate) => {
    setCandidates(prev =>
      prev.map(candidate =>
        candidate.Id === updatedCandidate.Id ? updatedCandidate : candidate
      )
    );
    setSelectedCandidate(updatedCandidate);
  };

  const handleCandidateSelect = (candidate) => {
    setSelectedCandidate(candidate);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedCandidate(null);
  };

  const getTotalCandidates = () => {
    return candidates.length;
  };

  const getStageMetrics = () => {
    return stages.map(stage => ({
      stage,
      count: getCandidatesByStage(stage).length,
      percentage: candidates.length > 0 
        ? Math.round((getCandidatesByStage(stage).length / candidates.length) * 100)
        : 0
    }));
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {stages.map((_, index) => (
            <div key={index} className="min-w-80 space-y-4">
              <div className="h-16 bg-gray-200 rounded animate-pulse" />
              <SkeletonLoader count={2} type="card" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState 
          message={error}
          onRetry={loadCandidates}
        />
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Pipeline</h1>
          <p className="text-gray-600">Track candidates through your hiring process</p>
        </div>
        <EmptyState
          title="No candidates in pipeline"
          description="Add candidates to start tracking them through your hiring stages"
          actionLabel="Add Candidate"
          onAction={() => toast.info('Add candidate feature coming soon')}
          icon="Workflow"
        />
      </div>
    );
  }

  const stageMetrics = getStageMetrics();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Pipeline</h1>
          <p className="text-gray-600">
            {getTotalCandidates()} candidates across {stages.length} stages
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-sm">
          {stageMetrics.slice(0, 3).map((metric, index) => (
            <motion.div
              key={metric.stage}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-gray-200"
            >
              <div className={`w-2 h-2 rounded-full ${
                metric.stage === 'Applied' ? 'bg-gray-400' :
                metric.stage === 'Screening' ? 'bg-info' :
                'bg-warning'
              }`} />
              <span className="text-gray-600">{metric.stage}:</span>
              <span className="font-semibold text-gray-900">{metric.count}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pipeline Board */}
      <div className="overflow-x-auto">
        <div className="flex gap-6 pb-4" style={{ minWidth: 'max-content' }}>
          {stages.map((stage, index) => (
            <motion.div
              key={stage}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <StageColumn
                stage={stage}
                candidates={getCandidatesByStage(stage)}
                onCandidateUpdate={handleCandidateUpdate}
                onCandidateSelect={handleCandidateSelect}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stage Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg border border-gray-200 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <ApperIcon name="BarChart3" className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Pipeline Summary</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stageMetrics.map((metric, index) => (
            <motion.div
              key={metric.stage}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.05 }}
              className="text-center p-4 bg-gray-50 rounded-lg"
            >
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {metric.count}
              </div>
              <div className="text-sm text-gray-600 mb-2">{metric.stage}</div>
              <div className="text-xs text-gray-500">
                {metric.percentage}% of total
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Candidate Detail Modal */}
      <CandidateDetail
        candidate={selectedCandidate}
        isOpen={showDetail}
        onClose={handleCloseDetail}
        onUpdate={handleCandidateUpdate}
      />
    </div>
  );
};

export default Pipeline;