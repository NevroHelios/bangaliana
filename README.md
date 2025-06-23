# বঙ্গ-Lore Frontend

## Bengali Cultural Social Media Platform

This is the official frontend for **বঙ্গ-Lore**, a revolutionary Bengali-first social media platform designed to digitize and preserve Bengali cultural heritage while serving the massive ₹84,000 crore cultural economy. Built with React Native and Expo, it provides a rich, cross-platform experience for both cultural enthusiasts and business users.

## 🎯 Project Vision

বঙ্গ-Lore bridges the gap between Bengali cultural traditions and modern technology, serving as the essential digital infrastructure for:
- **Cultural Communities**: Discovering and sharing authentic Bengali heritage
- **Durga Puja Committees**: Managing events and connecting with vendors
- **Local Businesses**: Accessing Bengali-first marketing tools
- **Global Bengali Diaspora**: Staying connected to their cultural roots

## ✨ Key Features

### Core Social Platform
- **Bengali-First Design**: Native Bengali typography and cultural UI elements
- **Dynamic Cultural Feed**: AI-curated Bengali cultural content with location-based filtering
- **Post Creation**: Upload photos/videos with automatic Bengali story generation (60 words)
- **Interactive Elements**: Like, comment, bookmark with Bengali language support
- **Voice Integration**: Audio recording and playback for accessibility

### AI-Powered Cultural Features
- **HyperRural Chatbot**: Bengali voice/text/image AI assistant with local cultural context
- **AI Story Generation**: Automatic 60-word Bengali stories from uploaded media using Gemini
- **Cultural Content Analysis**: Smart tagging and categorization of cultural posts
- **Personalized Recommendations**: Vector-based content discovery

### Business & Event Management
- **Event Discovery**: Interactive map showing Durga Puja committees and cultural events
- **Vendor Marketplace**: Connect puja committees with local service providers
- **Business Dashboard**: Analytics and campaign management for B2B customers
- **Ticket Integration**: Event booking and management system

### Advanced Capabilities
- **Hyperlocal Features**: Geo-tagged content with Bengali locality awareness
- **Multi-modal Input**: Support for voice, text, and image interactions
- **Offline Support**: Essential features work without internet connectivity
- **Dark/Light Themes**: Culturally-appropriate color schemes

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Expo Go](https://expo.dev/go) app on your mobile device
- A code editor like [VS Code](https://code.visualstudio.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd bangaliana-mainv3
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install Expo CLI globally (if not already installed):**
   ```bash
   npm install -g @expo/cli
   ```

### Configuration

#### Backend Connection
Update the API endpoint in your environment configuration:

```typescript
// In your config file
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.100:10000' // Your local IP
  : 'https://your-production-api.com';
```

#### Environment Variables
Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_API_URL=http://your-backend-ip:10000
EXPO_PUBLIC_CIVIC_AUTH_CLIENT_ID=your_civic_auth_client_id
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### Running the Application

1. **Start the development server:**
   ```bash
   npx expo start
   ```

2. **Run on your device:**
   - **Physical Device**: Open Expo Go app and scan the QR code
   - **Android Emulator**: Press `a` in the terminal
   - **iOS Simulator**: Press `i` in the terminal

3. **For production builds:**
   ```bash
   # Android
   npx expo build:android
   
   # iOS
   npx expo build:ios
   ```

## 🏗️ Tech Stack

### Core Technologies
- **Framework**: [React Native](https://reactnative.dev/) with [Expo SDK 49+](https://expo.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) for type safety
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) with file-based routing
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) for global state

### UI & Styling
- **Components**: [React Native Paper 5.0](https://reactnativepaper.com/) with Material Design 3
- **Icons**: [Expo Vector Icons](https://docs.expo.dev/guides/icons/)
- **Typography**: Noto Sans Bengali for native script support
- **Theming**: Custom Bengali cultural color schemes

### Audio & Media
- **Audio Recording**: [expo-av](https://docs.expo.dev/versions/latest/sdk/av/)
- **Image Handling**: [expo-image-picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- **Media Upload**: Direct integration with Cloudinary

### Authentication & Security
- **Auth Provider**: [Civic Auth](https://www.civic.com/) integration
- **Secure Storage**: [expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/)
- **Biometric**: [expo-local-authentication](https://docs.expo.dev/versions/latest/sdk/local-authentication/)

## 📱 App Architecture

### Screen Structure
```
app/
├── (auth)/           # Authentication screens
│   ├── login.tsx
│   ├── register.tsx
│   └── onboarding.tsx
├── (drawer)/         # Main app screens
│   ├── feed.tsx      # Cultural content feed
│   ├── create.tsx    # Post creation
│   ├── events.tsx    # Event discovery
│   ├── chat.tsx      # HyperRural chatbot
│   └── business/     # B2B dashboard
├── profile/          # User profiles
└── _layout.tsx       # Root layout
```

### Component Organization
```
components/
├── ui/              # Reusable UI components
├── cultural/        # Bengali-specific components
├── business/        # B2B interface components
├── chat/           # Chatbot interface
└── forms/          # Form components
```

## 🎨 Design System

### Color Palette
- **Primary**: `#FF6B35` (Bengali Saffron)
- **Secondary**: `#228B22` (Forest Green)
- **Accent**: `#FFD700` (Gold)
- **Background**: `#FAFAFA` (Light) / `#121212` (Dark)

### Typography
- **Primary**: Noto Sans Bengali (Bengali text)
- **Secondary**: Inter (English text)
- **Sizes**: 12, 14, 16, 20, 24, 32, 48px

## 🔧 Development Guidelines

### Code Style
- Use TypeScript for all new files
- Follow React Native best practices
- Implement proper error boundaries
- Add accessibility labels for Bengali screen readers

### Testing
```bash
# Run unit tests
npm test

# Run E2E tests (if configured)
npm run test:e2e
```

### Building & Deployment
```bash
# Create development build
npx expo install --fix
npx expo prebuild

# Create production build
npm run build:production
```

## 🌍 Bengali Language Support

### Features
- **Native Input**: Bengali keyboard support
- **Voice Recognition**: Bengali speech-to-text
- **Cultural Context**: AI understanding of Bengali idioms and references
- **Localization**: Complete Bengali UI translation

### Implementation
```typescript
// Example Bengali text handling
import { getBengaliText } from '../utils/localization';

const CulturalGreeting = () => {
  return (
    <Text style={styles.bengaliText}>
      {getBengaliText('welcome_message')}
    </Text>
  );
};
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/cultural-enhancement`
3. Commit changes: `git commit -m 'Add Bengali festival calendar'`
4. Push to branch: `git push origin feature/cultural-enhancement`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Bengali cultural consultants and community leaders
- Google Gemini AI team for Bengali language support  
- Durga Puja committees across Bengal for their partnership
- Open source Bengali language processing communities

---

**বঙ্গ-Lore** - *Preserving Bengali heritage through modern technology* 🇮🇳
