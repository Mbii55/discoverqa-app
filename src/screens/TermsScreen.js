import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Terms & Conditions</Text>
        <Text style={styles.lastUpdated}>Last updated: 20/10/2025</Text>

        <Text style={styles.paragraph}>
          Welcome to DiscoverQA. These Terms & Conditions ("Terms") govern your use of 
          the DiscoverQA mobile application ("App", "Service"). By accessing or using 
          DiscoverQA, you agree to be bound by these Terms. If you do not agree, please 
          do not use the App.
        </Text>

        <Text style={styles.heading}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By creating an account or using DiscoverQA, you confirm that:
        </Text>
        <Text style={styles.listItem}>• You are at least 18 years old, OR you are between 13 and 17 years old with parental or guardian consent</Text>
        <Text style={styles.listItem}>• You have the legal capacity to enter into these Terms</Text>
        <Text style={styles.listItem}>• You will comply with all applicable laws and regulations in Qatar</Text>
        <Text style={styles.paragraph}>
          Users under 18 must have permission from a parent or legal guardian to use the App.
        </Text>

        <Text style={styles.heading}>2. Description of Service</Text>
        <Text style={styles.paragraph}>
          DiscoverQA is an informational app that provides users with:
        </Text>
        <Text style={styles.listItem}>• Access to events happening in Qatar</Text>
        <Text style={styles.listItem}>• Information about places and attractions in Qatar</Text>
        <Text style={styles.listItem}>• The ability to save favorites and set event reminders</Text>
        <Text style={styles.paragraph}>
          All event and place data is sourced from third-party providers (including PredictHQ 
          and Serper) and may be subject to change or inaccuracies. DiscoverQA does not 
          guarantee the accuracy, completeness, or timeliness of any information provided.
        </Text>

        <Text style={styles.heading}>3. User Accounts</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Account Creation:</Text> To use certain features, you 
          must create an account with a valid email address and password.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Account Security:</Text> You are responsible for 
          maintaining the confidentiality of your account credentials and for all activities 
          that occur under your account. You agree to notify us immediately of any 
          unauthorized use of your account.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Account Termination:</Text> We may suspend or terminate 
          your account at any time, with or without notice, for violation of these Terms or 
          for any other reason at our sole discretion.
        </Text>

        <Text style={styles.heading}>4. Acceptable Use</Text>
        <Text style={styles.paragraph}>
          You agree NOT to:
        </Text>
        <Text style={styles.listItem}>• Use the App for any illegal purpose under the laws of Qatar</Text>
        <Text style={styles.listItem}>• Violate Qatar's public order, morals, or religious values</Text>
        <Text style={styles.listItem}>• Attempt to gain unauthorized access to the App or its systems</Text>
        <Text style={styles.listItem}>• Interfere with or disrupt the App's functionality</Text>
        <Text style={styles.listItem}>• Use automated systems (bots, scrapers) to access the App</Text>
        <Text style={styles.listItem}>• Impersonate another person or entity</Text>
        <Text style={styles.listItem}>• Upload malicious code, viruses, or harmful content</Text>
        <Text style={styles.listItem}>• Harass, abuse, or harm other users</Text>

        <Text style={styles.heading}>5. User Content</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Favorites:</Text> When you save events or places as 
          favorites, this data is stored in your account and remains private to you. We do 
          not claim ownership of your favorites.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Notifications:</Text> By setting event reminders, you 
          consent to receiving local notifications on your device. You may disable these at 
          any time through your device settings.
        </Text>

        <Text style={styles.heading}>6. Third-Party Services</Text>
        <Text style={styles.paragraph}>
          DiscoverQA integrates with third-party services including:
        </Text>
        <Text style={styles.listItem}>• Supabase (authentication and database)</Text>
        <Text style={styles.listItem}>• PredictHQ (event data)</Text>
        <Text style={styles.listItem}>• Serper (place information)</Text>
        <Text style={styles.listItem}>• Google Maps (navigation)</Text>
        <Text style={styles.paragraph}>
          These services operate under their own terms and privacy policies. We are not 
          responsible for the content, accuracy, or practices of third-party services. Your 
          use of third-party services is at your own risk.
        </Text>

        <Text style={styles.heading}>7. Data Protection & Privacy</Text>
        <Text style={styles.paragraph}>
          DiscoverQA follows Qatar’s Personal Data Privacy Protection Law (PDPL). By using 
          the App, you acknowledge that your data may be processed or stored by third-party 
          providers outside Qatar. You may request access, correction, deletion, or 
          withdrawal of consent regarding your personal data at any time.
        </Text>

        <Text style={styles.heading}>8. Intellectual Property</Text>
        <Text style={styles.paragraph}>
          The DiscoverQA app, including its design, logo, interface, and original content, 
          is the intellectual property of DiscoverQA and is protected by copyright and 
          trademark laws.
        </Text>
        <Text style={styles.paragraph}>
          Event data, place information, images, and other third-party content remain the 
          property of their respective owners. We do not claim ownership of such content.
        </Text>

        <Text style={styles.heading}>9. Disclaimer of Warranties</Text>
        <Text style={styles.paragraph}>
          THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
          EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT:
        </Text>
        <Text style={styles.listItem}>• The App will be uninterrupted or error-free</Text>
        <Text style={styles.listItem}>• All information will be accurate or up-to-date</Text>
        <Text style={styles.listItem}>• The App will meet your specific requirements</Text>
        <Text style={styles.listItem}>• Any errors or defects will be corrected</Text>

        <Text style={styles.heading}>10. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          TO THE MAXIMUM EXTENT PERMITTED UNDER QATAR LAW, DISCOVERQA AND ITS AFFILIATES 
          SHALL NOT BE LIABLE FOR:
        </Text>
        <Text style={styles.listItem}>• Any indirect, incidental, special, or consequential damages</Text>
        <Text style={styles.listItem}>• Loss of profits, data, or business opportunities</Text>
        <Text style={styles.listItem}>• Damages resulting from inaccurate event or place information</Text>
        <Text style={styles.listItem}>• Harm arising from attending events or visiting locations listed in the App</Text>
        <Text style={styles.listItem}>• Issues caused by third-party services or external links</Text>
        <Text style={styles.paragraph}>
          Our total liability shall not exceed the amount you paid to use the App (currently 
          0 QAR, as the App is free).
        </Text>

        <Text style={styles.heading}>11. Service Availability</Text>
        <Text style={styles.paragraph}>
          We reserve the right to modify, suspend, or discontinue the App (or any part 
          thereof) at any time, with or without notice, for any reason. We are not liable 
          for any service interruptions or discontinuations.
        </Text>

        <Text style={styles.heading}>12. Fees and Payments</Text>
        <Text style={styles.paragraph}>
          DiscoverQA is currently free to use. We reserve the right to introduce fees for 
          certain features in the future, with advance notice to users.
        </Text>

        <Text style={styles.heading}>13. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We may update these Terms from time to time. When updates occur, the "Last 
          updated" date will be modified. Your continued use of the App after changes are 
          posted constitutes acceptance of the updated Terms.
        </Text>

        <Text style={styles.heading}>14. Governing Law</Text>
        <Text style={styles.paragraph}>
          These Terms shall be governed by and construed in accordance with the laws of 
          Qatar. Any disputes arising from these Terms or your use of the App shall be 
          subject to the exclusive jurisdiction of the courts of Qatar.
        </Text>

        <Text style={styles.heading}>15. Dispute Resolution</Text>
        <Text style={styles.paragraph}>
          If you have a dispute with DiscoverQA, please contact us first at 
          mbii5567@hotmail.com so we may attempt to resolve the issue informally. Arbitration 
          will only occur if both parties provide separate, explicit written consent in 
          accordance with Qatar’s Arbitration Law.
        </Text>

        <Text style={styles.heading}>16. Severability</Text>
        <Text style={styles.paragraph}>
          If any provision of these Terms is found to be unenforceable or invalid, that 
          provision will be limited or removed to the minimum extent necessary, and the 
          remaining provisions will remain in full force and effect.
        </Text>

        <Text style={styles.heading}>16. Contact Information</Text>
        <Text style={styles.paragraph}>
          If you have questions about these Terms & Conditions, please contact us:
        </Text>
        <Text style={styles.contactInfo}>Email: mbii5567@hotmail.com</Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} DiscoverQA. All rights reserved.
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
  lastUpdated: {
    fontSize: 14,
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
    marginBottom: 12,
  },
  listItem: {
    fontSize: 15,
    lineHeight: 24,
    color: "#2D3748",
    marginBottom: 8,
    marginLeft: 16,
  },
  bold: {
    fontWeight: "600",
    color: "#1A202C",
  },
  contactInfo: {
    fontSize: 15,
    lineHeight: 24,
    color: "#2D3748",
    marginBottom: 8,
    marginLeft: 16,
    fontWeight: "500",
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
});