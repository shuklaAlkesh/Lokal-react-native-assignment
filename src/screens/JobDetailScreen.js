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

  const renderJobTypeTag = (type) => {
    const getJobTypeColor = (type) => {
      switch (type?.toLowerCase()) {
        case 'full time':
          return '#4CAF50';
        case 'part time':
          return '#FF9800';
        case 'contract':
          return '#F44336';
        default:
          return '#2196F3';
      }
    };

    return (
      <View style={[styles.tag, { backgroundColor: getJobTypeColor(type) + '20' }]}>
        <Ionicons name="time" size={14} color={getJobTypeColor(type)} />
        <Text style={[styles.tagText, { color: getJobTypeColor(type) }]}>
          {type}
        </Text>
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
              color="#0288D1"
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
          {renderJobTypeTag(job.jobType)}
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
          {job.job_category && renderDetailItem('folder-outline', 'Category', job.job_category)}
          {job.job_role && renderDetailItem('person-outline', 'Role', job.job_role)}
          {job.shift_timing && renderDetailItem('time-outline', 'Shift Timing', job.shift_timing)}
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

        {job.contact_preference && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Preferences</Text>
            <View style={styles.preferenceItem}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <View style={styles.preferenceTextContainer}>
                <Text style={styles.preferenceLabel}>Preferred Contact Hours</Text>
                <Text style={styles.preferenceText}>
                  {job.contact_preference.preferred_call_start_time} - {job.contact_preference.preferred_call_end_time}
                </Text>
              </View>
            </View>
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
    backgroundColor: '#F8F9FA',
  },
  coverImage: {
    width: '100%',
    height: 280,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  content: {
    padding: 16,
    marginTop: -30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#01579B',
    marginBottom: 8,
    lineHeight: 32,
  },
  company: {
    fontSize: 17,
    color: '#0288D1',
    marginBottom: 8,
    fontWeight: '600',
  },
  bookmarkButton: {
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tag: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  tagText: {
    fontSize: 13,
    color: '#2D3436',
    fontWeight: '500',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#01579B',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
  },
  detailTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  detailText: {
    fontSize: 16,
    color: '#01579B',
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#2D3436',
    lineHeight: 26,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
  },
  preferenceTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  preferenceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  preferenceText: {
    fontSize: 16,
    color: '#01579B',
    fontWeight: '600',
  },
  contactSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 15,
    gap: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  callButton: {
    backgroundColor: '#0288D1',
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