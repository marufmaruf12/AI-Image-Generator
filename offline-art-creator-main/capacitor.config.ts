import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.1e0762f78d4b4c31bee2f63ac36d26a3',
  appName: 'AI Image Generator',
  webDir: 'dist',
  server: {
    url: 'https://1e0762f7-8d4b-4c31-bee2-f63ac36d26a3.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1625',
      showSpinner: true,
      spinnerColor: '#3b82f6'
    }
  }
};

export default config;