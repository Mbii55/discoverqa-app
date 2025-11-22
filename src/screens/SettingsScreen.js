// src/screens/SettingsScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Constants from 'expo-constants';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isAndroid = Platform.OS === 'android';

const SettingsScreen = ({ navigation }) => {
  const { user, profile, signOut } = useAuth();

  // Get version dynamically from app.json
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const buildNumber = Constants.expoConfig?.ios?.buildNumber || 
                       Constants.expoConfig?.android?.versionCode || '';

  const handleManageAccount = () => {
    if (user) {
      navigation.navigate('ManageAccount');
    } else {
      navigation.navigate('Login');
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigation.navigate('MainTabs');
  };

  const handleAbout = () => {
    navigation.navigate('AboutDiscoverQA');
  };

  const handleTerms = () => {
    navigation.navigate('Terms'); // Terms & Conditions screen
  };

  const handlePrivacy = () => {
    navigation.navigate('PrivacyPolicy');
  };

  const handleContact = () => {
    const email = 'support@discoverqa.com';
    const subject = 'DiscoverQA Feedback';
    const body = 'Hi DiscoverQA team,\n\n';
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.openURL(mailtoUrl).catch((err) => {
      console.error('Failed to open email client:', err);
      Alert.alert(
        'Email Not Available',
        `Please send your feedback to: ${email}`,
        [
          { 
            text: 'Copy Email', 
            onPress: () => {
              Alert.alert('Email Address', email);
            }
          },
          { text: 'OK' }
        ]
      );
    });
  };

  const userName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'User';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* User Profile Card */}
        {user ? (
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {userName.charAt(0).toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userName}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.loginPromptCard}>
            <Text style={styles.loginPromptTitle}>Welcome to DiscoverQA</Text>
            <Text style={styles.loginPromptText}>
              Sign in to save favorites and personalize your experience
            </Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleManageAccount}
            >
              <Text style={styles.loginButtonText}>Sign In / Create Account</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Account Section */}
        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>

            <SettingItem
              icon={
                <MaterialIcons
                  name="person-outline"
                  size={22}
                  color="#4A5568"
                />
              }
              label="Manage Account"
              onPress={handleManageAccount}
            />

            <SettingItem
              icon={<MaterialIcons name="logout" size={22} color="#E53E3E" />}
              label="Log Out"
              onPress={handleLogout}
              destructive
            />
          </View>
        )}

        {/* App Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>

          <SettingItem
            icon={
              <MaterialIcons name="info-outline" size={22} color="#4A5568" />
            }
            label="About DiscoverQA"
            onPress={handleAbout}
          />

          <SettingItem
            icon={
              <MaterialIcons name="description" size={22} color="#4A5568" />
            }
            label="Terms & Conditions"
            onPress={handleTerms}
          />

          <SettingItem
            icon={
              <MaterialIcons name="privacy-tip" size={22} color="#4A5568" />
            }
            label="Privacy Policy"
            onPress={handlePrivacy}
          />
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <SettingItem
            icon={
              <MaterialIcons name="mail-outline" size={22} color="#4A5568" />
            }
            label="Contact & Feedback"
            onPress={handleContact}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>DiscoverQA</Text>
          <Text style={styles.footerVersion}>
            Version {appVersion}{buildNumber ? ` (${buildNumber})` : ''}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

function SettingItem({ icon, label, onPress, destructive }) {
  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingItemLeft}>
        {icon}
        <Text
          style={[
            styles.settingLabel,
            destructive && styles.settingLabelDestructive,
          ]}
        >
          {label}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
    </TouchableOpacity>
  );
}

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Header
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: isAndroid ? 12 : 16,
    paddingBottom: isAndroid ? 16 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: isAndroid ? 26 : 32,
    fontWeight: '700',
    color: '#2D3748',
    letterSpacing: isAndroid ? -0.3 : -0.5,
  },

  // Profile Card
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: isAndroid ? 16 : 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: isAndroid ? 12 : 16,
  },
  avatar: {
    width: isAndroid ? 56 : 60,
    height: isAndroid ? 56 : 60,
    borderRadius: isAndroid ? 28 : 30,
    backgroundColor: '#2D3748',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: isAndroid ? 22 : 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: isAndroid ? 16 : 18,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: isAndroid ? 13 : 14,
    color: '#718096',
    fontWeight: '500',
  },

  // Login Prompt Card
  loginPromptCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: isAndroid ? 20 : 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  loginPromptTitle: {
    fontSize: isAndroid ? 18 : 20,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8,
  },
  loginPromptText: {
    fontSize: isAndroid ? 13 : 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: isAndroid ? 18 : 20,
    marginBottom: isAndroid ? 16 : 20,
  },
  loginButton: {
    backgroundColor: '#2D3748',
    paddingHorizontal: isAndroid ? 20 : 24,
    paddingVertical: isAndroid ? 10 : 12,
    borderRadius: 12,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: isAndroid ? 14 : 15,
    fontWeight: '600',
  },

  // Section
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: isAndroid ? 12 : 13,
    fontWeight: '700',
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },

  // Setting Item
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: isAndroid ? 14 : 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F7F8FA',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: isAndroid ? 15 : 16,
    fontWeight: '500',
    color: '#2D3748',
    marginLeft: 14,
  },
  settingLabelDestructive: {
    color: '#E53E3E',
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: isAndroid ? 13 : 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: isAndroid ? 11 : 12,
    color: '#A0AEC0',
    fontWeight: '500',
  },
});
