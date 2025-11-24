// src/components/TermsAgreementModal.js
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Dimensions,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 600;
const isAndroid = Platform.OS === 'android';

const TermsAgreementModal = ({ visible, onAccept }) => {
  const openTerms = () => {
    Linking.openURL('https://discoverqa.netlify.app/terms');
  };

  const openPrivacy = () => {
    Linking.openURL('https://discoverqa.netlify.app/privacy-policy');
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Icon */}
            <View style={styles.iconContainer}>
              <MaterialIcons name="description" size={isTablet ? 64 : 56} color="#2D3748" />
            </View>

            {/* Title */}
            <Text style={styles.title}>Welcome to DiscoverQA</Text>
            <Text style={styles.subtitle}>
              Discover the best events and places in Qatar
            </Text>

            {/* Content */}
            <View style={styles.contentCard}>
              <Text style={styles.contentTitle}>Before you continue</Text>
              <Text style={styles.contentText}>
                To use DiscoverQA, please review and accept our Terms & Conditions and Privacy Policy.
              </Text>

              <View style={styles.bulletPoints}>
                <View style={styles.bulletPoint}>
                  <MaterialIcons name="check-circle" size={20} color="#2D3748" />
                  <Text style={styles.bulletText}>
                    Browse events and places freely
                  </Text>
                </View>
                <View style={styles.bulletPoint}>
                  <MaterialIcons name="check-circle" size={20} color="#2D3748" />
                  <Text style={styles.bulletText}>
                    Create account to save favorites
                  </Text>
                </View>
                <View style={styles.bulletPoint}>
                  <MaterialIcons name="check-circle" size={20} color="#2D3748" />
                  <Text style={styles.bulletText}>
                    Set reminders for upcoming events
                  </Text>
                </View>
              </View>
            </View>

            {/* Links */}
            <View style={styles.linksContainer}>
              <TouchableOpacity style={styles.linkButton} onPress={openTerms}>
                <MaterialIcons name="description" size={20} color="#2D3748" />
                <Text style={styles.linkText}>Read Terms & Conditions</Text>
                <MaterialIcons name="open-in-new" size={16} color="#718096" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.linkButton} onPress={openPrivacy}>
                <MaterialIcons name="privacy-tip" size={20} color="#2D3748" />
                <Text style={styles.linkText}>Read Privacy Policy</Text>
                <MaterialIcons name="open-in-new" size={16} color="#718096" />
              </TouchableOpacity>
            </View>

            {/* Agreement Text */}
            <View style={styles.agreementBox}>
              <Text style={styles.agreementText}>
                By tapping "I Agree & Continue", you acknowledge that you have read and agree to our{' '}
                <Text style={styles.linkInline} onPress={openTerms}>
                  Terms & Conditions
                </Text>
                {' '}and{' '}
                <Text style={styles.linkInline} onPress={openPrivacy}>
                  Privacy Policy
                </Text>
                .
              </Text>
            </View>

            {/* Accept Button */}
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={onAccept}
              activeOpacity={0.8}
            >
              <Text style={styles.acceptButtonText}>I Agree & Continue</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: isTablet ? 24 : 20,
    width: '100%',
    maxWidth: isTablet ? 600 : 400,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  scrollContent: {
    padding: isTablet ? 32 : 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: isTablet ? 24 : 20,
  },
  title: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: isTablet ? 16 : 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: isTablet ? 28 : 24,
    lineHeight: isTablet ? 22 : 20,
  },
  contentCard: {
    backgroundColor: '#F7F8FA',
    borderRadius: 12,
    padding: isTablet ? 20 : 16,
    marginBottom: isTablet ? 24 : 20,
  },
  contentTitle: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8,
  },
  contentText: {
    fontSize: isTablet ? 15 : 14,
    color: '#4A5568',
    lineHeight: isTablet ? 22 : 20,
    marginBottom: 16,
  },
  bulletPoints: {
    gap: isTablet ? 12 : 10,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isTablet ? 12 : 10,
  },
  bulletText: {
    flex: 1,
    fontSize: isTablet ? 14 : 13,
    color: '#4A5568',
    fontWeight: '500',
  },
  linksContainer: {
    gap: isTablet ? 12 : 10,
    marginBottom: isTablet ? 24 : 20,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    padding: isTablet ? 16 : 14,
    borderRadius: 12,
    gap: isTablet ? 12 : 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  linkText: {
    flex: 1,
    fontSize: isTablet ? 15 : 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  agreementBox: {
    backgroundColor: '#EBF8FF',
    padding: isTablet ? 18 : 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BEE3F8',
    marginBottom: isTablet ? 24 : 20,
  },
  agreementText: {
    fontSize: isTablet ? 13 : 12,
    color: '#2C5282',
    lineHeight: isTablet ? 20 : 18,
    textAlign: 'center',
  },
  linkInline: {
    color: '#2D3748',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  acceptButton: {
    flexDirection: 'row',
    backgroundColor: '#2D3748',
    paddingVertical: isTablet ? 18 : 16,
    paddingHorizontal: isTablet ? 28 : 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: isTablet ? 10 : 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptButtonText: {
    fontSize: isTablet ? 17 : 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default TermsAgreementModal;