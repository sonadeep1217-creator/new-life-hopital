/**
 * New Life Diabetic Hospital - Simple Express Backend
 * Serves static frontend + provides REST API for appointments, auth, etc.
 * Data is stored in JSON files under /data for persistence.
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data directory
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// ---------- Simple JSON file DB ----------
function readDB(name, def = []) {
  const file = path.join(DATA_DIR, name + '.json');
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {}
  return def;
}
function writeDB(name, data) {
  fs.writeFileSync(path.join(DATA_DIR, name + '.json'), JSON.stringify(data, null, 2));
}

// Seed if empty
function seed() {
  if (!fs.existsSync(path.join(DATA_DIR, 'doctors.json'))) {
    writeDB('doctors', [
      { id: 'd1', name: 'Dr. Rajesh Patel', specialty: 'Diabetologist', experience: '18 years', phone: '+91 98765 43210', email: 'rajesh@newlifehospital.in', patients: 1240 },
      { id: 'd2', name: 'Dr. Meera Shah', specialty: 'Endocrinologist', experience: '12 years', phone: '+91 98765 43211', email: 'meera@newlifehospital.in', patients: 890 },
      { id: 'd3', name: 'Dr. Amit Kothari', specialty: 'Diabetic Foot Specialist', experience: '15 years', phone: '+91 98765 43212', email: 'amit@newlifehospital.in', patients: 670 },
      { id: 'd4', name: 'Dr. Priya Joshi', specialty: 'Nutritionist & Diabetes Educator', experience: '10 years', phone: '+91 98765 43213', email: 'priya@newlifehospital.in', patients: 1100 }
    ]);
    writeDB('appointments', []);
    writeDB('patients', [
      { id: 'p1', name: 'Ramesh Kumar', email: 'ramesh@email.com', phone: '9876500001', password: 'patient123', dob: '1975-05-12', bloodGroup: 'B+', diabetesType: 'Type 2' },
      { id: 'p2', name: 'Sunita Devi', email: 'sunita@email.com', phone: '9876500002', password: 'patient123', dob: '1982-08-20', bloodGroup: 'O+', diabetesType: 'Type 2' }
    ]);
    writeDB('reports', [
      { id: 'r1', patientId: 'p1', title: 'HbA1c Report - Oct 2026', date: '2026-10-15', type: 'Lab', file: 'hba1c-ramesh-oct2026.pdf', doctor: 'Dr. Rajesh Patel' },
      { id: 'r2', patientId: 'p1', title: 'Lipid Profile', date: '2026-10-15', type: 'Lab', file: 'lipid-ramesh-oct2026.pdf', doctor: 'Dr. Rajesh Patel' }
    ]);
    writeDB('users', [
      { id: 'admin1', username: 'admin', password: 'admin123', role: 'admin', name: 'Hospital Admin' },
      { id: 'doc1', username: 'dr.rajesh', password: 'doctor123', role: 'doctor', name: 'Dr. Rajesh Patel', doctorId: 'd1' },
      { id: 'doc2', username: 'dr.meera', password: 'doctor123', role: 'doctor', name: 'Dr. Meera Shah', doctorId: 'd2' }
    ]);
    writeDB('contacts', []);
    console.log('Database seeded.');
  }
}
seed();

// ---------- API Routes ----------
app.get('/api/doctors', (req, res) => res.json(readDB('doctors')));

app.get('/api/appointments', (req, res) => {
  let list = readDB('appointments');
  if (req.query.doctorId) list = list.filter(a => a.doctorId === req.query.doctorId);
  if (req.query.patientId) list = list.filter(a => a.patientId === req.query.patientId);
  res.json(list);
});

app.post('/api/appointments', (req, res) => {
  const list = readDB('appointments');
  const item = { id: uuidv4(), ...req.body, status: 'pending', createdAt: new Date().toISOString() };
  list.push(item);
  writeDB('appointments', list);
  res.status(201).json(item);
});

app.patch('/api/appointments/:id', (req, res) => {
  const list = readDB('appointments');
  const idx = list.findIndex(a => a.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: 'Not found' });
  list[idx] = { ...list[idx], ...req.body };
  writeDB('appointments', list);
  res.json(list[idx]);
});

app.post('/api/auth/login', (req, res) => {
  const { username, password, role } = req.body;
  const users = readDB('users');
  let user = users.find(u => u.username === username && u.password === password && (!role || u.role === role));
  if (!user && (role === 'patient' || !role)) {
    const patients = readDB('patients');
    const p = patients.find(x => (x.email === username || x.phone === username) && x.password === password);
    if (p) user = { id: p.id, name: p.name, role: 'patient', patientId: p.id, email: p.email };
  }
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ id: user.id, name: user.name, role: user.role, doctorId: user.doctorId || null, patientId: user.patientId || user.id });
});

app.get('/api/reports/:patientId', (req, res) => {
  const reports = readDB('reports').filter(r => r.patientId === req.params.patientId);
  res.json(reports);
});

app.post('/api/contact', (req, res) => {
  const list = readDB('contacts');
  const item = { id: uuidv4(), ...req.body, createdAt: new Date().toISOString() };
  list.push(item);
  writeDB('contacts', list);
  res.status(201).json(item);
});

app.get('/api/patients', (req, res) => res.json(readDB('patients')));
app.get('/api/contacts', (req, res) => res.json(readDB('contacts')));

// Fallback to index for SPA-like routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  New Life Diabetic Hospital server running at http://localhost:${PORT}`);
  console.log(`  Open the website and use demo logins from the Login page.\n`);
});
