import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const JobCard = ({ job, onPress, isBookmarked, onBookmarkPress }) => {
  const handleCall = () => {
    if (job.phone) {
      Linking.openURL(`tel:${job.phone}`);
    }
  };

  const handleWhatsApp = () => {
    if (job.phone) {
      const whatsappUrl = `https://wa.me/${job.phone.replace(/\D/g, '')}`;
      Linking.openURL(whatsappUrl);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.topSection}>
        {job.image ? (
          <Image 
            source={{ uri: job.image }} 
            style={styles.companyLogo}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>{job.company?.charAt(0) || 'J'}</Text>
          </View>
        )}
        
        <View style={styles.headerContent}>
          <Text style={styles.company} numberOfLines={1}>{job.company}</Text>
          <Text style={styles.title} numberOfLines={2}>{job.title}</Text>
        </View>

        <TouchableOpacity 
          onPress={onBookmarkPress} 
          style={styles.bookmarkButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={isBookmarked ? '#FF4757' : '#666'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="location" size={16} color="#2D3436" />
            <Text style={styles.detailText} numberOfLines={1}>{job.location}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="cash" size={16} color="#2D3436" />
            <Text style={styles.detailText} numberOfLines={1}>{job.salary}</Text>
          </View>
        </View>

        <View style={styles.tagRow}>
          {job.vacancies > 0 && (
            <View style={[styles.tag, styles.vacancyTag]}>
              <Ionicons name="people" size={14} color="#0E56A8" />
              <Text style={[styles.tagText, styles.vacancyText]}>
                {job.vacancies} Openings
              </Text>
            </View>
          )}
          {job.experience && (
            <View style={styles.tag}>
              <Ionicons name="briefcase" size={14} color="#6C5CE7" />
              <Text style={styles.tagText}>{job.experience}</Text>
            </View>
          )}
        </View>

        <View style={styles.contactButtonsContainer}>
          <TouchableOpacity 
            style={[styles.contactButton, styles.callButton]} 
            onPress={handleCall}
          >
            <Ionicons name="call" size={18} color="white" />
            <Text style={styles.contactText}>Contact Now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.contactButton, styles.whatsappButton]} 
            onPress={handleWhatsApp}
          >
            <Ionicons name="logo-whatsapp" size={18} color="white" />
            <Text style={styles.contactText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  topSection: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  companyLogo: {
    width: 60,
    height: 60,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#E3F2FD',
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#BBDEFB',
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0288D1',
  },
  headerContent: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  company: {
    fontSize: 15,
    color: '#0288D1',
    fontWeight: '700',
    marginBottom: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#01579B',
    lineHeight: 24,
  },
  bookmarkButton: {
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  detailsContainer: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#2D3436',
    flex: 1,
    fontWeight: '500',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 25,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  vacancyTag: {
    backgroundColor: '#E3F2FD',
    borderColor: '#BBDEFB',
  },
  tagText: {
    fontSize: 13,
    color: '#2D3436',
    fontWeight: '500',
  },
  vacancyText: {
    color: '#0288D1',
    fontWeight: '600',
  },
  contactButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
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
  contactText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default JobCard; 