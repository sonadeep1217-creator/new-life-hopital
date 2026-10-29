/* ============================================
   NEW LIFE DIABETIC HOSPITAL - CORE JS
   Animations + LocalStorage "Backend"
   ============================================ */

// ---------- Data Store (LocalStorage Backend) ----------
const DB = {
  get(key, def = []) {
    try {
      const raw = localStorage.getItem('nlh_' + key);
      return raw ? JSON.parse(raw) : def;
    } catch { return def; }
  },
  set(key, val) {
    localStorage.setItem('nlh_' + key, JSON.stringify(val));
  },
  push(key, item) {
    const arr = this.get(key);
    arr.push(item);
    this.set(key, arr);
    return item;
  },
  update(key, id, updates) {
    const arr = this.get(key);
    const idx = arr.findIndex(x => x.id === id);
    if (idx >= 0) {
      arr[idx] = { ...arr[idx], ...updates };
      this.set(key, arr);
      return arr[idx];
    }
    return null;
  },
  remove(key, id) {
    const arr = this.get(key).filter(x => x.id !== id);
    this.set(key, arr);
  }
};

// Seed initial data if empty
function seedData() {
  if (!localStorage.getItem('nlh_seeded')) {
    DB.set('doctors', [
      { id: 'd1', name: 'Dr. Rajesh Patel', specialty: 'Senior Diabetologist & Physician', experience: '18 years', qualification: 'MBBS, MD (Medicine), Fellowship in Diabetology', phone: '+91 98765 43210', email: 'rajesh@newlifehospital.in', patients: 1240, about: 'Specialist in Type 1 & Type 2 Diabetes, Insulin management, CGM and long-term complication prevention. Practicing in Gandhidham with focus on personalized diabetes care.', timing: 'Mon–Sat 10:00 AM – 1:00 PM, 5:00 PM – 7:00 PM', photo: true },
      { id: 'd2', name: 'Dr. Meera Shah', specialty: 'Endocrinologist', experience: '12 years', qualification: 'MBBS, MD, DM (Endocrinology)', phone: '+91 98765 43211', email: 'meera@newlifehospital.in', patients: 890, about: 'Expert in hormonal disorders, thyroid, PCOS and diabetes in women. Provides comprehensive endocrine care with modern treatment protocols.', timing: 'Mon–Sat 11:00 AM – 2:00 PM', photo: false },
      { id: 'd3', name: 'Dr. Amit Kothari', specialty: 'Diabetic Foot & Wound Specialist', experience: '15 years', qualification: 'MBBS, MS (General Surgery), Fellowship in Diabetic Foot', phone: '+91 98765 43212', email: 'amit@newlifehospital.in', patients: 670, about: 'Specialized in diabetic foot ulcers, neuropathy, vascular assessment and limb salvage. Focused on preventing amputations through early intervention.', timing: 'Tue, Thu, Sat 10:00 AM – 1:00 PM', photo: false },
      { id: 'd4', name: 'Dr. Priya Joshi', specialty: 'Nutritionist & Diabetes Educator', experience: '10 years', qualification: 'M.Sc Nutrition, CDE (Certified Diabetes Educator)', phone: '+91 98765 43213', email: 'priya@newlifehospital.in', patients: 1100, about: 'Creates practical diet plans suited to Gujarati food habits. Helps patients with weight management, carb counting and lifestyle modification.', timing: 'Mon–Fri 4:00 PM – 7:00 PM', photo: false }
    ]);
    DB.set('appointments', [
      { id: 'a1', patientName: 'Ramesh Kumar', phone: '9876500001', doctorId: 'd1', date: '2026-10-30', time: '10:00', type: 'Consultation', status: 'confirmed', notes: 'Type 2 Diabetes follow-up' },
      { id: 'a2', patientName: 'Sunita Devi', phone: '9876500002', doctorId: 'd2', date: '2026-10-31', time: '11:30', type: 'Lab Review', status: 'pending', notes: '' }
    ]);
    DB.set('patients', [
      { id: 'p1', name: 'Ramesh Kumar', email: 'ramesh@email.com', phone: '9876500001', password: 'patient123', dob: '1975-05-12', bloodGroup: 'B+', diabetesType: 'Type 2' },
      { id: 'p2', name: 'Sunita Devi', email: 'sunita@email.com', phone: '9876500002', password: 'patient123', dob: '1982-08-20', bloodGroup: 'O+', diabetesType: 'Type 2' }
    ]);
    DB.set('reports', [
      { id: 'r1', patientId: 'p1', title: 'HbA1c Report - Oct 2026', date: '2026-10-15', type: 'Lab', file: 'hba1c-ramesh-oct2026.pdf', doctor: 'Dr. Rajesh Patel' },
      { id: 'r2', patientId: 'p1', title: 'Lipid Profile', date: '2026-10-15', type: 'Lab', file: 'lipid-ramesh-oct2026.pdf', doctor: 'Dr. Rajesh Patel' },
      { id: 'r3', patientId: 'p1', title: 'Diabetes Consultation Summary', date: '2026-09-20', type: 'Clinical', file: 'consult-ramesh-sep2026.pdf', doctor: 'Dr. Rajesh Patel' }
    ]);
    DB.set('users', [
      { id: 'admin1', username: 'admin', password: 'admin123', role: 'admin', name: 'Hospital Admin' },
      { id: 'doc1', username: 'dr.rajesh', password: 'doctor123', role: 'doctor', name: 'Dr. Rajesh Patel', doctorId: 'd1' },
      { id: 'doc2', username: 'dr.meera', password: 'doctor123', role: 'doctor', name: 'Dr. Meera Shah', doctorId: 'd2' }
    ]);
    DB.set('contacts', []);
    localStorage.setItem('nlh_seeded', '1');
  }
}

