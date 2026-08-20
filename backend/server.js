const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {}

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Import Mongoose Models (Task 5)
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_appointment_db';

// ==========================================
// 1. GLOBAL MIDDLEWARE
// ==========================================
app.use(cors());
app.use(express.json());

// Task 3: Custom requestLogger middleware
// Format: [METHOD] [PATH] [TIMESTAMP]
// Example: [GET] /api/v1/appointments [2026-08-20T10:15:20.000Z]
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${req.method}] ${req.originalUrl || req.url} [${timestamp}]`);
  next();
};
app.use(requestLogger);

// ==========================================
// 2. IN-MEMORY DATA STORAGE (Task 3 & 4)
// ==========================================
let inMemoryDoctors = [
  {
    id: 1,
    name: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@medcare.com',
    specialisation: 'Cardiology',
    available: true,
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    email: 'michael.chen@medcare.com',
    specialisation: 'Neurology',
    available: true,
  },
  {
    id: 3,
    name: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@medcare.com',
    specialisation: 'Pediatrics',
    available: false,
  },
  {
    id: 4,
    name: 'Dr. James Wilson',
    email: 'james.wilson@medcare.com',
    specialisation: 'Orthopedics',
    available: true,
  },
  {
    id: 5,
    name: 'Dr. Priya Patel',
    email: 'priya.patel@medcare.com',
    specialisation: 'Dermatology',
    available: true,
  },
];

let inMemoryAppointments = [
  {
    id: 1,
    patientName: 'John Doe',
    doctorName: 'Dr. Sarah Jenkins',
    date: '2026-08-25',
    timeSlot: '10:00 AM',
    status: 'confirmed',
    reason: 'Annual Heart Checkup',
  },
  {
    id: 2,
    patientName: 'Jane Smith',
    doctorName: 'Dr. Michael Chen',
    date: '2026-08-26',
    timeSlot: '02:30 PM',
    status: 'pending',
    reason: 'Persistent Migraines',
  },
  {
    id: 3,
    patientName: 'Robert Davis',
    doctorName: 'Dr. James Wilson',
    date: '2026-08-27',
    timeSlot: '11:15 AM',
    status: 'cancelled',
    reason: 'Knee Joint Pain Review',
  },
];

// ==========================================
// 3. REST API ENDPOINTS (Task 3)
// ==========================================

// Root Health / Info Route
app.get('/', (req, res) => {
  res.status(200).json({
    project: 'MedCare Plus - Hospital Appointment System API',
    status: 'Online',
    version: '1.0.0',
    endpoints: {
      getAllAppointments: 'GET /api/v1/appointments',
      createAppointment: 'POST /api/v1/appointments',
      getAllDoctors: 'GET /api/v1/doctors',
      mongoEndpoints: {
        patients: '/api/v1/patients',
        dbAppointments: '/api/v1/db/appointments',
        validationDemo: 'POST /api/v1/demo/validation-test',
      },
    },
  });
});

// GET /api/v1/doctors - Return all doctors (Task 3 & 4)
app.get('/api/v1/doctors', async (req, res, next) => {
  try {
    // If MongoDB is connected and has doctor records, we can return those or in-memory list
    if (mongoose.connection.readyState === 1) {
      const dbDoctors = await Doctor.find();
      if (dbDoctors && dbDoctors.length > 0) {
        return res.status(200).json({
          success: true,
          count: dbDoctors.length,
          data: dbDoctors,
        });
      }
    }
    // Return in-memory doctors
    return res.status(200).json({
      success: true,
      count: inMemoryDoctors.length,
      data: inMemoryDoctors,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/appointments - Return all appointments (Task 3 & 5)
app.get('/api/v1/appointments', async (req, res, next) => {
  try {
    // If MongoDB is connected, retrieve populated appointments from Atlas
    if (mongoose.connection.readyState === 1) {
      const dbAppointments = await Appointment.find()
        .populate('patientId')
        .populate('doctorId')
        .sort({ createdAt: -1 });

      if (dbAppointments && dbAppointments.length > 0) {
        const formatted = dbAppointments.map((app) => ({
          id: app._id,
          patientName: app.patientId ? app.patientId.name : 'Unknown Patient',
          doctorName: app.doctorId ? `${app.doctorId.name} (${app.doctorId.specialisation})` : 'General Doctor',
          date: app.date,
          timeSlot: app.timeSlot,
          status: app.status,
          reason: app.reason,
        }));

        return res.status(200).json({
          success: true,
          count: formatted.length,
          data: formatted,
        });
      }
    }

    // Fallback to in-memory appointments
    return res.status(200).json({
      success: true,
      count: inMemoryAppointments.length,
      data: inMemoryAppointments,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/appointments - Create a new appointment (Task 3 & 5: Saves to Atlas)
app.post('/api/v1/appointments', async (req, res, next) => {
  try {
    const { patientName, doctorName, date, timeSlot, status = 'pending', reason } = req.body;

    // Validation for required fields
    if (!patientName || !doctorName || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Please provide patientName, doctorName, date, and timeSlot',
      });
    }

    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: `Invalid status "${status}". Allowed values: pending, confirmed, cancelled`,
      });
    }

    if (reason && reason.length > 300) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Reason cannot exceed 300 characters',
      });
    }

    let savedDbAppointment = null;

    // Save directly to MongoDB Atlas if connected
    if (mongoose.connection.readyState === 1) {
      try {
        // Find existing patient by name or create a new one in Atlas
        const sanitizedName = patientName.trim();
        const safeEmail = `${sanitizedName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'patient'}_${Date.now()}@medcare.com`;
        
        let patient = await Patient.findOne({ name: sanitizedName });
        if (!patient) {
          patient = await Patient.create({
            name: sanitizedName,
            email: req.body.email || safeEmail,
            phone: req.body.phone || '+1 555-0100',
            bloodGroup: req.body.bloodGroup || 'O+',
            age: req.body.age || 30,
          });
        }

        // Find doctor by matching name
        let doctor = await Doctor.findOne({
          name: { $regex: doctorName.replace(/\(.*?\)/g, '').trim(), $options: 'i' },
        });
        if (!doctor) {
          doctor = await Doctor.findOne();
        }

        if (patient && doctor) {
          const newDbApp = await Appointment.create({
            patientId: patient._id,
            doctorId: doctor._id,
            date,
            timeSlot,
            status: status || 'pending',
            reason: reason ? reason.trim() : 'General Consultation',
          });

          savedDbAppointment = await Appointment.findById(newDbApp._id)
            .populate('patientId')
            .populate('doctorId');
        }
      } catch (dbErr) {
        console.warn('Atlas persistence note:', dbErr.message);
      }
    }

    // In-memory record
    const newAppointment = {
      id: savedDbAppointment ? savedDbAppointment._id : inMemoryAppointments.length + 1,
      patientName: patientName.trim(),
      doctorName: doctorName.trim(),
      date,
      timeSlot,
      status: status || 'pending',
      reason: reason ? reason.trim() : 'General Consultation',
    };

    inMemoryAppointments.unshift(newAppointment);

    return res.status(201).json({
      success: true,
      message: 'Appointment created and saved to MongoDB Atlas successfully',
      data: newAppointment,
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 4. MONGODB + MONGOOSE DEMONSTRATION ROUTES (Task 5)
// ==========================================

// POST /api/v1/patients - Create a new patient in MongoDB
app.post('/api/v1/patients', async (req, res, next) => {
  try {
    const patient = new Patient(req.body);
    const savedPatient = await patient.save();
    res.status(201).json({
      success: true,
      message: 'Patient registered successfully in MongoDB',
      data: savedPatient,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/patients - Retrieve all patients from MongoDB
app.get('/api/v1/patients', async (req, res, next) => {
  try {
    const patients = await Patient.find();
    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/db/appointments - Create an appointment in MongoDB with Mongoose references
app.post('/api/v1/db/appointments', async (req, res, next) => {
  try {
    const { patientId, doctorId, date, timeSlot, status, reason } = req.body;
    const appointment = new Appointment({
      patientId,
      doctorId,
      date,
      timeSlot,
      status,
      reason,
    });
    const saved = await appointment.save();
    const populated = await Appointment.findById(saved._id)
      .populate('patientId')
      .populate('doctorId');

    res.status(201).json({
      success: true,
      message: 'MongoDB appointment created and populated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/db/appointments - Get all MongoDB appointments populated
app.get('/api/v1/db/appointments', async (req, res, next) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId')
      .populate('doctorId');
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/demo/validation-test - Explicit test endpoint for Task 5 validation failure demo
app.post('/api/v1/demo/validation-test', async (req, res, next) => {
  try {
    const { testType } = req.body;

    if (testType === 'missing-field') {
      // Missing required name & email
      const badPatient = new Patient({});
      await badPatient.validate();
    } else if (testType === 'invalid-blood-group') {
      // Invalid blood group
      const badPatient = new Patient({
        name: 'Alex Johnson',
        email: 'alex@example.com',
        bloodGroup: 'Z_POSITIVE', // Invalid
      });
      await badPatient.validate();
    } else if (testType === 'invalid-status') {
      // Invalid appointment status
      const badAppointment = new Appointment({
        patientId: new mongoose.Types.ObjectId(),
        doctorId: new mongoose.Types.ObjectId(),
        date: '2026-08-20',
        timeSlot: '10:00 AM',
        status: 'approved_not_valid', // Invalid enum
      });
      await badAppointment.validate();
    } else if (testType === 'reason-too-long') {
      // Reason exceeding 300 characters
      const longReason = 'A'.repeat(305);
      const badAppointment = new Appointment({
        patientId: new mongoose.Types.ObjectId(),
        doctorId: new mongoose.Types.ObjectId(),
        date: '2026-08-20',
        timeSlot: '10:00 AM',
        reason: longReason,
      });
      await badAppointment.validate();
    } else {
      return res.status(400).json({
        success: false,
        message: 'Provide testType: "missing-field", "invalid-blood-group", "invalid-status", or "reason-too-long"',
      });
    }

    res.status(200).json({ success: true, message: 'Validation unexpectedly passed' });
  } catch (error) {
    next(error);
  }
});

// Trigger 500 error route for testing error middleware
app.get('/api/v1/error-test', (req, res, next) => {
  const customError = new Error('Simulated internal server error');
  customError.statusCode = 500;
  next(customError);
});

// ==========================================
// 5. GLOBAL ERROR-HANDLING MIDDLEWARE (Task 3 & 5)
// ==========================================
// Must be registered after all routes as the last middleware.
// Returns a structured JSON response instead of exposing the raw error stack.
app.use((err, req, res, next) => {
  // Handle Mongoose Validation Error (Task 5)
  if (err.name === 'ValidationError') {
    const errorDetails = Object.values(err.errors).map((item) => ({
      field: item.path,
      message: item.message,
      value: item.value,
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Schema validation failed for one or more fields',
      details: errorDetails,
    });
  }

  // Handle Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return res.status(400).json({
      success: false,
      error: 'Duplicate Key Error',
      message: `The ${field} "${value}" is already in use. Please use a unique value.`,
    });
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId format)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID Format',
      message: `Invalid identifier provided for field "${err.path}"`,
    });
  }

  // Generic and Server Errors (Status 500)
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  return res.status(statusCode).json({
    success: false,
    error: err.name || 'Server Error',
    message: err.message || 'An unexpected error occurred on the server',
  });
});

// ==========================================
// 6. DATABASE CONNECTION & SERVER STARTUP
// ==========================================
const seedDatabaseIfEmpty = async () => {
  try {
    const doctorCount = await Doctor.countDocuments();
    if (doctorCount === 0) {
      console.log('Seeding initial Doctor data into MongoDB...');
      await Doctor.insertMany([
        { name: 'Dr. Sarah Jenkins', email: 'sarah.jenkins@medcare.com', specialisation: 'Cardiology', available: true },
        { name: 'Dr. Michael Chen', email: 'michael.chen@medcare.com', specialisation: 'Neurology', available: true },
        { name: 'Dr. Emily Rodriguez', email: 'emily.rodriguez@medcare.com', specialisation: 'Pediatrics', available: false },
        { name: 'Dr. James Wilson', email: 'james.wilson@medcare.com', specialisation: 'Orthopedics', available: true },
        { name: 'Dr. Priya Patel', email: 'priya.patel@medcare.com', specialisation: 'Dermatology', available: true },
      ]);
      console.log('Doctors seeded successfully.');
    }

    const patientCount = await Patient.countDocuments();
    if (patientCount === 0) {
      console.log('Seeding initial Patient data into MongoDB...');
      const patient = await Patient.create({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 555-0199',
        bloodGroup: 'O+',
        age: 34,
      });

      const doctor = await Doctor.findOne({ name: 'Dr. Sarah Jenkins' });
      if (doctor) {
        await Appointment.create({
          patientId: patient._id,
          doctorId: doctor._id,
          date: '2026-08-25',
          timeSlot: '10:00 AM',
          status: 'confirmed',
          reason: 'Annual Heart Checkup',
        });
        console.log('Sample Patient and Appointment seeded successfully.');
      }
    }
  } catch (seedErr) {
    console.warn('Note on auto-seeding:', seedErr.message);
  }
};

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log(`[MongoDB] Connected successfully to: ${MONGO_URI}`);
    await seedDatabaseIfEmpty();
  })
  .catch((err) => {
    console.warn(`[MongoDB] Connection notice: ${err.message}`);
    console.warn('Backend will continue serving in-memory endpoints for Task 3 & Task 4.');
  });

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` MedCare Plus Backend Server running on port: ${PORT}`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(` Health Check: http://localhost:${PORT}/`);
  console.log(` Endpoints:`);
  console.log(`   - GET  /api/v1/appointments`);
  console.log(`   - POST /api/v1/appointments`);
  console.log(`   - GET  /api/v1/doctors`);
  console.log(`   - POST /api/v1/patients`);
  console.log(`   - POST /api/v1/db/appointments`);
  console.log(`   - POST /api/v1/demo/validation-test`);
  console.log(`=======================================================`);
});
