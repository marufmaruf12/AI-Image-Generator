# AI Image Generator - Android App Setup

This app is a completely offline text-to-image generator that runs on Android devices using Capacitor.

## Features
- 🎨 Generate 4 unique image variations from any text prompt
- 📱 Completely offline - no internet required after installation
- 🚀 On-device AI processing using web technologies
- 💾 Save images directly to device gallery
- 🌙 Beautiful dark theme with gradient design
- 📐 Mobile-optimized responsive interface

## Quick Development Preview
The app is already running in the browser preview. You can:
1. Enter any text prompt (e.g., "A majestic mountain landscape at sunset")
2. Click "Generate Images" to create 4 variations
3. View and download images
4. Test the complete offline functionality

## Android App Deployment

To deploy this as a standalone Android app:

### Prerequisites
- Node.js and npm installed
- Android Studio installed
- Git repository access

### Setup Steps

1. **Export to GitHub** (via Lovable interface)
2. **Clone and setup:**
   ```bash
   git clone <your-github-repo-url>
   cd <your-project-name>
   npm install
   ```

3. **Initialize Capacitor:**
   ```bash
   npx cap init
   ```

4. **Add Android platform:**
   ```bash
   npx cap add android
   ```

5. **Build the web app:**
   ```bash
   npm run build
   ```

6. **Sync to Android:**
   ```bash
   npx cap sync android
   ```

7. **Open in Android Studio:**
   ```bash
   npx cap open android
   ```

8. **Build APK/AAB in Android Studio**

### Testing
- **Emulator:** Use Android Studio's emulator
- **Physical device:** Enable developer mode and USB debugging

### App Configuration
- **App ID:** `app.lovable.1e0762f78d4b4c31bee2f63ac36d26a3`
- **App Name:** AI Image Generator
- **Permissions:** No special permissions required
- **Offline:** Works completely offline after installation

## Technical Details
- **Framework:** React + TypeScript + Vite
- **Mobile:** Capacitor for native Android deployment
- **AI Processing:** Hugging Face Transformers.js (browser-based)
- **UI:** Tailwind CSS with custom design system
- **Storage:** Local browser storage (IndexedDB)

## Performance Notes
- First generation may take longer as the AI model loads
- Subsequent generations are faster
- Images are stored locally on device
- No data sent to external servers

## Troubleshooting
- If build fails, ensure Android SDK is properly configured
- For WebGPU issues, the app automatically falls back to CPU processing
- Memory usage is optimized for mobile devices

For more help, read the Capacitor documentation: https://capacitorjs.com/docs/android