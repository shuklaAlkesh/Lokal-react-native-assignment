import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_KEY = '@lokalapp_bookmarks';

export const initDatabase = async () => {
  try {
    const bookmarks = await AsyncStorage.getItem(BOOKMARKS_KEY);
    if (!bookmarks) {
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify([]));
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

export const saveBookmark = async (jobData) => {
  try {
    const bookmarks = await getBookmarks();
    const newBookmark = {
      id: jobData.id,
      jobData: jobData
    };
    bookmarks.push(newBookmark);
    await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return newBookmark.id;
  } catch (error) {
    console.error('Error saving bookmark:', error);
    throw error;
  }
};

export const removeBookmark = async (jobId) => {
  try {
    const bookmarks = await getBookmarks();
    const updatedBookmarks = bookmarks.filter(bookmark => bookmark.id !== jobId);
    await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
  } catch (error) {
    console.error('Error removing bookmark:', error);
    throw error;
  }
};

export const getBookmarks = async () => {
  try {
    const bookmarksJson = await AsyncStorage.getItem(BOOKMARKS_KEY);
    return bookmarksJson ? JSON.parse(bookmarksJson) : [];
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    return [];
  }
};

export const isJobBookmarked = async (jobId) => {
  try {
    const bookmarks = await getBookmarks();
    return bookmarks.some(bookmark => bookmark.id === jobId);
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    return false;
  }
}; 