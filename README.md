# CheckinEcuador - Hive Onboarding App

A simple and reliable web application for onboarding new users to the Hive blockchain. This app creates introduction posts with proper metadata to ensure compatibility with Hive bots and onboarding systems.

## Features

- **Simple Login**: Secure login with Hive username and posting key
- **Image Upload**: Take and upload selfies directly from the browser
- **Introduction Posts**: Create formatted introduction posts with metadata
- **Community Selection**: Post to specific Hive communities
- **Mobile Friendly**: Responsive design that works on all devices
- **Secure**: Posting keys are stored temporarily and cleared after posting

## Why This App?

This app was created to solve reliability issues with existing onboarding tools:
- No crashes or compatibility issues
- Works on all mobile devices
- Ensures proper metadata for bot detection
- Simple, focused interface

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Hive account with posting key

### Installation

1. Clone or download this repository
2. Open `index.html` in your web browser
3. That's it! No build process required.

### Usage

1. **Login**: Enter your Hive username and posting key
2. **Upload Selfie**: Take or select a photo from your device
3. **Write Introduction**: Tell the community about yourself
4. **Fill Details**: Enter who onboarded you and select a community
5. **Post**: Submit your introduction to the Hive blockchain

## Development

This is a vanilla JavaScript application with no build requirements.

### File Structure

```
CheckinEcuador/
├── index.html          # Main HTML file
├── styles.css          # All CSS styles
├── js/
│   ├── app.js          # Main application logic
│   └── hive.js         # Hive blockchain integration
└── README.md           # This file
```

### Key Components

- **CheckinEcuadorApp**: Main application class handling UI and flow
- **HiveIntegration**: Handles Hive blockchain operations
- **ImageUploadService**: Manages image uploads

### Local Development

Simply open `index.html` in your browser. For local development with live reload:

```bash
# Using Python (if available)
python -m http.server 8000

# Using Node.js (if available)
npx http-server

# Then open http://localhost:8000
```

## Security

- Posting keys are stored in localStorage only during the posting process
- Keys are automatically cleared after successful posting
- No sensitive data is permanently stored
- All operations are client-side for maximum security

## API Integration

The app integrates with:
- Hive blockchain APIs for posting
- Image upload services (images.hive.blog)
- Community metadata systems

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on multiple devices
5. Submit a pull request

## License

This project is open source. Feel free to use, modify, and distribute.

## Support

For issues or questions, please create an issue in the repository or contact the development team.

---

Built with ❤️ for the Hive community
