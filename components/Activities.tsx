import React, { useState } from 'react';
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

interface ActivitiesProps {
  onBack: () => void;
  userData: {
    name: string;
    email: string;
    profilePic: string;
  };
}

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

  // S3 Configuration
  const s3Options = {
    keyPrefix: 'food_uploads/',
    bucket: S3_BUCKET_NAME || 'your-bucket-name',
    region: AWS_REGION || 'us-east-1',
    accessKey: AWS_ACCESS_KEY || '',
    secretKey: AWS_SECRET_ACCESS_KEY || '',
  };

  console.log(s3Options);

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
        const base64string = result.assets[0].base64;
        setBase64string(base64string || '');
        // Set the current image
        setCurrentImage(capturedImage);
        console.log('Image captured:', capturedImage);

        // Save base64 string to a local file
        if (base64string) {
          const fileName = `image_${Date.now()}.txt`;
          const fileUri = `${FileSystem.documentDirectory}${fileName}`;
          await FileSystem.writeAsStringAsync(fileUri, base64string);
          console.log('Base64 image saved to:', fileUri);
        }

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

  // Function to read base64 from file
  const readBase64FromFile = async (fileUri: string) => {
    try {
      const base64Content = await FileSystem.readAsStringAsync(fileUri);
      console.log('Successfully read base64 from file');
      return base64Content;
    } catch (error) {
      console.error('Error reading base64 from file:', error);
      return null;
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
      const response = await RNS3.put(file, s3Options).then(() => {
        function extractLocationData(input: string): string | null {
          const match = input.match(/<Location>(.*?)<\/Location>/s);
          return match ? match[1] : null;
        }
        const imageLocation = extractLocationData(response.text);
      });

      if (response.status === 201) {
        console.log('Successfully uploaded to S3:', response.text);
        Alert.alert('Success', 'Image uploaded successfully!');

        // Reset states after successful upload
        setCurrentImage(null);
        setImageName('');
        setIsCapturing(false);
      } else {
        console.error('Failed to upload to S3:', response);
        Alert.alert('Error', 'Failed to upload image to server');
      }
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
