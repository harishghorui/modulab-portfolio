import { Schema, model, models } from 'mongoose';

// Schema updated at: 2026-04-17T15:45:00Z
const ProjectSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Please provide a project title'],
  },
  slug: {
    type: String,
    required: [true, 'Please provide a unique slug'],
    unique: true,
  },
  summary: {
    type: String,
    required: [true, 'Please provide a short summary'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a detailed description'],
  },
  techStack: [{
    type: Schema.Types.ObjectId,
    ref: 'Skill'
  }],
  category: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  liveLink: {
    type: String,
  },
  githubLink: {
    type: String,
  },
  image: {
    type: String,
    required: [true, 'Please provide a thumbnail image URL'],
  },
  featured: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Custom validator to ensure at least one category is selected
ProjectSchema.path('category').validate(function (value: unknown[]) {
  return Array.isArray(value) && value.length > 0;
}, 'Please specify at least one category');

const Project = models.Project || model('Project', ProjectSchema);

export default Project;
