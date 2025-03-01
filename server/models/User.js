const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    default: ''
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', '']
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  profileImageUrl: {
    type: String,
    default: ''
  },
  emergencyContact: {
    name: { type: String, default: '' },
    relationship: { type: String, default: '' },
    phoneNumber: { type: String, default: '' }
  },
  travelPreferences: {
    accommodationTypes: {
      type: [String],
      default: []
    },
    travelStyles: {
      type: [String],
      default: []
    },
    languages: {
      type: [String],
      default: []
    }
  },
  upcomingTrips: {
    type: [{
      destination: String,
      startDate: Date,
      endDate: Date,
      groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
      }
    }],
    default: []
  },
  pastTrips: {
    type: [{
      destination: String,
      startDate: Date,
      endDate: Date,
      groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
      }
    }],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema); 