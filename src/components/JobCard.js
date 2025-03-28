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
              <Ionicons name="people" size={14} color="#0984E3" />
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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  topSection: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  companyLogo: {
    width: 50,
    height: 50,
    borderRadius: 12,
  },
  logoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#E1F5FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0984E3',
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  company: {
    fontSize: 14,
    color: '#0984E3',
    fontWeight: '600',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3436',
    lineHeight: 22,
  },
  bookmarkButton: {
    padding: 4,
  },
  detailsContainer: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#2D3436',
    flex: 1,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  vacancyTag: {
    backgroundColor: '#E1F5FE',
  },
  tagText: {
    fontSize: 12,
    color: '#2D3436',
  },
  vacancyText: {
    color: '#0984E3',
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
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  callButton: {
    backgroundColor: '#0984E3',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  contactText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default JobCard; 