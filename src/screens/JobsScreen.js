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
    
    if (!query || query.trim() === '') {
      setFilterData(jobs);
    } else {
      const searchText = query.toLowerCase().trim();
      
      const filtered = jobs.filter(job => {
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
      
      setFilterData(filtered);
    }
  };

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
});

export default JobsScreen;
