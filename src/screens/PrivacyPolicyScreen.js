import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last updated: 20/10/2025</Text>

        <Text style={styles.paragraph}>
          Your privacy is important to us. This Privacy Policy explains how DiscoverQA 
          ("we", "us", or "our") collects, uses, and protects your personal information 
          when you use our mobile application ("App").
        </Text>
        <Text style={styles.paragraph}>
          DiscoverQA processes personal data in accordance with the applicable laws of the 
          State of Qatar, including Qatar’s Personal Data Privacy Protection Law 
          (Law No. 13 of 2016) ("PDPL").
        </Text>

        <Text style={styles.heading}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We collect the following types of information:
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Personal Information:</Text> When you create an account, 
          we collect your full name and email address. This information is necessary to 
          create and manage your account and provide access to the App’s features.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Usage Data:</Text> We collect information about the 
          places and events you save as favorites and how you interact with the App. This 
          data is stored securely and associated with your account.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Device Information:</Text> We may collect basic device 
          information such as device type, operating system version, and app version for 
          troubleshooting, analytics, and security purposes. This information does not 
          directly identify you on its own.
        </Text>
        <Text style={styles.paragraph}>
          We do NOT collect sensitive information such as financial data, precise continuous 
          location tracking, or health information.
        </Text>

        <Text style={styles.heading}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use the information we collect to:
        </Text>
        <Text style={styles.listItem}>• Create and manage your account</Text>
        <Text style={styles.listItem}>• Display your profile information within the app</Text>
        <Text style={styles.listItem}>• Sync your favorites across devices</Text>
        <Text style={styles.listItem}>• Send event reminders (with your permission)</Text>
        <Text style={styles.listItem}>• Improve app performance and user experience</Text>
        <Text style={styles.listItem}>• Monitor usage, security, and prevent misuse</Text>
        <Text style={styles.listItem}>• Provide customer support</Text>
        <Text style={styles.paragraph}>
          We process your personal information only for legitimate purposes such as providing 
          and improving the App, fulfilling our contractual obligations to you (for example, 
          creating and managing your account), complying with legal obligations, and based on 
          your consent where required (for example, sending notifications).
        </Text>
        <Text style={styles.paragraph}>
          We do NOT sell, rent, or share your personal information with third parties for 
          their own marketing purposes.
        </Text>

        <Text style={styles.heading}>3. Data Storage and Security</Text>
        <Text style={styles.paragraph}>
          Your data is stored securely using Supabase, a trusted cloud database provider 
          that employs industry-standard encryption and security measures. Your password 
          is never stored in plain text by DiscoverQA—authentication is handled securely 
          by Supabase Auth.
        </Text>
        <Text style={styles.paragraph}>
          While we take reasonable technical and organizational measures to protect your 
          information, no method of transmission over the internet or electronic storage 
          is completely risk-free. We cannot guarantee absolute security.
        </Text>

        <Text style={styles.heading}>4. Third-Party Services</Text>
        <Text style={styles.paragraph}>
          DiscoverQA integrates with the following third-party services:
        </Text>
        <Text style={styles.listItem}>
          • <Text style={styles.bold}>Supabase:</Text> Authentication and database storage
        </Text>
        <Text style={styles.listItem}>
          • <Text style={styles.bold}>PredictHQ:</Text> Event data provider
        </Text>
        <Text style={styles.listItem}>
          • <Text style={styles.bold}>Serper:</Text> Place information and images
        </Text>
        <Text style={styles.listItem}>
          • <Text style={styles.bold}>Expo:</Text> Mobile application framework and tooling
        </Text>
        <Text style={styles.paragraph}>
          These services may collect and process data in accordance with their own privacy 
          policies. We recommend reviewing their privacy policies for more information.
        </Text>
        <Text style={styles.paragraph}>
          Where third-party service providers act as our data processors, they only process 
          your personal data on our behalf and in accordance with our instructions and 
          this Privacy Policy.
        </Text>

        <Text style={styles.heading}>5. Permissions</Text>
        <Text style={styles.paragraph}>
          The app may request the following device permissions:
        </Text>
        <Text style={styles.listItem}>
          • <Text style={styles.bold}>Notifications:</Text> To send you reminders about 
          events you have chosen to be reminded about
        </Text>
        <Text style={styles.paragraph}>
          All permissions are optional and used only for their stated purposes. You can 
          manage or revoke permissions at any time through your device settings.
        </Text>

        <Text style={styles.heading}>6. Data Retention</Text>
        <Text style={styles.paragraph}>
          We retain your personal information for as long as your account is active or as 
          needed to provide you with our services and meet our legal obligations. If you 
          delete your account, we will delete or anonymize your personal information within 
          30 days, except where we are required by law to retain certain information for a 
          longer period.
        </Text>

        <Text style={styles.heading}>7. Your Rights</Text>
        <Text style={styles.paragraph}>
          Subject to applicable law, including Qatar’s PDPL, you have the right to:
        </Text>
        <Text style={styles.listItem}>• Access your personal information</Text>
        <Text style={styles.listItem}>• Update or correct your profile information</Text>
        <Text style={styles.listItem}>• Delete your favorites at any time</Text>
        <Text style={styles.listItem}>• Request deletion of your account and associated data</Text>
        <Text style={styles.listItem}>• Withdraw consent for notifications or other optional features</Text>
        <Text style={styles.listItem}>• Object to certain types of processing, where permitted by law</Text>
        <Text style={styles.listItem}>
          • Lodge a complaint with the competent data protection authority in Qatar if you 
          believe your data protection rights have been violated
        </Text>
        <Text style={styles.paragraph}>
          To exercise these rights or if you have questions about your data, please contact 
          us at: <Text style={styles.bold}>Mbii5567@hotmail.com</Text>
        </Text>

        <Text style={styles.heading}>8. Children's Privacy</Text>
        <Text style={styles.paragraph}>
          DiscoverQA is intended for users aged 18 and older, or for users aged 13 to 17 
          who have obtained parental or guardian consent, as described in our Terms & 
          Conditions. We do not knowingly collect personal information from children under 13. 
          If we become aware that we have collected personal information from a child under 13 
          without appropriate consent, we will delete that information as soon as reasonably 
          possible.
        </Text>

        <Text style={styles.heading}>9. International Users and Data Transfers</Text>
        <Text style={styles.paragraph}>
          Your information may be transferred to and processed in countries other than 
          Qatar, where our service providers (such as Supabase and other third parties) 
          are located. By using DiscoverQA, you consent to the transfer of your information 
          to these countries.
        </Text>
        <Text style={styles.paragraph}>
          We take reasonable steps to ensure that your personal data is protected using 
          appropriate contractual, technical, and organizational safeguards, even where the 
          data protection laws of those countries may differ from those in Qatar.
        </Text>

        <Text style={styles.heading}>10. Changes to This Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time to time to reflect changes in our 
          practices, technologies, or legal requirements. When we do, we will update the 
          "Last updated" date at the top of this Policy. Your continued use of the App 
          after changes are posted constitutes your acceptance of the updated Policy.
        </Text>

        <Text style={styles.heading}>11. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions, concerns, or requests regarding this Privacy Policy 
          or our data practices, please contact us at:
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
    marginBottom: 13,
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