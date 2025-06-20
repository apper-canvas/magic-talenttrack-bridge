import interviewsData from '@/services/mockData/interviews.json';

class InterviewService {
  constructor() {
    this.interviews = [...interviewsData];
    this.lastId = Math.max(...this.interviews.map(i => i.Id), 0);
  }

  // Get all interviews
  async getAll() {
    await this.delay(300);
    return [...this.interviews];
  }

  // Get interview by ID
  async getById(id) {
    await this.delay(200);
    const interview = this.interviews.find(i => i.Id === parseInt(id));
    if (!interview) {
      throw new Error('Interview not found');
    }
    return { ...interview };
  }

  // Create new interview
  async create(interviewData) {
    await this.delay(400);
    
    const newInterview = {
      Id: ++this.lastId,
      title: interviewData.title || 'New Interview',
      candidateName: interviewData.candidateName || 'Unknown Candidate',
      candidateId: interviewData.candidateId || null,
      startTime: interviewData.startTime,
      endTime: interviewData.endTime,
      status: interviewData.status || 'scheduled',
      type: interviewData.type || 'technical',
      location: interviewData.location || 'Virtual',
      notes: [],
      participants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.interviews.push(newInterview);
    return { ...newInterview };
  }

  // Update interview
  async update(id, updateData) {
    await this.delay(300);
    
    const index = this.interviews.findIndex(i => i.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Interview not found');
    }

    this.interviews[index] = {
      ...this.interviews[index],
      ...updateData,
      Id: parseInt(id), // Preserve ID
      updatedAt: new Date().toISOString()
    };

    return { ...this.interviews[index] };
  }

  // Delete interview
  async delete(id) {
    await this.delay(200);
    
    const index = this.interviews.findIndex(i => i.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Interview not found');
    }

    this.interviews.splice(index, 1);
    return true;
  }

  // Add note to interview
  async addNote(interviewId, noteData) {
    await this.delay(300);
    
    const interview = this.interviews.find(i => i.Id === parseInt(interviewId));
    if (!interview) {
      throw new Error('Interview not found');
    }

    const newNote = {
      id: Date.now(),
      content: noteData.content,
      timestamp: noteData.timestamp || new Date().toISOString(),
      author: noteData.author || 'Current User'
    };

    if (!interview.notes) {
      interview.notes = [];
    }
    
    interview.notes.push(newNote);
    interview.updatedAt = new Date().toISOString();

    return { ...interview };
  }

  // Add participant to interview
  async addParticipant(interviewId, participantData) {
    await this.delay(300);
    
    const interview = this.interviews.find(i => i.Id === parseInt(interviewId));
    if (!interview) {
      throw new Error('Interview not found');
    }

    const newParticipant = {
      id: Date.now(),
      name: participantData.name,
      email: participantData.email,
      role: participantData.role || 'Interviewer',
      addedAt: participantData.addedAt || new Date().toISOString()
    };

    if (!interview.participants) {
      interview.participants = [];
    }

    // Check for duplicate emails
    const existingParticipant = interview.participants.find(p => p.email === participantData.email);
    if (existingParticipant) {
      throw new Error('Participant already added to this interview');
    }
    
    interview.participants.push(newParticipant);
    interview.updatedAt = new Date().toISOString();

    return { ...interview };
  }

  // Remove participant from interview
  async removeParticipant(interviewId, participantId) {
    await this.delay(200);
    
    const interview = this.interviews.find(i => i.Id === parseInt(interviewId));
    if (!interview) {
      throw new Error('Interview not found');
    }

    if (!interview.participants) {
      throw new Error('No participants found');
    }

    const participantIndex = interview.participants.findIndex(p => p.id === parseInt(participantId));
    if (participantIndex === -1) {
      throw new Error('Participant not found');
    }

    interview.participants.splice(participantIndex, 1);
    interview.updatedAt = new Date().toISOString();

    return { ...interview };
  }

  // Get interviews by candidate ID
  async getByCandidateId(candidateId) {
    await this.delay(200);
    return this.interviews.filter(i => i.candidateId === parseInt(candidateId));
  }

  // Get interviews by date range
  async getByDateRange(startDate, endDate) {
    await this.delay(200);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.interviews.filter(interview => {
      const interviewDate = new Date(interview.startTime);
      return interviewDate >= start && interviewDate <= end;
    });
  }

  // Get interviews by status
  async getByStatus(status) {
    await this.delay(200);
    return this.interviews.filter(i => i.status === status);
  }

  // Update interview status
  async updateStatus(id, status) {
    await this.delay(200);
    return this.update(id, { status, updatedAt: new Date().toISOString() });
  }

  // Search interviews
  async search(query) {
    await this.delay(300);
    const searchTerm = query.toLowerCase();
    
    return this.interviews.filter(interview => 
      interview.title.toLowerCase().includes(searchTerm) ||
      interview.candidateName.toLowerCase().includes(searchTerm) ||
      interview.type.toLowerCase().includes(searchTerm) ||
      interview.location.toLowerCase().includes(searchTerm)
    );
  }

  // Helper method for simulating API delays
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get upcoming interviews (next 7 days)
  async getUpcoming() {
    await this.delay(200);
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return this.interviews.filter(interview => {
      const interviewDate = new Date(interview.startTime);
      return interviewDate >= now && interviewDate <= nextWeek && interview.status === 'scheduled';
    }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }

  // Get interview statistics
  async getStatistics() {
    await this.delay(200);
    
    const total = this.interviews.length;
    const scheduled = this.interviews.filter(i => i.status === 'scheduled').length;
    const completed = this.interviews.filter(i => i.status === 'completed').length;
    const cancelled = this.interviews.filter(i => i.status === 'cancelled').length;
    const rescheduled = this.interviews.filter(i => i.status === 'rescheduled').length;

    return {
      total,
      scheduled,
      completed,
      cancelled,
      rescheduled,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }
}

const interviewService = new InterviewService();
export default interviewService;