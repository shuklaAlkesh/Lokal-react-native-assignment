import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { getBookmarks, removeBookmark } from '../database/database';
import JobCard from '../components/JobCard';

const BookmarksScreen = ({ navigation }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const bookmarkedJobs = await getBookmarks();
      setBookmarks(bookmarkedJobs);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (jobId) => {
    try {
      await removeBookmark(jobId);
      setBookmarks(prev => prev.filter(bookmark => bookmark.id !== jobId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  useEffect(() => {
    loadBookmarks();
    
    // Refresh bookmarks when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadBookmarks();
    });

    return unsubscribe;
  }, [navigation]);

  if (!loading && bookmarks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No bookmarked jobs yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bookmarks}
        renderItem={({ item }) => (
          <JobCard
            job={item.jobData}
            onPress={() => navigation.navigate('BookmarkDetail', { job: item.jobData })}
            isBookmarked={true}
            onBookmarkPress={() => handleRemoveBookmark(item.id)}
          />
        )}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default BookmarksScreen; 