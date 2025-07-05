// Configuration for CheckinEcuador app
// You can modify these settings as needed

const CONFIG = {
    // Imgur API configuration
    imgur: {
        // Add your own Imgur client ID here for better rate limits
        // Get one free at: https://api.imgur.com/oauth2/addclient
        clientIds: [
            '4d83e353ac99be2',  // Default (shared, limited)
            // 'YOUR_CLIENT_ID_HERE',  // Add your own here
        ],
        
        // Fallback to base64 if all uploads fail
        allowFallback: true,
        
        // Maximum file size (10MB)
        maxFileSize: 10 * 1024 * 1024
    },
    
    // Hive blockchain configuration
    hive: {
        apiNodes: [
            'https://api.hive.blog',
            'https://hived.privex.io',
            'https://anyx.io',
            'https://api.openhive.network'
        ],
        
        // Default community for posts
        defaultCommunity: 'hive-115276',  // Ecuador Community
        
        // Beneficiary settings
        beneficiaries: [{
            account: 'hiveecuador',  // Your Ecuador community account
            weight: 8000  // 80%
        }]
    }
};

// Export configuration
window.CONFIG = CONFIG;
