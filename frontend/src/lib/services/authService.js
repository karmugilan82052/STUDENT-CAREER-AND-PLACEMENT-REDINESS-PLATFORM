import { auth, db } from '../firebase/firebaseClient';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { authStore } from '../stores/authStore';
import { isMockMode } from './dbHelper';
import { browser } from '$app/environment';

import { emailService } from './emailService';

// Helper to update stores
function updateAuthStore(user, profile, role, loading = false) {
  authStore.set({ user, profile, role, loading });
}

// Global Auth State Observer
if (browser) {
  if (isMockMode) {
    // LocalStorage Observer simulation
    const currentSession = localStorage.getItem('cs_session');
    if (currentSession) {
      try {
        const userObj = JSON.parse(currentSession);
        const students = JSON.parse(localStorage.getItem('cs_students') || '{}');
        let profile = userObj.role === 'student' ? students[userObj.uid] || null : null;
        if (profile && profile.profilePhotoUrl && profile.profilePhotoUrl.includes('images.unsplash.com')) {
          profile.profilePhotoUrl = "";
          students[userObj.uid] = profile;
          localStorage.setItem('cs_students', JSON.stringify(students));
        }
        updateAuthStore(userObj, profile, userObj.role, false);
      } catch (e) {
        localStorage.removeItem('cs_session');
        updateAuthStore(null, null, null, false);
      }
    } else {
      updateAuthStore(null, null, null, false);
    }
  } else {
    // Firebase Auth Observer
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Check role in firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const role = userDoc.data().role;
            let profile = null;
            if (role === 'student') {
              const studentDoc = await getDoc(doc(db, 'students', user.uid));
              if (studentDoc.exists()) {
                profile = studentDoc.data();
              }
            }
            updateAuthStore({ uid: user.uid, email: user.email, emailVerified: user.emailVerified }, profile, role, false);
          } else {
            // Default user role if not registered in firestore
            updateAuthStore({ uid: user.uid, email: user.email, emailVerified: user.emailVerified }, null, 'student', false);
          }
        } catch (error) {
          console.error("Auth state observer error:", error);
          updateAuthStore(user, null, null, false);
        }
      } else {
        updateAuthStore(null, null, null, false);
      }
    });
  }
}

