// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../config';

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isTablet = SCREEN_WIDTH >= 600;

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    setEmailError('');
    setPasswordError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log('Supabase login error:', error);
        const msg = (error.message || '').toLowerCase();

        if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
          setPasswordError('Invalid email or password');
        } else if (msg.includes('email')) {
          setEmailError('Invalid email');
        } else {
          setEmailError('Login failed');
          setPasswordError('Login failed');
        }
      } else {
        console.log('Logged in:', data.user?.email);
        navigation.navigate('MainTabs');
      }
    } catch (e) {
      console.log('Unexpected login error:', e);
      setEmailError('Login failed');
      setPasswordError('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

 const handlePasswordReset = async () => {
  if (!email) {
    setEmailError('Please enter your email first');
    return;
  }

  setEmailError('');
  setIsResetting(true);

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'discoverqa://reset-password',
    });
    
    if (error) {
      console.log('Reset error:', error);
      setEmailError('Failed to send reset email');
    } else {
      Alert.alert(
        'Check your email',
        'A reset link has been sent to your email address.'
      );
    }
  } catch (e) {
    console.log('Unexpected reset error:', e);
    setEmailError('Failed to send reset email');
  } finally {
    setIsResetting(false);
  }
};

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.subtitle}>
              Sign in to access your favorites and personalize your experience
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Email Field */}
            <View style={styles.field}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[styles.input, emailError && styles.inputError]}
                placeholder="you@example.com"
                placeholderTextColor="#A0AEC0"
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={setEmail}
                value={email}
              />
              {emailError ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.errorText}>{emailError}</Text>
                </View>
              ) : null}
            </View>

            {/* Password Field */}
            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, passwordError && styles.inputError]}
                placeholder="Enter your password"
                placeholderTextColor="#A0AEC0"
                secureTextEntry
                onChangeText={setPassword}
                value={password}
              />
              {passwordError ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.errorText}>{passwordError}</Text>
                </View>
              ) : null}
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity
              onPress={handlePasswordReset}
              style={styles.forgotButton}
              disabled={isResetting}
            >
              {isResetting ? (
                <ActivityIndicator size="small" color="#2D3748" />
              ) : (
                <Text style={styles.forgotText}>Forgot password?</Text>
              )}
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Sign Up Prompt */}
          <View style={styles.signupPrompt}>
            <Text style={styles.signupPromptText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signupLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: isTablet ? 32 : 20,
    paddingTop: isTablet ? 60 : 40,
    paddingBottom: 40,
    maxWidth: isTablet ? 500 : '100%',
    width: '100%',
    alignSelf: 'center',
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: isTablet ? 40 : 32,
  },
  title: {
    fontSize: isTablet ? 34 : 28,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: isTablet ? 16 : 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: isTablet ? 22 : 20,
    paddingHorizontal: isTablet ? 0 : 20,
  },

  // Form Card
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: isTablet ? 24 : 20,
    padding: isTablet ? 32 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  // Fields
  field: {
    marginBottom: isTablet ? 24 : 20,
  },
  label: {
    fontSize: isTablet ? 14 : 13,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: isTablet ? 10 : 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#F7F8FA',
    borderRadius: isTablet ? 14 : 12,
    paddingHorizontal: isTablet ? 18 : 16,
    paddingVertical: isTablet ? 16 : 14,
    fontSize: isTablet ? 16 : 15,
    color: '#2D3748',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputError: {
    borderColor: '#E53E3E',
    backgroundColor: '#FFF5F5',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: isTablet ? 8 : 6,
  },
  errorIcon: {
    fontSize: isTablet ? 16 : 14,
    marginRight: isTablet ? 8 : 6,
  },
  errorText: {
    color: '#E53E3E',
    fontSize: isTablet ? 14 : 13,
    fontWeight: '500',
  },

  // Forgot Password
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: isTablet ? 24 : 20,
  },
  forgotText: {
    color: '#2D3748',
    fontSize: isTablet ? 15 : 14,
    fontWeight: '600',
  },

  // Login Button
  loginButton: {
    backgroundColor: '#2D3748',
    borderRadius: isTablet ? 14 : 12,
    paddingVertical: isTablet ? 18 : 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: isTablet ? 17 : 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // Sign Up Prompt
  signupPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: isTablet ? 28 : 24,
    gap: isTablet ? 8 : 6,
  },
  signupPromptText: {
    fontSize: isTablet ? 15 : 14,
    color: '#718096',
  },
  signupLink: {
    fontSize: isTablet ? 15 : 14,
    color: '#2D3748',
    fontWeight: '700',
  },
});