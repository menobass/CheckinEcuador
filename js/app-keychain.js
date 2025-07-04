// CheckinEcuador App with Hive Keychain Integration
class CheckinEcuadorApp {
    constructor() {
        this.currentUser = null;
        this.uploadedImageUrl = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkKeychainAvailability();
    }

    setupEventListeners() {
        // Keychain login            app: 'checkinecuador/1.0.0',
            username: this.currentUser,
            image: [data.imageUrl],
            country: 'Ecuador',
            onboarder: data.onboardedBy,
            introductionText: data.intro,
            communityName: 'hive-115276',
            lightningAddress: lightningAddress,
            developer: 'menobass' document.getElementById('keychain-login-btn').addEventListener('click', () => {
            this.loginWithKeychain();
        });

        // Logout
        document.getElementById('logout-button').addEventListener('click', () => {
            this.logout();
        });

        // Image upload
        document.getElementById('selfie').addEventListener('change', (e) => {
            this.handleImageSelect(e);
        });

        // Post to Hive with Keychain
        document.getElementById('postToHive').addEventListener('click', () => {
            this.postToHiveWithKeychain();
        });

        // Generate JSON (fallback)
        document.getElementById('generateJSON').addEventListener('click', () => {
            this.handleGenerateJSON();
        });
    }

    checkKeychainAvailability() {
        const statusDiv = document.getElementById('keychain-status');
        
        // Check immediately
        this.updateKeychainStatus(statusDiv);
        
        // Also check after a delay (like the working test)
        setTimeout(() => {
            this.updateKeychainStatus(statusDiv);
        }, 1000);
    }
    
    updateKeychainStatus(statusDiv) {
        if (typeof window.hive_keychain !== 'undefined' && window.hive_keychain) {
            statusDiv.innerHTML = '<div class="success">✅ Hive Keychain detected! Ready to login.</div>';
            
            // Test handshake like the working test
            try {
                window.hive_keychain.requestHandshake(() => {
                    console.log('Keychain handshake successful');
                });
            } catch (e) {
                console.log('Keychain handshake error:', e);
            }
        } else {
            statusDiv.innerHTML = `
                <div class="error">
                    ⚠️ Hive Keychain not detected. 
                    <br>Please install Hive Keychain or use the Keychain browser.
                    <br><a href="https://hive-keychain.com" target="_blank">Get Hive Keychain</a>
                </div>
            `;
        }
    }

