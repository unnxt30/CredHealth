import AsyncStorage from '@react-native-async-storage/async-storage';
import { XMLParser } from 'fast-xml-parser';
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View,
  Image,
  useColorScheme,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Shield, ArrowLeft, Plus, X, Info } from 'react-native-feather';
import { HEALTH_SCORE_KEY } from './PointsDashboard';

const POLICY_STORAGE_KEY = '@blockchain_policy_data';

const API_BASE_URL = 'http://10.79.8.134:3000';

// Enhanced policy interface with additional details
interface Policy {
  id: string;
  policyID: string;
  userID: string;
  userWalletAddress: string;
  initialHealthScore: string;
  coverageDuration: string;
  createdAt: string;
  status: string;
  // Additional details from API
  coverageAmount?: string;
  premiumAmount?: string;
  currentHealthPoints?: string;
  rollingAverage?: string;
  k?: string;
  isActive?: boolean;
}

// Add onBack prop to the component
const BlockchainPolicyDashboard = ({ onBack }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [policies, setPolicies] = useState<Policy[]>([]); // Start with empty array
  const [isModalVisible, setModalVisible] = useState(false);
  const [isDetailsModalVisible, setDetailsModalVisible] = useState(false);
  const [currentHealthScore, setCurrentHealthScore] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    policyID: '',
    userID: '',
    userWalletAddress: '',
    initialHealthScore: '',
    coverageDuration: '',
  });
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  useEffect(() => {
    const loadCurrentHealthScore = async () => {
      try {
        const storedScore = await AsyncStorage.getItem(HEALTH_SCORE_KEY);
        if (storedScore) {
          setCurrentHealthScore(storedScore);
          console.log('Loaded current health score:', storedScore);
        }
      } catch (error) {
        console.error('Error loading health score:', error);
      }
    };

    loadCurrentHealthScore();
    // Load saved policies when component mounts
    loadPolicies();
  }, []);

  // Function to load saved policies
  const loadPolicies = async () => {
    try {
      const savedPolicies = await AsyncStorage.getItem(POLICY_STORAGE_KEY);
      if (savedPolicies) {
        setPolicies(JSON.parse(savedPolicies));
      }
    } catch (error) {
      console.error('Error loading policies:', error);
      Alert.alert('Error', 'Failed to load policies');
    }
  };

  // Function to save policies
  const savePolicies = async (updatedPolicies: Policy[]) => {
    try {
      await AsyncStorage.setItem(POLICY_STORAGE_KEY, JSON.stringify(updatedPolicies));
    } catch (error) {
      console.error('Error saving policies:', error);
      throw error;
    }
  };

  const handleCreatePolicy = async () => {
    // Validate fields
    if (
      !newPolicy.policyID ||
      !newPolicy.userID ||
      !newPolicy.userWalletAddress ||
      !newPolicy.initialHealthScore ||
      !newPolicy.coverageDuration
    ) {
      Alert.alert('Invalid Input', 'Please fill all fields');
      return;
    }

    try {
      setModalVisible(false); // Close modal immediately to show loading state

      // Create new policy object
      const createdPolicy: Policy = {
        id: Date.now().toString(), // unique ID
        ...newPolicy,
        createdAt: new Date().toISOString(),
        status: 'Active',
      };

      // Send to API
      try {
        console.log('Creating policy:', createdPolicy);
        const apiResponse = await fetch(`${API_BASE_URL}/createPolicy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            policyId: newPolicy.policyID,
            userId: newPolicy.userID,
            userWalletAddress: newPolicy.userWalletAddress,
            initialHealthScore: newPolicy.initialHealthScore,
            coverageDuration: newPolicy.coverageDuration,
          }),
        });

        console.log('API response status:', apiResponse.status);

        // Check if API request was successful
        if (!apiResponse.ok) {
          const responseText = await apiResponse.text();
          console.error('API error response:', responseText);
          throw new Error('Failed to create policy on server');
        }

        console.log('API request successful for: ' + newPolicy.policyID);

        // Fetch additional policy details
        const detailsResponse = await fetch(
          `${API_BASE_URL}/getPolicyDetails/${newPolicy.policyID}`
        );
        if (!detailsResponse.ok) {
          throw new Error('Failed to fetch policy details');
        }

        const policyDetails = await detailsResponse.json();
        console.log(JSON.stringify(policyDetails));

        // Update the created policy with additional details
        const updatedPolicy = {
          ...createdPolicy,
          coverageAmount: policyDetails.data.policy.coverageAmount,
          premiumAmount: policyDetails.data.policy.premiumAmount,
          currentHealthPoints: policyDetails.data.policy.currentHealthPoints,
          rollingAverage: policyDetails.data.policy.rollingAverage,
          k: policyDetails.data.policy.k,
          isActive: policyDetails.data.policy.isActive,
        };

        // Add to policies list
        const updatedPolicies = [...policies, updatedPolicy];
        setPolicies(updatedPolicies);

        // Save to AsyncStorage
        await savePolicies(updatedPolicies);
        console.log('Saved to AsyncStorage');

        // Set selected policy and show details modal immediately
        setSelectedPolicy(updatedPolicy);
        setDetailsModalVisible(true);

        // Show success message
        Alert.alert(
          'Policy Created',
          `Policy ${newPolicy.policyID} has been created successfully!`
        );

        // Reset form
        setNewPolicy({
          policyID: '',
          userID: '',
          userWalletAddress: '',
          initialHealthScore: '',
          coverageDuration: '',
        });
      } catch (apiError) {
        console.error('API request error:', apiError);
        // Continue with local storage even if API fails
        console.log('Continuing with local storage despite API error');
      }
    } catch (error) {
      console.error('Error creating policy:', error);
      Alert.alert('Error', 'Failed to create policy. Please check your connection and try again.');
      setModalVisible(true); // Re-open modal if there was an error
    }
  };

  // Function to handle policy selection
  const handleSelectPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
    setDetailsModalVisible(true);
  };

  // Close details modal
  const closeDetailsModal = () => {
    setDetailsModalVisible(false);
  };
  const updateHealthPoints = async (policyId: string, walletId: string, updatedScore: string) => {
    setIsUpdating(true);

    try {
      const updateResponse = await fetch(`${API_BASE_URL}/updateHealthPoints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          policyId,
          updatedScore,
          walletId,
        }),
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error('Update failed');
      }

      const result = await updateResponse.json();

      const updatedPolicies = policies.map((p) => {
        if (p.policyID == policyId) {
          return {
            ...p,
            currentHealthPoints: updatedScore,
            ...(result.policy || {}),
          };
        }
        return p;
      });
      setPolicies(updatedPolicies);
      await savePolicies(updatedPolicies);

      // If a policy is currently selected, update it
      if (selectedPolicy && selectedPolicy.policyID === policyId) {
        setSelectedPolicy({
          ...selectedPolicy,
          currentHealthPoints: currentHealthScore,
          // Update other fields if the API returns them
          ...(result.policy || {}),
        });
      }

      Alert.alert('Success', 'Health points updated successfully!');
    } catch (error) {
      console.error('Error updating health points:', error);
      Alert.alert('Update Failed', `Failed to update health points: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Add this function to your component
  const clearAllPolicies = async () => {
    try {
      // Confirm before deletion
      Alert.alert(
        'Clear All Policies',
        'Are you sure you want to delete all policies? This cannot be undone.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Clear All',
            style: 'destructive',
            onPress: async () => {
              await AsyncStorage.removeItem(POLICY_STORAGE_KEY);
              setPolicies([]);
              Alert.alert('Success', 'All policies have been cleared');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error clearing policies:', error);
      Alert.alert('Error', 'Failed to clear policies');
    }
  };

  // Add this helper function
  const showPolicyLimitInfo = () => {
    Alert.alert(
      'Policy Limit Reached',
      'Only one policy can be active at a time. To create a new policy, please delete the existing one first.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View className="flex-1 px-6 py-4">
        {/* Header with Back Button, Clear Button, and Add Button */}
        <View className="flex-row items-center justify-between py-3">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={onBack} className="mr-2">
              <ArrowLeft stroke={isDarkMode ? '#4ADE80' : '#10B981'} width={24} height={24} />
            </TouchableOpacity>
            <Shield stroke={isDarkMode ? '#4ADE80' : '#10B981'} width={24} height={24} />
            <Text
              className={`ml-2 text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Blockchain Policies
            </Text>
          </View>

          <View className="flex-row">
            {/* Only show clear button if there are policies */}
            {policies.length > 0 && (
              <TouchableOpacity
                onPress={clearAllPolicies}
                className={`mr-2 rounded-full p-2 ${isDarkMode ? 'bg-red-700' : 'bg-red-500'}`}>
                <X stroke="#FFFFFF" width={20} height={20} />
              </TouchableOpacity>
            )}
            {/* Disable add button if there's already a policy */}
            <TouchableOpacity
              onPress={policies.length === 0 ? () => setModalVisible(true) : showPolicyLimitInfo}
              className={`rounded-full p-2 ${
                policies.length === 0
                  ? isDarkMode
                    ? 'bg-emerald-700'
                    : 'bg-emerald-500'
                  : isDarkMode
                    ? 'bg-gray-600'
                    : 'bg-gray-400'
              }`}>
              <Plus
                stroke="#FFFFFF"
                width={24}
                height={24}
                opacity={policies.length === 0 ? 1 : 0.6}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Policy List or Empty State */}
        <ScrollView className="my-4 flex-1">
          {policies.length === 0 ? (
            <View className="items-center justify-center py-20">
              <Shield
                stroke={isDarkMode ? '#4ADE80' : '#10B981'}
                width={60}
                height={60}
                opacity={0.5}
              />
              <Text
                className={`mt-4 text-center text-lg font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No policies yet
              </Text>
              <Text className={`text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Create your first policy by tapping the + button
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className={`mt-6 rounded-lg px-6 py-3 ${isDarkMode ? 'bg-emerald-700' : 'bg-emerald-500'}`}>
                <Text className="font-medium text-white">Create Policy</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Policy list
            policies.map((policy) => (
              <TouchableOpacity
                key={policy.id}
                className={`mb-4 rounded-lg p-4 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } shadow-sm`}
                onPress={() => handleSelectPolicy(policy)}>
                <View className="mb-2 flex-row items-center justify-between">
                  <Text
                    className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Policy: {policy.policyID}
                  </Text>
                  <View
                    className={`rounded px-2 py-1 ${
                      policy.status === 'Active' ? 'bg-green-500' : 'bg-orange-500'
                    }`}>
                    <Text className="text-xs font-medium text-white">{policy.status}</Text>
                  </View>
                </View>

                <View className="mb-2 flex-row items-center">
                  <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mr-1`}>
                    User ID:
                  </Text>
                  <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {policy.userID}
                  </Text>
                </View>

                <View className="mb-2 flex-row items-center">
                  <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mr-1`}>
                    Health Score:
                  </Text>
                  <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {policy.initialHealthScore}
                  </Text>
                </View>

                <View className="mb-2 flex-row items-center">
                  <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mr-1`}>
                    Coverage:
                  </Text>
                  <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {policy.coverageDuration} months
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mr-1`}>
                    Created:
                  </Text>
                  <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {new Date(policy.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                <View className="mt-3 border-t border-gray-200 pt-2">
                  <View className="flex-row items-center justify-between">
                    <Text
                      className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}
                      numberOfLines={1}>
                      Wallet: {policy.userWalletAddress}
                    </Text>
                    {/* Show indicator if this policy has additional details */}
                    {(policy.coverageAmount || policy.premiumAmount) && (
                      <Info stroke={isDarkMode ? '#4ADE80' : '#10B981'} width={16} height={16} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      {/* Create Policy Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className={`w-5/6 rounded-xl p-5 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <View className="mb-4 flex-row items-center justify-between">
              <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Create New Policy
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X stroke={isDarkMode ? '#FFFFFF' : '#000000'} width={24} height={24} />
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <ScrollView className="max-h-96">
              <View className="mb-4">
                <Text className={`mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Policy ID
                </Text>
                <TextInput
                  className={`mb-3 rounded-md border p-2 ${
                    isDarkMode
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-gray-50 text-gray-800'
                  }`}
                  placeholder="Enter Policy ID"
                  placeholderTextColor={isDarkMode ? '#A0AEC0' : '#A0AEC0'}
                  value={newPolicy.policyID}
                  onChangeText={(text) => setNewPolicy({ ...newPolicy, policyID: text })}
                />

                <Text className={`mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  User ID
                </Text>
                <TextInput
                  className={`mb-3 rounded-md border p-2 ${
                    isDarkMode
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-gray-50 text-gray-800'
                  }`}
                  placeholder="Enter User ID"
                  placeholderTextColor={isDarkMode ? '#A0AEC0' : '#A0AEC0'}
                  value={newPolicy.userID}
                  onChangeText={(text) => setNewPolicy({ ...newPolicy, userID: text })}
                />

                <Text className={`mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  User Wallet Address
                </Text>
                <TextInput
                  className={`mb-3 rounded-md border p-2 ${
                    isDarkMode
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-gray-50 text-gray-800'
                  }`}
                  placeholder="Enter Wallet Address"
                  placeholderTextColor={isDarkMode ? '#A0AEC0' : '#A0AEC0'}
                  value={newPolicy.userWalletAddress}
                  onChangeText={(text) => setNewPolicy({ ...newPolicy, userWalletAddress: text })}
                />

                <Text className={`mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Initial Health Score
                </Text>
                <TextInput
                  className={`mb-3 rounded-md border p-2 ${
                    isDarkMode
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-gray-50 text-gray-800'
                  }`}
                  placeholder="Enter Initial Health Score"
                  placeholderTextColor={isDarkMode ? '#A0AEC0' : '#A0AEC0'}
                  value={newPolicy.initialHealthScore}
                  onChangeText={(text) => setNewPolicy({ ...newPolicy, initialHealthScore: text })}
                  keyboardType="numeric"
                />

                <Text className={`mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Coverage Duration (months)
                </Text>
                <TextInput
                  className={`mb-3 rounded-md border p-2 ${
                    isDarkMode
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-gray-50 text-gray-800'
                  }`}
                  placeholder="Enter Coverage Duration"
                  placeholderTextColor={isDarkMode ? '#A0AEC0' : '#A0AEC0'}
                  value={newPolicy.coverageDuration}
                  onChangeText={(text) => setNewPolicy({ ...newPolicy, coverageDuration: text })}
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>

            {/* Buttons */}
            <View className="mt-4 flex-row justify-end">
              <TouchableOpacity
                className="mr-2 rounded-md bg-gray-500 px-4 py-2"
                onPress={() => setModalVisible(false)}>
                <Text className="text-white">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="rounded-md bg-emerald-500 px-4 py-2"
                onPress={handleCreatePolicy}>
                <Text className="text-white">Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Policy Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isDetailsModalVisible && selectedPolicy !== null}
        onRequestClose={closeDetailsModal}>
        <View className="flex-1 items-center justify-center bg-black/50">
          <View
            className={`w-11/12 max-w-md rounded-xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <View className="mb-4 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Shield stroke={isDarkMode ? '#4ADE80' : '#10B981'} width={24} height={24} />
                <Text
                  className={`ml-2 text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Policy Details
                </Text>
              </View>
              <TouchableOpacity onPress={closeDetailsModal}>
                <X stroke={isDarkMode ? '#FFFFFF' : '#000000'} width={24} height={24} />
              </TouchableOpacity>
            </View>

            {selectedPolicy && (
              <ScrollView className="max-h-96">
                {/* Basic Info Section */}
                <View
                  className={`mb-4 rounded-lg p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <Text
                    className={`mb-2 text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Basic Information
                  </Text>

                  <View className="mb-2 flex-row justify-between">
                    <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Policy ID:
                    </Text>
                    <Text className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {selectedPolicy.policyID}
                    </Text>
                  </View>

                  <View className="mb-2 flex-row justify-between">
                    <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      User ID:
                    </Text>
                    <Text className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {selectedPolicy.userID}
                    </Text>
                  </View>

                  <View className="mb-2 flex-row justify-between">
                    <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Status:
                    </Text>
                    <View
                      className={`rounded px-2 py-0.5 ${selectedPolicy.status === 'Active' ? 'bg-green-500' : 'bg-orange-500'}`}>
                      <Text className="text-xs font-medium text-white">
                        {selectedPolicy.status}
                      </Text>
                    </View>
                  </View>

                  <View className="mb-2 flex-row justify-between">
                    <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Created:
                    </Text>
                    <Text className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {new Date(selectedPolicy.createdAt).toLocaleDateString()}
                    </Text>
                  </View>

                  <View className="flex-row justify-between">
                    <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Coverage:
                    </Text>
                    <Text className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {selectedPolicy.coverageDuration} months
                    </Text>
                  </View>
                </View>

                {/* API Details Section */}
                <View
                  className={`mb-4 rounded-lg p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <Text
                    className={`mb-2 text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Policy Details
                  </Text>

                  <View className="mb-2 flex-row justify-between">
                    <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Initial Health Score:
                    </Text>
                    <Text className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {selectedPolicy.initialHealthScore}
                    </Text>
                  </View>

                  {selectedPolicy.currentHealthPoints && (
                    <View className="mb-2 flex-row justify-between">
                      <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Current Health:
                      </Text>
                      <Text
                        className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {selectedPolicy.currentHealthPoints}
                      </Text>
                    </View>
                  )}

                  {selectedPolicy.coverageAmount && (
                    <View className="mb-2 flex-row justify-between">
                      <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Coverage Amount:
                      </Text>
                      <Text
                        className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        ${selectedPolicy.coverageAmount}
                      </Text>
                    </View>
                  )}

                  {selectedPolicy.premiumAmount && (
                    <View className="mb-2 flex-row justify-between">
                      <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Premium Amount:
                      </Text>
                      <Text
                        className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        ${selectedPolicy.premiumAmount}
                      </Text>
                    </View>
                  )}

                  {selectedPolicy.rollingAverage && (
                    <View className="mb-2 flex-row justify-between">
                      <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Rolling Average:
                      </Text>
                      <Text
                        className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {selectedPolicy.rollingAverage}
                      </Text>
                    </View>
                  )}

                  {selectedPolicy.k && (
                    <View className="mb-2 flex-row justify-between">
                      <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        K Factor:
                      </Text>
                      <Text
                        className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {selectedPolicy.k}
                      </Text>
                    </View>
                  )}

                  {selectedPolicy.isActive !== undefined && (
                    <View className="flex-row justify-between">
                      <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Active Status:
                      </Text>
                      <Text
                        className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {selectedPolicy.isActive ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Wallet Section */}
                <View className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <Text
                    className={`mb-2 text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Wallet Information
                  </Text>

                  <Text
                    className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'} break-words`}>
                    {selectedPolicy.userWalletAddress}
                  </Text>
                </View>

                {/* Add this inside your Policy Details Modal, right before the Close Button */}
                {selectedPolicy && currentHealthScore && (
                  <View className="mt-4">
                    {selectedPolicy.currentHealthPoints !== currentHealthScore ? (
                      <View className="mb-4 rounded-lg bg-blue-100 p-4">
                        <Text className="mb-2 text-center text-blue-800">
                          Your current health score ({currentHealthScore}) differs from the policy's
                          health points ({selectedPolicy.currentHealthPoints || 'Not set'}).
                        </Text>
                        <TouchableOpacity
                          className={`mt-2 rounded-md py-2 ${
                            isUpdating ? 'bg-gray-400' : 'bg-blue-600'
                          }`}
                          disabled={isUpdating}
                          onPress={() =>
                            updateHealthPoints(
                              selectedPolicy.policyID,
                              selectedPolicy.userWalletAddress,
                              currentHealthScore
                            )
                          }>
                          <Text className="text-center font-medium text-white">
                            {isUpdating ? 'Updating...' : 'Update Health Points'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View className="mb-4 rounded-lg bg-green-100 p-4">
                        <Text className="text-center text-green-800">
                          Your health score is up to date with the policy.
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </ScrollView>
            )}

            {/* Close Button */}
            <TouchableOpacity
              className={`mt-4 rounded-md py-3 ${isDarkMode ? 'bg-emerald-600' : 'bg-emerald-500'}`}
              onPress={closeDetailsModal}>
              <Text className="text-center font-medium text-white">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default BlockchainPolicyDashboard;
