const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient reference (patientId) is required'],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor reference (doctorId) is required'],
    },
    date: {
      type: String,
      required: [true, 'Appointment date is required'],
      trim: true,
    },
    timeSlot: {
      type: String,
      required: [true, 'Appointment time slot is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'cancelled'],
        message: 'Status must be one of: pending, confirmed, cancelled',
      },
      default: 'pending',
    },
    reason: {
      type: String,
      maxlength: [300, 'Reason cannot exceed 300 characters'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
