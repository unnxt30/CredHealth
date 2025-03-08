import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  useColorScheme,
  Dimensions
} from 'react-native';
import { Heart, Award, TrendingUp, Shield, ArrowRight, Menu } from 'react-native-feather';

const { width } = Dimensions.get('window');

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  
  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1A1A1A' : '#F9FAFB',
    flex: 1,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Heart stroke={isDarkMode ? "#4ADE80" : "#10B981"} width={24} height={24} />
            <Text style={[styles.logoText, isDarkMode && styles.textLight]}>HealthCredit</Text>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Menu stroke={isDarkMode ? "#F9FAFB" : "#1F2937"} width={24} height={24} />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={[styles.heroTitle, isDarkMode && styles.textLight]}>
            Turn Healthy Habits Into Financial Rewards
          </Text>
          <Text style={[styles.heroSubtitle, isDarkMode && styles.textMuted]}>
            Earn credit and financial benefits by maintaining a healthy lifestyle
          </Text>
          <View style={styles.heroImageContainer}>
            <Image
              source={{ uri: 'https://via.placeholder.com/600x400?text=Health+App' }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.ctaContainer}>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.secondaryButton, isDarkMode && styles.secondaryButtonDark]}>
              <Text style={[styles.secondaryButtonText, isDarkMode && styles.textLight]}>Learn More</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.textLight]}>How It Works</Text>
          
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Heart stroke="#FFFFFF" width={24} height={24} />
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, isDarkMode && styles.textLight]}>Track Health Metrics</Text>
              <Text style={[styles.featureDescription, isDarkMode && styles.textMuted]}>
                Connect your fitness devices and health apps to automatically track your progress
              </Text>
            </View>
          </View>
          
          <View style={styles.featureCard}>
            <View style={[styles.featureIconContainer, { backgroundColor: '#8B5CF6' }]}>
              <Award stroke="#FFFFFF" width={24} height={24} />
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, isDarkMode && styles.textLight]}>Earn Health Points</Text>
              <Text style={[styles.featureDescription, isDarkMode && styles.textMuted]}>
                Complete health challenges and daily goals to earn points
              </Text>
            </View>
          </View>
          
          <View style={styles.featureCard}>
            <View style={[styles.featureIconContainer, { backgroundColor: '#EC4899' }]}>
              <TrendingUp stroke="#FFFFFF" width={24} height={24} />
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, isDarkMode && styles.textLight]}>Convert to Credit</Text>
              <Text style={[styles.featureDescription, isDarkMode && styles.textMuted]}>
                Transform your health points into financial benefits, discounts, and credit score boosts
              </Text>
            </View>
          </View>
          
          <View style={styles.featureCard}>
            <View style={[styles.featureIconContainer, { backgroundColor: '#F59E0B' }]}>
              <Shield stroke="#FFFFFF" width={24} height={24} />
            </View>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, isDarkMode && styles.textLight]}>Secure & Private</Text>
              <Text style={[styles.featureDescription, isDarkMode && styles.textMuted]}>
                Your health data is encrypted and never sold to third parties
              </Text>
            </View>
          </View>
        </View>

        {/* Benefits Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.textLight]}>Benefits</Text>
          
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <Text style={[styles.benefitNumber, isDarkMode && styles.textLight]}>15%</Text>
              <Text style={[styles.benefitText, isDarkMode && styles.textMuted]}>Average insurance discount</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Text style={[styles.benefitNumber, isDarkMode && styles.textLight]}>30+</Text>
              <Text style={[styles.benefitText, isDarkMode && styles.textMuted]}>Partner financial institutions</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Text style={[styles.benefitNumber, isDarkMode && styles.textLight]}>50pts</Text>
              <Text style={[styles.benefitText, isDarkMode && styles.textMuted]}>Average credit score increase</Text>
            </View>
          </View>
        </View>

        {/* Testimonial Section */}
        <View style={[styles.testimonialSection, isDarkMode && styles.testimonialSectionDark]}>
          <Text style={styles.testimonialQuote}>
            "HealthCredit helped me improve both my physical health and financial wellbeing at the same time!"
          </Text>
          <View style={styles.testimonialAuthor}>
            <Image
              source={{ uri: 'https://via.placeholder.com/60x60' }}
              style={styles.testimonialAvatar}
            />
            <View>
              <Text style={styles.testimonialName}>Sarah Johnson</Text>
              <Text style={styles.testimonialRole}>Member since 2023</Text>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={[styles.ctaTitle, isDarkMode && styles.textLight]}>
            Ready to turn your health into wealth?
          </Text>
          <TouchableOpacity style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Download Now</Text>
            <ArrowRight stroke="#FFFFFF" width={20} height={20} />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={[styles.footer, isDarkMode && styles.footerDark]}>
          <View style={styles.footerTop}>
            <View style={styles.footerColumn}>
              <Text style={styles.footerColumnTitle}>HealthCredit</Text>
              <Text style={styles.footerLink}>About Us</Text>
              <Text style={styles.footerLink}>Careers</Text>
              <Text style={styles.footerLink}>Press</Text>
            </View>
            
            <View style={styles.footerColumn}>
              <Text style={styles.footerColumnTitle}>Resources</Text>
              <Text style={styles.footerLink}>Blog</Text>
              <Text style={styles.footerLink}>Help Center</Text>
              <Text style={styles.footerLink}>Contact</Text>
            </View>
            
            <View style={styles.footerColumn}>
              <Text style={styles.footerColumnTitle}>Legal</Text>
              <Text style={styles.footerLink}>Privacy</Text>
              <Text style={styles.footerLink}>Terms</Text>
              <Text style={styles.footerLink}>Security</Text>
            </View>
          </View>
          
          <View style={styles.footerBottom}>
            <Text style={styles.footerCopyright}>
              © {new Date().getFullYear()} HealthCredit. All rights reserved.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
    color: '#1F2937',
  },
  menuButton: {
    padding: 8,
  },
  heroSection: {
    padding: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    color: '#1F2937',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 24,
  },
  heroImageContainer: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  heroImage: {
    width: '100%',
    height: 200,
  },
  ctaContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonDark: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
  },
  secondaryButtonText: {
    color: '#1F2937',
    fontWeight: '600',
    fontSize: 16,
  },
  sectionContainer: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 24,
  },
  featureCard: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  benefitsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  benefitItem: {
    width: width > 600 ? '30%' : '100%',
    marginBottom: 16,
    alignItems: 'center',
  },
  benefitNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 4,
  },
  benefitText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  testimonialSection: {
    backgroundColor: '#F3F4F6',
    padding: 24,
    borderRadius: 12,
    margin: 24,
  },
  testimonialSectionDark: {
    backgroundColor: '#374151',
  },
  testimonialQuote: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  testimonialAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testimonialAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  testimonialName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  testimonialRole: {
    fontSize: 14,
    color: '#6B7280',
  },
  ctaSection: {
    padding: 24,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 24,
  },
  ctaButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginRight: 8,
  },
  footer: {
    backgroundColor: '#F9FAFB',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerDark: {
    backgroundColor: '#1F2937',
    borderTopColor: '#374151',
  },
  footerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  footerColumn: {
    width: width > 600 ? '30%' : '100%',
    marginBottom: 24,
  },
  footerColumnTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  footerLink: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  footerBottom: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 24,
  },
  footerCopyright: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  textLight: {
    color: '#F9FAFB',
  },
  textMuted: {
    color: '#9CA3AF',
  },
});

export default App;