    async loginWithKeychain() {
        const username = document.getElementById('username').value.trim();
        const statusDiv = document.getElementById('keychain-status');
        const loginBtn = document.getElementById('keychain-login-btn');
        
        if (!username) {
            statusDiv.innerHTML = '<div class="error">Please enter your Hive username</div>';
            return;
        }

        if (!window.hive_keychain) {
            statusDiv.innerHTML = '<div class="error">Hive Keychain not available</div>';
            return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = 'Connecting...';
        statusDiv.innerHTML = '<div class="info">Requesting Keychain authentication...</div>';

        try {
            // Use requestSignBuffer for login authentication
            const loginMessage = `Login to CheckinEcuador at ${Date.now()}`;
            window.hive_keychain.requestSignBuffer(username, loginMessage, 'Posting', (response) => {
                if (response.success) {
                    this.currentUser = username;
                    this.showPostingPage();
                    statusDiv.innerHTML = '<div class="success">✅ Successfully logged in with Keychain!</div>';
                } else {
                    statusDiv.innerHTML = `<div class="error">❌ Keychain authentication failed: ${response.message || 'Unknown error'}</div>`;
                    loginBtn.disabled = false;
                    loginBtn.textContent = 'Login with Keychain';
                }
            });
        } catch (error) {
            statusDiv.innerHTML = `<div class="error">❌ Error: ${error.message}</div>`;
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login with Keychain';
        }
    }

    showLoginPage() {
        document.getElementById('login-page').classList.remove('hidden');
        document.getElementById('posting-page').classList.add('hidden');
    }

    showPostingPage() {
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('posting-page').classList.remove('hidden');
        
        // Update verification banner
        const userSpan = document.querySelector('.verification-banner .user-info');
        if (userSpan) {
            userSpan.textContent = `@${this.currentUser}`;
        }
    }

    logout() {
        this.currentUser = null;
        this.uploadedImageUrl = null;
        this.showLoginPage();
        
        // Reset form
        document.getElementById('username').value = '';
        document.getElementById('keychain-status').innerHTML = '';
        this.checkKeychainAvailability();
    }

    async handleImageSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.showImageUploadStatus('Uploading image...', 'loading');

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('https://api.imgur.com/3/image', {
                method: 'POST',
                headers: {
                    'Authorization': 'Client-ID 4d83e353ac99be2'
                },
                body: formData
            });

            const data = await response.json();
            
            if (data.success && data.data && data.data.link) {
                this.uploadedImageUrl = data.data.link;
                this.showImagePreview(data.data.link);
                this.showImageUploadStatus('✅ Image uploaded successfully!', 'success');
            } else {
                throw new Error('Invalid response from Imgur');
            }
        } catch (error) {
            this.showImageUploadStatus('❌ Upload failed: ' + error.message, 'error');
        }
    }

    showImagePreview(imageUrl) {
        const preview = document.getElementById('image-preview');
        preview.innerHTML = `
            <div class="image-preview-container">
                <img src="${imageUrl}" alt="Uploaded selfie">
                <div class="image-info">
                    <small>Image uploaded successfully</small>
                </div>
            </div>
        `;
    }

    showImageUploadStatus(message, type = 'loading') {
        const preview = document.getElementById('image-preview');
        preview.innerHTML = `
            <div class="upload-status">
                <div class="status-${type}">${message}</div>
            </div>
        `;
    }

    async postToHiveWithKeychain() {
        if (!this.validateForm()) return;

        if (!window.hive_keychain) {
            this.showFormError('Hive Keychain not available');
            return;
        }

        const postButton = document.getElementById('postToHive');
        const originalText = postButton.textContent;
        postButton.disabled = true;
        postButton.textContent = 'Posting with Keychain...';

        try {
            const postData = this.getFormData();
            const { title, body, jsonMetadata, permlink } = this.generatePostContent(postData);

            // Prepare comment options with beneficiaries
            const commentOptions = {
                author: this.currentUser,
                permlink: permlink,
                max_accepted_payout: '1000000.000 HBD',
                percent_hbd: 10000,
                allow_votes: true,
                allow_curation_rewards: true,
                extensions: [[0, {
                    beneficiaries: [{
                        account: 'threespeakselfie',
                        weight: 8000
                    }]
                }]]
            };

            // Use Keychain to post
            window.hive_keychain.requestPost(
                this.currentUser,        // account
                title,                   // title
                body,                    // body
                'hive-115276',          // parent_permlink (community)
                '',                     // parent_account (empty for root post)
                JSON.stringify(jsonMetadata), // json_metadata (must be string!)
                permlink,               // permlink
                JSON.stringify(commentOptions), // comment_options (must be string too!)
                (response) => {
                    if (response.success) {
                        this.showFormSuccess('✅ Successfully posted to Hive!');
                        this.showPostSuccess(response.result);
                        this.resetForm();
                    } else {
                        this.showFormError('Failed to post: ' + (response.message || 'Unknown error'));
                    }
                    
                    postButton.disabled = false;
                    postButton.textContent = originalText;
                }
            );

        } catch (error) {
            this.showFormError('Error preparing post: ' + error.message);
            postButton.disabled = false;
            postButton.textContent = originalText;
        }
    }

    async handleGenerateJSON() {
        if (!this.validateForm()) return;

        const jsonButton = document.getElementById('generateJSON');
        const originalText = jsonButton.textContent;
        jsonButton.disabled = true;
        jsonButton.textContent = 'Generating...';

        try {
            const postData = this.getFormData();
            const { title, body, jsonMetadata, permlink } = this.generatePostContent(postData);
            
            // Generate the complete posting operation JSON
            const postingOperation = {
                operations: [
                    [
                        "comment",
                        {
                            parent_author: "",
                            parent_permlink: "hive-115276",
                            author: this.currentUser,
                            permlink: permlink,
                            title: title,
                            body: body,
                            json_metadata: JSON.stringify(jsonMetadata)
                        }
                    ],
                    [
                        "comment_options",
                        {
                            author: this.currentUser,
                            permlink: permlink,
                            max_accepted_payout: "1000000.000 HBD",
                            percent_hbd: 10000,
                            allow_votes: true,
                            allow_curation_rewards: true,
                            extensions: [[0, {
                                beneficiaries: [{
                                    account: "threespeakselfie",
                                    weight: 8000
                                }]
                            }]]
                        }
                    ]
                ],
                posting_data: {
                    community: "hive-115276",
                    category: "onboarding",
                    title: title,
                    permlink: permlink,
                    tags: jsonMetadata.tags,
                    app: jsonMetadata.app,
                    beneficiaries: [{
                        account: "threespeakselfie",
                        weight: 8000
                    }]
                }
            };

            // Download as JSON file
            this.downloadJSON(postingOperation, `hive-post-${permlink}.json`);
            this.showFormSuccess('✅ JSON file generated and downloaded!');

        } catch (error) {
            this.showFormError('Failed to generate JSON: ' + error.message);
        } finally {
            jsonButton.disabled = false;
            jsonButton.textContent = originalText;
        }
    }

    validateForm() {
        if (!this.uploadedImageUrl) {
            this.showFormError('Please upload a selfie first');
            document.getElementById('selfie').focus();
            return false;
        }

        const intro = document.getElementById('intro').value.trim();
        const onboardedBy = document.getElementById('onboarded-by').value.trim();

        if (!intro || !onboardedBy) {
            this.showFormError('Please fill in all required fields');
            return false;
        }

        return true;
    }

    getFormData() {
        return {
            intro: document.getElementById('intro').value.trim(),
            onboardedBy: document.getElementById('onboarded-by').value.trim(),
            imageUrl: this.uploadedImageUrl
        };
    }

    generatePostContent(data) {
        const title = `I was onboarded to Hive by @${data.onboardedBy}`;
        const body = `![Selfie](${data.imageUrl})\n\n${data.intro}`;
        const permlink = this.generatePermlink(title);
        
        const jsonMetadata = {
            tags: ['introduceyourself', 'checkin'],
            app: 'checkinecuador/1.0.0',
            username: this.currentUser,
            image: [data.imageUrl],
            country: 'Ecuador',
            onboarder: data.onboardedBy,
            introductionText: data.intro,
            communityName: 'hive-115276',
            lightningAddress: `${this.currentUser}@sats.v4v.app`,
            developer: 'menobass'
        };

        return { title, body, jsonMetadata, permlink };
    }

    generatePermlink(title) {
        const basePermlink = title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        
        const timestamp = Date.now();
        return `${basePermlink}-${timestamp}`;
    }

    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    showPostSuccess(result) {
        // You can implement a success dialog here
        console.log('Post successful:', result);
        alert(`Post successfully published!\nTransaction ID: ${result.id}`);
    }

    resetForm() {
        document.getElementById('intro').value = '';
        document.getElementById('onboarded-by').value = '';
        document.getElementById('selfie').value = '';
        document.getElementById('image-preview').innerHTML = '';
        this.uploadedImageUrl = null;
    }

    showFormError(message) {
        // You can implement error display here
        console.error('Form error:', message);
        alert('Error: ' + message);
    }

    showFormSuccess(message) {
        // You can implement success display here
        console.log('Form success:', message);
        alert(message);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new CheckinEcuadorApp();
});
