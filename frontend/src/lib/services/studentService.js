import { auth, db, storage } from '../firebase/firebaseClient';
import { 
  doc, getDoc, setDoc, updateDoc, collection, 
  getDocs, query, where, addDoc, deleteDoc, orderBy 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { isMockMode } from './dbHelper';
import { authStore } from '../stores/authStore';
import { fetchNotifications } from '../stores/notificationStore';

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  placementDrives: true,
  interviewSchedules: true,
  applicationDeadlines: true,
  dailyAiReminders: false,
  resumeImprovements: true,
  skillGapRoadmaps: true,
  emailNotifications: true,
  inAppNotifications: true
};

// Local storage helpers
function getLocalItem(key, defaultVal = []) {
  try {
    return JSON.parse(localStorage.getItem(key)) || defaultVal;
  } catch (e) {
    return defaultVal;
  }
}
function setLocalItem(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

export const studentService = {
  // PROFILE OPERATIONS
  async getProfile(studentId) {
    if (isMockMode) {
      const students = getLocalItem('cs_students', {});
      return students[studentId] || null;
    } else {
      const snap = await getDoc(doc(db, 'students', studentId));
      return snap.exists() ? snap.data() : null;
    }
  },

  async updateProfile(studentId, profileData) {
    if (isMockMode) {
      const students = getLocalItem('cs_students', {});
      if (students[studentId]) {
        students[studentId] = { ...students[studentId], ...profileData, updatedAt: new Date().toISOString() };
        setLocalItem('cs_students', students);
        
        // Dynamic re-score on CGPA change
        if (profileData.cgpa) {
          await this.recalculateReadinessScore(studentId);
        }
        
        // Sync store profile
        authStore.update(s => ({ ...s, profile: students[studentId] }));
        return students[studentId];
      }
      return null;
    } else {
      const studentRef = doc(db, 'students', studentId);
      const data = { ...profileData, updatedAt: new Date() };
      await updateDoc(studentRef, data);
      
      if (profileData.cgpa) {
        await this.recalculateReadinessScore(studentId);
      }
      
      const snap = await getDoc(studentRef);
      const freshProfile = snap.data();
      authStore.update(s => ({ ...s, profile: freshProfile }));
      return freshProfile;
    }
  },

  async uploadProfilePhoto(studentId, fileBlob) {
    let fileUrl = "";
    if (isMockMode) {
      fileUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64Image = e.target.result;
          resolve(base64Image);
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(fileBlob);
      });
    } else {
      const fileRef = ref(storage, `ProfilePhotos/${studentId}/${Date.now()}_profile.jpg`);
      const uploadSnap = await uploadBytes(fileRef, fileBlob);
      fileUrl = await getDownloadURL(uploadSnap.ref);
    }

    await this.updateProfile(studentId, { profilePhotoUrl: fileUrl });

    // Sync to Firebase Authentication currentUser if available
    if (!isMockMode && auth.currentUser) {
      try {
        const { updateProfile } = await import('firebase/auth');
        await updateProfile(auth.currentUser, { photoURL: fileUrl });
      } catch (e) {
        console.warn("Could not sync photoURL to Firebase Auth:", e);
      }
    }

    return fileUrl;
  },

  async removeProfilePhoto(studentId) {
    await this.updateProfile(studentId, { profilePhotoUrl: "" });
    if (!isMockMode && auth.currentUser) {
      try {
        const { updateProfile } = await import('firebase/auth');
        await updateProfile(auth.currentUser, { photoURL: "" });
      } catch (e) {
        console.warn("Could not clear photoURL in Firebase Auth:", e);
      }
    }
    return "";
  },

  async getNotificationPreferences(studentId) {
    const profile = await this.getProfile(studentId);
    return {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...(profile?.notificationPreferences || {})
    };
  },

  async updateNotificationPreferences(studentId, preferences) {
    const merged = {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...preferences
    };
    await this.updateProfile(studentId, { notificationPreferences: merged });
    return merged;
  },

  // SKILLS OPERATIONS
  async getSkills(studentId) {
    if (isMockMode) {
      const skillsDb = getLocalItem('cs_skills', {});
      return skillsDb[studentId] || { studentId, categories: { programming: [], database: [], cloud: [], ai: [], softSkills: [] } };
    } else {
      const snap = await getDoc(doc(db, 'skills', studentId));
      if (snap.exists()) {
        return snap.data();
      }
      return { studentId, categories: { programming: [], database: [], cloud: [], ai: [], softSkills: [] } };
    }
  },

  async saveSkills(studentId, categories) {
    const data = { studentId, categories, updatedAt: isMockMode ? new Date().toISOString() : new Date() };
    if (isMockMode) {
      const skillsDb = getLocalItem('cs_skills', {});
      skillsDb[studentId] = data;
      setLocalItem('cs_skills', skillsDb);
      await this.recalculateReadinessScore(studentId);
      return data;
    } else {
      await setDoc(doc(db, 'skills', studentId), data);
      await this.recalculateReadinessScore(studentId);
      return data;
    }
  },

  // PROJECTS OPERATIONS
  async getProjects(studentId) {
    if (isMockMode) {
      const projects = getLocalItem('cs_projects', []);
      return projects.filter(p => p.studentId === studentId);
    } else {
      const q = query(collection(db, 'projects'), where('studentId', '==', studentId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  },

  async addProject(studentId, project) {
    if (isMockMode) {
      const projects = getLocalItem('cs_projects', []);
      const newProj = {
        id: "proj_" + Math.random().toString(36).substr(2, 9),
        studentId,
        ...project,
        createdAt: new Date().toISOString()
      };
      projects.push(newProj);
      setLocalItem('cs_projects', projects);
      await this.recalculateReadinessScore(studentId);
      return newProj;
    } else {
      const data = { studentId, ...project, createdAt: new Date() };
      const docRef = await addDoc(collection(db, 'projects'), data);
      await this.recalculateReadinessScore(studentId);
      return { id: docRef.id, ...data };
    }
  },

  async deleteProject(studentId, projectId) {
    if (isMockMode) {
      let projects = getLocalItem('cs_projects', []);
      projects = projects.filter(p => p.id !== projectId);
      setLocalItem('cs_projects', projects);
      await this.recalculateReadinessScore(studentId);
    } else {
      await deleteDoc(doc(db, 'projects', projectId));
      await this.recalculateReadinessScore(studentId);
    }
  },

  // CERTIFICATIONS OPERATIONS
  async getCertifications(studentId) {
    if (isMockMode) {
      const certs = getLocalItem('cs_certifications', []);
      return certs.filter(c => c.studentId === studentId);
    } else {
      const q = query(collection(db, 'certifications'), where('studentId', '==', studentId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  },

  async addCertification(studentId, cert, fileBlob = null) {
    let fileUrl = cert.fileUrl || "https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=300&h=200&fit=crop";
    
    if (fileBlob && !isMockMode) {
      const fileRef = ref(storage, `Certificates/${studentId}/${Date.now()}_${cert.name}.pdf`);
      const uploadSnap = await uploadBytes(fileRef, fileBlob);
      fileUrl = await getDownloadURL(uploadSnap.ref);
    } else if (fileBlob && isMockMode) {
      // Create a mock download link
      fileUrl = "mock-certificate-url";
    }

    const data = {
      studentId,
      name: cert.name,
      issuer: cert.issuer,
      issueDate: cert.issueDate,
      expiryDate: cert.expiryDate || "N/A",
      fileUrl,
      createdAt: isMockMode ? new Date().toISOString() : new Date()
    };

    if (isMockMode) {
      const certs = getLocalItem('cs_certifications', []);
      const newCert = { id: "cert_" + Math.random().toString(36).substr(2, 9), ...data };
      certs.push(newCert);
      setLocalItem('cs_certifications', certs);
      await this.recalculateReadinessScore(studentId);
      return newCert;
    } else {
      const docRef = await addDoc(collection(db, 'certifications'), data);
      await this.recalculateReadinessScore(studentId);
      return { id: docRef.id, ...data };
    }
  },

  async deleteCertification(studentId, certId) {
    if (isMockMode) {
      let certs = getLocalItem('cs_certifications', []);
      certs = certs.filter(c => c.id !== certId);
      setLocalItem('cs_certifications', certs);
      await this.recalculateReadinessScore(studentId);
    } else {
      // In production, we'd also delete the storage file if applicable
      await deleteDoc(doc(db, 'certifications', certId));
      await this.recalculateReadinessScore(studentId);
    }
  },

  // RESUMES OPERATIONS
  async getResumes(studentId) {
    if (isMockMode) {
      const resumes = getLocalItem('cs_resumes', []);
      return resumes.filter(r => r.studentId === studentId);
    } else {
      const q = query(collection(db, 'resumes'), where('studentId', '==', studentId), orderBy('uploadedAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  },

  async uploadResume(studentId, fileName, fileBlob) {
    let fileUrl = "#";
    let storagePath = "";
    
    if (!isMockMode) {
      storagePath = `ResumeFiles/${studentId}/${Date.now()}_${fileName}`;
      const fileRef = ref(storage, storagePath);
      const uploadSnap = await uploadBytes(fileRef, fileBlob);
      fileUrl = await getDownloadURL(uploadSnap.ref);
    } else {
      fileUrl = "mock-resume-download-url";
      storagePath = `ResumeFiles/mock/${fileName}`;
    }

    // Set other resumes as non-primary
    if (isMockMode) {
      let resumes = getLocalItem('cs_resumes', []);
      resumes = resumes.map(r => r.studentId === studentId ? { ...r, isPrimary: false } : r);
      
      const newResume = {
        id: "res_" + Math.random().toString(36).substr(2, 9),
        studentId,
        fileName,
        fileUrl,
        storagePath,
        uploadedAt: new Date().toISOString(),
        isPrimary: true
      };
      resumes.push(newResume);
      setLocalItem('cs_resumes', resumes);
      await this.recalculateReadinessScore(studentId);
      return newResume;
    } else {
      // We will perform Firestore writes
      // Set all existing resumes' isPrimary to false
      const resumesColl = collection(db, 'resumes');
      const q = query(resumesColl, where('studentId', '==', studentId));
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        if (d.data().isPrimary) {
          await updateDoc(doc(db, 'resumes', d.id), { isPrimary: false });
        }
      }

      const data = {
        studentId,
        fileName,
        fileUrl,
        storagePath,
        uploadedAt: new Date(),
        isPrimary: true
      };
      const docRef = await addDoc(collection(db, 'resumes'), data);
      await this.recalculateReadinessScore(studentId);
      return { id: docRef.id, ...data };
    }
  },

  async deleteResume(studentId, resumeId, storagePath) {
    if (isMockMode) {
      let resumes = getLocalItem('cs_resumes', []);
      resumes = resumes.filter(r => r.id !== resumeId);
      setLocalItem('cs_resumes', resumes);

      const analyses = getLocalItem('cs_resume_analysis', {});
      delete analyses[resumeId];
      setLocalItem('cs_resume_analysis', analyses);

      await this.recalculateReadinessScore(studentId);
    } else {
      // Delete storage file
      if (storagePath) {
        try {
          const fileRef = ref(storage, storagePath);
          await deleteObject(fileRef);
        } catch (e) {
          console.error("Storage delete error:", e);
        }
      }
      await deleteDoc(doc(db, 'resumes', resumeId));
      await deleteDoc(doc(db, 'resumeAnalysis', resumeId));
      await this.recalculateReadinessScore(studentId);
    }
  },

  async getResumeAnalysis(resumeId) {
    if (isMockMode) {
      const analyses = getLocalItem('cs_resume_analysis', {});
      return analyses[resumeId] || null;
    } else {
      const snap = await getDoc(doc(db, 'resumeAnalysis', resumeId));
      return snap.exists() ? snap.data() : null;
    }
  },

  // COMPANIES & APPLICATIONS
  async getCompanies(studentId) {
    // Return all companies from DB
    if (isMockMode) {
      return getLocalItem('cs_companies', []);
    } else {
      const snap = await getDocs(collection(db, 'companies'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  },

  async getApplications(studentId) {
    if (isMockMode) {
      const apps = getLocalItem('cs_applications', []);
      return apps.filter(a => a.studentId === studentId);
    } else {
      const q = query(collection(db, 'applications'), where('studentId', '==', studentId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  },

  async applyToCompany(studentId, companyId) {
    if (isMockMode) {
      const apps = getLocalItem('cs_applications', []);
      const exists = apps.find(a => a.studentId === studentId && a.companyId === companyId);
      if (exists) return exists;

      const newApp = {
        id: "app_" + Math.random().toString(36).substr(2, 9),
        studentId,
        companyId,
        status: "Applied",
        appliedDate: new Date().toISOString()
      };
      apps.push(newApp);
      setLocalItem('cs_applications', apps);

      // Trigger placement application notification
      const companies = getLocalItem('cs_companies', []);
      const company = companies.find(c => c.id === companyId);
      await this.addNotification(studentId, {
        title: "Application Submitted",
        message: `You have successfully applied to ${company ? company.name : 'Company'}. Keep checking for schedule updates.`,
        type: "Company"
      });

      return newApp;
    } else {
      // Query if already exists
      const q = query(collection(db, 'applications'), where('studentId', '==', studentId), where('companyId', '==', companyId));
      const checkSnap = await getDocs(q);
      if (!checkSnap.empty) {
        return { id: checkSnap.docs[0].id, ...checkSnap.docs[0].data() };
      }

      const data = {
        studentId,
        companyId,
        status: "Applied",
        appliedDate: new Date()
      };
      const docRef = await addDoc(collection(db, 'applications'), data);

      const compSnap = await getDoc(doc(db, 'companies', companyId));
      const compName = compSnap.exists() ? compSnap.data().name : 'Company';

      await addDoc(collection(db, 'notifications'), {
        recipientId: studentId,
        title: "Application Submitted",
        message: `You have successfully applied to ${compName}. Keep checking for schedule updates.`,
        type: "Company",
        read: false,
        createdAt: new Date()
      });

      return { id: docRef.id, ...data };
    }
  },

  // NOTIFICATIONS
  async getNotifications(studentId) {
    if (isMockMode) {
      const notifs = getLocalItem('cs_notifications', []);
      return notifs.filter(n => n.recipientId === studentId || n.recipientId === 'all')
                   .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      const q1 = query(collection(db, 'notifications'), where('recipientId', '==', studentId), orderBy('createdAt', 'desc'));
      const q2 = query(collection(db, 'notifications'), where('recipientId', '==', 'all'), orderBy('createdAt', 'desc'));
      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      
      const res = [
        ...snap1.docs.map(d => ({ id: d.id, ...d.data() })),
        ...snap2.docs.map(d => ({ id: d.id, ...d.data() }))
      ];
      return res.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
    }
  },

  async markNotificationRead(notifId, studentId = null) {
    if (isMockMode) {
      let notifs = getLocalItem('cs_notifications', []);
      notifs = notifs.map(n => n.id === notifId ? { ...n, read: true } : n);
      setLocalItem('cs_notifications', notifs);
    } else {
      await updateDoc(doc(db, 'notifications', notifId), { read: true });
    }
    if (studentId) {
      await fetchNotifications(studentId);
    }
  },

  async addNotification(recipientId, notification) {
    // Check recipient's notification preferences before dispatching
    if (recipientId && recipientId !== 'all') {
      const profile = await this.getProfile(recipientId);
      const prefs = {
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        ...(profile?.notificationPreferences || {})
      };

      if (prefs.inAppNotifications === false) {
        return null; // Student opted out of in-app notifications
      }

      if (notification.type === 'Placement' && prefs.placementDrives === false) {
        return null;
      }
      if (notification.type === 'Interview' && prefs.interviewSchedules === false) {
        return null;
      }
      if (notification.type === 'Reminder' && prefs.dailyAiReminders === false) {
        return null;
      }
    }

    const data = {
      recipientId,
      title: notification.title,
      message: notification.message,
      type: notification.type || "Reminder",
      read: false,
      createdAt: isMockMode ? new Date().toISOString() : new Date()
    };
    let res;
    if (isMockMode) {
      const notifs = getLocalItem('cs_notifications', []);
      const newNotif = { id: "notif_" + Math.random().toString(36).substr(2, 9), ...data };
      notifs.push(newNotif);
      setLocalItem('cs_notifications', notifs);
      res = newNotif;
    } else {
      const docRef = await addDoc(collection(db, 'notifications'), data);
      res = { id: docRef.id, ...data };
    }
    if (recipientId && recipientId !== 'all') {
      await fetchNotifications(recipientId);
    }
    return res;
  },

  // READINESS SCORE ENGINE
  async recalculateReadinessScore(studentId) {
    // Readiness parameters:
    // 1. CGPA (20%): out of 10. (CGPA / 10) * 20
    // 2. Resume (20%): primary resume score. If no resume, 0. If analyzed, (score/100)*20.
    // 3. Skills (20%): count of skills. Let's say 8+ skills of high ratings gives full 20.
    // 4. Projects (20%): each project gives 7% (max 20%).
    // 5. Certifications (10%): each gives 5% (max 10%).
    // 6. Mock Interview (10%): average score of mock interviews.
    
    let cgpa = 0.0;
    let resumeScore = 0;
    let skillScore = 0;
    let projectScore = 0;
    let certScore = 0;
    let interviewScore = 0;

    if (isMockMode) {
      const students = getLocalItem('cs_students', {});
      const profile = students[studentId];
      if (!profile) return;

      cgpa = profile.cgpa || 0.0;
      
      const resumes = getLocalItem('cs_resumes', []).filter(r => r.studentId === studentId);
      const primaryResume = resumes.find(r => r.isPrimary);
      if (primaryResume) {
        const analyses = getLocalItem('cs_resume_analysis', {});
        const analysis = analyses[primaryResume.id];
        resumeScore = analysis ? analysis.atsScore : 50; // default to 50 if uploaded but not fully analyzed
      }

      const skillsDb = getLocalItem('cs_skills', {});
      const skillsObj = skillsDb[studentId];
      if (skillsObj) {
        let totalSkillsCount = 0;
        let sumRating = 0;
        Object.values(skillsObj.categories).forEach(arr => {
          totalSkillsCount += arr.length;
          arr.forEach(s => sumRating += (s.rating || 50));
        });
        if (totalSkillsCount > 0) {
          const avg = sumRating / totalSkillsCount;
          skillScore = Math.min(20, (totalSkillsCount * 1.5) + (avg / 10)); // compound count & avg rating
        }
      }

      const projects = getLocalItem('cs_projects', []).filter(p => p.studentId === studentId);
      projectScore = Math.min(20, projects.length * 7);

      const certs = getLocalItem('cs_certifications', []).filter(c => c.studentId === studentId);
      certScore = Math.min(10, certs.length * 5);

      const interviews = getLocalItem('cs_interviews', []).filter(i => i.studentId === studentId && i.status === 'Completed');
      if (interviews.length > 0) {
        const sum = interviews.reduce((a, b) => a + (b.evaluation?.score || 0), 0);
        interviewScore = (sum / interviews.length) * 0.1; // scale 100 to 10 max
      } else {
        interviewScore = 0;
      }

      const overall = Math.round(
        ((cgpa / 10) * 20) + 
        ((resumeScore / 100) * 20) + 
        skillScore + 
        projectScore + 
        certScore + 
        interviewScore
      );

      profile.readinessScore = Math.max(10, Math.min(100, overall));
      students[studentId] = profile;
      setLocalItem('cs_students', students);
      authStore.update(s => ({ ...s, profile }));
    } else {
      // Firebase actual calculations
      const profileSnap = await getDoc(doc(db, 'students', studentId));
      if (!profileSnap.exists()) return;
      cgpa = profileSnap.data().cgpa || 0.0;

      const resSnap = await getDocs(query(collection(db, 'resumes'), where('studentId', '==', studentId)));
      const primaryRes = resSnap.docs.find(d => d.data().isPrimary);
      if (primaryRes) {
        const analysisSnap = await getDoc(doc(db, 'resumeAnalysis', primaryRes.id));
        resumeScore = analysisSnap.exists() ? analysisSnap.data().atsScore : 50;
      }

      const skillSnap = await getDoc(doc(db, 'skills', studentId));
      if (skillSnap.exists()) {
        let count = 0;
        let sumRating = 0;
        const cats = skillSnap.data().categories || {};
        Object.values(cats).forEach(arr => {
          if (Array.isArray(arr)) {
            count += arr.length;
            arr.forEach(s => sumRating += (s.rating || 50));
          }
        });
        if (count > 0) {
          skillScore = Math.min(20, (count * 1.5) + ((sumRating / count) / 10));
        }
      }

      const projSnap = await getDocs(query(collection(db, 'projects'), where('studentId', '==', studentId)));
      projectScore = Math.min(20, projSnap.docs.length * 7);

      const certSnap = await getDocs(query(collection(db, 'certifications'), where('studentId', '==', studentId)));
      certScore = Math.min(10, certSnap.docs.length * 5);

      const interviewSnap = await getDocs(query(collection(db, 'interviews'), where('studentId', '==', studentId), where('status', '==', 'Completed')));
      if (!interviewSnap.empty) {
        const sum = interviewSnap.docs.reduce((a, b) => a + (b.data().evaluation?.score || 0), 0);
        interviewScore = (sum / interviewSnap.docs.length) * 0.1;
      }

      const overall = Math.round(
        ((cgpa / 10) * 20) + 
        ((resumeScore / 100) * 20) + 
        skillScore + 
        projectScore + 
        certScore + 
        interviewScore
      );

      await updateDoc(doc(db, 'students', studentId), {
        readinessScore: Math.max(10, Math.min(100, overall)),
        updatedAt: new Date()
      });

      const updatedSnap = await getDoc(doc(db, 'students', studentId));
      authStore.update(s => ({ ...s, profile: updatedSnap.data() }));
    }
  },

  // DATA EXPORT & ACCOUNT MANAGEMENT
  async exportStudentData(studentId) {
    const [profile, skills, projects, certifications, resumes, applications, notifications] = await Promise.all([
      this.getProfile(studentId),
      this.getSkills(studentId),
      this.getProjects(studentId),
      this.getCertifications(studentId),
      this.getResumes(studentId),
      this.getApplications(studentId),
      this.getNotifications(studentId)
    ]);

    return {
      exportedAt: new Date().toISOString(),
      studentId,
      profile,
      skills,
      projects,
      certifications,
      resumes: (resumes || []).map(r => ({
        id: r.id,
        fileName: r.fileName,
        uploadedAt: r.uploadedAt,
        isPrimary: r.isPrimary
      })),
      applications,
      notificationsCount: (notifications || []).length
    };
  },

  async deleteAccount(studentId) {
    if (isMockMode) {
      // 1. Remove from local storage records
      const users = getLocalItem('cs_users', {});
      const matchedEmail = Object.keys(users).find(k => users[k].uid === studentId);
      if (matchedEmail) delete users[matchedEmail];
      setLocalItem('cs_users', users);

      const students = getLocalItem('cs_students', {});
      delete students[studentId];
      setLocalItem('cs_students', students);

      const skillsDb = getLocalItem('cs_skills', {});
      delete skillsDb[studentId];
      setLocalItem('cs_skills', skillsDb);

      let projects = getLocalItem('cs_projects', []);
      setLocalItem('cs_projects', projects.filter(p => p.studentId !== studentId));

      let certs = getLocalItem('cs_certifications', []);
      setLocalItem('cs_certifications', certs.filter(c => c.studentId !== studentId));

      let resumes = getLocalItem('cs_resumes', []);
      setLocalItem('cs_resumes', resumes.filter(r => r.studentId !== studentId));

      let apps = getLocalItem('cs_applications', []);
      setLocalItem('cs_applications', apps.filter(a => a.studentId !== studentId));

      let notifs = getLocalItem('cs_notifications', []);
      setLocalItem('cs_notifications', notifs.filter(n => n.recipientId !== studentId));

      localStorage.removeItem('cs_session');
      authStore.set({ user: null, profile: null, role: null, loading: false });
      return true;
    } else {
      // 1. Delete student doc
      await deleteDoc(doc(db, 'students', studentId));
      await deleteDoc(doc(db, 'users', studentId));
      await deleteDoc(doc(db, 'skills', studentId));

      // 2. Delete resumes & storage
      const resumesSnap = await getDocs(query(collection(db, 'resumes'), where('studentId', '==', studentId)));
      for (const d of resumesSnap.docs) {
        const path = d.data().storagePath;
        if (path) {
          try { await deleteObject(ref(storage, path)); } catch (e) {}
        }
        await deleteDoc(doc(db, 'resumes', d.id));
      }

      // 3. Delete Firebase Auth user if current
      if (auth.currentUser && auth.currentUser.uid === studentId) {
        const { deleteUser } = await import('firebase/auth');
        await deleteUser(auth.currentUser);
      }

      authStore.set({ user: null, profile: null, role: null, loading: false });
      return true;
    }
  }
};
