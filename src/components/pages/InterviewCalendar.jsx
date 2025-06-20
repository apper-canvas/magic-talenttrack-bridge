import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Badge from '@/components/atoms/Badge';
import Avatar from '@/components/atoms/Avatar';
import interviewService from '@/services/api/interviewService';

const localizer = momentLocalizer(moment);

const InterviewCalendar = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewType, setViewType] = useState('week');

  // Interview detail modal state
  const [editingInterview, setEditingInterview] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [participantEmail, setParticipantEmail] = useState('');
  const [isAddingParticipant, setIsAddingParticipant] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Interviews' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'rescheduled', label: 'Rescheduled' }
  ];

  const loadInterviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await interviewService.getAll();
      setInterviews(data);
    } catch (err) {
      setError('Failed to load interviews');
      toast.error('Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterviews();
  }, []);

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = searchQuery === '' || 
      interview.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.candidateName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || interview.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const calendarEvents = filteredInterviews.map(interview => ({
    id: interview.Id,
    title: interview.title,
    start: new Date(interview.startTime),
    end: new Date(interview.endTime),
    resource: interview,
    status: interview.status
  }));

  const getEventStyle = (event) => {
    const statusColors = {
      scheduled: '#3b82f6',
      completed: '#10b981',
      cancelled: '#ef4444',
      rescheduled: '#f59e0b'
    };
    
    return {
      style: {
        backgroundColor: statusColors[event.resource.status] || '#6b7280',
        color: 'white',
        border: 'none',
        borderRadius: '4px'
      }
    };
  };

  const handleEventSelect = (event) => {
    setSelectedInterview(event.resource);
    setEditingInterview(event.resource);
    setIsDetailModalOpen(true);
  };

  const handleSlotSelect = (slotInfo) => {
    if (isScheduling) return;
    
    const newInterview = {
      title: 'New Interview',
      candidateName: 'Select Candidate',
      startTime: slotInfo.start,
      endTime: slotInfo.end,
      status: 'scheduled',
      notes: [],
      participants: []
    };
    
    setSelectedInterview(newInterview);
    setEditingInterview(newInterview);
    setIsDetailModalOpen(true);
  };

  const handleDeleteInterview = async (interviewId) => {
    if (!confirm('Are you sure you want to delete this interview?')) return;
    
    try {
      await interviewService.delete(interviewId);
      await loadInterviews();
      setIsDetailModalOpen(false);
      toast.success('Interview deleted successfully');
    } catch (error) {
      toast.error('Failed to delete interview');
    }
  };

  const handleRescheduleInterview = async () => {
    if (!rescheduleDate || !rescheduleTime || !editingInterview) return;
    
    setIsRescheduling(true);
    try {
      const startDateTime = new Date(`${rescheduleDate}T${rescheduleTime}`);
      const endDateTime = new Date(startDateTime.getTime() + (60 * 60 * 1000)); // 1 hour later
      
      const updatedData = {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        status: 'rescheduled'
      };
      
      await interviewService.update(editingInterview.Id, updatedData);
      await loadInterviews();
      setRescheduleDate('');
      setRescheduleTime('');
      toast.success('Interview rescheduled successfully');
    } catch (error) {
      toast.error('Failed to reschedule interview');
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim() || !editingInterview) return;
    
    setIsAddingNote(true);
    try {
      const noteData = {
        content: noteContent,
        timestamp: new Date().toISOString()
      };
      
      await interviewService.addNote(editingInterview.Id, noteData);
      const updated = await interviewService.getById(editingInterview.Id);
      setEditingInterview(updated);
      setNoteContent('');
      await loadInterviews();
      toast.success('Note added successfully');
    } catch (error) {
      toast.error('Failed to add note');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleAddParticipant = async () => {
    if (!participantEmail.trim() || !editingInterview) return;
    
    setIsAddingParticipant(true);
    try {
      const participantData = {
        email: participantEmail,
        name: participantEmail.split('@')[0],
        addedAt: new Date().toISOString()
      };
      
      await interviewService.addParticipant(editingInterview.Id, participantData);
      const updated = await interviewService.getById(editingInterview.Id);
      setEditingInterview(updated);
      setParticipantEmail('');
      await loadInterviews();
      toast.success('Participant added successfully');
    } catch (error) {
      toast.error('Failed to add participant');
    } finally {
      setIsAddingParticipant(false);
    }
  };

  const handleRemoveParticipant = async (participantId) => {
    if (!confirm('Remove this participant from the interview?')) return;
    
    try {
      await interviewService.removeParticipant(editingInterview.Id, participantId);
      const updated = await interviewService.getById(editingInterview.Id);
      setEditingInterview(updated);
      await loadInterviews();
      toast.success('Participant removed successfully');
    } catch (error) {
      toast.error('Failed to remove participant');
    }
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedInterview(null);
    setEditingInterview(null);
    setNoteContent('');
    setParticipantEmail('');
    setRescheduleDate('');
    setRescheduleTime('');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="flex items-center gap-2 text-gray-600">
            <ApperIcon name="Loader2" className="w-6 h-6 animate-spin" />
            Loading interviews...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <ApperIcon name="AlertCircle" className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadInterviews}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview Calendar</h1>
          <p className="text-gray-600">Manage and schedule all interviews</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="info">
            {filteredInterviews.length} Interview{filteredInterviews.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search interviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {['month', 'week', 'day'].map(view => (
                <button
                  key={view}
                  onClick={() => setViewType(view)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewType === view
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={handleEventSelect}
            onSelectSlot={handleSlotSelect}
            selectable={true}
            views={['month', 'week', 'day']}
            view={viewType}
            onView={setViewType}
            step={30}
            timeslots={2}
            eventPropGetter={getEventStyle}
            components={{
              event: ({ event }) => (
                <div className="p-1">
                  <div className="flex items-center gap-1">
                    <ApperIcon 
                      name="Calendar" 
                      className="w-3 h-3" 
                    />
                    <span className="text-xs font-medium truncate">
                      {event.title}
                    </span>
                  </div>
                  <div className="text-xs opacity-75 truncate">
                    {event.resource.candidateName}
                  </div>
                </div>
              )
            }}
          />
        </div>
      </div>

      {/* Interview Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && editingInterview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={closeDetailModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {editingInterview.title}
                    </h2>
                    <p className="text-gray-600">{editingInterview.candidateName}</p>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <ApperIcon name="Calendar" className="w-4 h-4" />
                        {format(new Date(editingInterview.startTime), 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <ApperIcon name="Clock" className="w-4 h-4" />
                        {format(new Date(editingInterview.startTime), 'h:mm a')}
                      </span>
                      <Badge variant={
                        editingInterview.status === 'scheduled' ? 'info' :
                        editingInterview.status === 'completed' ? 'success' :
                        editingInterview.status === 'cancelled' ? 'danger' : 'warning'
                      }>
                        {editingInterview.status}
                      </Badge>
                    </div>
                  </div>
                  <button
                    onClick={closeDetailModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ApperIcon name="X" className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-96 space-y-6">
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteInterview(editingInterview.Id)}
                  >
                    <ApperIcon name="Trash2" className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>

                {/* Reschedule Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Reschedule Interview</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      placeholder="Select date"
                    />
                    <Input
                      type="time"
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                      placeholder="Select time"
                    />
                  </div>
                  <Button
                    className="mt-3"
                    size="sm"
                    onClick={handleRescheduleInterview}
                    disabled={!rescheduleDate || !rescheduleTime || isRescheduling}
                    loading={isRescheduling}
                  >
                    Reschedule
                  </Button>
                </div>

                {/* Add Note Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Add Note</h3>
                  <div className="space-y-3">
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Add a note about this interview..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                    <Button
                      size="sm"
                      onClick={handleAddNote}
                      disabled={!noteContent.trim() || isAddingNote}
                      loading={isAddingNote}
                    >
                      Add Note
                    </Button>
                  </div>
                </div>

                {/* Notes List */}
                {editingInterview.notes && editingInterview.notes.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Notes ({editingInterview.notes.length})
                    </h3>
                    <div className="space-y-2">
                      {editingInterview.notes.map((note) => (
                        <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-3">
                          <p className="text-gray-900">{note.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(note.timestamp), 'MMM d, yyyy at h:mm a')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Participant Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Add Participant</h3>
                  <div className="flex gap-3">
                    <Input
                      type="email"
                      value={participantEmail}
                      onChange={(e) => setParticipantEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={handleAddParticipant}
                      disabled={!participantEmail.trim() || isAddingParticipant}
                      loading={isAddingParticipant}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {/* Participants List */}
                {editingInterview.participants && editingInterview.participants.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Participants ({editingInterview.participants.length})
                    </h3>
                    <div className="space-y-2">
                      {editingInterview.participants.map((participant) => (
                        <div key={participant.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={participant.name} size="sm" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{participant.name}</p>
                              <p className="text-xs text-gray-500">{participant.email}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveParticipant(participant.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <ApperIcon name="X" className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InterviewCalendar;