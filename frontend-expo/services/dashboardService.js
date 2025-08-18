  import { API_URL } from '../config';

class DashboardService {
  constructor() {
    this.baseURL = API_URL || 'http://localhost:5000';
  }

  async getDashboardOverview() {
    try {
      const response = await fetch(`${this.baseURL}/api/dashboard/overview`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      throw error;
    }
  }

  async getCourseDetails(courseCode) {
    try {
      const response = await fetch(`${this.baseURL}/api/dashboard/course/${courseCode}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching course details:', error);
      throw error;
    }
  }

  async getPhaseProgress(courseId, phaseId) {
    try {
      const response = await fetch(`${this.baseURL}/api/dashboard/courses/${courseId}/phases/${phaseId}/progress`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching phase progress:', error);
      throw error;
    }
  }

  async getSummaryStats() {
    try {
      const response = await fetch(`${this.baseURL}/api/dashboard/summary`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching summary stats:', error);
      throw error;
    }
  }

  // ✅ NEW METHOD for PGP Summary
  async getPGPSummary() {
    try {
      const response = await fetch(`${this.baseURL}/api/dashboard/pgp-summary`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching PGP summary:', error);
      throw error;
    }
  }
  
  // PhD Summary
  async getPhDSummary() {
    try {
      const response = await fetch(`${this.baseURL}/api/dashboard/phd-summary`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching PhD summary:', error);
      throw error;
    }
  }
  
  // EPhD Summary
  async getEPhDSummary() {
    try {
      const response = await fetch(`${this.baseURL}/api/dashboard/ephd-summary`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching EPhD summary:', error);
      throw error;
    }
  }
  
  // EMBA Summary
  async getEMBASummary() {
    try {
      const response = await fetch(`${this.baseURL}/api/dashboard/emba-summary`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching EMBA summary:', error);
      throw error;
    }
  }

  // Home Dashboard Summary
  async getHomeSummary() {
    try {
      const response = await fetch(`${this.baseURL}/api/dashboard/home-summary`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching home summary:', error);
      throw error;
    }
  }

  // Helper method to get course ID by course name
  getCourseIdByName(courseName) {
    const courseMapping = {
      'PGP': 1,
      'PhD': 2,
      'EPhD': 3,
      'EMBA': 4
    };
    return courseMapping[courseName] || 1;
  }

  // Helper method to get phase ID by course and phase name
  getPhaseIdByName(courseName, phaseName) {
    const phaseMapping = {
      'PGP': {
        'Phase 1': 1,
        'Phase 2a': 2,
        'Phase 2b': 3,
        'Phase 3': 4
      },
      'PhD': {
        'Phase 1': 5,
        'Phase 2': 6,
        'Phase 3': 7
      },
      'EPhD': {
        'Phase 1': 8,
        'Phase 2': 9,
        'Phase 3': 10
      },
      'EMBA': {
        'Phase 1': 11,
        'Phase 2': 12,
        'Phase 3': 13
      }
    };
    return phaseMapping[courseName]?.[phaseName] || 1;
  }

  // Get recent activities from notifications API
  async getRecentActivities() {
    try {
      const response = await fetch(`${this.baseURL}/api/notifications/recent-activities`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  }

  // Get important dates from notifications API
  async getImportantDates() {
    try {
      const response = await fetch(`${this.baseURL}/api/notifications/important-dates`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching important dates:', error);
      throw error;
    }
  }
}

export default new DashboardService();
