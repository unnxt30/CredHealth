const API_BASE_URL = 'http://10.79.8.134:3000';

export interface HealthScores {
  activityScore: number;
  dietScore: number;
  healthScore: number;
  sleepScore: number;
}

// Fetch health scores from the API
export const fetchHealthScores = async (): Promise<HealthScores> => {
  try {
    const response = await fetch(`${API_BASE_URL}/get-scores/`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching health scores:', error);
    // Return default scores if API call fails
    return {
      activityScore: 0,
      dietScore: 0,
      healthScore: 0,
      sleepScore: 0,
    };
  }
};

// Submit a meal photo for evaluation
export const evaluateMealPhoto = async (
  savedFace: string,
  testFace: string,
  meal: string
): Promise<any> => {
  try {
    const requestBody = {
      saved_face: savedFace,
      test_face: testFace,
      meal: meal,
    };

    const response = await fetch(`${API_BASE_URL}/evaluate-meal/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log('Response data:', data);
    return data;
  } catch (error) {
    console.error('Error evaluating meal photo:', error);
    return { success: false, verified: false };
  }
};
