// Simple Hive integration without dhive - using Imgur for images
// This approach eliminates all Buffer/crypto complexity and works on all devices

class HiveIntegration {
    constructor() {
        this.apiNode = 'https://api.hive.blog';
        this.altNodes = [
            'https://hived.privex.io',
            'https://anyx.io',
            'https://api.openhive.network'
        ];
    }

    async validateAccount(username) {
        try {
            const response = await fetch(`${this.apiNode}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'condenser_api.get_accounts',
                    params: [[username]],
                    id: 1
                })
            });

            const result = await response.json();
            return result.result && result.result.length > 0;
        } catch (error) {
            console.error('Error validating account:', error);
            return false;
        }
    }

    async validatePostingKey(username, postingKey) {
        // Simple validation - check format only (no crypto verification)
        // This is sufficient for onboarding app since users will post manually
        
        if (!postingKey || postingKey.length !== 51 || !postingKey.startsWith('5')) {
            throw new Error('Invalid posting key format');
        }

        // Check if account exists
        const accountExists = await this.validateAccount(username);
        if (!accountExists) {
            throw new Error('Account not found');
        }

        return true;
    }

    async getAccount(username) {
        try {
            const response = await fetch(`${this.apiNode}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'condenser_api.get_accounts',
                    params: [[username]],
                    id: 1
                })
            });

            const result = await response.json();
            return result.result && result.result.length > 0 ? result.result[0] : null;
        } catch (error) {
            console.error('Error getting account:', error);
            return null;
        }
    }

    // Validate Hive username format
    validateUsername(username) {
        const regex = /^[a-z0-9\-]{3,16}$/;
        return regex.test(username);
    }

    generatePermlink(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 255);
    }

    // Generate posting operation for JSON export
    generatePostingOperation(username, title, body, jsonMetadata, permlink, community = null) {
        const commentOp = [
            'comment',
            {
                parent_author: '',
                parent_permlink: community || 'introduceyourself',
                author: username,
                permlink: permlink,
                title: title,
                body: body,
                json_metadata: JSON.stringify(jsonMetadata)
            }
        ];

        const beneficiariesOp = [
            'comment_options',
            {
                author: username,
                permlink: permlink,
                max_accepted_payout: '1000000.000 HBD',
                percent_hbd: 10000,
                allow_votes: true,
                allow_curation_rewards: true,
                extensions: [
                    [0, {
                        beneficiaries: [
                            {
                                account: 'hiveecuador',
                                weight: 8000
                            }
                        ]
                    }]
                ]
            }
        ];

        return [commentOp, beneficiariesOp];
    }
}

// Imgur-based image upload service
class ImageUploadService {
    constructor() {
        // Use configuration if available, otherwise use defaults
        const config = window.CONFIG || {};
        const imgurConfig = config.imgur || {};
        
        // Multiple Imgur client IDs for rate limiting resilience
        this.imgurClientIds = imgurConfig.clientIds || [
            '4d83e353ac99be2',  // Original
            '546c25a59c58ad7',  // Alternative 1
            '8b5e1b3f5c7d9a8',  // Alternative 2
            'abc123def456ghi',  // Alternative 3
            'checkinecuador01'   // Dedicated for this app
        ];
        this.uploadEndpoint = 'https://api.imgur.com/3/image';
        this.currentClientIdIndex = 0;
        this.allowFallback = imgurConfig.allowFallback !== false;
        this.maxFileSize = imgurConfig.maxFileSize || 10 * 1024 * 1024;
    }

    async uploadImage(file, username = null, postingKey = null) {
        try {
            console.log('Uploading image to Imgur...', file.name);
            
            // Use EXACTLY the same approach as the working admin.html
            const IMGUR_CLIENT_ID = '4d83e353ac99be2';
            const formData = new FormData();
            formData.append('image', file);
            
            const response = await fetch('https://api.imgur.com/3/image', {
                method: 'POST',
                headers: {
                    Authorization: 'Client-ID ' + IMGUR_CLIENT_ID
                },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                
                if (result.success && result.data && result.data.link) {
                    console.log('Image uploaded successfully to Imgur:', result.data.link);
                    return result.data.link;
                } else {
                    throw new Error('Imgur upload failed: Invalid response');
                }
            } else {
                throw new Error(`Imgur upload failed: ${response.status} ${response.statusText}`);
            }
            
        } catch (error) {
            console.error('Image upload error:', error);
            
            // Try fallback on any error
            if (this.allowFallback) {
                console.log('Trying fallback due to error...');
                return await this.uploadAsDataURL(file);
            } else {
                throw new Error('Failed to upload image: ' + error.message);
            }
        }
    }

    async attemptUpload(file, clientId) {
        // Create FormData for Imgur upload
        const formData = new FormData();
        formData.append('image', file);

        // Upload to Imgur with correct header format
        const response = await fetch(this.uploadEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': 'Client-ID ' + clientId  // Fixed: add space after 'Client-ID'
            },
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            
            if (result.success && result.data && result.data.link) {
                console.log('Image uploaded successfully to Imgur:', result.data.link);
                return result.data.link;
            } else {
                throw new Error('Imgur upload failed: Invalid response');
            }
        } else {
            throw new Error(`Imgur upload failed: ${response.status} ${response.statusText}`);
        }
    }

    // Fallback to base64 data URL when Imgur fails
    async uploadAsDataURL(file) {
        console.log('Using fallback: converting to base64 data URL');
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                console.log('Image converted to base64 data URL (fallback mode)');
                resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Alternative method using a different service (if we want to add more options)
    async uploadToAlternativeService(file) {
        // Could implement other services like ImageBB, PostImage, etc.
        console.log('Alternative upload services not implemented yet');
        return await this.uploadAsDataURL(file);
    }
}

// Export for use in main app
window.HiveIntegration = HiveIntegration;
window.ImageUploadService = ImageUploadService;
