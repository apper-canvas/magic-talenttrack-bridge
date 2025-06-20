import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import SearchBar from '@/components/molecules/SearchBar';
import FilterPanel from '@/components/molecules/FilterPanel';
import CandidateCard from '@/components/molecules/CandidateCard';
import CandidateDetail from '@/components/organisms/CandidateDetail';
import SkeletonLoader from '@/components/organisms/SkeletonLoader';
import ErrorState from '@/components/organisms/ErrorState';
import EmptyState from '@/components/organisms/EmptyState';
import candidateService from '@/services/api/candidateService';
import positionService from '@/services/api/positionService';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const navigate = useNavigate();

  const stages = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'];

  useEffect(() => {
    loadCandidates();
    loadPositions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [candidates, searchQuery]);

  const loadCandidates = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await candidateService.getAll();
      setCandidates(result);
    } catch (err) {
      setError(err.message || 'Failed to load candidates');
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const loadPositions = async () => {
    try {
      const result = await positionService.getAll();
      setPositions(result);
    } catch (err) {
      console.error('Failed to load positions:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...candidates];

    if (searchQuery) {
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (candidate.skills && candidate.skills.some(skill =>
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      );
    }

    setFilteredCandidates(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFiltersChange = (filters) => {
    let filtered = [...candidates];

    if (searchQuery) {
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (candidate.skills && candidate.skills.some(skill =>
          skill.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      );
    }

    if (filters.positions && filters.positions.length > 0) {
      filtered = filtered.filter(candidate =>
        filters.positions.includes(candidate.position)
      );
    }

    if (filters.stages && filters.stages.length > 0) {
      filtered = filtered.filter(candidate =>
        filters.stages.includes(candidate.stage)
      );
    }

    setFilteredCandidates(filtered);
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

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-24 animate-pulse" />
        </div>
        <div className="flex gap-4">
          <div className="h-10 bg-gray-200 rounded flex-1 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-24 animate-pulse" />
        </div>
        <SkeletonLoader count={6} type="card" />
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

  const uniquePositions = [...new Set(candidates.map(c => c.position))];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Candidates</h1>
          <p className="text-gray-600">
            {filteredCandidates.length} of {candidates.length} candidates
          </p>
        </div>
        <Button
          icon="Plus"
          onClick={() => {
            // Handle add candidate
            toast.info('Add candidate feature coming soon');
          }}
        >
          Add Candidate
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          placeholder="Search by name, email, position, or skills..."
          onSearch={handleSearch}
          className="flex-1"
        />
        <FilterPanel
          positions={uniquePositions}
          stages={stages}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      {/* Candidates Grid */}
      {filteredCandidates.length === 0 ? (
        <EmptyState
          title={searchQuery ? "No candidates found" : "No candidates yet"}
          description={
            searchQuery
              ? "Try adjusting your search terms or filters"
              : "Add your first candidate to get started with recruitment tracking"
          }
          actionLabel="Add Candidate"
          onAction={() => toast.info('Add candidate feature coming soon')}
          icon="Users"
        />
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {filteredCandidates.map((candidate, index) => (
            <motion.div
              key={candidate.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <CandidateCard
                candidate={candidate}
                onUpdate={handleCandidateUpdate}
                onSelect={handleCandidateSelect}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

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

export default Candidates;