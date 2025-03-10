# CredHealth - React Native App

CredHealth is a React Native application designed to provide users with a platform for managing their health data, tracking healthy habits, and creating blockchain-based health insurance policies. The app integrates with AWS S3 for image storage, uses NativeWind for styling, and supports both iOS and Android platforms.

## Features

- **Health Activity Tracking**: Capture and upload images of meals for health verification.
- **Blockchain Policies**: Create and manage health insurance policies with predefined terms and automated payouts.
- **Health Score Dashboard**: View and track your health scores across various categories (activity, diet, sleep).
- **Profile Management**: Update and manage your profile information, including profile pictures.
- **AWS S3 Integration**: Upload and store images securely on AWS S3.
- **NativeWind Styling**: Utilizes Tailwind CSS for consistent and responsive styling.

## Installation

### Prerequisites

- Node.js (v16 or higher)
- Expo CLI (`npm install -g expo-cli`)
- AWS S3 bucket credentials (for image uploads)

### Steps

1. **Clone the repository**:
```bash
git clone https://github.com/unnxt30/credhealth.git
cd credhealth
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
Create a `.env` file in the root directory with the following AWS S3 credentials:
```env
S3_BUCKET_NAME=your-s3-bucket-name
AWS_REGION=your-aws-region
AWS_ACCESS_KEY=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
```

4. **Run the app**:
```bash
expo start
```
   - Use the Expo Go app on your mobile device to scan the QR code and run the app.
   - Alternatively, run on an emulator or physical device using:
     ```bash
     expo run:android
     ```
     or
     ```bash
     expo run:ios
     ```

## Project Structure

- **`App.tsx`**: Main entry point of the application.
- **`components/`**: Contains reusable components such as `Home`, `Activities`, `ProfileDashboard`, and `PointsDashboard`.
- **`services/`**: Contains API services for fetching health scores, evaluating meal photos, and managing AWS S3 uploads.
- **`server/`**: Backend server for handling API requests and integrating with blockchain services.
- **`app.json`**: Expo configuration file for app metadata and settings.
- **`babel.config.js`**: Babel configuration for transpiling JavaScript and TypeScript.
- **`tailwind.config.js`**: Tailwind CSS configuration for NativeWind styling.

## Dependencies

- **React Native**: Core framework for building the app.
- **Expo**: Development platform for React Native apps.
- **NativeWind**: Tailwind CSS integration for React Native.
- **AWS SDK**: For interacting with AWS S3.
- **React Native AWS3**: Library for uploading files to AWS S3.
- **React Native Feather Icons**: Icon library for the app.
- **React Native Reanimated**: For smooth animations.
- **React Native Safe Area Context**: For handling safe area insets.

## Scripts

- **`npm start`**: Starts the Expo development server.
- **`npm run android`**: Runs the app on an Android device/emulator.
- **`npm run ios`**: Runs the app on an iOS simulator.
- **`npm run web`**: Runs the app in a web browser.
- **`npm run lint`**: Runs ESLint and Prettier to check code quality.
- **`npm run format`**: Formats the code using Prettier.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeatureName`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeatureName`).
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](https://LICENSE) file for details.

## Acknowledgments

- [Expo](https://expo.dev/) for the development platform.
- [NativeWind](https://nativewind.dev/) for Tailwind CSS integration.
- [AWS SDK](https://aws.amazon.com/sdk-for-javascript/) for S3 integration.

---

For any questions or issues, please open an issue on the GitHub repository.