// ---------- Auth ----------
const Auth = {
  login(username, password, role) {
    const users = DB.get('users');
    const user = users.find(u => u.username === username && u.password === password && (!role || u.role === role));
    if (user) {
      const session = { id: user.id, name: user.name, role: user.role, doctorId: user.doctorId || null, username: user.username };
      localStorage.setItem('nlh_session', JSON.stringify(session));
      return session;
    }
    // Patient login by email
    if (role === 'patient' || !role) {
      const patients = DB.get('patients');
      const p = patients.find(x => (x.email === username || x.phone === username) && x.password === password);
      if (p) {
        const session = { id: p.id, name: p.name, role: 'patient', patientId: p.id, email: p.email };
        localStorage.setItem('nlh_session', JSON.stringify(session));
        return session;
      }
    }
    return null;
  },
  logout() {
    localStorage.removeItem('nlh_session');
    window.location.href = '/pages/login.html';
  },
  current() {
    try {
      return JSON.parse(localStorage.getItem('nlh_session'));
    } catch { return null; }
  },
  require(roles) {
    const s = this.current();
    if (!s || (roles && !roles.includes(s.role))) {
      window.location.href = '/pages/login.html';
      return null;
    }
    return s;
  }
};

// ---------- Animations (smooth scroll reveal) ----------
function initAnimations() {
  const els = document.querySelectorAll('[data-animate]');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        // Optional: unobserve after animate once
        // observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  els.forEach(el => observer.observe(el));
}

// Header scroll effect
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// Mobile nav
function initMobileNav() {
  const toggle = document.querySelector('.mobile-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }
}

// Smooth page load
document.addEventListener('DOMContentLoaded', () => {
  seedData();
  initAnimations();
  initHeader();
  initMobileNav();
});

// ---------- Helpers ----------
function uid() {
  return 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function showAlert(container, msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `alert alert-${type}`;
  el.textContent = msg;
  container.prepend(el);
  setTimeout(() => el.remove(), 4500);
}

function getDoctorName(id) {
  const docs = DB.get('doctors');
  const d = docs.find(x => x.id === id);
  return d ? d.name : id;
}

// WhatsApp Emergency
function openWhatsApp(msg = 'Hello, I need emergency assistance regarding diabetes care at New Life Hospital, Gandhidham.') {
  const phone = '919876543210'; // Replace with real hospital WhatsApp
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
}

function callEmergency() {
  window.location.href = 'tel:+912836123456';
}
