import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, isToday, isTomorrow } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import candidateService from '@/services/api/candidateService';
import positionService from '@/services/api/positionService';
import SkeletonLoader from '@/components/organisms/SkeletonLoader';
import ErrorState from '@/components/organisms/ErrorState';
import EmptyState from '@/components/organisms/EmptyState';

const Dashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [candidatesData, positionsData] = await Promise.all([
        candidateService.getAll(),
        positionService.getAll()
      ]);
      setCandidates(candidatesData);
      setPositions(positionsData);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getMetrics = () => {
    const total = candidates.length;
    const byStage = candidates.reduce((acc, candidate) => {
      acc[candidate.stage] = (acc[candidate.stage] || 0) + 1;
      return acc;
    }, {});

    const activePositions = positions.filter(p => p.status === 'Active').length;
    const recentCandidates = candidates.filter(c => 
      isToday(new Date(c.createdAt)) || isTomorrow(new Date(c.createdAt))
    );

    return {
      total,
      byStage,
      activePositions,
      recentCandidates: recentCandidates.length
    };
  };

  const getUpcomingTasks = () => {
    // Simulate upcoming tasks based on candidate stages
    const tasks = [];
    
    candidates.forEach(candidate => {
      if (candidate.stage === 'Screening') {
        tasks.push({
          id: `screening-${candidate.Id}`,
          type: 'screening',
          title: `Screen candidate: ${candidate.name}`,
          candidate: candidate.name,
          position: candidate.position,
          priority: 'high',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
        });
      }
      
      if (candidate.stage === 'Interview') {
        tasks.push({
          id: `interview-${candidate.Id}`,
          type: 'interview',
          title: `Interview: ${candidate.name}`,
          candidate: candidate.name,
          position: candidate.position,
          priority: 'medium',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // Day after tomorrow
        });
      }
    });

    return tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 5);
  };

  const getRecentActivity = () => {
    return candidates
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 8)
      .map(candidate => ({
        id: candidate.Id,
        type: 'candidate_updated',
        title: `${candidate.name} moved to ${candidate.stage}`,
        candidate: candidate.name,
        position: candidate.position,
        stage: candidate.stage,
        timestamp: candidate.updatedAt
      }));
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonLoader count={4} type="metric" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonLoader count={3} type="card" />
          <SkeletonLoader count={3} type="card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState 
          message={error}
          onRetry={loadDashboardData}
        />
      </div>
    );
  }

  const metrics = getMetrics();
  const upcomingTasks = getUpcomingTasks();
  const recentActivity = getRecentActivity();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your candidates.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="Users" className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Candidates</p>
              <p className="text-2xl font-semibold text-gray-900">{metrics.total}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="Briefcase" className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Positions</p>
              <p className="text-2xl font-semibold text-gray-900">{metrics.activePositions}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="Clock" className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">In Interview</p>
              <p className="text-2xl font-semibold text-gray-900">{metrics.byStage.Interview || 0}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="CheckCircle" className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Hired</p>
              <p className="text-2xl font-semibold text-gray-900">{metrics.byStage.Hired || 0}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <ApperIcon name="CheckSquare" className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
            </div>
          </div>
          
          <div className="p-6">
            {upcomingTasks.length === 0 ? (
              <EmptyState
                title="No upcoming tasks"
                description="All caught up! Check back later for new tasks."
                icon="CheckCircle"
              />
            ) : (
              <div className="space-y-4">
                {upcomingTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      task.priority === 'high' ? 'bg-red-500' :
                      task.priority === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{task.title}</h4>
                      <p className="text-sm text-gray-600 truncate">{task.position}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Due {format(task.dueDate, 'MMM d')}
                      </p>
                    </div>
                    <ApperIcon 
                      name={task.type === 'screening' ? 'Phone' : 'Users'} 
                      className="w-4 h-4 text-gray-400 flex-shrink-0" 
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <ApperIcon name="Activity" className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
          </div>
          
          <div className="p-6">
            {recentActivity.length === 0 ? (
              <EmptyState
                title="No recent activity"
                description="Activity will appear here as you manage candidates."
                icon="Activity"
              />
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <ApperIcon name="ArrowRight" className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{activity.title}</p>
                      <p className="text-xs text-gray-500 truncate">{activity.position}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;