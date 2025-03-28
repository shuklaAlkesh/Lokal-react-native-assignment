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
  const [searchQuery,setSearchQuery] = useState('');
  const [filterData,SetFilterData] = useState([]);

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

  // Keep filterData synchronized with jobs when jobs change
  useEffect(() => {
    console.log('Jobs updated:', jobs);
    if (searchQuery.trim() === '') {
      SetFilterData(jobs);
    } else {
      handleSearch(searchQuery); // Re-apply current search when jobs update
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
      // When search is empty, show all jobs
      SetFilterData(jobs);
    } else {
      // Filter jobs that contain the search query in their title
      const searchText = query.toLowerCase().trim();
      
      // Filter jobs where title contains the search text
      const filtered = jobs.filter(job => {
        if (!job.title) return false;
        return job.title.toLowerCase().includes(searchText);
      });
      
      SetFilterData(filtered);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search jobs by title..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <View style={styles.searchResults}>
            <Text style={styles.searchResultsText}>
              {filterData.length} results found
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
  searchInput: {
    height: 50,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  searchResults: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  searchResultsText: {
    fontSize: 14,
    color: '#666',
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
