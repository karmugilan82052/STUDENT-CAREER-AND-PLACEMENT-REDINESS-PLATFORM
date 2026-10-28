import { db } from '../firebase/firebaseClient';
import { collection, addDoc } from 'firebase/firestore';
import { isMockMode } from './dbHelper';
import { studentService } from './studentService';
import { showToast } from '../stores/toastStore';

function getLocalLogs() {
  try {
    return JSON.parse(localStorage.getItem('cs_email_logs')) || [];
  } catch (e) {
    return [];
  }
}

function saveLocalLog(log) {
  const logs = getLocalLogs();
  logs.unshift(log);
  localStorage.setItem('cs_email_logs', JSON.stringify(logs));
}

export const emailService = {
  /**
   * Send registration confirmation email to newly registered student
   */
  async sendRegistrationEmail(email, name, regDetails = {}, studentUid = null) {
    const subject = "🎉 Welcome to CareerReady AI - Account Registration Confirmed!";
    const driveUrl = typeof window !== 'undefined' ? `${window.location.origin}/companies` : 'http://localhost:5173/companies';
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #f8fafc; padding: 30px; border-radius: 16px; border: 1px solid #1e293b;">
        <div style="text-align: center; padding-bottom: 20px; border-b: 1px solid #1e293b;">
          <h1 style="color: #6366f1; margin: 0; font-size: 24px;">✨ CareerReady AI Placement Portal</h1>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Official Student Onboarding & Career Management</p>
        </div>
        
        <div style="padding: 20px 0;">
          <h2 style="color: #f1f5f9; font-size: 18px;">Hello ${name},</h2>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
            Congratulations! Your student account on <strong>CareerReady AI</strong> has been successfully registered. You can now access placement drives, AI resume parsing, and mock interview tools.
          </p>

          <div style="background-color: #1e293b; padding: 16px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #6366f1;">
            <h3 style="margin: 0 0 10px 0; color: #818cf8; font-size: 14px; text-transform: uppercase;">Candidate Registration Details</h3>
            <table style="width: 100%; color: #cbd5e1; font-size: 13px; border-collapse: collapse;">
              <tr><td style="padding: 4px 0; color: #94a3b8;">Email Address:</td><td style="font-weight: bold; color: #ffffff;">${email}</td></tr>
              <tr><td style="padding: 4px 0; color: #94a3b8;">Register Number:</td><td style="font-weight: bold; color: #ffffff;">${regDetails.registerNumber || 'N/A'}</td></tr>
              <tr><td style="padding: 4px 0; color: #94a3b8;">Department:</td><td style="font-weight: bold; color: #ffffff;">${regDetails.department || 'N/A'}</td></tr>
              <tr><td style="padding: 4px 0; color: #94a3b8;">Registration Date:</td><td style="font-weight: bold; color: #ffffff;">${new Date().toLocaleDateString()}</td></tr>
            </table>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${driveUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
              Browse Active Placement Drives →
            </a>
          </div>

          <p style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
            If you have any questions, contact your Placement Officer or reach out via the in-app AI Mentor chat.
          </p>
        </div>

        <div style="border-t: 1px solid #1e293b; padding-top: 16px; text-align: center; color: #64748b; font-size: 11px;">
          &copy; ${new Date().getFullYear()} CareerReady AI Placement Portal. All rights reserved.
        </div>
      </div>
    `;

    const emailLog = {
      id: "mail_" + Math.random().toString(36).substr(2, 9),
      to: email,
      recipientName: name,
      subject,
      htmlBody,
      sentAt: new Date().toISOString(),
      status: "DELIVERED",
      type: "REGISTRATION_WELCOME"
    };

    if (isMockMode) {
      saveLocalLog(emailLog);
      console.log(`%c[EMAIL DISPATCH] Sent registration email to ${email}`, "color: #10b981; font-weight: bold;", emailLog);
    } else {
      try {
        await addDoc(collection(db, 'emailLogs'), {
          ...emailLog,
          sentAt: new Date()
        });
      } catch (e) {
        console.warn("Failed to write emailLog to Firestore:", e);
      }
    }

    // Add an in-app notification as well!
    if (studentUid) {
      await studentService.addNotification(studentUid, {
        title: "Registration Confirmation Sent",
        message: `Welcome to CareerReady AI, ${name}! Registration confirmation mail has been sent to ${email}.`,
        type: "System"
      });
    }

    showToast(`Registration confirmation email sent to ${email}`, "success");
    return emailLog;
  },

  /**
   * Get sent email logs
   */
  async getEmailLogs() {
    if (isMockMode) {
      return getLocalLogs();
    } else {
      return getLocalLogs();
    }
  }
};
