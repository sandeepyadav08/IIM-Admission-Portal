# AuthApp Dashboard

This application provides authentication and dashboard functionality for PGP, PhD, EPhD, and EMBA programs with comprehensive applicant management and scheduling features.

## Features
### 🏠 Home Dashboard

- Overview of all programs (PGP, PhD, EPhD, EMBA)
- Quick statistics (Total Applications, Admitted, Under Review)
- Program-wise application breakdown
- Recent activities and important dates

### 👥 Applicants Management

- Comprehensive applicant list with pagination
- Advanced search and filtering by:
  - Program (PGP, PhD, EPhD, EMBA)
  - Application status (submitted, under_review, admitted, rejected)
  - Gender, Source, Offer status, Fee payment status
- Toggle offer issued and fee paid status
- Real-time data updates

### 📅 Schedule Management

- Calendar-based event management
- Add, edit, and delete events
- Event types: Interview, Meeting, Presentation, Workshop, Exam
- Program-specific event association
- Date navigation and filtering

## Setup Instructions

### Database Setup

1. Make sure MySQL is running and accessible with the credentials in `backend/config/db.js`
2. Initialize the database tables:

```bash
# Initialize the main database tables
node backend/verify-db.js

# Initialize the dashboard tables
node backend/init-dashboard-db.js

# Initialize the program-specific tables (PhD, EPhD, EMBA)
node backend/init-program-tables.js

# Initialize applicants and schedule tables
node backend/init-applicants-schedule.js
```

### Running the Application

#### Option 1: Quick Start (Windows)

Double-click `start-app.bat` to start both servers automatically.

#### Option 2: Manual Start

1. Start the backend server:

```bash
cd backend
npm install
node server.js
```

2. Start the frontend:

```bash
cd frontend-expo
npm install
npm start
```

## API Endpoints

### Dashboard APIs

- `GET /api/dashboard/overview` - Get overview of all courses
- `GET /api/dashboard/home-summary` - Get home dashboard summary
- `GET /api/dashboard/pgp-summary` - Get PGP program summary
- `GET /api/dashboard/phd-summary` - Get PhD program summary
- `GET /api/dashboard/ephd-summary` - Get Executive PhD program summary
- `GET /api/dashboard/emba-summary` - Get Executive MBA program summary

### Authentication APIs

- `POST /api/register` - Register a new user
- `POST /api/login` - Login and get authentication token
- `POST /api/forgot-password` - Request password reset OTP
- `POST /api/reset-password` - Reset password with OTP

### Applicants APIs

- `GET /api/applicants` - Get all applicants with filtering and pagination
- `GET /api/applicants/:id` - Get specific applicant details
- `PATCH /api/applicants/:id/offer` - Update applicant offer status
- `PATCH /api/applicants/:id/fee` - Update applicant fee payment status
- `GET /api/applicants/stats/summary` - Get applicant statistics

### Schedule APIs

- `GET /api/schedule` - Get all events with filtering
- `GET /api/schedule/:id` - Get specific event details
- `POST /api/schedule` - Create new event
- `PUT /api/schedule/:id` - Update existing event
- `DELETE /api/schedule/:id` - Delete event
- `GET /api/schedule/calendar/:year/:month` - Get calendar view events
- `GET /api/schedule/upcoming/week` - Get upcoming events (next 7 days)
## Screenshot
![1login](https://github.com/user-attachments/assets/11ccd606-1a23-4c41-b5b2-4cee7127504c)

![2forgot password](https://github.com/user-attachments/assets/4e036dd1-4f40-4c06-8632-8a44c0bdd5be)

![3deashboard screen](https://github.com/user-attachments/assets/0e329840-f40b-474b-879d-e13c1d510478)

![4menu screen](https://github.com/user-attachments/assets/1a8804a0-c6a3-494d-9064-983ffce83a8f)

![5setting](https://github.com/user-attachments/assets/63642d6a-748b-4ac8-82af-044d69b90e01)

![6notification](https://github.com/user-attachments/assets/9328a958-e8d9-469c-8a85-6b8551d4a3ee)

## Troubleshooting

If you're seeing data in Postman but not in the frontend:

1. Check that the API URL in `frontend-expo/config.js` is correct
2. Make sure all database tables are properly initialized
3. Check browser console for any API errors
4. Verify that the backend server is running and accessible from the frontend

# TO Start app
1. cd AuthApp/frontend-expo
2. npm start
# Backend
1. cd AuthApp/backend
2. node server.js
