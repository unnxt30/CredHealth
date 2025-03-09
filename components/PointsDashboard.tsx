import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft, Award, Clipboard, Activity, Coffee, Info } from 'react-native-feather';
import Svg, { Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { fetchHealthScores, HealthScores } from '../services/healthScoreApi';

interface PointsDashboardProps {
  userData: {
    name: string;
    email: string;
    profilePic: string;
  };
  onBack: () => void;
}

const PointsDashboard: React.FC<PointsDashboardProps> = ({ userData, onBack }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const scrollViewRef = useRef<ScrollView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for points data
  const [pointsData, setPointsData] = useState<HealthScores>({
    activityScore: 0,
    dietScore: 0,
    healthScore: 0,
    sleepScore: 0,
  });

  // Fetch scores from API
  useEffect(() => {
    const getScores = async () => {
      try {
        setIsLoading(true);
        const scores = await fetchHealthScores();
        console.log(scores);
        setPointsData(scores);
        setError(null);
      } catch (err) {
        setError('Failed to load health scores. Please try again later.');
        console.error('Error fetching health scores:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getScores();
  }, []);

  // Calculate total points as the average of all categories
  const totalPoints = pointsData.healthScore;

  const maxPoints = 100;
  const percentage = (totalPoints / maxPoints) * 100;

  // Animation values
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const scoreOpacity = useRef(new Animated.Value(0)).current;
  const scoreScale = useRef(new Animated.Value(0.8)).current;

  // Define point categories with both light and dark mode colors
  const pointCategories = [
    {
      title: 'Physical Activity',
      points: pointsData.activityScore,
      icon: (color: string) => <Activity stroke={color} width={20} height={20} />,
      progressColor: isDarkMode ? '#8B5CF6' : '#7C3AED',
      gradientFrom: isDarkMode ? '#7C3AED' : '#8B5CF6',
      gradientTo: isDarkMode ? '#8B5CF6' : '#7C3AED',
      iconBg: isDarkMode ? '#5B21B6' : '#EDE9FE',
      iconColor: isDarkMode ? '#fff' : '#7C3AED',
    },
    {
      title: 'Nutrition Tracking',
      points: Number(pointsData.dietScore),
      icon: (color: string) => <Award stroke={color} width={20} height={20} />,
      progressColor: isDarkMode ? '#EC4899' : '#DB2777',
      gradientFrom: isDarkMode ? '#DB2777' : '#EC4899',
      gradientTo: isDarkMode ? '#EC4899' : '#DB2777',
      iconBg: isDarkMode ? '#9D174D' : '#FCE7F3',
      iconColor: isDarkMode ? '#fff' : '#DB2777',
    },
    {
      title: 'Sleep Quality',
      points: Number(pointsData.sleepScore),
      icon: (color: string) => <Coffee stroke={color} width={20} height={20} />,
      progressColor: isDarkMode ? '#F59E0B' : '#D97706',
      gradientFrom: isDarkMode ? '#D97706' : '#F59E0B',
      gradientTo: isDarkMode ? '#F59E0B' : '#D97706',
      iconBg: isDarkMode ? '#92400E' : '#FEF3C7',
      iconColor: isDarkMode ? '#fff' : '#D97706',
    },
  ];

  // Run animations when data is loaded
  useEffect(() => {
    if (!isLoading) {
      // Reset animations
      progressAnimation.setValue(0);
      scoreOpacity.setValue(0);
      scoreScale.setValue(0.8);

      // Start animations
      Animated.timing(progressAnimation, {
        toValue: percentage,
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();

      // Animate the score appearing
      Animated.sequence([
        Animated.delay(800),
        Animated.parallel([
          Animated.timing(scoreOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(scoreScale, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [isLoading, percentage]);

  // Helper function to get letter grade based on score
  const getGrade = (score: number): string => {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    if (score >= 45) return 'D+';
    if (score >= 40) return 'D';
    return 'F';
  };

  const grade = getGrade(totalPoints);

  // Function to refresh scores
  const refreshScores = async () => {
    try {
      setIsLoading(true);
      const scores = await fetchHealthScores();
      setPointsData(scores);
      setError(null);
    } catch (err) {
      setError('Failed to refresh health scores. Please try again later.');
      console.error('Error refreshing health scores:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <TouchableOpacity
          onPress={onBack}
          className={`rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-2`}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDarkMode ? 0.3 : 0.1,
            shadowRadius: 3,
            elevation: 5,
          }}>
          <ArrowLeft stroke={isDarkMode ? 'white' : '#1F2937'} width={20} height={20} />
        </TouchableOpacity>
        <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Health Score
        </Text>
        <TouchableOpacity
          className={`rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-2`}
          onPress={refreshScores}>
          <Info stroke={isDarkMode ? 'white' : '#1F2937'} width={20} height={20} />
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollViewRef} className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View className="items-center py-4">
          <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            {userData.name}'s Health
          </Text>
          <Text className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Your overall health score is calculated from 4 key metrics
          </Text>
        </View>

        {/* Loading State */}
        {isLoading ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color={isDarkMode ? '#10B981' : '#059669'} />
            <Text className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Loading your health scores...
            </Text>
          </View>
        ) : error ? (
          <View className="items-center justify-center py-12">
            <Text className={`text-center ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
              {error}
            </Text>
            <TouchableOpacity
              className="mt-4 rounded-lg bg-emerald-500 px-4 py-2"
              onPress={refreshScores}>
              <Text className="font-semibold text-white">Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Circular Progress */}
            <View className="items-center justify-center py-6">
              <View className="relative">
                <Svg height="200" width="200" viewBox="0 0 100 100">
                  {/* Define gradients */}
                  <Defs>
                    <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <Stop offset="0%" stopColor={isDarkMode ? '#059669' : '#10B981'} />
                      <Stop offset="100%" stopColor={isDarkMode ? '#10B981' : '#059669'} />
                    </LinearGradient>
                  </Defs>

                  {/* Background Circle */}
                  <Circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke={isDarkMode ? '#2D3748' : '#E5E7EB'}
                    strokeWidth="8"
                    fill="none"
                  />

                  {/* Progress Circle */}
                  <G rotation="-90" origin="50,50">
                    <Circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="url(#progressGradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(2 * Math.PI * 42 * percentage) / 100} ${2 * Math.PI * 42 * (1 - percentage / 100)}`}
                      strokeLinecap="round"
                    />
                  </G>

                  {/* Small decorative circles */}
                  {[0, 90, 180, 270].map((angle, i) => (
                    <G key={i} rotation={angle} origin="50,50">
                      <Circle
                        cx="50"
                        cy="8"
                        r="2"
                        fill={
                          i === 0
                            ? isDarkMode
                              ? '#10B981'
                              : '#059669'
                            : isDarkMode
                              ? '#4B5563'
                              : '#D1D5DB'
                        }
                      />
                    </G>
                  ))}
                </Svg>

                {/* Center Text */}
                <Animated.View
                  className="absolute inset-0 items-center justify-center"
                  style={{
                    opacity: scoreOpacity,
                    transform: [{ scale: scoreScale }],
                  }}>
                  <Text
                    className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {totalPoints.toFixed(0)}
                  </Text>
                  <View className="mt-1 flex-row items-center">
                    <Text
                      className={`text-lg font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {grade}
                    </Text>
                  </View>
                </Animated.View>
              </View>
            </View>

            {/* Category Label */}
            <View className="mb-4 flex-row items-center justify-between">
              <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Health Categories
              </Text>
              <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Score / 100
              </Text>
            </View>

            {/* Points Breakdown */}
            <View className="mb-6 flex-col gap-5 space-y-6">
              {pointCategories.map((category, index) => {
                const pointsValue = Number(category.points);

                return (
                  <View
                    key={index}
                    className={`rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-5`}
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: isDarkMode ? 0.2 : 0.1,
                      shadowRadius: 6,
                      elevation: 5,
                    }}>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <View
                          className="h-12 w-12 items-center justify-center rounded-full"
                          style={{ backgroundColor: category.iconBg }}>
                          {category.icon(category.iconColor)}
                        </View>
                        <View className="ml-4">
                          <Text
                            className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            {category.title}
                          </Text>
                          <Text
                            className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {category.points < 70 ? 'Needs improvement' : 'Good progress'}
                          </Text>
                        </View>
                      </View>
                      <Text
                        className={`text-xl font-bold ${
                          isDarkMode
                            ? category.points >= 70
                              ? 'text-emerald-400'
                              : 'text-amber-400'
                            : category.points >= 70
                              ? 'text-emerald-600'
                              : 'text-amber-600'
                        }`}>
                        {category.points}
                      </Text>
                    </View>

                    {/* Static progress bar instead of animated */}
                    <View
                      className={`mt-4 h-3 w-full overflow-hidden rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <View
                        className="h-3 rounded-full"
                        style={{
                          width: `${pointsValue}%`,
                          backgroundColor: category.progressColor,
                        }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Tips Section */}
            <View
              className={`mb-8 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-emerald-50'} p-5`}>
              <Text
                className={`mb-2 text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Improvement Tips
              </Text>
              <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {pointsData.dietScore < 70
                  ? 'Focus on improving your nutrition tracking to boost your overall health score. Try logging your meals consistently for the next week.'
                  : pointsData.activityScore < 70
                    ? 'Try to increase your physical activity. Even a 20-minute walk each day can make a significant difference.'
                    : 'Keep up the good work! Consider adding more variety to your diet to maintain your excellent progress.'}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PointsDashboard;
