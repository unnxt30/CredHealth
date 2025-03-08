import axios from 'axios';

// Replace with your MongoDB API endpoint
// This could be a serverless function URL (Vercel, Netlify, AWS Lambda, etc.)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Food entry interface
export interface FoodEntryData {
  id?: string;
  title: string;
  imageUri: string;
  timestamp: Date;
  verified: boolean;
}

// Upload image to a storage service and get URL
// For a prototype, you could use a service like Cloudinary or Firebase Storage
export const uploadImage = async (imageUri: string): Promise<string> => {
  try {
    // Create form data for image upload
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'image.jpg';

    // Append the image to form data
    formData.append('file', {
      uri: imageUri,
      name: filename,
      type: 'image/jpeg',
    } as any);

    // Upload to your image hosting service
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.imageUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
};

// Get all food entries
export const getFoodEntries = async (): Promise<FoodEntryData[]> => {
  try {
    const response = await axios.get(`${API_URL}/food-entries`);

    // Convert string timestamps back to Date objects
    return response.data.map((entry: any) => ({
      ...entry,
      timestamp: new Date(entry.timestamp),
    }));
  } catch (error) {
    console.error('Error fetching food entries:', error);
    throw new Error('Failed to fetch food entries');
  }
};

// Create a new food entry
export const createFoodEntry = async (entry: FoodEntryData): Promise<FoodEntryData> => {
  try {
    const response = await axios.post(`${API_URL}/food-entries`, entry);
    return {
      ...response.data,
      timestamp: new Date(response.data.timestamp),
    };
  } catch (error) {
    console.error('Error creating food entry:', error);
    throw new Error('Failed to create food entry');
  }
};
