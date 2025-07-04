// Hive blockchain integration
// This file contains the actual Hive posting functionality

// Import dhive for real blockchain integration
const { Client, PrivateKey, cryptoUtils } = window.dhive || {};

class HiveIntegration {
    constructor() {
        this.apiNode = 'https://api.hive.blog';
        this.altNodes = [
            'https://hived.privex.io',
            'https://anyx.io',
            'https://api.openhive.network'
        ];
        
        // Initialize dhive client
        this.client = new Client([
            this.apiNode,
            ...this.altNodes
        ]);
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
        try {
            // Step 1: Get account data to verify account exists
            const accountData = await this.getAccount(username);
            if (!accountData) {
                throw new Error('Account not found');
            }

            // Step 2: Validate posting key format and derive public key
            const privateKey = PrivateKey.fromString(postingKey);
            const publicKey = privateKey.createPublic().toString();

            // Step 3: Check if the derived public key matches the account's posting key
            const accountPostingKey = accountData.posting.key_auths[0][0];
            
            if (publicKey !== accountPostingKey) {
                throw new Error('Posting key does not match account');
            }

            return true;
        } catch (error) {
            console.error('Error validating posting key:', error);
            throw error;
        }
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
        // Hive usernames must be 3-16 characters, lowercase, numbers, and hyphens
        const regex = /^[a-z0-9\-]{3,16}$/;
        return regex.test(username);
    }

    // Validate posting key format
    validatePostingKey(postingKey) {
        try {
            // Check if it's a valid private key format
            const privateKey = PrivateKey.fromString(postingKey);
            return privateKey.toString() === postingKey;
        } catch (error) {
            return false;
        }
    }

    async postToHive(username, postingKey, title, body, jsonMetadata, community = null) {
        try {
            // Create private key object
            const privateKey = PrivateKey.fromString(postingKey);
            
            // Generate permlink
            const permlink = this.generatePermlink(title);
            
            // Create the comment operation
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

            // Create beneficiaries operation
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
                                    account: 'threespeakselfie',
                                    weight: 8000
                                }
                            ]
                        }]
                    ]
                }
            ];

            // Broadcast the operations
            const result = await this.client.broadcast.sendOperations(
                [commentOp, beneficiariesOp], 
                privateKey
            );

            return {
                success: true,
                permlink: permlink,
                url: `https://hive.blog/@${username}/${permlink}`,
                transactionId: result.id
            };
        } catch (error) {
            console.error('Error posting to Hive:', error);
            throw error;
        }
    }

    generatePermlink(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 255);
    }
}

// Image upload service
class ImageUploadService {
    constructor() {
        // Using images.hive.blog as the primary service
        this.uploadEndpoint = 'https://images.hive.blog';
        this.altEndpoint = 'https://images.ecency.com';
    }

    async uploadImage(file, username, postingKey) {
        try {
            console.log('Attempting Hive image upload...');
            
            // Create cryptographic signature using dhive
            const signature = await this.createImageSignature(file, postingKey);
            
            // Try to upload to Hive image service
            const imageUrl = await this.uploadToHiveImageService(file, username, signature);
            
            return imageUrl;
        } catch (error) {
            console.error('Image upload error:', error);
            throw new Error('Failed to upload image: ' + error.message);
        }
    }

    async createImageSignature(file, postingKey) {
        try {
            // Read file as array buffer
            const fileBuffer = await this.fileToArrayBuffer(file);
            
            // Create the challenge string as per Hive spec
            const challenge = 'ImageSigningChallenge';
            const challengeBuffer = new TextEncoder().encode(challenge);
            
            // Combine challenge + file data
            const combined = new Uint8Array(challengeBuffer.length + fileBuffer.byteLength);
            combined.set(challengeBuffer, 0);
            combined.set(new Uint8Array(fileBuffer), challengeBuffer.length);
            
            // Create SHA256 hash
            const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
            
            // Convert to Buffer for dhive compatibility
            const hashArray = new Uint8Array(hashBuffer);
            const messageBuffer = Buffer.from(hashArray);
            
            console.log('Buffer created:', messageBuffer);
            console.log('Buffer type:', typeof messageBuffer);
            console.log('Buffer constructor:', messageBuffer.constructor.name);
            console.log('Is Buffer?', Buffer.isBuffer(messageBuffer));
            console.log('Has _isBuffer?', messageBuffer._isBuffer);
            console.log('Buffer length:', messageBuffer.length);
            
            // Use dhive to create proper signature
            const privateKey = PrivateKey.fromString(postingKey);
            const signature = privateKey.sign(messageBuffer);
            
            return signature.toString();
            
        } catch (error) {
            console.error('Signature creation error:', error);
            throw new Error('Failed to create signature: ' + error.message);
        }
    }

    async uploadToHiveImageService(file, username, signature) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Try primary endpoint first
            const response = await fetch(`${this.uploadEndpoint}/${username}/${signature}`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                return result.url;
            } else {
                throw new Error(`Upload failed with status: ${response.status}`);
            }
        } catch (error) {
            console.error('Primary upload failed:', error);
            
            // Try alternative endpoint
            try {
                const response = await fetch(`${this.altEndpoint}/upload`, {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const result = await response.json();
                    return result.url;
                } else {
                    throw new Error(`Alt upload failed with status: ${response.status}`);
                }
            } catch (altError) {
                console.error('Alternative upload failed:', altError);
                throw new Error('Both image upload services failed');
            }
        }
    }

    async fileToArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    async uploadToHiveImageService(file, username, signature) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Try primary endpoint first
            const response = await fetch(`${this.uploadEndpoint}/${username}/${signature}`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                return result.url;
            } else {
                throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.log('Primary endpoint failed, trying alternative...');
            
            // Try alternative endpoint
            try {
                const response = await fetch(`${this.altEndpoint}/${username}/${signature}`, {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const result = await response.json();
                    return result.url;
                } else {
                    throw new Error(`Both upload services failed`);
                }
            } catch (altError) {
                throw new Error('All image upload services failed');
            }
        }
    }

    // Fallback to base64 data URL for testing
    async uploadAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

// Export for use in main app
window.HiveIntegration = HiveIntegration;
window.ImageUploadService = ImageUploadService;
