class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findByEmail(email) {
    return this.model.findOne({ email });
  }

  async create(data) {
    return this.model.create(data);
  }
  async findById(id) {
    return this.model.findById(id);
  }

  async findByIdWithSession(id, session) {
    return this.model.findById(id).session(session);
  }

  async findByIdAndDelete(id) {
    return this.model.findByIdAndDelete(id);
  }

  async save(doc) {
    return doc.save();
  }

  async saveWithSession(doc, session) {
    return doc.save({ session });
  }
}

module.exports = BaseRepository;
