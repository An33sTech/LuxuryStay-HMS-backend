const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  guest: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
  rating: { type: Number, min: 1, max: 5 },
  comments: { type: String },
  submittedAt: { type: Date, default: Date.now }
});

const Feedback = mongoose.model("Feedback", FeedbackSchema);
module.exports = Feedback;