export const authService = {
  async login(email, password) {
    if (isMockMode) {
      let users = {};
      try { users = JSON.parse(localStorage.getItem('cs_users') || '{}'); } catch(e) {}
      
      let matched = Object.values(users).find(u => u.email.toLowerCase() === email.toLowerCase());
      
      // Fallback matching if LocalStorage wasn't updated yet
      if (!matched) {
        if (email.toLowerCase().includes('student')) {
          matched = { uid: "student123", email: "student@careerready.ai", role: "student", name: "John Doe" };
        } else if (email.toLowerCase().includes('admin')) {
          matched = { uid: "admin123", email: "admin@careerready.ai", role: "admin", name: "System Administrator" };
        }
      }
      
      // Simple mock authentication (password >= 6 chars for dev)
      if (matched && password.length >= 6) {
        const userObj = { uid: matched.uid, email: matched.email, emailVerified: true, role: matched.role };
        localStorage.setItem('cs_session', JSON.stringify(userObj));
        
        let students = {};
        try { students = JSON.parse(localStorage.getItem('cs_students') || '{}'); } catch(e) {}
        
        let profile = matched.role === 'student' ? students[matched.uid] || null : null;
        if (matched.role === 'student' && !profile) {
          profile = {
            uid: matched.uid,
            name: matched.name || "John Doe",
            registerNumber: "2024MCA001",
            email: matched.email,
            department: "Master of Computer Applications (MCA)",
            year: 2,
            cgpa: 8.5,
            phone: "+91 9876543210",
            address: "123 Main Street, Tech City",
            links: { linkedin: "https://linkedin.com/in/johndoe", github: "https://github.com/johndoe", portfolio: "https://johndoe.dev" },
            careerGoal: "Full Stack AI Engineer",
            preferredLanguage: "en",
            profilePhotoUrl: "",
            readinessScore: 78,
            updatedAt: new Date().toISOString()
          };
        }
        updateAuthStore(userObj, profile, matched.role, false);
        return userObj;
      }
      throw new Error("Invalid credentials. Try student@careerready.ai or admin@careerready.ai with password 'password123'.");
    } else {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      // Wait for auth observer to update store
      return credential.user;
    }
  },

  async registerStudent(email, password, regDetails) {
    if (isMockMode) {
      const users = JSON.parse(localStorage.getItem('cs_users') || '{}');
      if (users[email]) {
        throw new Error("Email already registered.");
      }
      const uid = "stu_" + Math.random().toString(36).substr(2, 9);
      
      // Save user record
      users[email] = { uid, email, role: 'student', name: regDetails.name };
      localStorage.setItem('cs_users', JSON.stringify(users));

      // Save student profile record
      const students = JSON.parse(localStorage.getItem('cs_students') || '{}');
      const profile = {
        uid,
        email,
        name: regDetails.name,
        registerNumber: regDetails.registerNumber,
        department: regDetails.department,
        year: parseInt(regDetails.year) || 1,
        cgpa: parseFloat(regDetails.cgpa) || 0.0,
        phone: regDetails.phone || "",
        address: regDetails.address || "",
        links: { linkedin: "", github: "", portfolio: "" },
        careerGoal: "",
        preferredLanguage: "en",
        profilePhotoUrl: "",
        readinessScore: 35, // starting base score
        updatedAt: new Date().toISOString()
      };
      students[uid] = profile;
      localStorage.setItem('cs_students', JSON.stringify(students));

      const userObj = { uid, email, emailVerified: true, role: 'student' };
      localStorage.setItem('cs_session', JSON.stringify(userObj));
      updateAuthStore(userObj, profile, 'student', false);

      // Trigger Welcome Registration Email
      try {
        await emailService.sendRegistrationEmail(email, regDetails.name, regDetails, uid);
      } catch (e) {
        console.error("Failed to send welcome email:", e);
      }

      return userObj;
    } else {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = credential.user.uid;

      // 1. Create root user doc
      await setDoc(doc(db, 'users', uid), {
        uid,
        email,
        role: 'student',
        createdAt: new Date()
      });

      // 2. Create student profile doc
      const profile = {
        uid,
        email,
        name: regDetails.name,
        registerNumber: regDetails.registerNumber,
        department: regDetails.department,
        year: parseInt(regDetails.year) || 1,
        cgpa: parseFloat(regDetails.cgpa) || 0.0,
        phone: regDetails.phone || "",
        address: regDetails.address || "",
        links: { linkedin: "", github: "", portfolio: "" },
        careerGoal: "",
        preferredLanguage: "en",
        profilePhotoUrl: "",
        readinessScore: 35,
        updatedAt: new Date()
      };
      await setDoc(doc(db, 'students', uid), profile);
      
      // 3. Send email verification and welcome email
      await sendEmailVerification(credential.user);
      try {
        await emailService.sendRegistrationEmail(email, regDetails.name, regDetails, uid);
      } catch (e) {
        console.error("Failed to send welcome email:", e);
      }

      return credential.user;
    }
  },

  async logout() {
    if (isMockMode) {
      localStorage.removeItem('cs_session');
      updateAuthStore(null, null, null, false);
      return;
    } else {
      await fbSignOut(auth);
    }
  },

  async forgotPassword(email) {
    if (isMockMode) {
      console.log("Mock password reset email sent to:", email);
      return;
    } else {
      await sendPasswordResetEmail(auth, email);
    }
  },

  async sendVerification() {
    if (isMockMode) {
      console.log("Mock verification email sent.");
      return;
    } else if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  }
};
