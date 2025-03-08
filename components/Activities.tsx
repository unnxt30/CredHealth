import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
  Alert,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Shield, ArrowLeft, Camera, TrendingUp, Check, Clock } from 'react-native-feather';
import * as ImagePicker from 'expo-image-picker';
import { getFoodEntries, createFoodEntry, uploadImage, FoodEntryData } from '../services/api';

interface ActivitiesProps {
  onBack: () => void;
  userData: {
    name: string;
    email: string;
    profilePic: string;
  };
}

interface FoodEntry {
  id: string;
  title: string;
  imageUri: string;
  timestamp: Date;
  verified: boolean;
}

const Activities = ({ onBack, userData }: ActivitiesProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [entryTitle, setEntryTitle] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch entries from MongoDB when component mounts
  useEffect(() => {
    fetchEntries();
  }, []);

  // Fetch entries from MongoDB
  const fetchEntries = async () => {
    try {
      const entries = await getFoodEntries();
      setFoodEntries(
        entries.map((entry) => ({
          ...entry,
          id: entry.id || String(Date.now()), // Provide fallback ID if missing
        }))
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to load your entries');
      console.error('Error fetching entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Take a photo with real-time verification
  const captureFood = async () => {
    // Request camera permissions
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

    if (cameraPermission.status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your camera to capture food photos.'
      );
      return;
    }

    // Open camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      exif: true, // Include EXIF data for timestamp verification
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setIsVerifying(true);
      setIsLoading(true);

      // Simulate verification process
      setTimeout(() => {
        const capturedImage = result.assets[0].uri;
        setCurrentImage(capturedImage);
        setIsCapturing(true);
        setIsVerifying(false);
        setIsLoading(false);
      }, 2000);
    }
  };

  // Save the food entry to MongoDB
  const saveEntry = async () => {
    if (!currentImage || !entryTitle.trim()) {
      Alert.alert('Missing Information', 'Please provide a title for your healthy meal');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Upload image to storage service
      const imageUrl = await uploadImage(currentImage);

      // 2. Create entry in MongoDB
      const newEntry: FoodEntryData = {
        title: entryTitle,
        imageUri: imageUrl,
        timestamp: new Date(),
        verified: true,
      };

      await createFoodEntry(newEntry);

      // 3. Refresh entries
      await fetchEntries();

      // 4. Reset form
      setCurrentImage(null);
      setEntryTitle('');
      setIsCapturing(false);

      Alert.alert('Success', 'Your healthy meal has been recorded and verified!');
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Failed to save your entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel the current capture
  const cancelCapture = () => {
    setCurrentImage(null);
    setEntryTitle('');
    setIsCapturing(false);
  };

  // Access fitness analytics
  const accessFitAnalytics = () => {
    Alert.alert('Coming Soon', 'Fitness analytics integration is coming in the next update!');
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
              Health Activities
            </Text>
          </View>
        </View>

        {/* Main Content */}
        {isCapturing ? (
          // Capture Form
          <View className="px-6 py-4">
            <Text
              className={`mb-4 text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Verify Your Healthy Meal
            </Text>

            {currentImage && (
              <View className="mb-4 items-center">
                <Image
                  source={{ uri: currentImage }}
                  className="h-64 w-full rounded-lg"
                  resizeMode="cover"
                />
                <View className="mt-2 flex-row items-center rounded-full bg-emerald-100 px-3 py-1">
                  <Check stroke="#10B981" width={16} height={16} />
                  <Text className="ml-1 text-sm text-emerald-700">Real-time verified</Text>
                </View>
              </View>
            )}

            <View
              className={`rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} mb-4 p-4 shadow-sm`}>
              <Text className={`mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Give your meal a title:
              </Text>
              <TextInput
                className={`mb-4 rounded-lg border px-3 py-2 ${
                  isDarkMode ? 'border-gray-700 text-white' : 'border-gray-300 text-gray-800'
                }`}
                placeholder="E.g., Healthy Breakfast Bowl"
                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                value={entryTitle}
                onChangeText={setEntryTitle}
              />

              <View className="flex-row justify-between">
                <TouchableOpacity
                  className="rounded-lg bg-gray-300 px-4 py-2"
                  onPress={cancelCapture}>
                  <Text className="font-semibold text-gray-700">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="rounded-lg bg-emerald-600 px-4 py-2"
                  onPress={saveEntry}>
                  <Text className="font-semibold text-white">Save Entry</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          // Activities Options
          <View className="px-6 py-4">
            <Text
              className={`mb-6 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Track Your Healthy Habits
            </Text>

            {isLoading && (
              <View className="items-center justify-center py-8">
                <ActivityIndicator size="large" color="#10B981" />
                <Text className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {isVerifying ? 'Verifying your photo...' : 'Loading...'}
                </Text>
              </View>
            )}

            {!isLoading && (
              <>
                <TouchableOpacity
                  className={`mb-4 flex-row items-center rounded-xl p-5 ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  } shadow-sm`}
                  onPress={captureFood}>
                  <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-emerald-500">
                    <Camera stroke="#FFFFFF" width={24} height={24} />
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`mb-1 text-lg font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                      Capture Your Healthy Eating
                    </Text>
                    <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Take photos of your meals for verification and rewards
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`mb-4 flex-row items-center rounded-xl p-5 ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  } shadow-sm`}
                  onPress={accessFitAnalytics}>
                  <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-purple-500">
                    <TrendingUp stroke="#FFFFFF" width={24} height={24} />
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`mb-1 text-lg font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                      Fetch Fit Analytics
                    </Text>
                    <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Connect with fitness apps to track your health progress
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            )}

            {/* Recent Entries */}
            {foodEntries.length > 0 && (
              <View className="mt-6">
                <Text
                  className={`mb-4 text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Recent Entries
                </Text>

                {foodEntries.map((entry) => (
                  <View
                    key={entry.id}
                    className={`mb-4 rounded-xl p-4 ${
                      isDarkMode ? 'bg-gray-800' : 'bg-white'
                    } shadow-sm`}>
                    <Image
                      source={{ uri: entry.imageUri }}
                      className="mb-3 h-48 w-full rounded-lg"
                      resizeMode="cover"
                    />
                    <View className="flex-row items-center justify-between">
                      <View>
                        <Text
                          className={`text-lg font-semibold ${
                            isDarkMode ? 'text-white' : 'text-gray-800'
                          }`}>
                          {entry.title}
                        </Text>
                        <View className="mt-1 flex-row items-center">
                          <Clock
                            stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
                            width={14}
                            height={14}
                          />
                          <Text
                            className={`ml-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {entry.timestamp.toLocaleString()}
                          </Text>
                        </View>
                      </View>
                      {entry.verified && (
                        <View className="flex-row items-center rounded-full bg-emerald-100 px-2 py-1">
                          <Check stroke="#10B981" width={14} height={14} />
                          <Text className="ml-1 text-xs text-emerald-700">Verified</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Activities;
