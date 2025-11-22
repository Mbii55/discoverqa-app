import React from "react";
import { View, Text, ScrollView, StyleSheet, Linking, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function AboutDiscoverQAScreen() {
  const openEmail = () => {
    const email = 'mbii5567@hotmail.com';
    const subject = 'DiscoverQA Inquiry';
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    Linking.openURL(mailtoUrl);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>About DiscoverQA</Text>
        <Text style={styles.subtitle}>
          Your modern guide to exploring Qatar
        </Text>

        {/* Intro */}
        <Text style={styles.paragraph}>
          DiscoverQA is a smart, fast, and beautifully designed app that helps you 
          find the best events, attractions, and must-visit places across Qatar.
        </Text>

        {/* Section 1 */}
        <Text style={styles.heading}>What DiscoverQA Offers</Text>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.listText}>Live events happening across Qatar</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.listText}>Popular attractions, parks, museums & hotspots</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.listText}>Detailed place & event info powered by real-time APIs</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.listText}>Favorites system to save the places & events you love</Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.listText}>Smart reminders so you never miss important events</Text>
        </View>

        {/* Section 2 */}
        <Text style={styles.heading}>Why We Built It</Text>
        <Text style={styles.paragraph}>
          Qatar is full of exciting experiences — from world-class museums and beaches 
          to sports events, concerts, and cultural activities. But finding everything in 
          one place was always difficult.
        </Text>
        <Text style={styles.paragraph}>
          DiscoverQA solves that problem by providing a clean and reliable way to explore 
          the country effortlessly.
        </Text>

        {/* Section 3 */}
        <Text style={styles.heading}>Powered By</Text>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.listText}>
            <Text style={styles.bold}>PredictHQ</Text> – Live events data
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.listText}>
            <Text style={styles.bold}>Serper</Text> – Popular places information
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.listText}>
            <Text style={styles.bold}>Supabase</Text> – Account & favorites storage
          </Text>
        </View>
        <View style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.listText}>
            <Text style={styles.bold}>Expo + React Native</Text> – Mobile app framework
          </Text>
        </View>

        {/* Section 4 */}
        <Text style={styles.heading}>Privacy & Data</Text>
        <Text style={styles.paragraph}>
          DiscoverQA only stores the minimum data needed — your name, email, and the 
          items you add to favorites. No tracking, no ads, no third-party selling. 
          Your privacy matters to us.
        </Text>

        {/* Contact Section */}
        <Text style={styles.heading}>Get In Touch</Text>
        <Text style={styles.paragraph}>
          Have questions, feedback, or suggestions? We'd love to hear from you!
        </Text>
        <TouchableOpacity style={styles.contactButton} onPress={openEmail}>
          <Ionicons name="mail-outline" size={20} color="#2D3748" />
          <Text style={styles.contactButtonText}>support@discoverqa.com</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} DiscoverQA
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A202C",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#718096",
    marginBottom: 24,
    fontStyle: "italic",
  },
  heading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A202C",
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: "#2D3748",
    marginBottom: 16,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 8,
    paddingLeft: 8,
  },
  bullet: {
    color: "#2D3748",
    fontSize: 15,
    marginRight: 8,
    fontWeight: "600",
  },
  listText: {
    flex: 1,
    color: "#2D3748",
    fontSize: 15,
    lineHeight: 22,
  },
  bold: {
    fontWeight: "600",
    color: "#1A202C",
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F7FAFC",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 8,
  },
  contactButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2D3748",
  },
  footer: {
    marginTop: 40,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    color: "#718096",
  },
  footerCredit: {
    fontSize: 12,
    color: "#A0AEC0",
    marginTop: 4,
  },
});