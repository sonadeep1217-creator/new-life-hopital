# New Life Diabetic Hospital – Gandhidham

Professional multi-page hospital website for a specialized **Diabetic Hospital** located in **Gandhidham, Kutch, Gujarat**.

## Features

### Public Website (Separate Pages)
- **Home** – Hero, stats, services preview, doctors, CTA
- **About Us** – Story, mission, vision, facilities
- **Services** – Full list of diabetes care services
- **Doctors** – Specialist profiles with book buttons
- **Appointment Booking** – Complete form (doctor, date, time, type)
- **Contact & Emergency** – Address, phone, WhatsApp emergency, contact form

### Portals (Login Required)
- **Patient Portal** – Dashboard, download reports, view appointments, profile
- **Doctor Panel** – View & manage assigned appointments, confirm/complete, patient list
- **Admin Panel** – Full overview, manage all appointments, doctors, patients, contact messages

### Design & UX
- Modern medical teal/blue colour theme
- Smooth scroll animations (Intersection Observer – 60/120 Hz friendly)
- Floating Emergency Call + WhatsApp buttons
- Fully responsive
- Professional cards, forms, tables, status badges

### Backend
- Express.js server serving static files + REST API
- JSON file-based storage (`/data`)
- Auth endpoints, appointments CRUD, reports, contact form

---

## How to Run

```bash
cd new-life-hospital
npm install
npm start
```

Open: **http://localhost:3000**

---

## Demo Login Credentials

| Role    | Username / Email       | Password    |
|---------|------------------------|-------------|
| Patient | ramesh@email.com       | patient123  |
| Doctor  | dr.rajesh              | doctor123   |
| Admin   | admin                  | admin123    |

---

## Hospital Details (as shown on site)

- **Name:** New Life Diabetic Hospital  
- **Location:** Plot 45, Sector 8, Near Railway Station, Gandhidham, Kutch, Gujarat 370201  
- **Phone:** +91 2836-123456  
- **Emergency / WhatsApp:** +91 98765 43210  
- **Email:** info@newlifehospital.in  
- **OPD Timings:** Mon–Sat 9 AM–1 PM & 4 PM–7 PM  

---

## Project Structure

```
new-life-hospital/
├── public/
│   ├── index.html
│   ├── css/style.css
│   ├── js/app.js          (LocalStorage + animations + Auth)
│   └── pages/
│       ├── about.html
│       ├── services.html
│       ├── doctors.html
│       ├── appointment.html
│       ├── contact.html
│       ├── login.html
│       ├── patient.html
│       ├── doctor.html
│       └── admin.html
├── backend/server.js
├── data/                  (JSON DB created on first run)
└── package.json
```

The frontend also works fully offline via **LocalStorage** (no server required for basic demo).  
The Express backend provides persistent storage and a proper API when you run `npm start`.
