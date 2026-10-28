import { db } from '../firebase/firebaseClient';
import { 
  collection, getDocs, doc, setDoc, updateDoc, 
  deleteDoc, addDoc, getDoc, query, where, orderBy 
} from 'firebase/firestore';
import { isMockMode } from './dbHelper';

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

export const adminService = {
  // MANAGE STUDENTS
  async getAllStudents() {
    if (isMockMode) {
      const students = getLocalItem('cs_students', {});
      return Object.values(students);
    } else {
      const snap = await getDocs(collection(db, 'students'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  },

  async getStudentDetails(studentId) {
    if (isMockMode) {
      const students = getLocalItem('cs_students', {});
      const profile = students[studentId] || null;
      if (!profile) return null;

      const skillsDb = getLocalItem('cs_skills', {});
      const skills = skillsDb[studentId] || { categories: { programming: [], database: [], cloud: [], ai: [], softSkills: [] } };

      const projects = getLocalItem('cs_projects', []).filter(p => p.studentId === studentId);
      const certs = getLocalItem('cs_certifications', []).filter(c => c.studentId === studentId);
      const resumes = getLocalItem('cs_resumes', []).filter(r => r.studentId === studentId);

      return { profile, skills, projects, certs, resumes };
    } else {
      const profileSnap = await getDoc(doc(db, 'students', studentId));
      if (!profileSnap.exists()) return null;

      const skillsSnap = await getDoc(doc(db, 'skills', studentId));
      const skills = skillsSnap.exists() ? skillsSnap.data() : { categories: { programming: [], database: [], cloud: [], ai: [], softSkills: [] } };

      const projSnap = await getDocs(query(collection(db, 'projects'), where('studentId', '==', studentId)));
      const projects = projSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const certSnap = await getDocs(query(collection(db, 'certifications'), where('studentId', '==', studentId)));
      const certs = certSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const resSnap = await getDocs(query(collection(db, 'resumes'), where('studentId', '==', studentId)));
      const resumes = resSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      return { profile: profileSnap.data(), skills, projects, certs, resumes };
    }
  },

  // MANAGE COMPANIES
  async addCompany(company) {
    const data = {
      name: company.name,
      logoUrl: company.logoUrl || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop",
      package: parseFloat(company.package) || 0.0,
      location: company.location,
      eligibility: {
        minCgpa: parseFloat(company.eligibility?.minCgpa) || 0.0,
        departments: company.eligibility?.departments || [],
        requiredSkills: company.eligibility?.requiredSkills || []
      },
      bond: company.bond || "None",
      driveDate: company.driveDate,
      jobDescription: company.jobDescription,
      createdAt: isMockMode ? new Date().toISOString() : new Date()
    };

    if (isMockMode) {
      const companies = getLocalItem('cs_companies', []);
      const newCompany = { id: "comp_" + Math.random().toString(36).substr(2, 9), ...data };
      companies.push(newCompany);
      setLocalItem('cs_companies', companies);
      
      // Trigger global notification for new company drive
      await this.broadcastNotification({
        title: `New Placement Drive: ${company.name}`,
        message: `Package: ${company.package} LPA | Eligibility: CGPA >= ${company.eligibility?.minCgpa || 6.0}. Register/apply from the drives page.`,
        type: "Placement"
      });

      return newCompany;
    } else {
      const docRef = await addDoc(collection(db, 'companies'), data);
      
      // Add global notification doc
      await addDoc(collection(db, 'notifications'), {
        recipientId: 'all',
        title: `New Placement Drive: ${company.name}`,
        message: `Package: ${company.package} LPA | Eligibility: CGPA >= ${company.eligibility?.minCgpa || 6.0}. Register/apply from the drives page.`,
        type: "Placement",
        read: false,
        createdAt: new Date()
      });

      return { id: docRef.id, ...data };
    }
  },

  async updateCompany(companyId, companyDetails) {
    if (isMockMode) {
      const companies = getLocalItem('cs_companies', []);
      const idx = companies.findIndex(c => c.id === companyId);
      if (idx !== -1) {
        companies[idx] = { ...companies[idx], ...companyDetails };
        setLocalItem('cs_companies', companies);
        return companies[idx];
      }
      return null;
    } else {
      const ref = doc(db, 'companies', companyId);
      await updateDoc(ref, companyDetails);
      const snap = await getDoc(ref);
      return snap.data();
    }
  },

  async deleteCompany(companyId) {
    if (isMockMode) {
      let companies = getLocalItem('cs_companies', []);
      companies = companies.filter(c => c.id !== companyId);
      setLocalItem('cs_companies', companies);

      let apps = getLocalItem('cs_applications', []);
      apps = apps.filter(a => a.companyId !== companyId);
      setLocalItem('cs_applications', apps);
    } else {
      await deleteDoc(doc(db, 'companies', companyId));
      
      // Also delete corresponding student applications
      const q = query(collection(db, 'applications'), where('companyId', '==', companyId));
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        await deleteDoc(doc(db, 'applications', d.id));
      }
    }
  },

  // APPLICATIONS OVERVIEW
  async getAllApplications() {
    if (isMockMode) {
      return getLocalItem('cs_applications', []);
    } else {
      const snap = await getDocs(collection(db, 'applications'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  },

  async updateApplicationStatus(applicationId, status) {
    if (isMockMode) {
      const apps = getLocalItem('cs_applications', []);
      const idx = apps.findIndex(a => a.id === applicationId);
      if (idx !== -1) {
        apps[idx].status = status;
        setLocalItem('cs_applications', apps);

        // Send alert notification to student
        const appObj = apps[idx];
        const companies = getLocalItem('cs_companies', []);
        const company = companies.find(c => c.id === appObj.companyId);
        
        await addDoc(collection(db, 'notifications'), {
          recipientId: appObj.studentId,
          title: `Application Status Updated`,
          message: `Your application status for ${company ? company.name : 'Company'} has been updated to: "${status}".`,
          type: "Company",
          read: false,
          createdAt: new Date().toISOString()
        });

        return apps[idx];
      }
      return null;
    } else {
      await updateDoc(doc(db, 'applications', applicationId), { status });
      const snap = await getDoc(doc(db, 'applications', applicationId));
      const appData = snap.data();

      const compSnap = await getDoc(doc(db, 'companies', appData.companyId));
      const compName = compSnap.exists() ? compSnap.data().name : 'Company';

      await addDoc(collection(db, 'notifications'), {
        recipientId: appData.studentId,
        title: `Application Status Updated`,
        message: `Your application status for ${compName} has been updated to: "${status}".`,
        type: "Company",
        read: false,
        createdAt: new Date()
      });

      return { id: snap.id, ...appData };
    }
  },

  // BROADCAST NOTIFICATION
  async broadcastNotification(notification) {
    const data = {
      recipientId: "all",
      title: notification.title,
      message: notification.message,
      type: notification.type || "Placement",
      read: false,
      createdAt: isMockMode ? new Date().toISOString() : new Date()
    };

    if (isMockMode) {
      const notifs = getLocalItem('cs_notifications', []);
      const newNotif = { id: "notif_" + Math.random().toString(36).substr(2, 9), ...data };
      notifs.push(newNotif);
      setLocalItem('cs_notifications', notifs);
      return newNotif;
    } else {
      const docRef = await addDoc(collection(db, 'notifications'), data);
      return { id: docRef.id, ...data };
    }
  },

  // GET STATISTICS AND ANALYTICS
  async getDashboardAnalytics() {
    const students = await this.getAllStudents();
    const companies = isMockMode ? getLocalItem('cs_companies', []) : (await getDocs(collection(db, 'companies'))).docs.map(d => d.data());
    const applications = isMockMode ? getLocalItem('cs_applications', []) : (await getDocs(collection(db, 'applications'))).docs.map(d => d.data());

    const totalStudents = students.length;
    const totalCompanies = companies.length;
    const totalApplications = applications.length;

    let totalScoreSum = 0;
    let placedCount = 0;
    let registeredCount = 0;

    const departmentScores = {};
    const departmentCounts = {};

    students.forEach(s => {
      totalScoreSum += s.readinessScore || 0;
      
      const dept = s.department || "Other";
      if (!departmentScores[dept]) {
        departmentScores[dept] = 0;
        departmentCounts[dept] = 0;
      }
      departmentScores[dept] += s.readinessScore || 0;
      departmentCounts[dept]++;
    });

    const deptAverages = {};
    Object.keys(departmentScores).forEach(dept => {
      deptAverages[dept] = Math.round(departmentScores[dept] / departmentCounts[dept]);
    });

    applications.forEach(a => {
      if (a.status === 'Placed') placedCount++;
      registeredCount++;
    });

    const averageReadiness = totalStudents > 0 ? Math.round(totalScoreSum / totalStudents) : 0;
    const placementRate = totalStudents > 0 ? Math.round((placedCount / totalStudents) * 100) : 0;

    // ATS distributions
    const atsRanges = { '90+': 0, '80-89': 0, '70-79': 0, '60-69': 0, '<60': 0 };
    let totalAts = 0;
    let analyzedResumes = 0;

    if (isMockMode) {
      const resumeAnalysis = getLocalItem('cs_resume_analysis', {});
      Object.values(resumeAnalysis).forEach(analysis => {
        const score = analysis.atsScore || 0;
        totalAts += score;
        analyzedResumes++;
        if (score >= 90) atsRanges['90+']++;
        else if (score >= 80) atsRanges['80-89']++;
        else if (score >= 70) atsRanges['70-79']++;
        else if (score >= 60) atsRanges['60-69']++;
        else atsRanges['<60']++;
      });
    } else {
      const snap = await getDocs(collection(db, 'resumeAnalysis'));
      snap.docs.forEach(d => {
        const score = d.data().atsScore || 0;
        totalAts += score;
        analyzedResumes++;
        if (score >= 90) atsRanges['90+']++;
        else if (score >= 80) atsRanges['80-89']++;
        else if (score >= 70) atsRanges['70-79']++;
        else if (score >= 60) atsRanges['60-69']++;
        else atsRanges['<60']++;
      });
    }

    const averageAts = analyzedResumes > 0 ? Math.round(totalAts / analyzedResumes) : 72; // default placeholder avg

    return {
      totalStudents,
      totalCompanies,
      totalApplications,
      placedCount,
      averageReadiness,
      placementRate,
      deptAverages,
      atsRanges,
      averageAts
    };
  }
};
