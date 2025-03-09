import React, { useEffect, useState } from 'react';
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
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Shield, ArrowLeft, Camera, Upload } from 'react-native-feather';
import * as ImagePicker from 'expo-image-picker';
import { RNS3 } from 'react-native-aws3';
import { S3_BUCKET_NAME, AWS_REGION, AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY } from '@env';
import * as FileSystem from 'expo-file-system';
import { evaluateMealPhoto } from 'services/healthScoreApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PROFILE_PIC_KEY } from './ProfileDashboard';

interface ActivitiesProps {
  onBack: () => void;
  userData: {
    name: string;
    email: string;
    profilePic: string;
  };
}

export const generateS3Options = (subfolder: string) => {
  return {
    keyPrefix: `${subfolder}/`,
    bucket: S3_BUCKET_NAME || 'your-bucket-name',
    region: AWS_REGION || 'us-east-1',
    accessKey: AWS_ACCESS_KEY || '',
    secretKey: AWS_SECRET_ACCESS_KEY || '',
  };
};

const s3Options = generateS3Options('food_uploads');
const selfieS3Options = generateS3Options('selfies');
const Activities = ({ onBack, userData }: ActivitiesProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [base64string, setBase64string] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageName, setImageName] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [storedProfilePic, setStoredProfilePic] = useState<string | null>(null);
  const [selfieMode, setSelfieMode] = useState(false);
  const [currentSelfie, setCurrentSelfie] = useState<string | null>(null);
  const [currentSelfieUrl, setCurrentSelfieUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadStoredProfilePic = async () => {
      try {
        const savedPic = await AsyncStorage.getItem(PROFILE_PIC_KEY);
        if (savedPic) {
          setStoredProfilePic(savedPic);
          console.log('Loaded stored profile picture:', savedPic);
        }
      } catch (error) {
        console.error('Error loading stored profile picture:', error);
      }
    };

    loadStoredProfilePic();
  }, []);

  // Test S3 connection
  const testS3Connection = async () => {
    setConnectionStatus('checking');

    try {
      // Create a small test file
      const testFile = {
        uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        name: `connection_test_${Date.now()}.png`,
        type: 'image/png',
      };

      // Attempt to upload the test file
      const response = await RNS3.put(testFile, s3Options);

      if (response.status === 201) {
        console.log('S3 connection successful:', response.text);
        setConnectionStatus('success');
        Alert.alert('Connection Successful', 'Successfully connected to S3 bucket!');
      } else {
        console.error('S3 connection failed:', response);
        setConnectionStatus('failed');
        Alert.alert('Connection Failed', 'Could not connect to S3 bucket. Check your credentials.');
      }
    } catch (error) {
      console.error('Error testing S3 connection:', error);
      setConnectionStatus('error');
      Alert.alert(
        'Connection Error',
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const captureSelfie = async () => {
    // Request camera permissions
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

    if (cameraPermission.status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your camera to take a selfie.');
      return;
    }

    // Open front camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      cameraType: ImagePicker.CameraType.front,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setIsVerifying(true);
      setIsLoading(true);

      try {
        const capturedSelfie = result.assets[0].uri;
        setCurrentSelfie(capturedSelfie);
        console.log('Selfie captured:', capturedSelfie);

        // Upload selfie to S3
        const file = {
          uri: capturedSelfie,
          name: `selfie_${Date.now()}.jpg`,
          type: 'image/jpeg',
        };

        const response = await RNS3.put(file, selfieS3Options);

        if (response.status === 201) {
          const selfieUrl = response.body.postResponse.location;
          setCurrentSelfieUrl(selfieUrl);
          console.log('Selfie uploaded to S3:', selfieUrl);

          // Now proceed to food photo mode
          setSelfieMode(false);
          Alert.alert('Selfie Captured', 'Now please take a photo of your meal');
        } else {
          console.error('Failed to upload selfie to S3:', response);
          Alert.alert('Error', 'Failed to upload selfie to server');
        }
      } catch (error) {
        console.error('Error processing selfie:', error);
        Alert.alert('Error', 'Failed to process selfie');
      } finally {
        setIsVerifying(false);
        setIsLoading(false);
      }
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

    // Open camera with minimal processing
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false, // Disable editing to preserve original image
      quality: 1, // Use maximum quality (1.0) to avoid compression
      exif: true, // Include EXIF data for timestamp verification
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setIsVerifying(true);
      setIsLoading(true);

      try {
        const capturedImage = result.assets[0].uri;
        // Set the current image
        setCurrentImage(capturedImage);
        console.log('Image captured:', capturedImage);

        // Show the captured image
        setIsCapturing(true);
      } catch (error) {
        console.error('Error saving image locally:', error);
        Alert.alert('Error', 'Failed to save the image locally');
      } finally {
        setIsVerifying(false);
        setIsLoading(false);
      }
    }
  };

  // Upload image to AWS S3
  const uploadToAWS = async () => {
    if (!currentImage) {
      Alert.alert('Error', 'No image to upload');
      return;
    }

    if (!imageName.trim()) {
      Alert.alert('Error', 'Please provide a name for your image');
      return;
    }

    setIsUploading(true);

    try {
      // Create a file object for S3 upload
      const file = {
        uri: currentImage,
        name: `${imageName.replace(/\s+/g, '_')}_${Date.now()}.jpg`,
        type: 'image/jpeg',
      };

      // Upload to S3
      const response = await RNS3.put(file, s3Options);
      const meal = response.body.postResponse.location;
      const savedFaceUrl =
        storedProfilePic ||
        userData.profilePic ||
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/President_Barack_Obama.jpg/440px-President_Barack_Obama.jpg';
      const testFaceUrl =
        currentSelfieUrl ||
        'https://cdn.britannica.com/89/164789-050-D6B5E2C7/Barack-Obama-2012.jpg?w=800&h=600';

      if (response.status === 201) {
        console.log('Sending to evaluate-meal with params:', {
          savedFace: savedFaceUrl,
          testFace: testFaceUrl,
          meal: meal,
        });

        const result = await evaluateMealPhoto(savedFaceUrl, testFaceUrl, meal);
        console.log('Evaluation result:', result.data.verified);

        if (result.success) {
          if (!result.data.verified) {
            // Show alert for failed verification
            Alert.alert(
              'Verification Failed',
              'The selfie images did not match. Please try again with a clearer selfie.',
              [{ text: 'OK' }]
            );
          } else {
            Alert.alert('Success', 'Image uploaded and verified successfully!');
          }
        }
      } else {
        Alert.alert('Error', 'Failed to process the meal image. Please try again.');
      }

      console.log('Successfully uploaded to S3:', response.text);

      // Reset states after upload (regardless of verification result)
      setCurrentImage(null);
      setImageName('');
      setIsCapturing(false);
    } catch (error) {
      console.error('Error uploading to S3:', error);
      Alert.alert('Error', 'Failed to upload image to server');
    } finally {
      setIsUploading(false);
    }
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

          {isUploading && (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="large" color="#10B981" />
              <Text className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Uploading your image...
              </Text>
            </View>
          )}

          {!isLoading && !isUploading && !currentImage && (
            <>
              <TouchableOpacity
                className={`mb-4 flex-row items-center rounded-xl p-5 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-sm`}
                onPress={captureSelfie}>
                <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-purple-500">
                  <Camera stroke="#FFFFFF" width={24} height={24} />
                </View>
                <View className="flex-1">
                  <Text
                    className={`mb-1 text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Take a Selfie
                  </Text>
                  <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Verify your identity before meal tracking
                  </Text>
                </View>
              </TouchableOpacity>

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

              {/* S3 Connection Test Button */}
              <TouchableOpacity
                className={`mb-4 flex-row items-center rounded-xl p-5 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-sm`}
                onPress={testS3Connection}>
                <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-blue-500">
                  <Shield stroke="#FFFFFF" width={24} height={24} />
                </View>
                <View className="flex-1">
                  <Text
                    className={`mb-1 text-lg font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                    Test S3 Connection
                  </Text>
                  <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Verify your AWS S3 bucket connection
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Connection Status Indicator */}
              {connectionStatus && (
                <View
                  className={`mb-4 rounded-lg p-3 ${
                    connectionStatus === 'success'
                      ? 'bg-green-100'
                      : connectionStatus === 'failed' || connectionStatus === 'error'
                        ? 'bg-red-100'
                        : 'bg-yellow-100'
                  }`}>
                  <Text
                    className={`text-center ${
                      connectionStatus === 'success'
                        ? 'text-green-700'
                        : connectionStatus === 'failed' || connectionStatus === 'error'
                          ? 'text-red-700'
                          : 'text-yellow-700'
                    }`}>
                    {connectionStatus === 'checking'
                      ? 'Checking connection...'
                      : connectionStatus === 'success'
                        ? 'Successfully connected to S3!'
                        : connectionStatus === 'failed'
                          ? 'Connection failed. Check your credentials.'
                          : 'Error connecting to S3. See console for details.'}
                  </Text>
                </View>
              )}
            </>
          )}

          {/* Display captured image if available */}
          {currentImage && !isUploading && (
            <View className="mb-4">
              <View className="items-center">
                <Image
                  source={{ uri: currentImage }}
                  className="h-64 w-full rounded-lg"
                  resizeMode="cover"
                />
                <View className="mt-2 flex-row items-center rounded-full bg-emerald-100 px-3 py-1">
                  <Text className="ml-1 text-sm text-emerald-700">Image captured successfully</Text>
                </View>
              </View>

              {/* Image naming input */}
              <View className="mt-4">
                <Text className={`mb-2 font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  Name your meal:
                </Text>
                <TextInput
                  className={`mb-4 rounded-lg border border-gray-300 p-3 ${
                    isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                  }`}
                  placeholder="Enter a name for your meal"
                  placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  value={imageName}
                  onChangeText={setImageName}
                />

                {/* Upload button */}
                <TouchableOpacity
                  className="flex-row items-center justify-center rounded-lg bg-emerald-500 p-3"
                  onPress={uploadToAWS}>
                  <Upload stroke="#FFFFFF" width={20} height={20} />
                  <Text className="ml-2 font-semibold text-white">Upload to Server</Text>
                </TouchableOpacity>

                {/* Retake photo button */}
                <TouchableOpacity
                  className="mt-3 flex-row items-center justify-center rounded-lg border border-gray-300 p-3"
                  onPress={captureFood}>
                  <Camera stroke={isDarkMode ? '#F9FAFB' : '#1F2937'} width={20} height={20} />
                  <Text
                    className={`ml-2 font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Retake Photo
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Activities;
