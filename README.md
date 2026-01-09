# Health Motivation App - Frontend

## Overview
The Health Motivation App is a comprehensive mobile application built with React Native and Expo, designed to help users maintain and improve their health through various features and motivational tools.

## Tech Stack
- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **UI Components**: React Native Elements, React Native Paper
- **State Management**: React Native's built-in state management
- **Storage**: AsyncStorage for local data persistence
- **Charts**: React Native Chart Kit
- **Icons**: Expo Vector Icons, React Bootstrap Icons

## Key Features

### 1. User Interface
- Modern and intuitive UI design
- Responsive layout for various screen sizes
- Custom animations and transitions
- Support for both light and dark themes

### 2. Health Tracking
- Activity monitoring
- Progress visualization through charts
- Goal setting and tracking
- Customizable health metrics

### 3. Motivation Features
- Daily motivational quotes
- Achievement system
- Progress sharing capabilities
- Push notifications for reminders

### 4. Multimedia Integration
- Image picker functionality
- Audio playback support
- Video integration
- Speech synthesis for audio feedback

### 5. Social Features
- Social sharing capabilities
- Community interaction
- Progress sharing

## Project Structure
```
health-motivation-app/
├── src/                    # Source code directory
├── App.js                  # Main application component
├── app.json               # Expo configuration
├── babel.config.js        # Babel configuration
├── metro.config.js        # Metro bundler configuration
└── webpack.config.js      # Webpack configuration
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Studio (for Android development)

### Detailed Installation Guide

1. **Initial Setup**
```bash
# Create a new directory and navigate into it
mkdir health-motivation-app
cd health-motivation-app

# Initialize a new Expo project
npx create-expo-app .

# Install core dependencies
npm install expo@latest
npm install react@19.0.0 react-dom@19.0.0 react-native@0.79.2
```

2. **Navigation Dependencies**
```bash
npm install @react-navigation/native@^6.1.9
npm install @react-navigation/native-stack@^6.9.17
npm install @react-navigation/bottom-tabs@^6.5.11
npm install react-native-screens@~4.10.0
npm install react-native-safe-area-context@5.4.0
```

3. **UI Component Libraries**
```bash
# React Native Elements
npm install @rneui/base@^4.0.0-rc.7
npm install @rneui/themed@^4.0.0-rc.8

# React Native Paper
npm install react-native-paper@^5.13.1

# Bootstrap and related
npm install bootstrap@^5.3.3
npm install react-bootstrap-icons@^1.11.5
npm install react-native-bootstrap-styles@^4.5.0-r
```

4. **Storage and State Management**
```bash
npm install @react-native-async-storage/async-storage@2.1.2
```

5. **Charts and Visualization**
```bash
npm install react-native-chart-kit@^6.12.0
```

6. **Media and Animation**
```bash
# Expo media packages
npm install expo-av@~15.1.4
npm install expo-image-picker@~16.1.4
npm install expo-speech@~13.1.7

# Animation
npm install react-native-animatable@^1.4.0
npm install react-native-reanimated@~3.17.4
```

7. **Additional UI Components**
```bash
npm install react-native-vector-icons@^10.0.3
npm install react-native-shadow@^1.2.2
npm install react-native-shadow-generator@^1.1.2
npm install react-native-linear-gradient@^2.8.3
```

8. **Development Dependencies**
```bash
npm install --save-dev @babel/core@^7.20.0
npm install --save-dev @expo/webpack-config@^19.0.0
npm install --save-dev @types/react@~19.0.10
npm install --save-dev typescript@^5.3.0
```

### Configuration Files

1. **babel.config.js**
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin']
  };
};
```

2. **metro.config.js**
```javascript
const { getDefaultConfig } = require('@expo/metro-config');

module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);
  return defaultConfig;
})();
```

### Verification Steps

1. **Start the Development Server**
```bash
npm start
```

2. **Test on Different Platforms**
```bash
npm run android  # For Android
npm run ios     # For iOS
npm run web     # For web
```

### Common Issues and Solutions

1. **Metro Bundler Issues**
```bash
npm start -- --reset-cache
```

2. **iOS Build Issues**
```bash
cd ios && pod install && cd ..
```

3. **Version Management**
- Keep track of your `package.json` files
- Use exact versions for production
- Consider using `package-lock.json` for consistent installations

4. **Security Considerations**
- Never commit `.env` files
- Keep dependencies updated
- Regularly check for security vulnerabilities:
  ```bash
  npm audit
  ```

## Dependencies
- **Core**: React Native, Expo
- **UI**: React Native Elements, React Native Paper
- **Navigation**: React Navigation
- **Storage**: AsyncStorage
- **Charts**: React Native Chart Kit
- **Media**: Expo AV, Expo Image Picker
- **Notifications**: Expo Notifications
- **Authentication**: Expo Auth Session

## Development Guidelines
1. Follow the existing code structure
2. Use functional components with hooks
3. Implement proper error handling
4. Write clean and documented code
5. Test on both iOS and Android platforms

## Performance Considerations
- Optimize image loading
- Implement proper caching strategies
- Use lazy loading where appropriate
- Monitor and optimize bundle size

## Security Features
- Secure storage implementation
- Input validation
- API security measures
- Data encryption

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the 0BSD License. 