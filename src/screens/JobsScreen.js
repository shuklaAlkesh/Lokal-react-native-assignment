import React, { useState, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  ActivityIndicator, 
  StyleSheet, 
  RefreshControl,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { fetchJobs } from '../services/api';
import { saveBookmark, removeBookmark, isJobBookmarked } from '../database/database';
import JobCard from '../components/JobCard';
import { Ionicons } from '@expo/vector-icons';

const JobsScreen = ({ navigation }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarkedJobs, setBookmarkedJobs] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterData, setFilterData] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    experience: '',
    jobType: '',
    salaryRange: '',
  });

  const loadJobs = async (pageNum = 1, shouldRefresh = false) => {
    if (loading || (!hasMore && !shouldRefresh)) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchJobs(pageNum);
      console.log('API Response:', response); 
      
      if (!response || !response.data) {
        throw new Error('Invalid response format');
      }

      const newJobs = response.data || [];
      console.log('New Jobs:', newJobs); 
      
      if (shouldRefresh) {
        setJobs(newJobs);
      } else {
        setJobs(prev => [...prev, ...newJobs]);
      }
      
      setHasMore(newJobs.length > 0);
      await checkBookmarkStatus(newJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const checkBookmarkStatus = async (jobsToCheck) => {
    const bookmarkStatuses = {};
    for (const job of jobsToCheck) {
      bookmarkStatuses[job.id] = await isJobBookmarked(job.id);
    }
    setBookmarkedJobs(prev => ({ ...prev, ...bookmarkStatuses }));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setError(null);
    loadJobs(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore && !error) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadJobs(nextPage);
    }
  };

  const toggleBookmark = async (job) => {
    try {
      if (bookmarkedJobs[job.id]) {
        await removeBookmark(job.id);
      } else {
        await saveBookmark(job);
      }
      setBookmarkedJobs(prev => ({
        ...prev,
        [job.id]: !prev[job.id]
      }));
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await loadJobs();
    };
    initializeData();
  }, []);

  useEffect(() => {
    console.log('Jobs updated:', jobs);
    if (searchQuery.trim() === '') {
      setFilterData(jobs);
    } else {
      handleSearch(searchQuery);
    }
  }, [jobs]);

  const renderFooter = () => {
    if (error) return null;
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="briefcase-outline" size={64} color="#666" />
        <Text style={styles.emptyText}>No jobs available</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderError = () => {
    if (!error) return null;
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff6b6b" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (error) {
    return renderError();
  }

  const handleSearch = (query) => {
    setSearchQuery(query);
    let filtered = [...jobs];

    // Apply search filter
    if (query && query.trim() !== '') {
      const searchText = query.toLowerCase().trim();
      filtered = filtered.filter(job => {
        const searchableFields = [
          job.title,
          job.company,
          job.location,
          job.experience,
          job.jobType,
          job.qualification,
          job.job_category,
          job.job_role
        ].filter(Boolean);

        return searchableFields.some(field => 
          field.toLowerCase().includes(searchText)
        );
      });
    }

    // Apply existing filters
    if (filters.experience) {
      filtered = filtered.filter(job => {
        const jobExperience = job.experience?.toLowerCase() || '';
        const filterExperience = filters.experience.toLowerCase();
        
        // Handle different experience level formats
        if (filterExperience === 'entry level') {
          return jobExperience.includes('entry') || 
                 jobExperience.includes('fresher') || 
                 jobExperience.includes('0-1') ||
                 jobExperience.includes('0 to 1');
        } else if (filterExperience === 'mid level') {
          return jobExperience.includes('mid') || 
                 jobExperience.includes('2-5') ||
                 jobExperience.includes('2 to 5');
        } else if (filterExperience === 'senior level') {
          return jobExperience.includes('senior') || 
                 jobExperience.includes('5+') ||
                 jobExperience.includes('5+ years');
        }
        return false;
      });
    }

    if (filters.jobType) {
      filtered = filtered.filter(job => {
        const jobType = job.jobType?.toLowerCase() || '';
        const filterType = filters.jobType.toLowerCase();
        
        // Handle different job type formats
        if (filterType === 'full time') {
          return jobType.includes('full') || jobType.includes('permanent');
        } else if (filterType === 'part time') {
          return jobType.includes('part');
        } else if (filterType === 'contract') {
          return jobType.includes('contract') || jobType.includes('temporary');
        } else if (filterType === 'internship') {
          return jobType.includes('intern') || jobType.includes('trainee');
        }
        return false;
      });
    }

    if (filters.salaryRange) {
      filtered = filtered.filter(job => {
        const salary = parseInt(job.salary?.replace(/[^0-9]/g, '') || '0');
        const [min, max] = filters.salaryRange.split('-').map(Number);
        
        if (filters.salaryRange === '100000+') {
          return salary >= 100000;
        }
        return salary >= min && salary <= max;
      });
    }

    setFilterData(filtered);
  };

  const handleApplyFilters = () => {
    let filtered = [...jobs];

    // Apply search filter if exists
    if (searchQuery && searchQuery.trim() !== '') {
      const searchText = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(job => {
        const searchableFields = [
          job.title,
          job.company,
          job.location,
          job.experience,
          job.jobType,
          job.qualification,
          job.job_category,
          job.job_role
        ].filter(Boolean);

        return searchableFields.some(field => 
          field.toLowerCase().includes(searchText)
        );
      });
    }

    // Apply filters with improved matching logic
    if (filters.experience) {
      filtered = filtered.filter(job => {
        const jobExperience = job.experience?.toLowerCase() || '';
        const filterExperience = filters.experience.toLowerCase();
        
        if (filterExperience === 'entry level') {
          return jobExperience.includes('entry') || 
                 jobExperience.includes('fresher') || 
                 jobExperience.includes('0-1') ||
                 jobExperience.includes('0 to 1');
        } else if (filterExperience === 'mid level') {
          return jobExperience.includes('mid') || 
                 jobExperience.includes('2-5') ||
                 jobExperience.includes('2 to 5');
        } else if (filterExperience === 'senior level') {
          return jobExperience.includes('senior') || 
                 jobExperience.includes('5+') ||
                 jobExperience.includes('5+ years');
        }
        return false;
      });
    }

    if (filters.jobType) {
      filtered = filtered.filter(job => {
        const jobType = job.jobType?.toLowerCase() || '';
        const filterType = filters.jobType.toLowerCase();
        
        if (filterType === 'full time') {
          return jobType.includes('full') || jobType.includes('permanent');
        } else if (filterType === 'part time') {
          return jobType.includes('part');
        } else if (filterType === 'contract') {
          return jobType.includes('contract') || jobType.includes('temporary');
        } else if (filterType === 'internship') {
          return jobType.includes('intern') || jobType.includes('trainee');
        }
        return false;
      });
    }

    if (filters.salaryRange) {
      filtered = filtered.filter(job => {
        const salary = parseInt(job.salary?.replace(/[^0-9]/g, '') || '0');
        const [min, max] = filters.salaryRange.split('-').map(Number);
        
        if (filters.salaryRange === '100000+') {
          return salary >= 100000;
        }
        return salary >= min && salary <= max;
      });
    }

    setFilterData(filtered);
    setShowFilterModal(false);
  };

  const handleFilterToggle = (type, value) => {
    setFilters(prev => {
      // If the same filter is clicked again, remove it
      if (prev[type] === value) {
        return { ...prev, [type]: '' };
      }
      // Otherwise, apply the new filter
      return { ...prev, [type]: value };
    });
  };

  const FilterModal = () => (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Jobs</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Ionicons name="close" size={24} color="#2D3436" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterScroll}>
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Experience Level</Text>
              <View style={styles.filterOptions}>
                {['Entry Level', 'Mid Level', 'Senior Level'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.filterOption,
                      filters.experience === level && styles.filterOptionSelected,
                    ]}
                    onPress={() => handleFilterToggle('experience', level)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.experience === level && styles.filterOptionTextSelected,
                    ]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Job Type</Text>
              <View style={styles.filterOptions}>
                {['Full Time', 'Part Time', 'Contract', 'Internship'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterOption,
                      filters.jobType === type && styles.filterOptionSelected,
                    ]}
                    onPress={() => handleFilterToggle('jobType', type)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.jobType === type && styles.filterOptionTextSelected,
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Salary Range</Text>
              <View style={styles.filterOptions}>
                {[
                  { label: 'Below ₹20,000', value: '0-20000' },
                  { label: '₹20,000 - ₹50,000', value: '20000-50000' },
                  { label: '₹50,000 - ₹100,000', value: '50000-100000' },
                  { label: 'Above ₹100,000', value: '100000+' },
                ].map((range) => (
                  <TouchableOpacity
                    key={range.value}
                    style={[
                      styles.filterOption,
                      filters.salaryRange === range.value && styles.filterOptionSelected,
                    ]}
                    onPress={() => handleFilterToggle('salaryRange', range.value)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.salaryRange === range.value && styles.filterOptionTextSelected,
                    ]}>
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.applyButton]}
              onPress={handleApplyFilters}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title, company, location..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => handleSearch('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="filter" size={20} color="#0984E3" />
          </TouchableOpacity>
        </View>
        {searchQuery.length > 0 && (
          <View style={styles.searchResults}>
            <Text style={styles.searchResultsText}>
              {filterData.length} results found
            </Text>
            <Text style={styles.searchHint}>
              Try searching by title, company name, location, or job type
            </Text>
          </View>
        )}
      </View>

      <FlatList
        data={filterData}
        renderItem={({ item }) => (
          <JobCard 
            job={item}
            onPress={() => navigation.navigate('JobDetail', { job: item })}
            isBookmarked={bookmarkedJobs[item.id]}
            onBookmarkPress={() => toggleBookmark(item)}
          />
        )}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
          />
        }
        contentContainerStyle={[
          styles.listContainer,
          jobs.length === 0 && styles.emptyList
        ]}
      />

      <FilterModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 25,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#2D3436',
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  searchResults: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  searchResultsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  searchHint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  footer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  filterButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  filterScroll: {
    maxHeight: 400,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  filterOptionSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#0984E3',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#2D3436',
  },
  filterOptionTextSelected: {
    color: '#0984E3',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButton: {
    backgroundColor: '#0984E3',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default JobsScreen;
