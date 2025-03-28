import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Linking,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { saveBookmark, removeBookmark, isJobBookmarked } from '../database/database';

const JobDetailScreen = ({ route }) => {
  const { job } = route.params;
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    checkBookmarkStatus();
  }, []);

  const checkBookmarkStatus = async () => {
    try {
      const bookmarked = await isJobBookmarked(job.id);
      setIsBookmarked(bookmarked);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const toggleBookmark = async () => {
    try {
      if (isBookmarked) {
        await removeBookmark(job.id);
      } else {
        await saveBookmark(job);
      }
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleCall = () => {
    if (job.phone) {
      Linking.openURL(`tel:${job.phone}`);
    } else {
      Alert.alert('Contact Information', 'No contact information available');
    }
  };

  const handleWhatsApp = () => {
    if (job.phone) {
      const whatsappUrl = `https://wa.me/${job.phone.replace(/\D/g, '')}`;
      Linking.openURL(whatsappUrl);
    } else {
      Alert.alert('Contact Information', 'No contact information available');
    }
  };

  const renderDetailItem = (icon, label, value) => {
    if (!value) return null;
    return (
      <View style={styles.detailItem}>
        <Ionicons name={icon} size={20} color="#666" />
        <View style={styles.detailTextContainer}>
          <Text style={styles.detailLabel}>{label}</Text>
          <Text style={styles.detailText}>{value}</Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {job.image && (
        <Image 
          source={{ uri: job.image }} 
          style={styles.coverImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{job.title}</Text>
            <Text style={styles.company}>{job.company}</Text>
          </View>
          <TouchableOpacity onPress={toggleBookmark} style={styles.bookmarkButton}>
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={24}
              color="#007AFF"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.tagContainer}>
          {job.tags.map((tag, index) => (
            <View 
              key={index} 
              style={[styles.tag, { backgroundColor: tag.bg_color || '#f0f0f0' }]}
            >
              <Text style={[styles.tagText, { color: tag.text_color || '#666' }]}>
                {tag.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          {renderDetailItem('business-outline', 'Company', job.company)}
          {renderDetailItem('location-outline', 'Location', job.location)}
          {renderDetailItem('cash-outline', 'Salary', job.salary)}
          {renderDetailItem('time-outline', 'Job Type', job.jobType)}
          {renderDetailItem('school-outline', 'Qualification', job.qualification)}
          {renderDetailItem('briefcase-outline', 'Experience', job.experience)}
          {renderDetailItem('people-outline', 'Vacancies', job.vacancies > 0 ? `${job.vacancies} Openings` : null)}
          {renderDetailItem('calendar-outline', 'Posted On', new Date(job.createdOn).toLocaleDateString())}
        </View>

        {job.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{job.description}</Text>
          </View>
        )}

        {job.requirements && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            <Text style={styles.description}>{job.requirements}</Text>
          </View>
        )}
      </View>

      <View style={styles.contactSection}>
        <TouchableOpacity 
          style={[styles.contactButton, styles.callButton]} 
          onPress={handleCall}
        >
          <Ionicons name="call" size={20} color="white" />
          <Text style={styles.contactButtonText}>Contact Now</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.contactButton, styles.whatsappButton]} 
          onPress={handleWhatsApp}
        >
          <Ionicons name="logo-whatsapp" size={20} color="white" />
          <Text style={styles.contactButtonText}>WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  coverImage: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  company: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  bookmarkButton: {
    padding: 4,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  contactSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  callButton: {
    backgroundColor: '#0984E3',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default JobDetailScreen; 