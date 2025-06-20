import candidateData from '../mockData/candidates.json';
import { format } from 'date-fns';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let data = [...candidateData];

const candidateService = {
  async getAll() {
    await delay(300);
    return [...data];
  },

  async getById(id) {
    await delay(200);
    const candidate = data.find(item => item.Id === parseInt(id, 10));
    if (!candidate) {
      throw new Error('Candidate not found');
    }
    return { ...candidate };
  },

  async create(candidate) {
    await delay(400);
    const maxId = Math.max(...data.map(item => item.Id), 0);
    const newCandidate = {
      ...candidate,
      Id: maxId + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: candidate.notes || []
    };
    data.push(newCandidate);
    return { ...newCandidate };
  },

  async update(id, updates) {
    await delay(300);
    const index = data.findIndex(item => item.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Candidate not found');
    }
    
    const updatedCandidate = {
      ...data[index],
      ...updates,
      Id: data[index].Id,
      updatedAt: new Date().toISOString()
    };
    
    data[index] = updatedCandidate;
    return { ...updatedCandidate };
  },

  async delete(id) {
    await delay(250);
    const index = data.findIndex(item => item.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Candidate not found');
    }
    
    const deleted = data.splice(index, 1)[0];
    return { ...deleted };
  },

  async addNote(candidateId, note) {
    await delay(200);
    const candidate = data.find(item => item.Id === parseInt(candidateId, 10));
    if (!candidate) {
      throw new Error('Candidate not found');
    }

    const newNote = {
      id: Date.now().toString(),
      content: note.content,
      timestamp: new Date().toISOString(),
      type: note.type || 'general'
    };

    candidate.notes = candidate.notes || [];
    candidate.notes.unshift(newNote);
    candidate.updatedAt = new Date().toISOString();

    return { ...candidate };
  },

  async updateStage(candidateId, newStage) {
    await delay(250);
    return await this.update(candidateId, { stage: newStage });
  },

  async getByStage(stage) {
    await delay(200);
    return data.filter(candidate => candidate.stage === stage).map(item => ({ ...item }));
  },

  async search(query) {
    await delay(300);
    const searchTerm = query.toLowerCase();
    return data.filter(candidate => 
      candidate.name.toLowerCase().includes(searchTerm) ||
      candidate.email.toLowerCase().includes(searchTerm) ||
      candidate.position.toLowerCase().includes(searchTerm) ||
      (candidate.skills && candidate.skills.some(skill => 
        skill.toLowerCase().includes(searchTerm)
      ))
    ).map(item => ({ ...item }));
  }
};

export default candidateService;