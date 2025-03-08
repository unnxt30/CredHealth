import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View,
  Image,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Shield, Award, TrendingUp, FileText, ArrowRight, Menu } from 'react-native-feather';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

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
          <TouchableOpacity className="p-2">
            <Menu stroke={isDarkMode ? '#F9FAFB' : '#1F2937'} width={24} height={24} />
          </TouchableOpacity>
        </View>

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

          <View className="mb-6 w-full overflow-hidden rounded-xl">
            <Image
              source={{
                uri: 'https://via.placeholder.com/600x400?text=Blockchain+Health+Insurance',
              }}
              className="h-48 w-full"
              resizeMode="cover"
            />
          </View>

          <TouchableOpacity className="rounded-lg bg-emerald-600 px-6 py-3">
            <Text className="font-semibold text-white">Get Started</Text>
          </TouchableOpacity>
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
