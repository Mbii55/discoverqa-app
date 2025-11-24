// src/screens/ResetPasswordScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../config';

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isTablet = SCREEN_WIDTH >= 600;

const ResetPasswordScreen = ({ navigation, route }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleResetPassword = async () => {
    setError('');

    // Validation
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('Reset password error:', error);
        setError('Failed to reset password. Please try again.');
      } else {
        Alert.alert(
          'Success',
          'Your password has been reset successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      }
    } catch (e) {
      console.error('Unexpected error:', e);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
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
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your new password below
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* New Password Field */}
            <View style={styles.field}>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor="#A0AEC0"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                autoCapitalize="none"
              />
            </View>

            {/* Confirm Password Field */}
            <View style={styles.field}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                placeholderTextColor="#A0AEC0"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
              />
              <Text style={styles.helperText}>
                Must be at least 6 characters
              </Text>
            </View>

            {/* Reset Button */}
            <TouchableOpacity
              style={[styles.resetButton, loading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.resetButtonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Back to Login */}
          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>Remember your password?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

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

  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    padding: isTablet ? 16 : 14,
    borderRadius: 12,
    marginBottom: isTablet ? 24 : 20,
    borderLeftWidth: 4,
    borderLeftColor: '#E53E3E',
  },
  errorIcon: {
    fontSize: isTablet ? 20 : 18,
    marginRight: isTablet ? 12 : 10,
  },
  errorText: {
    flex: 1,
    color: '#E53E3E',
    fontSize: isTablet ? 15 : 14,
    fontWeight: '500',
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
  helperText: {
    fontSize: isTablet ? 13 : 12,
    color: '#718096',
    marginTop: isTablet ? 8 : 6,
  },

  // Reset Button
  resetButton: {
    backgroundColor: '#2D3748',
    borderRadius: isTablet ? 14 : 12,
    paddingVertical: isTablet ? 18 : 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: isTablet ? 17 : 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
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

export default ResetPasswordScreen;