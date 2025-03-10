import 'react-native-get-random-values';
import { RNS3 } from 'react-native-aws3';
import * as FileSystem from 'expo-file-system';
import { File, Paths } from 'expo-file-system/next';
import { S3_BUCKET_NAME, AWS_REGION, AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY } from '@env';
import RNFS from 'react-native-fs';

// S3 Configuration
const s3Options = {
  keyPrefix: 'food_uploads/',
  bucket: S3_BUCKET_NAME || 'your-bucket-name',
  region: AWS_REGION || 'us-east-1',
  accessKey: AWS_ACCESS_KEY || '',
  secretKey: AWS_SECRET_ACCESS_KEY || '',
  successActionStatus: 201,
};

// Food entry interface
export interface FoodEntryData {
  id: string;
  title: string;
  imageUri: string;
  timestamp: Date;
  verified: boolean;
}

// Upload image directly to Amazon S3 and get URL
export const uploadImage = async (imageUri: string): Promise<string> => {
  try {
    // Create the file object
    const file = {
      uri: imageUri,
      name: `${Date.now()}-${imageUri.split('/').pop() || 'image.jpg'}`,
      type: 'image/jpeg',
    };

    // const file = new File(Paths.document, 'sample_64.txt');
    // file.create();
    // file.write(imageUri);
    console.log('Uploading file to S3:', imageUri);
    console.log('Using S3 options:', {
      bucket: s3Options.bucket,
      region: s3Options.region,
      keyPrefix: s3Options.keyPrefix,
    });

    // Upload to S3 using react-native-aws3
    const response = await RNS3.put(file, s3Options);

    if (response.status !== 201) {
      console.error('S3 upload failed with status:', response.status);
      throw new Error(`Failed to upload image to S3: Status ${response.status}`);
    }

    console.log('Successfully uploaded image to S3:', response.text);

    // Return the public URL of the uploaded image
    return response.text;
  } catch (error) {
    console.error('Error uploading image to S3:', error);
    throw new Error(
      `Failed to upload image to S3: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

// Store food entry in device storage using FileSystem
export const createFoodEntry = async (entry: FoodEntryData): Promise<FoodEntryData> => {
  try {
    // Define file paths for both FileSystem and RNFS
    const expoFileUri = `${FileSystem.documentDirectory}food_entries.json`;
    const rnfsFileUri = `${RNFS.DocumentDirectoryPath}/food_entries.json`;

    console.log('Saving entry to:', expoFileUri);
    console.log('Alternative path:', rnfsFileUri);

    // Get existing entries
    let existingEntries: FoodEntryData[] = [];

    // Try to read existing entries
    try {
      const entries = await getFoodEntries();
      existingEntries = entries;
      console.log(`Found ${existingEntries.length} existing entries`);
    } catch (readError) {
      console.log('No existing entries found or error reading:', readError);
    }

    // Add new entry
    existingEntries.push(entry);

    // Convert to JSON
    const entriesJson = JSON.stringify(existingEntries);

    // Try to save with Expo FileSystem
    try {
      await FileSystem.writeAsStringAsync(expoFileUri, entriesJson);
      console.log('Successfully saved entry with Expo FileSystem');
    } catch (expoError) {
      console.log('Error saving with Expo FileSystem, trying RNFS:', expoError);

      // Fall back to RNFS
      try {
        await RNFS.writeFile(rnfsFileUri, entriesJson, 'utf8');
        console.log('Successfully saved entry with RNFS');
      } catch (rnfsError) {
        console.error('Error saving with RNFS:', rnfsError);
        throw rnfsError;
      }
    }

    return entry;
  } catch (error) {
    console.error('Error creating food entry:', error);
    throw new Error('Failed to create food entry');
  }
};

// Get all food entries from device storage
export const getFoodEntries = async (): Promise<FoodEntryData[]> => {
  try {
    // Define file paths for both FileSystem and RNFS
    const expoFileUri = `${FileSystem.documentDirectory}food_entries.json`;
    const rnfsFileUri = `${RNFS.DocumentDirectoryPath}/food_entries.json`;

    console.log('Checking for entries file at:', expoFileUri);
    console.log('Alternative path:', rnfsFileUri);

    // Try with Expo FileSystem first
    let fileExists = false;
    let entriesJson = '';

    try {
      const fileInfo = await FileSystem.getInfoAsync(expoFileUri);
      fileExists = fileInfo.exists;

      if (fileExists) {
        console.log('Found entries file with Expo FileSystem');
        entriesJson = await FileSystem.readAsStringAsync(expoFileUri);
      }
    } catch (expoError) {
      console.log('Expo FileSystem error:', expoError);
      // Fall back to RNFS
    }

    // If not found with Expo, try RNFS
    if (!fileExists) {
      try {
        fileExists = await RNFS.exists(rnfsFileUri);

        if (fileExists) {
          console.log('Found entries file with RNFS');
          entriesJson = await RNFS.readFile(rnfsFileUri, 'utf8');
        }
      } catch (rnfsError) {
        console.log('RNFS error:', rnfsError);
      }
    }

    // If no file exists, return empty array
    if (!fileExists || !entriesJson.trim()) {
      console.log('No entries file found, returning empty array');
      return [];
    }

    // Parse the JSON data
    try {
      const entries = JSON.parse(entriesJson);
      console.log(`Successfully parsed ${entries.length} entries`);

      // Convert string timestamps back to Date objects
      return entries.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
        id: entry.id || String(Date.now()), // Ensure ID exists
      }));
    } catch (parseError) {
      console.error('Error parsing entries JSON:', parseError);
      console.log('Raw JSON content:', entriesJson);
      return [];
    }
  } catch (error) {
    console.error('Error fetching food entries:', error);
    // Return empty array instead of throwing to prevent app crashes
    return [];
  }
};
