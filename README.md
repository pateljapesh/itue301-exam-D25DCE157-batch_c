# MedCare Plus - Hospital Appointment System
**ITUE301 — Advanced Web Development Frameworks**
**Open-Book Practical Examination — Set A**

---

## 1. Project Name
**MedCare Plus — Hospital Appointment System**  
A full-stack web application designed for hospitals to manage specialist doctors, patient records, and appointment schedules with live status tracking.

---

## 2. Tech Stack & Architecture
- **Frontend**: React (Vite), React Router v6, Pure Modern Vanilla CSS (Design Tokens, Glassmorphism, Status-driven UI)
- **Backend**: Node.js, Express.js REST API, Custom Logging Middleware, Centralized Error Handling
- **Database**: MongoDB & Mongoose ODM (Patient, Doctor, Appointment Schemas with enum and length validations and population references)

---

## 3. Repository Structure
```
itue301-exam-[your-roll-number]-[batch]/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx              # Navigation with React Router links
│   │   │   └── AppointmentCard.jsx     # Reusable card with dynamic status styles
│   │   ├── pages/
│   │   │   ├── HomePage.jsx            # Landing page with appointment cards showcase
│   │   │   ├── DoctorsPage.jsx         # REST API consumer with loading, error, data states
│   │   │   └── BookingPage.jsx         # Multi-state appointment form & live preview
│   │   ├── App.jsx                     # Route configuration (/, /doctors, /booking)
│   │   ├── main.jsx                    # React root with BrowserRouter
│   │   └── index.css                   # Modern CSS design system
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── models/
│   │   ├── Patient.js                  # Mongoose schema with bloodGroup enum & unique email
│   │   ├── Doctor.js                   # Mongoose schema with specialisation & availability
│   │   └── Appointment.js              # Schema with references, status enum & 300 char reason
│   ├── server.js                       # Express REST API, middlewares, and DB connection
│   ├── .env.example
│   └── package.json
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 4. Required Environment Variables
Create a `.env` file inside the `backend/` directory (or copy from `.env.example`):

```env
# Server Port
PORT=5000

# MongoDB Connection String (Local MongoDB or MongoDB Atlas)
MONGO_URI=mongodb://127.0.0.1:27017/hospital_appointment_db
```

> **Note**: An `.env.example` file is included in both root and backend directories. The actual `.env` is ignored in git per security instructions.

---

## 5. MongoDB Setup
1. **Local MongoDB**: Ensure the MongoDB service is running locally on port `27017` (`mongodb://127.0.0.1:27017/hospital_appointment_db`).
2. **MongoDB Atlas (Cloud)**: Replace `MONGO_URI` in `.env` with your Atlas connection string:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/hospital_appointment_db?retryWrites=true&w=majority
   ```
3. When the backend starts, it automatically establishes the Mongoose connection and seeds sample doctors and patient appointments if the collection is empty.

---

## 6. Backend Setup and Run Command

### Step 1: Navigate to the backend directory
```bash
cd backend
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Start the server
The backend can be started using either command:
```bash
npm start
# (or)
node server.js
```
The server will start listening at: `http://localhost:5000`

---

## 7. Frontend Setup and Run Command

### Step 1: Open a new terminal and navigate to the frontend directory
```bash
cd frontend
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Start the Vite development server
```bash
npm run dev
```
Open your browser and navigate to: `http://localhost:5173`

---

## 8. Summary of Completed Tasks

### Task 1 — React Component Architecture (4 Marks)
- Created `HomePage`, `DoctorsPage`, `BookingPage`, and `AppointmentCard`.
- `AppointmentCard` accepts 5 props: `patientName`, `doctorName`, `date`, `timeSlot`, `status`.
- Dynamically applies distinct CSS classes for statuses (`confirmed` in green, `pending` in amber, `cancelled` in red).
- Passes appointment props seamlessly from parent components.

### Task 2 — React Routing and State Management (4 Marks)
- Configured React Router with routes:
  - `/` &rarr; `HomePage`
  - `/doctors` &rarr; `DoctorsPage`
  - `/booking` &rarr; `BookingPage`
- Built `Navbar` using React Router `NavLink` without full-page reloads.
- Built appointment form with `useState` managing `formData`, `selectedDoctor`, and live preview.
- Displays patient name and doctor selection live in real-time as state changes.

### Task 3 — Express REST API + Middleware (4 Marks)
- Implemented endpoints:
  - `GET /api/v1/appointments` &rarr; Returns all appointments (200 OK)
  - `POST /api/v1/appointments` &rarr; Creates a new appointment (201 Created)
  - `GET /api/v1/doctors` &rarr; Returns all doctors (200 OK)
- Custom `requestLogger` middleware logs: `[METHOD] [PATH] [TIMESTAMP]` on every request.
- Global error-handling middleware returns structured JSON responses without exposing raw error stacks.

### Task 4 — REST API Consumption in React (4 Marks)
- In `DoctorsPage`, consumes `GET /api/v1/doctors` asynchronously inside `useEffect()`.
- Maintains 3 distinct states: `data`, `loading`, and `error`.
- Displays animated spinner while loading, error message with "Try Again" retry button on failure, and doctors list with Name, Specialisation, and Availability badge on success.

### Task 5 — MongoDB + Mongoose Schema Design & Validation (4 Marks)
- Mongoose schemas created in `/backend/models/`:
  - **Patient**: `name` (required), `email` (required, unique), `phone`, `bloodGroup` (enum: `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`), `age` (number).
  - **Doctor**: `name` (required), `email`, `specialisation` (required), `available` (default: true).
  - **Appointment**: `patientId` (ref: `Patient`), `doctorId` (ref: `Doctor`), `date` (required), `timeSlot` (required), `status` (enum: `pending`, `confirmed`, `cancelled`, default: `pending`), `reason` (max 300 characters).
- Added `POST /api/v1/demo/validation-test` to demonstrate schema validation failures (missing required fields, invalid blood group, invalid status, reason > 300 chars) returning formatted JSON error responses.

---

## 9. API Endpoints Reference

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | API Status & Endpoint Directory | 200 OK |
| `GET` | `/api/v1/doctors` | Get all specialist doctors | 200 OK |
| `GET` | `/api/v1/appointments` | Get all appointments | 200 OK |
| `POST` | `/api/v1/appointments` | Create new appointment | 201 Created |
| `GET` | `/api/v1/patients` | Get all patients (MongoDB) | 200 OK |
| `POST` | `/api/v1/patients` | Create patient (MongoDB) | 201 Created |
| `GET` | `/api/v1/db/appointments` | Get populated DB appointments | 200 OK |
| `POST` | `/api/v1/db/appointments` | Create DB appointment with refs | 201 Created |
| `POST` | `/api/v1/demo/validation-test` | Test validation failure handling | 400 Bad Request |
