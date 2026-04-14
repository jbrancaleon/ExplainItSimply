# ExplainItSimply

AI-powered text simplification app. Paste anything and get a simple explanation at 4 complexity levels: Kid, Teen, General, or Expert.

Built with **FastAPI** (backend), **React** (web frontend), and **React Native + Expo** (mobile app for Android & iOS).

## Live Demo

- **Web App:** [https://first-session-app-kg9106rf.devinapps.com](https://first-session-app-kg9106rf.devinapps.com)
- **Backend API:** [https://app-izuxylzo.fly.dev](https://app-izuxylzo.fly.dev)

## Features

- Paste any complex text and get a simplified version
- **4 complexity levels:** Kid (age 10), Teen, General Adult, Expert
- **Voice input** (mobile) - tap the mic to speak your text instead of typing
- **Voice output** (mobile) - listen to the simplified explanation read aloud
- Copy simplified text to clipboard
- Character count statistics and reduction percentage
- Responsive UI for web and mobile

## Project Structure

```
ExplainItSimply/
├── explain-it-simply-backend/    # FastAPI + OpenAI backend
│   ├── app/
│   │   └── main.py               # API endpoints
│   └── pyproject.toml             # Python dependencies (Poetry)
├── explain-it-simply-frontend/   # React + Vite web frontend
│   ├── src/
│   │   ├── App.tsx                # Main web UI
│   │   └── App.css                # Styles
│   └── package.json
├── explain-it-simply-mobile/     # Expo React Native mobile app
│   ├── App.tsx                    # Main mobile UI with voice commands
│   ├── app.json                   # Expo config with permissions
│   └── package.json
└── README.md
```

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.12+
- **Poetry** (Python package manager)
- **OpenAI API Key** with credits ([get one here](https://platform.openai.com/api-keys))
- For mobile builds: **Expo CLI** and an **Expo account**
- For iOS builds: **Apple Developer account** ($99/year)

## Setup

### 1. Backend

```bash
cd explain-it-simply-backend

# Install dependencies
poetry install

# Create .env file with your OpenAI API key
echo "OPENAI_API_KEY=your-api-key-here" > .env

# Run the server
poetry run fastapi dev app/main.py --port 8000
```

The API will be available at `http://localhost:8000`.

**API Endpoint:**
```bash
# Test the simplify endpoint
curl -X POST http://localhost:8000/api/simplify \
  -H "Content-Type: application/json" \
  -d '{"text": "Quantum entanglement is a phenomenon...", "level": "kid"}'
```

### 2. Web Frontend

```bash
cd explain-it-simply-frontend

# Install dependencies
npm install

# Create .env pointing to your backend
echo "VITE_API_URL=http://localhost:8000" > .env

# Run the dev server
npm run dev
```

The web app will be available at `http://localhost:5173`.

### 3. Mobile App (Local Development)

```bash
cd explain-it-simply-mobile

# Install dependencies
npm install

# Start the Expo dev server
npx expo start
```

Then scan the QR code with **Expo Go** on your phone to preview the app.

---

## Building the Android App (APK / AAB)

### Option A: Using EAS Build (Recommended - No Android Studio Required)

EAS (Expo Application Services) builds your app in the cloud. No local Android SDK needed.

```bash
# 1. Install EAS CLI globally
npm install -g eas-cli

# 2. Log in to your Expo account (create one at https://expo.dev/signup)
eas login

# 3. Navigate to the mobile app directory
cd explain-it-simply-mobile

# 4. Configure the project for EAS builds (first time only)
eas build:configure

# 5. Build an Android APK (for direct installation / testing)
eas build --platform android --profile preview

# 6. Build an Android AAB (for Google Play Store submission)
eas build --platform android --profile production
```

After the build completes, EAS will provide a download link for your APK/AAB file.

**To install the APK on your Android device:**
1. Download the APK from the EAS build link
2. Transfer it to your Android device
3. Open the APK file on your device and tap "Install"
4. You may need to enable "Install from unknown sources" in your device settings

### Option B: Using Android Studio (Local Build)

```bash
# 1. Install Android Studio from https://developer.android.com/studio

# 2. Generate the native Android project
cd explain-it-simply-mobile
npx expo prebuild --platform android

# 3. Open the android/ folder in Android Studio
# File > Open > select the android/ folder

# 4. Build from Android Studio
# Build > Build Bundle(s) / APK(s) > Build APK(s)

# OR build from command line:
cd android
./gradlew assembleRelease
```

The APK will be at `android/app/build/outputs/apk/release/app-release.apk`.

### Publishing to Google Play Store

1. Create a [Google Play Developer account](https://play.google.com/console) ($25 one-time fee)
2. Build an AAB (Android App Bundle): `eas build --platform android --profile production`
3. Go to Google Play Console > Create App
4. Upload the AAB file
5. Fill in store listing details, screenshots, etc.
6. Submit for review

---

## Building the iOS App (IPA)

### Option A: Using EAS Build (Recommended)

```bash
# 1. Install EAS CLI (if not already installed)
npm install -g eas-cli

# 2. Log in to Expo
eas login

# 3. Navigate to the mobile app directory
cd explain-it-simply-mobile

# 4. Configure for EAS builds (first time only)
eas build:configure

# 5. Build for iOS
eas build --platform ios

# During the build, EAS will ask for your Apple Developer credentials:
# - Apple ID
# - App-specific password (generate at https://appleid.apple.com)
# - Team ID (from https://developer.apple.com/account)
```

EAS handles all iOS code signing and provisioning profiles automatically.

### Option B: Using Xcode (Local Build)

```bash
# 1. Install Xcode from the Mac App Store (macOS only)

# 2. Generate the native iOS project
cd explain-it-simply-mobile
npx expo prebuild --platform ios

# 3. Install CocoaPods dependencies
cd ios
pod install
cd ..

# 4. Open in Xcode
open ios/ExplainItSimply.xcworkspace

# 5. Select your target device/simulator
# 6. Click the Play button to build and run
```

### Publishing to the App Store

1. You need an [Apple Developer account](https://developer.apple.com/programs/) ($99/year)
2. Build with EAS: `eas build --platform ios --profile production`
3. Submit to App Store: `eas submit --platform ios`
4. Or manually upload via Xcode's Organizer or Transporter app
5. Fill in App Store Connect listing details
6. Submit for Apple's review (typically 1-3 days)

---

## Voice Commands (Mobile App)

The mobile app supports voice interaction:

- **Voice Input (Speech-to-Text):** Tap the "Voice" mic button to speak your text instead of typing. The app will transcribe your speech and add it to the input field. Works on both Android and iOS.

- **Voice Output (Text-to-Speech):** After getting a simplified result, tap the "Listen" button to hear it read aloud. Tap "Stop" to stop playback.

**Required Permissions:**
- Microphone access (for voice input)
- Speech recognition (for voice input)

These permissions are configured in `app.json` and will be requested when you first use the voice feature.

---

## API Reference

### POST `/api/simplify`

Simplify text at a given complexity level.

**Request:**
```json
{
  "text": "Your complex text here...",
  "level": "kid"  // Options: "kid", "teen", "adult", "expert"
}
```

**Response:**
```json
{
  "simplified": "The simplified text...",
  "level": "kid",
  "original_length": 150,
  "simplified_length": 80
}
```

### GET `/healthz`

Health check endpoint. Returns `{"status": "ok"}`.

---

## Environment Variables

### Backend (`explain-it-simply-backend/.env`)
```
OPENAI_API_KEY=your-openai-api-key
```

### Web Frontend (`explain-it-simply-frontend/.env`)
```
VITE_API_URL=http://localhost:8000
```

The mobile app's API URL is configured in `App.tsx` (defaults to the deployed backend).

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Python, FastAPI, OpenAI API (GPT-4o-mini) |
| Web Frontend | React, TypeScript, Vite, Tailwind CSS |
| Mobile App | React Native, Expo, TypeScript |
| Voice Input | expo-speech-recognition (SpeechRecognizer / SFSpeechRecognizer) |
| Voice Output | expo-speech (Text-to-Speech) |
| Deployment | Fly.io (backend), Devin Apps (web frontend) |

## License

MIT
