// utils/api.js
import axios from 'axios';
import { API_URL } from '../config';

// Fix: Remove duplicate /api/dashboard in the URL
const API_BASE = API_URL || 'http://192.168.29.3:5000'; 

export const fetchCourseDetail = async (courseCode) => {
  try {
    const response = await axios.get(`${API_BASE}/api/dashboard/course/${courseCode}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course detail:', error);
    throw error;
  }
};

export const fetchDashboardOverview = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/dashboard/overview`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    throw error;
  }
};

export const fetchPGPSummary = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/dashboard/pgp-summary`);
    console.log('PGP Summary API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching PGP summary:', error);
    throw error;
  }
};

export const fetchPhDSummary = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/dashboard/phd-summary`);
    console.log('PhD Summary API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching PhD summary:', error);
    throw error;
  }
};

export const fetchEPhDSummary = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/dashboard/ephd-summary`);
    console.log('EPhD Summary API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching EPhD summary:', error);
    throw error;
  }
};

// Fix: Update endpoint from ema-summary to emba-summary to match backend
export const fetchEMBASummary = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/dashboard/emba-summary`);
    console.log('EMBA Summary API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching EMBA summary:', error);
    throw error;
  }
};