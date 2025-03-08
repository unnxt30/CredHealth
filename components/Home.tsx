import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View,
  Image,
  TouchableOpacity,
  useColorScheme,
  Button,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Shield, Award, TrendingUp, FileText, ArrowRight, Menu, User } from 'react-native-feather';
import ProfileDashboard from './ProfileDashboard';
import Activities from './Activities';

export interface UserData {
  name: string;
  email: string;
  profilePic: string;
}

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [isLoading, setIsLoading] = useState(false);

  // Mock user data
  const [userData, setUserData] = useState<UserData>({
    name: 'Unnat Sharma',
    email: 'officialunnat30@gmail.com',
    profilePic: '',
  });

  // Features data
  const features = [
    {
      icon: <FileText stroke="#FFFFFF" width={24} height={24} />,
      color: 'bg-emerald-500',
      title: 'Smart Contract Policies',
      description: 'Create health insurance policies with predefined terms and automated payouts',
    },
    {
      icon: <Shield stroke="#FFFFFF" width={24} height={24} />,
      color: 'bg-purple-500',
      title: 'Secure Health Data',
      description: 'Health data verification via oracle and immutable storage on blockchain',
    },
    {
      icon: <TrendingUp stroke="#FFFFFF" width={24} height={24} />,
      color: 'bg-pink-500',
      title: 'Automated Payouts',
      description: 'Trigger claim settlements based on real-time health data',
    },
    {
      icon: <Award stroke="#FFFFFF" width={24} height={24} />,
      color: 'bg-amber-500',
      title: 'Policy NFTs',
      description: 'Generate NFTs representing policies with real-time health status updates',
    },
  ];

  // Menu options
  const menuOptions = [
    { title: 'My Policies', onPress: () => console.log('My Policies pressed') },
    { title: 'Claims', onPress: () => console.log('Claims pressed') },
    {
      title: 'Profile',
      onPress: () => {
        setCurrentScreen('profile');
        setMenuOpen(false);
      },
    },
    {
      title: 'Health Activities',
      onPress: () => {
        setCurrentScreen('activities');
        setMenuOpen(false);
      },
    },
    { title: 'Settings', onPress: () => console.log('Settings pressed') },
  ];

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleSignIn = () => {
    setIsLoading(true);

    // Simulate authentication delay
    setTimeout(() => {
      setIsLoading(false);
      setIsSignedIn(true);
      Alert.alert('Welcome', `Signed in as ${userData.name}`);
    }, 2000); // 2 second delay
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    Alert.alert('Signed Out', 'You have been signed out');
  };

  const handleUpdateProfile = (updatedUserData: UserData) => {
    setUserData(updatedUserData);
  };

  // Render the appropriate screen
  if (currentScreen === 'profile' && isSignedIn) {
    return (
      <ProfileDashboard
        userData={userData}
        onBack={() => setCurrentScreen('home')}
        onUpdateProfile={handleUpdateProfile}
      />
    );
  }

  if (currentScreen === 'activities' && isSignedIn) {
    return <Activities userData={userData} onBack={() => setCurrentScreen('home')} />;
  }

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center">
            <Shield stroke={isDarkMode ? '#4ADE80' : '#10B981'} width={24} height={24} />
            <Text
              className={`ml-2 text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              HealthBlock
            </Text>
          </View>
          {isSignedIn ? (
            <TouchableOpacity className="flex-row items-center" onPress={toggleMenu}>
              <Image source={{ uri: userData.profilePic }} className="mr-2 h-8 w-8 rounded-full" />
              <Menu stroke={isDarkMode ? '#F9FAFB' : '#1F2937'} width={24} height={24} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity className="p-2" onPress={toggleMenu}>
              <Menu stroke={isDarkMode ? '#F9FAFB' : '#1F2937'} width={24} height={24} />
            </TouchableOpacity>
          )}
        </View>

        {/* Dropdown Menu */}
        {menuOpen && (
          <View
            className={`absolute right-4 top-14 z-10 rounded-lg shadow-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
            style={{ width: 200 }}>
            {isSignedIn && (
              <View
                className={`border-b px-4 py-3 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {userData.name}
                </Text>
                <Text className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  {userData.email}
                </Text>
              </View>
            )}
            {menuOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                className={`px-4 py-3 ${
                  index < menuOptions.length - 1
                    ? isDarkMode
                      ? 'border-b border-gray-700'
                      : 'border-b border-gray-200'
                    : ''
                }`}
                onPress={() => {
                  option.onPress();
                  setMenuOpen(false);
                }}>
                <Text className={isDarkMode ? 'text-white' : 'text-gray-800'}>{option.title}</Text>
              </TouchableOpacity>
            ))}
            {isSignedIn && (
              <TouchableOpacity
                className={`px-4 py-3 ${isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}
                onPress={() => {
                  handleSignOut();
                  setMenuOpen(false);
                }}>
                <Text className={isDarkMode ? 'text-red-400' : 'text-red-500'}>Sign Out</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Hero Section */}
        <View className="items-center px-6 py-8">
          <Text
            className={`mb-3 text-center text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Parametric Health Insurance on Blockchain
          </Text>
          <Text
            className={`mb-6 text-center text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
            Smart policies, automated claims, and verified health data in a decentralized ecosystem.
          </Text>

          {isSignedIn ? (
            <View className="items-center space-y-3">
              <View className="mb-4 flex-row items-center rounded-lg bg-emerald-50 p-4">
                <Image
                  source={{ uri: userData.profilePic }}
                  className="mr-3 h-12 w-12 rounded-full"
                />
                <View>
                  <Text className="text-lg font-bold text-gray-800">{userData.name}</Text>
                  <Text className="text-gray-600">Active Member</Text>
                </View>
              </View>
              <TouchableOpacity
                className="mb-2 rounded-lg bg-emerald-600 px-6 py-3"
                onPress={() => console.log('View policies')}>
                <Text className="font-semibold text-white">View My Policies</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="rounded-lg bg-purple-600 px-6 py-3"
                onPress={() => setCurrentScreen('activities')}>
                <Text className="font-semibold text-white">Track Health Activities</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="items-center space-y-3">
              {isLoading ? (
                <View className="items-center space-y-3">
                  <ActivityIndicator size="large" color="#10B981" />
                  <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Authenticating...
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  className="flex-row items-center rounded-lg bg-white px-6 py-3 shadow-sm"
                  onPress={handleSignIn}>
                  <Image
                    source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
                    style={{ width: 24, height: 24, marginRight: 8 }}
                  />
                  <Text className="font-semibold text-gray-700">Sign in with Google</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Features Section */}
        <View className="px-6 py-6">
          <Text
            className={`mb-6 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Key Features
          </Text>

          {features.map((feature, index) => (
            <View
              key={index}
              className={`mb-4 flex-row rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <View
                className={`h-12 w-12 rounded-full ${feature.color} mr-4 items-center justify-center`}>
                {feature.icon}
              </View>
              <View className="flex-1">
                <Text
                  className={`mb-1 text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {feature.title}
                </Text>
                <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA Section */}
        <View className="items-center px-6 py-8">
          <Text
            className={`mb-6 text-center text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Join the Future of Health Insurance
          </Text>
          <TouchableOpacity className="flex-row items-center rounded-lg bg-emerald-600 px-6 py-3">
            <Text className="mr-2 font-semibold text-white">Get Started</Text>
            <ArrowRight stroke="#FFFFFF" width={20} height={20} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
