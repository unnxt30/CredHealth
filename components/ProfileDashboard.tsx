import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View,
  Image,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';
import { Shield, ArrowLeft, Camera, Upload, Image as ImageIcon } from 'react-native-feather';
import { UserData } from './Home'; // Import the UserData interface
import * as ImagePicker from 'expo-image-picker';

interface ProfileDashboardProps {
  userData: UserData;
  onBack: () => void;
  onUpdateProfile: (userData: UserData) => void;
}

const ProfileDashboard = ({ userData, onBack, onUpdateProfile }: ProfileDashboardProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [profileImage, setProfileImage] = useState(userData.profilePic);

  // Request permissions and open image picker
  const pickImage = async () => {
    // Request media library permissions
    const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (galleryPermission.status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to upload images.'
      );
      return;
    }

    // Open image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0].uri;
      setProfileImage(selectedImage);
      onUpdateProfile({ ...userData, profilePic: selectedImage });
      Alert.alert('Success', 'Profile picture updated successfully!');
    }
  };

  // Request permissions and open camera
  const takePhoto = async () => {
    // Request camera permissions
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

    if (cameraPermission.status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your camera to take photos.');
      return;
    }

    // Open camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const capturedImage = result.assets[0].uri;
      setProfileImage(capturedImage);
      onUpdateProfile({ ...userData, profilePic: capturedImage });
      Alert.alert('Success', 'Profile picture updated successfully!');
    }
  };

  // Show image source options
  const handleImageUpload = () => {
    Alert.alert(
      'Update Profile Picture',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: takePhoto,
        },
        {
          text: 'Choose from Gallery',
          onPress: pickImage,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={onBack} className="mr-3">
            <ArrowLeft stroke={isDarkMode ? '#F9FAFB' : '#1F2937'} width={24} height={24} />
          </TouchableOpacity>
          <View className="flex-row items-center">
            <Shield stroke={isDarkMode ? '#4ADE80' : '#10B981'} width={24} height={24} />
            <Text
              className={`ml-2 text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Profile Dashboard
            </Text>
          </View>
        </View>

        {/* Profile Section */}
        <View className="items-center px-6 py-8">
          <View className="relative">
            <Image
              source={{ uri: profileImage }}
              className="h-32 w-32 rounded-full border-4 border-emerald-500"
            />
            <TouchableOpacity
              className="absolute bottom-0 right-0 rounded-full bg-emerald-500 p-2"
              onPress={handleImageUpload}>
              <Camera stroke="#FFFFFF" width={20} height={20} />
            </TouchableOpacity>
          </View>

          <Text
            className={`mt-4 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            {userData.name}
          </Text>
          <Text className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
            {userData.email}
          </Text>

          <View className="mt-6 flex-row space-x-3">
            <TouchableOpacity
              className="flex-row items-center rounded-lg bg-emerald-600 px-5 py-3"
              onPress={takePhoto}>
              <Camera stroke="#FFFFFF" width={20} height={20} />
              <Text className="ml-2 font-semibold text-white">Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center rounded-lg bg-purple-600 px-5 py-3"
              onPress={pickImage}>
              <ImageIcon stroke="#FFFFFF" width={20} height={20} />
              <Text className="ml-2 font-semibold text-white">Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* User Info Section */}
        <View className="px-6 py-4">
          <Text className={`mb-4 text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Personal Information
          </Text>

          <View className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 shadow-sm`}>
            <View className="mb-4 border-b border-gray-200 pb-2">
              <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Full Name
              </Text>
              <Text
                className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {userData.name}
              </Text>
            </View>

            <View className="mb-4 border-b border-gray-200 pb-2">
              <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Email Address
              </Text>
              <Text
                className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {userData.email}
              </Text>
            </View>

            <View className="mb-4 border-b border-gray-200 pb-2">
              <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Member Since
              </Text>
              <Text
                className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                June 2023
              </Text>
            </View>

            <View>
              <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Account Type
              </Text>
              <Text
                className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Premium
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileDashboard;
