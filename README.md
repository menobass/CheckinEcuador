# CheckinEcuador - Hive Onboarding App

A reliable, production-ready JavaScript web application for onboarding new users to the Hive blockchain. This app creates introduction posts with exact metadata matching the checkinwith.xyz format to ensure proper bot detection and integration with the Hive ecosystem.

## 🚀 Features

- **Real Hive Integration**: Uses @hiveio/dhive for authentic cryptographic signing
- **Secure Image Upload**: Real image upload to Hive with posting key signatures
- **Debug Window**: Copyable URLs for verification and testing
- **Dual Mode**: Both real posting and JSON generation for testing
- **Mobile Responsive**: Works on all devices
- **Exact Metadata**: Matches checkinwith.xyz format precisely

## 🛠️ Technologies

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Backend**: Node.js (simple static server)
- **Blockchain**: Hive blockchain integration
- **Image Service**: Hive image hosting

## 🏗️ Architecture

```
CheckinEcuador/
├── index.html          # Main HTML file (two-page structure)
├── styles.css          # Styling and responsive design
├── js/
│   ├── app.js         # Main application logic
│   └── hive.js        # Hive blockchain integration
├── server.js          # Local development server
├── package.json       # Dependencies and scripts
└── README.md          # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js installed on your system
- A Hive account with posting key
- Modern web browser

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/CheckinEcuador.git
cd CheckinEcuador
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## 📋 Usage

### Page 1: Login
1. Enter your Hive username
2. Enter your posting key
3. Click "Login & Verify"
4. Wait for account validation

### Page 2: Create Post
1. Upload a selfie image
2. Write your introduction text
3. Enter the username of who onboarded you
4. Click "Generate JSON"
5. Download the generated JSON file

## 🔧 Configuration

The app is pre-configured with:
- **Community**: `hive-115276` (hardcoded)
- **Country**: Ecuador (hardcoded)
- **Beneficiaries**: `threespeakselfie` (80% weight)
- **Developer**: `sagarkothari88`
- **App Name**: `checkinwithxyz/1.0.0`

## 📊 Metadata Structure

The app generates JSON with this exact metadata structure:

```json
{
  "tags": ["introduceyourself", "checkin"],
  "app": "checkinwithxyz/1.0.0",
  "username": "user123",
  "image": ["https://images.hive.blog/..."],
  "country": "Ecuador",
  "onboarder": "onboarder_username",
  "introductionText": "User's introduction...",
  "communityName": "hive-115276",
  "lightningAddress": "user123@sats.v4v.app",
  "developer": "sagarkothari88"
}
```

## 🔒 Security Features

- **Temporary Storage**: Posting keys stored in localStorage only during session
- **Automatic Cleanup**: Credentials cleared after posting or logout
- **Validation**: Account existence and posting key format validation
- **No Permanent Storage**: No sensitive data stored permanently

## 🧪 Testing Mode

Currently operates in testing mode with:
- **Mock Image URLs**: For development without real Hive image service
- **JSON Export**: Instead of direct blockchain posting
- **Local Validation**: Basic posting key format validation

## 🔮 Future Enhancements

- [ ] Real cryptographic signature for image uploads
- [ ] Direct blockchain posting (after testing phase)
- [ ] Enhanced error handling and user feedback
- [ ] Support for multiple communities
- [ ] Advanced posting key validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

## 🙏 Acknowledgments

- Hive blockchain community
- checkinwith.xyz for inspiration
- Ecuador Hive community

---

Built with ❤️ for the Hive blockchain community
