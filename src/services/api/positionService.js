import positionData from '../mockData/positions.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let data = [...positionData];

const positionService = {
  async getAll() {
    await delay(250);
    return [...data];
  },

  async getById(id) {
    await delay(200);
    const position = data.find(item => item.Id === parseInt(id, 10));
    if (!position) {
      throw new Error('Position not found');
    }
    return { ...position };
  },

  async create(position) {
    await delay(350);
    const maxId = Math.max(...data.map(item => item.Id), 0);
    const newPosition = {
      ...position,
      Id: maxId + 1,
      candidateCount: 0,
      createdAt: new Date().toISOString()
    };
    data.push(newPosition);
    return { ...newPosition };
  },

  async update(id, updates) {
    await delay(300);
    const index = data.findIndex(item => item.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Position not found');
    }
    
    const updatedPosition = {
      ...data[index],
      ...updates,
      Id: data[index].Id
    };
    
    data[index] = updatedPosition;
    return { ...updatedPosition };
  },

  async delete(id) {
    await delay(250);
    const index = data.findIndex(item => item.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Position not found');
    }
    
    const deleted = data.splice(index, 1)[0];
    return { ...deleted };
  }
};

export default positionService;