import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters']
    },
    description: {
      type: String,
      maxlength: 1000
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['viewer', 'editor', 'admin'], default: 'editor' },
        joinedAt: { type: Date, default: Date.now }
      }
    ],
    category: {
      type: String,
      enum: ['development', 'design', 'marketing', 'sales', 'support', 'other'],
      default: 'development'
    },
    status: {
      type: String,
      enum: ['planning', 'active', 'paused', 'completed', 'archived'],
      default: 'planning'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    startDate: Date,
    dueDate: Date,
    completedDate: Date,
    budget: {
      amount: Number,
      currency: { type: String, default: 'USD' }
    },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    tags: [String],
    attachments: [
      {
        name: String,
        url: String,
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    timeline: [
      {
        event: String,
        date: Date,
        creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      }
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Индексы для поиска
projectSchema.index({ owner: 1, status: 1 });
projectSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('Project', projectSchema);
