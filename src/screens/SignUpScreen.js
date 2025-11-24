// src/screens/SignUpScreen.js
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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../config';

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isTablet = SCREEN_WIDTH >= 600;

const SignUpScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    setIsLoading(true);
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setFormError('');

    if (!fullName || !email || !password) {
      setFormError('Please fill in all required fields.');
      if (!fullName) setNameError('Enter your name');
      if (!email) setEmailError('Enter your email');
      if (!password) setPasswordError('Enter a password');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        console.log('Supabase signUp error:', error);
        const msg = (error.message || '').toLowerCase();

        if (msg.includes('email')) {
          setEmailError('Invalid or already used email');
        } else if (msg.includes('password')) {
          setPasswordError('Password should be at least 6 characters');
        } else {
          setFormError('Registration failed. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      console.log('User registered:', data.user?.email);
      navigation.navigate('Login');
    } catch (e) {
      console.log('Unexpected signUp error:', e);
      setFormError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join DiscoverQA to save favorites and personalize your experience
            </Text>
          </View>

          {/* Form Error */}
          {formError ? (
            <View style={styles.formErrorContainer}>
              <Text style={styles.formErrorIcon}>⚠️</Text>
              <Text style={styles.formErrorText}>{formError}</Text>
            </View>
          ) : null}

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Full Name Field */}
            <View style={styles.field}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[styles.input, nameError && styles.inputError]}
                placeholder="Enter your full name"
                placeholderTextColor="#A0AEC0"
                onChangeText={setFullName}
                value={fullName}
                autoCapitalize="words"
              />
              {nameError ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.errorText}>{nameError}</Text>
                </View>
              ) : null}
            </View>

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
                placeholder="Create a strong password"
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
              ) : (
                <Text style={styles.helperText}>
                  Must be at least 6 characters
                </Text>
              )}
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.signupButton, isLoading && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Terms Notice */}
            <Text style={styles.termsText}>
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>

          {/* Login Prompt */}
          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUpScreen;

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
    marginBottom: isTablet ? 32 : 24,
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

  // Form Error
  formErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8D7DA',
    marginBottom: 16,
    padding: isTablet ? 16 : 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#DC3545',
  },
  formErrorIcon: {
    fontSize: isTablet ? 20 : 18,
    marginRight: isTablet ? 12 : 10,
  },
  formErrorText: {
    flex: 1,
    color: '#721C24',
    fontSize: isTablet ? 15 : 14,
    fontWeight: '500',
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
  helperText: {
    fontSize: isTablet ? 13 : 12,
    color: '#718096',
    marginTop: isTablet ? 8 : 6,
  },

  // Sign Up Button
  signupButton: {
    backgroundColor: '#2D3748',
    borderRadius: isTablet ? 14 : 12,
    paddingVertical: isTablet ? 18 : 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: isTablet ? 17 : 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // Terms
  termsText: {
    fontSize: isTablet ? 13 : 12,
    color: '#718096',
    textAlign: 'center',
    lineHeight: isTablet ? 20 : 18,
  },

  // Login Prompt
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: isTablet ? 28 : 24,
    gap: isTablet ? 8 : 6,
  },
  loginPromptText: {
    fontSize: isTablet ? 15 : 14,
    color: '#718096',
  },
  loginLink: {
    fontSize: isTablet ? 15 : 14,
    color: '#2D3748',
    fontWeight: '700',
  },
});