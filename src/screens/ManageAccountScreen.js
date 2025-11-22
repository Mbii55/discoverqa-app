// src/screens/ManageAccountScreen.js
import React, { useEffect, useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../../config";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const ManageAccountScreen = ({ navigation }) => {
  const { user, signOut } = useAuth();

  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    } else {
      setFullName("");
    }
  }, [user]);

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔒</Text>
          <Text style={styles.emptyTitle}>Not Logged In</Text>
          <Text style={styles.emptyText}>
            Log in to manage your account and profile settings.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.primaryButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleSaveProfile = async () => {
    setSaving(true);
    setStatusMsg("");
    setErrorMsg("");

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });

      if (error) {
        console.log("updateUser error:", error);
        setErrorMsg("Failed to update profile.");
      } else {
        setStatusMsg("Profile updated successfully.");
        setTimeout(() => setStatusMsg(""), 3000);
      }
    } catch (e) {
      console.log("Unexpected error:", e);
      setErrorMsg("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;

    setResetting(true);
    setStatusMsg("");
    setErrorMsg("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email);
      if (error) {
        setErrorMsg("Failed to send password reset email.");
      } else {
        setStatusMsg("Password reset link sent.");
        Alert.alert("Check your email", "We sent you a password reset link.");
      }
    } catch (e) {
      setErrorMsg("Failed to send password reset email.");
    } finally {
      setResetting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone. All your favorites and data will be permanently deleted.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      "Final Confirmation",
      "This is your last chance. Type DELETE to confirm account deletion.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "I'm Sure, Delete",
          style: "destructive",
          onPress: executeDeleteAccount,
        },
      ]
    );
  };

  const executeDeleteAccount = async () => {
    setDeleting(true);
    setStatusMsg("");
    setErrorMsg("");

    try {
      // First, delete user data from favorites table
      const { error: favoritesError } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id);

      if (favoritesError) {
        console.log("Error deleting favorites:", favoritesError);
      }

      // Delete user profile if you have a profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (profileError) {
        console.log("Error deleting profile:", profileError);
      }

      // Finally, delete the auth user
      const { error: deleteError } = await supabase.auth.admin.deleteUser(
        user.id
      );

      if (deleteError) {
        // If admin delete fails (requires service role), try signOut instead
        console.log("Admin delete failed, signing out instead:", deleteError);
        
        Alert.alert(
          "Account Deletion Request",
          "Your account data has been removed. Please contact support@discoverqa.com to complete account deletion, or simply stop using the app.",
          [
            {
              text: "OK",
              onPress: async () => {
                await signOut();
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Home" }],
                });
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Account Deleted",
          "Your account has been permanently deleted.",
          [
            {
              text: "OK",
              onPress: async () => {
                await signOut();
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Home" }],
                });
              },
            },
          ]
        );
      }
    } catch (e) {
      console.log("Delete account error:", e);
      setErrorMsg("Failed to delete account. Please contact support.");
    } finally {
      setDeleting(false);
    }
  };

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Manage Account</Text>
            <Text style={styles.subtitle}>Update your profile information</Text>
          </View>

          {/* Profile Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.currentEmail}>{user.email}</Text>
          </View>

          {/* Status Messages */}
          {statusMsg ? (
            <View style={styles.successMessage}>
              <Text style={styles.successIcon}>✓</Text>
              <Text style={styles.successText}>{statusMsg}</Text>
            </View>
          ) : null}

          {errorMsg ? (
            <View style={styles.errorMessage}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Profile Information Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Profile Information</Text>

            {/* Email Field (Read-only) */}
            <View style={styles.field}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputDisabled}>
                <Text style={styles.inputDisabledText}>{user.email}</Text>
                <View style={styles.lockedBadge}>
                  <Text style={styles.lockedText}>🔒 Locked</Text>
                </View>
              </View>
            </View>

            {/* Full Name Field */}
            <View style={styles.field}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#A0AEC0"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.primaryButton, saving && styles.buttonDisabled]}
              onPress={handleSaveProfile}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Security Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Security</Text>
            <Text style={styles.cardDescription}>
              Update your password to keep your account secure
            </Text>

            <TouchableOpacity
              style={[styles.secondaryButton, resetting && styles.buttonDisabled]}
              onPress={handlePasswordReset}
              disabled={resetting}
            >
              {resetting ? (
                <ActivityIndicator size="small" color="#2D3748" />
              ) : (
                <>
                  <Text style={styles.secondaryButtonIcon}>✉️</Text>
                  <Text style={styles.secondaryButtonText}>
                    Send Password Reset Email
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Danger Zone Card */}
          <View style={styles.dangerCard}>
            <Text style={styles.dangerCardTitle}>⚠️ Danger Zone</Text>
            <Text style={styles.dangerCardDescription}>
              Once you delete your account, there is no going back. All your favorites 
              and data will be permanently deleted.
            </Text>

            <TouchableOpacity
              style={[styles.dangerButton, deleting && styles.buttonDisabled]}
              onPress={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.dangerButtonText}>Delete Account</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              Your email address cannot be changed. If you need to update it, please contact support.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ManageAccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Header
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#718096",
    fontWeight: "500",
  },

  // Avatar Section
  avatarSection: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingVertical: 24,
    marginBottom: 16,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2D3748",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  currentEmail: {
    fontSize: 14,
    color: "#718096",
    fontWeight: "500",
  },

  // Messages
  successMessage: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D4EDDA",
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#28A745",
  },
  successIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  successText: {
    flex: 1,
    color: "#155724",
    fontSize: 14,
    fontWeight: "500",
  },
  errorMessage: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8D7DA",
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#DC3545",
  },
  errorIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  errorText: {
    flex: 1,
    color: "#721C24",
    fontSize: 14,
    fontWeight: "500",
  },

  // Card
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 16,
    lineHeight: 20,
  },

  // Fields
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4A5568",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#F7F8FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#2D3748",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  inputDisabled: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F7F8FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  inputDisabledText: {
    fontSize: 15,
    color: "#718096",
  },
  lockedBadge: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lockedText: {
    fontSize: 11,
    color: "#4A5568",
    fontWeight: "600",
  },

  // Buttons
  primaryButton: {
    backgroundColor: "#2D3748",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  secondaryButton: {
    flexDirection: "row",
    backgroundColor: "#F7F8FA",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  secondaryButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  secondaryButtonText: {
    color: "#2D3748",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // Info Card
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#EBF8FF",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BEE3F8",
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#2C5282",
    lineHeight: 18,
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: "#718096",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  
// Danger Zone Card
dangerCard: {
  backgroundColor: '#FFF5F5',
  borderRadius: 12,
  padding: 20,
  marginHorizontal: 20,
  marginBottom: 20,
  borderWidth: 1,
  borderColor: '#FED7D7',
},
dangerCardTitle: {
  fontSize: 18,
  fontWeight: '700',
  color: '#C53030',
  marginBottom: 8,
},
dangerCardDescription: {
  fontSize: 14,
  lineHeight: 20,
  color: '#742A2A',
  marginBottom: 16,
},

// Danger Button
dangerButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#E53E3E',
  paddingVertical: 14,
  paddingHorizontal: 20,
  borderRadius: 8,
  gap: 8,
},
dangerButtonIcon: {
  fontSize: 16,
},
dangerButtonText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: '600',
},
});