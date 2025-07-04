<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# CheckinEcuador - Hive Onboarding App

This is a JavaScript web application for onboarding new users to the Hive blockchain. The app creates introduction posts with specific metadata to ensure proper bot detection and integration with the Hive ecosystem.

## Key Technologies
- Vanilla JavaScript (ES6+)
- HTML5 with modern form elements
- CSS3 with flexbox and grid
- Hive blockchain integration
- Image upload functionality

## Architecture Guidelines
- Keep the app simple and lightweight for maximum compatibility
- Use localStorage only temporarily for posting keys (clear after successful post)
- Focus on reliability and error handling
- Implement proper validation for Hive usernames and posting keys
- Use responsive design for mobile compatibility

## Code Style
- Use modern JavaScript features (async/await, classes, modules)
- Follow semantic HTML structure
- Implement proper error handling and user feedback
- Use meaningful variable and function names
- Add comprehensive comments for complex logic

## Security Considerations
- Never store posting keys permanently
- Validate all user inputs
- Use secure image upload practices
- Implement proper error messages without exposing sensitive information

## Hive Integration
- Use official Hive API endpoints
- Follow Hive posting standards and metadata formats
- Implement proper permlink generation
- Handle Resource Credits (RC) limitations gracefully
