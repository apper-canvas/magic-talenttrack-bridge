import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import ApperIcon from '@/components/ApperIcon';
import Avatar from '@/components/atoms/Avatar';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import candidateService from '@/services/api/candidateService';

const localizer = momentLocalizer(moment);

const CandidateDetail = ({ 
  candidate, 
  isOpen, 
  onClose, 
  onUpdate,
  className = '' 
}) => {
const [activeTab, setActiveTab] = useState('overview');
  const [isUpdating, setIsUpdating] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [scheduledInterviews, setScheduledInterviews] = useState([]);
  const [isScheduling, setIsScheduling] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'User' },
    { id: 'notes', label: 'Notes', icon: 'MessageSquare' },
    { id: 'calendar', label: 'Calendar', icon: 'Calendar' },
    { id: 'history', label: 'History', icon: 'Clock' }
  ];

  const stages = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'];

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
      toast.success(`Updated stage to ${newStage}`);
    } catch (error) {
      toast.error('Failed to update stage');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim() || isAddingNote) return;
    
    setIsAddingNote(true);
    try {
      const updated = await candidateService.addNote(candidate.Id, {
        content: noteContent,
        type: 'general'
      });
      onUpdate?.(updated);
      setNoteContent('');
      toast.success('Note added successfully');
    } catch (error) {
      toast.error('Failed to add note');
    } finally {
      setIsAddingNote(false);
    }
};

  const handleScheduleInterview = async (slotInfo) => {
    if (isScheduling) return;
    
    setIsScheduling(true);
    try {
      const interviewData = {
        title: `Interview with ${candidate.name}`,
        start: slotInfo.start,
        end: slotInfo.end,
        candidateId: candidate.Id,
        type: 'interview'
      };
      
      await candidateService.scheduleInterview(candidate.Id, interviewData);
      await loadCalendarData();
      toast.success('Interview scheduled successfully');
    } catch (error) {
      toast.error('Failed to schedule interview');
    } finally {
      setIsScheduling(false);
    }
  };

  const loadCalendarData = async () => {
    try {
      const [slots, interviews] = await Promise.all([
        candidateService.getAvailableSlots(),
        candidateService.getScheduledInterviews(candidate.Id)
      ]);
      setAvailableSlots(slots);
      setScheduledInterviews(interviews);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
    }
  };

  useEffect(() => {
    if (candidate && activeTab === 'calendar') {
      loadCalendarData();
    }
  }, [candidate, activeTab]);

  if (!candidate) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className={`bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden ${className}`}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <Avatar name={candidate.name} size="lg" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {candidate.name}
                    </h2>
                    <p className="text-gray-600">{candidate.position}</p>
                    <p className="text-sm text-gray-500">{candidate.email}</p>
                    <div className="mt-2">
                      <Badge variant={getStageColor(candidate.stage)}>
                        {candidate.stage}
                      </Badge>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ApperIcon name="X" className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <ApperIcon name={tab.icon} className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-96">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <p className="text-gray-900">{candidate.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <p className="text-gray-900">{candidate.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  {candidate.skills && candidate.skills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resume */}
                  {candidate.resumeUrl && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Resume
                      </h3>
                      <a
                        href={candidate.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
                      >
                        <ApperIcon name="FileText" className="w-4 h-4" />
                        View Resume
                      </a>
                    </div>
                  )}

                  {/* Stage Actions */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Move to Stage
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {stages.map((stage) => (
                        <Button
                          key={stage}
                          variant={candidate.stage === stage ? 'primary' : 'secondary'}
                          size="sm"
                          onClick={() => handleStageUpdate(stage)}
                          disabled={isUpdating || candidate.stage === stage}
                        >
                          {stage}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-4">
                  {/* Add Note */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Add Note
                    </h3>
                    <div className="space-y-3">
                      <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Add a note about this candidate..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      />
                      <Button
                        onClick={handleAddNote}
                        disabled={!noteContent.trim() || isAddingNote}
                        loading={isAddingNote}
                        size="sm"
                      >
                        Add Note
                      </Button>
                    </div>
                  </div>

                  {/* Notes List */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Notes ({candidate.notes?.length || 0})
                    </h3>
                    {candidate.notes && candidate.notes.length > 0 ? (
                      <div className="space-y-3">
                        {candidate.notes.map((note) => (
                          <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <p className="text-gray-900 flex-1">{note.content}</p>
                              <Badge variant="default" size="xs">
                                {note.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              {format(new Date(note.timestamp), 'MMM d, yyyy at h:mm a')}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <ApperIcon name="MessageSquare" className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No notes yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Activity History
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <ApperIcon name="User" className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">
                          Candidate profile created
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(candidate.createdAt), 'MMM d, yyyy at h:mm a')}
                        </p>
                      </div>
                    </div>
                    
                    {candidate.updatedAt !== candidate.createdAt && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <ApperIcon name="Edit" className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">
                            Profile updated
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(candidate.updatedAt), 'MMM d, yyyy at h:mm a')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
)}

              {activeTab === 'calendar' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Schedule Interview
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Click on an available time slot to schedule an interview with {candidate.name}.
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div style={{ height: '400px' }}>
                      <Calendar
                        localizer={localizer}
                        events={[...availableSlots, ...scheduledInterviews]}
                        startAccessor="start"
                        endAccessor="end"
                        onSelectSlot={handleScheduleInterview}
                        selectable={!isScheduling}
                        views={['month', 'week', 'day']}
                        defaultView="week"
                        step={30}
                        timeslots={2}
                        eventPropGetter={(event) => ({
                          style: {
                            backgroundColor: event.type === 'available' ? '#10b981' : '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px'
                          }
                        })}
                        components={{
                          event: ({ event }) => (
                            <div className="p-1">
                              <div className="flex items-center gap-1">
                                <ApperIcon 
                                  name={event.type === 'available' ? 'Clock' : 'Calendar'} 
                                  className="w-3 h-3" 
                                />
                                <span className="text-xs font-medium truncate">
                                  {event.title}
                                </span>
                              </div>
                            </div>
                          )
                        }}
                      />
                    </div>
                  </div>

                  {scheduledInterviews.length > 0 && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-3">
                        Scheduled Interviews ({scheduledInterviews.length})
                      </h4>
                      <div className="space-y-2">
                        {scheduledInterviews.map((interview) => (
                          <div key={interview.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <ApperIcon name="Calendar" className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {interview.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {format(new Date(interview.start), 'MMM d, yyyy')} at {format(new Date(interview.start), 'h:mm a')}
                                </p>
                              </div>
                            </div>
                            <Badge variant="info" size="xs">
                              Scheduled
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isScheduling && (
                    <div className="text-center py-4">
                      <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                        <ApperIcon name="Loader2" className="w-4 h-4 animate-spin" />
                        Scheduling interview...
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CandidateDetail;