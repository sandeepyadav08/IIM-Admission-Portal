import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import dashboardService from '../services/dashboardService';

export default function CourseDashboard() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, isDark } = useTheme();
  const { courseName } = route.params;
  const insets = useSafeAreaInsets();

  // State for dynamic data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [overview, setOverview] = useState(null);

  // Different dashboard data based on course type
  const isPGP = courseName === 'PGP';

  // Fetch dashboard data on component mount
useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Overview is optional; we keep it
      const overviewData = await dashboardService.getDashboardOverview();
      setOverview(overviewData);

      // ✅ Use specific API endpoints for each course type
      let courseData;
      if (courseName === 'PGP') {
        courseData = await dashboardService.getPGPSummary();
      } else if (courseName === 'PhD') {
        courseData = await dashboardService.getPhDSummary();
      } else if (courseName === 'EPhD') {
        courseData = await dashboardService.getEPhDSummary();
      } else if (courseName === 'EMBA') {
        courseData = await dashboardService.getEMBASummary();
      } else {
        courseData = await dashboardService.getCourseDetails(courseName);
      }
      const transformedData = transformApiData(courseData, courseName);
      setDashboardData(transformedData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      setDashboardData(getDefaultDashboardData(courseName));
    } finally {
      setLoading(false);
    }
  };
  fetchDashboardData();
}, [courseName]);


  // Transform API data to match component structure
  const transformApiData = (apiData, courseName) => {
    // If no data or not in expected format, return default
    if (!apiData) {
      return getDefaultDashboardData(courseName);
    }

    // Handle different data structures based on course type
    if (courseName === 'PGP') {
      if (!apiData.phases) {
        // Handle PGP summary format
        return {
          phase3: {
            totalAcceptReject: { 
              count: `${apiData.phase3?.total_accepted || 0}/${apiData.phase3?.total_rejected || 0}`, 
              label: 'Total Accept/Reject' 
            },
            commitmentFee: { 
              count: apiData.phase3?.commitment_fee_paid || 0, 
              label: 'Commitment Fee' 
            },
            termFee: { 
              count: apiData.phase3?.term_fee_paid || 0, 
              label: 'Term Fee' 
            },
            acceptanceForm: { 
              count: apiData.phase3?.acceptance_form_submitted || 0, 
              label: 'Acceptance Form' 
            },
            withdrawal: {
              offeredWithdrawal: { 
                count: apiData.withdrawals?.total_withdrawals || 0, 
                label: 'Total Withdrawals' 
              },
              termWithdrawal: { count: 0, label: 'Term Withdrawal' },
              offeredForfeitedWithdrawn: { count: 0, label: 'Offered Forfeited Withdrawn' },
              offeredForfeitedNotWithdrawn: { count: 0, label: 'Offered Forfeited Not Withdrawn' }
            }
          },
          phase2b: {
            todayStats: {
              totalSlot: { 
                count: apiData.phase2b?.today_total_slots || 0, 
                label: 'Today Total Slot' 
              },
              totalStudents: { 
                count: apiData.phase2b?.today_total_students || 0, 
                label: 'Today Total Students' 
              },
              totalPresentStudents: { 
                count: apiData.phase2b?.present_students || 0, 
                label: 'Today Total Present Students' 
              },
              totalAbsentStudents: { 
                count: apiData.phase2b?.absent_students || 0, 
                label: 'Today Total Absent Students' 
              }
            }
          },
          phase2a: {
            availablePool: { count: 0, label: 'Available Pool for Phase 2(a)' },
            otherIIMs: { count: 0, label: 'Other IIMs(O)' },
            iimVisakhapatnam: { count: 0, label: 'IIM Visakhapatnam(V)' },
            totalWaitListed: { count: 0, label: 'Total Wait Listed' },
            totalConsentFormSubmit: { 
              count: apiData.phase2a?.total_consent_checks || 0, 
              label: 'Total Consent Form Submit' 
            },
            totalConsentRegret: { 
              count: apiData.phase2a?.total_consent_requests || 0, 
              label: 'Total Consent Requests' 
            }
          },
          verification: {
            reopen: { 
              count: apiData.verificationDetails?.reopen || 0, 
              label: 'Reopen' 
            },
            resubmitted: { 
              count: apiData.verificationDetails?.resubmitted || 0, 
              label: 'Resubmitted' 
            },
            autoSubmit: { 
              count: apiData.verificationDetails?.auto_submitted || 0, 
              label: 'Auto Submit' 
            }
          },
          phase1: {
            shortlistedStudents: { 
              count: apiData.phase1?.shortlisted_students || 0, 
              label: 'Shortlisted Students' 
            },
            registeredStudents: { 
              count: apiData.phase1?.registered_students || 0, 
              label: 'Registered Students' 
            },
            applicationFormSubmitted: { 
              count: apiData.phase1?.form_submitted || 0, 
              label: 'Application Form Submitted' 
            },
            reOpen: { 
              count: apiData.phase1?.reopened || 0, 
              label: 'Re Open' 
            },
            reSubmitted: { 
              count: apiData.phase1?.resubmitted || 0, 
              label: 'Re Submitted' 
            },
            notReSubmitted: { 
              count: apiData.phase1?.not_resubmitted || 0, 
              label: 'Not Re Submitted' 
            },
            totalApplication: { 
              count: apiData.phase1?.total_applications || 0, 
              label: 'Total Application' 
            }
          }
        };
      }
      
      // Handle standard format with phases
      const phases = apiData.phases;
      const transformedData = {};

      // Transform each phase data
      phases.forEach(phase => {
        const phaseName = phase.phase_name.toLowerCase().replace(/\s+/g, '');
        transformedData[phaseName] = {};
        
        // Transform statistics for this phase
        if (phase.statistics) {
          phase.statistics.forEach(stat => {
           const statKey = stat.metric_name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
            transformedData[phaseName][statKey] = {
              count: stat.value,
              label: stat.metric_name
            };
          });
        }
      });

      return transformedData;
    } 
    else if (['PhD', 'EPhD', 'EMBA'].includes(courseName)) {
      // Handle PhD, EPhD, EMBA summary format
      return {
        phase3: {
          commitmentFee: { 
            count: apiData.phase3?.commitment_fee_paid || 0, 
            label: 'Commitment Fee' 
          }
        },
        phase2: {
          todayStats: {
            totalSlot: { 
              count: apiData.phase2?.today_total_slots || 0, 
              label: 'Today Total Slot' 
            },
            todayTotalStudents: { 
              count: apiData.phase2?.today_total_students || 0, 
              label: 'Today Total Students' 
            },
            todayTotalPresentStudents: { 
              count: apiData.phase2?.present_students || 0, 
              label: 'Today Total Present Students' 
            },
            todayTotalAbsentStudents: { 
              count: apiData.phase2?.absent_students || 0, 
              label: 'Today Total Absent Students' 
            },
            todayTotalPendingStudents: { 
              count: apiData.phase2?.pending_students || 0, 
              label: 'Today Total Pending Students' 
            }
          },
          overallStats: {
            totalSlot: { 
              count: apiData.phase2?.total_slots || 0, 
              label: 'Total Slot' 
            },
            totalStudents: { 
              count: apiData.phase2?.total_students || 0, 
              label: 'Total Students' 
            },
            totalPresentStudents: { 
              count: apiData.phase2?.total_present || 0, 
              label: 'Total Present Students' 
            },
            totalAbsentStudents: { 
              count: apiData.phase2?.total_absent || 0, 
              label: 'Total Absent Students' 
            },
            totalPendingStudents: { 
              count: apiData.phase2?.total_pending || 0, 
              label: 'Total Pending Students' 
            }
          }
        },
        phase1: {
          registrationList: { 
            count: apiData.phase1?.total_registrations || 0, 
            label: 'Registration List' 
          },
          totalApplicant: { 
            count: apiData.phase1?.total_applications || 0, 
            label: 'Total Applicant' 
          },
          applicantsSubmitted: { 
            count: apiData.phase1?.submitted_applications || 0, 
            label: 'No. of Applicants submitted' 
          },
          applicationsSubmittedAreaWise: { 
            count: apiData.phase1?.area_wise_applications?.length || 0, 
            label: 'No. of Applications submitted area-wise' 
          }
        }
      };
    }
    
    // Default case - return default data
    return getDefaultDashboardData(courseName);
  };

  // Fallback default data
  const getDefaultDashboardData = (courseName) => {
    if (courseName === 'PGP') {
      return {
        phase3: {
          totalAcceptReject: { count: '0/0', label: 'Total Accept/Reject' },
          commitmentFee: { count: 0, label: 'Commitment Fee' },
          termFee: { count: 0, label: 'Term Fee' },
          acceptanceForm: { count: 0, label: 'Acceptance Form' },
          withdrawal: {
            offeredWithdrawal: { count: 0, label: 'Offered Withdrawal' },
            termWithdrawal: { count: 0, label: 'Term Withdrawal' },
            offeredForfeitedWithdrawn: { count: 0, label: 'Offered Forfeited Withdrawn' },
            offeredForfeitedNotWithdrawn: { count: 0, label: 'Offered Forfeited Not Withdrawn' }
          }
        },
        phase2b: {
          todayStats: {
            totalSlot: { count: 0, label: 'Today Total Slot' },
            totalStudents: { count: 0, label: 'Today Total Students' },
            totalPresentStudents: { count: 0, label: 'Today Total Present Students' },
            totalAbsentStudents: { count: 0, label: 'Today Total Absent Students' },
            totalPendingStudents: { count: 0, label: 'Today Total Pending Students' }
          }
        },
        phase2a: {
          availablePool: { count: 0, label: 'Available Pool for Phase 2(a)' },
          otherIIMs: { count: 0, label: 'Other IIMs(O)' },
          iimVisakhapatnam: { count: 0, label: 'IIM Visakhapatnam(V)' },
          totalWaitListed: { count: 0, label: 'Total Wait Listed' },
          totalConsentFormSubmit: { count: 0, label: 'Total Consent Form Submit' },
          totalConsentRegret: { count: 0, label: 'Total Consent Regret' }
        },
        verification: {
          reopen: { count: 0, label: 'Reopen' },
          resubmitted: { count: 0, label: 'Resubmitted' },
          autoSubmit: { count: 0, label: 'Auto Submit' }
        },
        phase1: {
          shortlistedStudents: { count: 0, label: 'Shortlisted Students' },
          registeredStudents: { count: 0, label: 'Registered Students' },
          applicationFormSubmitted: { count: 0, label: 'Application Form Submitted' },
          reOpen: { count: 0, label: 'Re Open' },
          reSubmitted: { count: 0, label: 'Re Submitted' },
          notReSubmitted: { count: 0, label: 'Not Re Submitted' },
          totalApplication: { count: 0, label: 'Total Application' }
        }
      };
    } else {
      return {
        phase3: {
          commitmentFee: { count: 0, label: 'Commitment Fee' }
        },
        phase2: {
          todayStats: {
            totalSlot: { count: 0, label: 'Today Total Slot' },
            todayTotalStudents: { count: 0, label: 'Today Total Students' },
            todayTotalPresentStudents: { count: 0, label: 'Today Total Present Students' },
            todayTotalAbsentStudents: { count: 0, label: 'Today Total Absent Students' },
            todayTotalPendingStudents: { count: 0, label: 'Today Total Pending Students' }
          },
          overallStats: {
            totalSlot: { count: 0, label: 'Total Slot' },
            totalStudents: { count: 0, label: 'Total Students' },
            totalPresentStudents: { count: 0, label: 'Total Present Students' },
            totalAbsentStudents: { count: 0, label: 'Total Absent Students' },
            totalPendingStudents: { count: 0, label: 'Total Pending Students' }
          }
        },
        phase1: {
          registrationList: { count: 0, label: 'Registration List' },
          totalApplicant: { count: 0, label: 'Total Applicant' },
          applicantsSubmitted: { count: 0, label: 'No. of Applicants submitted' },
          applicationsSubmittedAreaWise: { count: 0, label: 'No. of Applications submitted area-wise' }
        }
      };
    }
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <ExpoStatusBar style={isDark ? "light-content" : "dark-content"} />
        <View style={styles.container}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.card }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.primary }]}>{courseName} Dashboard</Text>
            <View style={styles.placeholder} />
          </View>
          
          {/* Loading indicator */}
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>Loading dashboard data...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && !dashboardData) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <ExpoStatusBar style={isDark ? "light-content" : "dark-content"} />
        <View style={styles.container}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.card }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.primary }]}>{courseName} Dashboard</Text>
            <View style={styles.placeholder} />
          </View>
          
          {/* Error message */}
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={48} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: colors.primary }]} 
              onPress={() => {
                setError(null);
                setLoading(true);
                // Retry fetch
                setTimeout(() => {
                  const fetchDashboardData = async () => {
                    try {
                      const overviewData = await dashboardService.getDashboardOverview();
                      setOverview(overviewData);
                      
                      // Use specific API endpoints for each course type
                      let courseData;
                      if (courseName === 'PGP') {
                        courseData = await dashboardService.getPGPSummary();
                      } else if (courseName === 'PhD') {
                        courseData = await dashboardService.getPhDSummary();
                      } else if (courseName === 'EPhD') {
                        courseData = await dashboardService.getEPhDSummary();
                      } else if (courseName === 'EMBA') {
                        courseData = await dashboardService.getEMBASummary();
                      } else {
                        courseData = await dashboardService.getCourseDetails(courseName);
                      }
                      
                      const transformedData = transformApiData(courseData, courseName);
                      setDashboardData(transformedData);
                    } catch (err) {
                      setError('Failed to load dashboard data');
                      setDashboardData(getDefaultDashboardData(courseName));
                    } finally {
                      setLoading(false);
                    }
                  };
                  fetchDashboardData();
                }, 100);
              }}
            >
              <Text style={[styles.retryButtonText, { color: colors.background }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const renderStatCard = (data, bgColor = colors.card) => (
    <View style={[styles.statCard, { backgroundColor: bgColor }]}>
      <Text style={[styles.statCount, { color: colors.primary }]}>{data.count}</Text>
      <Text style={[styles.statLabel, { color: colors.text }]}>{data.label}</Text>
    </View>
  );

  const renderPhDDashboard = () => (
    <ScrollView 
      style={styles.content} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: Math.max(insets.bottom, 20)
      }}
    >
      {/* Phase 3 */}
      <View style={styles.phaseSection}>
        <Text style={[styles.phaseTitle, { color: colors.primary }]}>PHASE 3</Text>
        <View style={styles.statsGrid}>
          <View style={styles.cardWrapper}>
            {renderStatCard(dashboardData.phase3.commitmentFee)}
          </View>
        </View>
      </View>

      {/* Phase 2 */}
      <View style={styles.phaseSection}>
        <Text style={[styles.phaseTitle, { color: colors.primary }]}>PHASE 2</Text>
        <View style={styles.statsGrid}>
          {Object.keys(dashboardData.phase2.todayStats).map((key, index) => (
            <View key={index} style={styles.cardWrapper}>
              {renderStatCard(dashboardData.phase2.todayStats[key])}
            </View>
          ))}
        </View>
        <View style={[styles.statsGrid, { marginTop: 10 }]}>
          {Object.keys(dashboardData.phase2.overallStats).map((key, index) => (
            <View key={index} style={styles.cardWrapper}>
              {renderStatCard(dashboardData.phase2.overallStats[key])}
            </View>
          ))}
        </View>
      </View>

      {/* Phase 1 */}
      <View style={styles.phaseSection}>
        <Text style={[styles.phaseTitle, { color: colors.primary }]}>PHASE 1</Text>
        <View style={styles.statsGrid}>
          {Object.keys(dashboardData.phase1).map((key, index) => (
            <View key={index} style={styles.cardWrapper}>
              {renderStatCard(dashboardData.phase1[key])}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderPGPDashboard = () => (
    <ScrollView 
      style={styles.content} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: Math.max(insets.bottom, 20)
      }}
    >
      {/* Existing PGP dashboard content */}
      <View style={styles.phaseSection}>
        <Text style={[styles.phaseTitle, { color: colors.primary }]}>PHASE 3</Text>
        <View style={styles.statsGrid}>
          {Object.keys(dashboardData.phase3)
            .filter(key => key !== 'withdrawal')
            .map((key, index) => (
              <View key={index} style={styles.cardWrapper}>
                {renderStatCard(dashboardData.phase3[key])}
              </View>
            ))}
        </View>
      </View>

      <View style={styles.phaseSection}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Withdrawal Request</Text>
        <View style={styles.statsGrid}>
          {Object.keys(dashboardData.phase3.withdrawal).map((key, index) => (
            <View key={index} style={styles.cardWrapper}>
              {renderStatCard(dashboardData.phase3.withdrawal[key])}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.phaseSection}>
        <Text style={[styles.phaseTitle, { color: colors.primary }]}>PHASE 2(b)</Text>
        <View style={styles.statsGrid}>
          {Object.keys(dashboardData.phase2b.todayStats).map((key, index) => (
            <View key={index} style={styles.cardWrapper}>
              {renderStatCard(dashboardData.phase2b.todayStats[key])}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.phaseSection}>
        <Text style={[styles.phaseTitle, { color: colors.primary }]}>PHASE 2(a)</Text>
        <View style={styles.statsGrid}>
          {Object.keys(dashboardData.phase2a).map((key, index) => (
            <View key={index} style={styles.cardWrapper}>
              {renderStatCard(dashboardData.phase2a[key])}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.phaseSection}>
        <Text style={[styles.phaseTitle, { color: colors.primary }]}>Verification Details</Text>
        <View style={styles.statsGrid}>
          {Object.keys(dashboardData.verification).map((key, index) => (
            <View key={index} style={styles.cardWrapper}>
              {renderStatCard(dashboardData.verification[key])}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.phaseSection}>
        <Text style={[styles.phaseTitle, { color: colors.primary }]}>PHASE 1</Text>
        <View style={styles.statsGrid}>
          {Object.keys(dashboardData.phase1).map((key, index) => (
            <View key={index} style={styles.cardWrapper}>
              {renderStatCard(dashboardData.phase1[key])}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <ExpoStatusBar style={isDark ? "light-content" : "dark-content"} />
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>{courseName} Dashboard</Text>
          <View style={styles.placeholder} />
        </View>

        {isPGP ? renderPGPDashboard() : renderPhDDashboard()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  phaseSection: {
    marginBottom: 20,
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  cardWrapper: {
    width: '50%',
    padding: 5,
  },
  statCard: {
    borderRadius: 8,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  statCount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
