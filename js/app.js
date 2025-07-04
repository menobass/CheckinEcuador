// Main application logic
class CheckinEcuadorApp {
    constructor() {
        this.currentUser = null;
        this.postingKey = null;
        this.uploadedImageUrl = null;
        this.hiveIntegration = new HiveIntegration();
        this.imageUploadService = new ImageUploadService();
        
        this.initializeEventListeners();
        this.checkLoginState();
    }

    initializeEventListeners() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Post to Hive button
        document.getElementById('postToHive').addEventListener('click', (e) => {
            e.preventDefault();
            this.handlePostToHive();
        });

        // Generate JSON button
        document.getElementById('generateJSON').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleGenerateJSON();
        });

        // Image upload
        document.getElementById('selfie').addEventListener('change', (e) => {
            this.handleImageSelect(e);
        });

        // Logout button
        document.getElementById('logout-button').addEventListener('click', () => {
            this.logout();
        });
    }

    checkLoginState() {
        // Check if user is already logged in (for development purposes)
        const savedUser = localStorage.getItem('hive_username');
        const savedKey = localStorage.getItem('hive_posting_key');
        
        if (savedUser && savedKey) {
            this.currentUser = savedUser;
            this.postingKey = savedKey;
            this.showPostingPage();
        } else {
            this.showLoginPage();
        }
    }

    async handleLogin() {
        const username = document.getElementById('username').value.trim();
        const postingKey = document.getElementById('posting-key').value.trim();

        if (!username || !postingKey) {
            this.showLoginError('Please enter both username and posting key');
            return;
        }

        this.showLoginLoading('Validating credentials...');

        try {
            console.log('Starting validation for username:', username);
            
            // Step 1: Validate username exists
            console.log('Checking if account exists...');
            const accountExists = await this.hiveIntegration.validateAccount(username);
            console.log('Account exists:', accountExists);
            
            if (!accountExists) {
                throw new Error('Hive account not found');
            }

            // Step 2: Validate posting key format
            console.log('Validating posting key format...');
            if (!this.isValidPostingKeyFormat(postingKey)) {
                throw new Error('Invalid posting key format');
            }
            console.log('Posting key format is valid');

            // Step 3: Validate posting key matches account
            console.log('Validating posting key against account...');
            await this.hiveIntegration.validatePostingKey(username, postingKey);
            console.log('Posting key validation complete');

            // Show success message first
            this.showLoginSuccess('✅ Verification completed! Preparing onboarding form...');

            // Store credentials temporarily
            this.currentUser = username;
            this.postingKey = postingKey;
            
            // Store in localStorage temporarily
            localStorage.setItem('hive_username', username);
            localStorage.setItem('hive_posting_key', postingKey);

            // Wait a moment to show success, then transition
            setTimeout(() => {
                console.log('Login successful, switching to posting page');
                this.showPostingPage();
            }, 1500);

        } catch (error) {
            console.error('Login failed:', error);
            this.showLoginError('Login failed: ' + error.message);
        }
    }

    isValidPostingKeyFormat(key) {
        // Basic validation - Hive posting keys are typically 51 characters starting with '5'
        return key.length === 51 && key.startsWith('5');
    }

    async handleImageSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showImageUploadStatus('❌ Please select a valid image file', 'error');
            return;
        }

        // Validate file size using configuration
        const config = window.CONFIG || {};
        const maxSize = config.imgur?.maxFileSize || 10 * 1024 * 1024;
        const maxSizeMB = Math.round(maxSize / (1024 * 1024));
        
        if (file.size > maxSize) {
            this.showImageUploadStatus(`❌ Image size must be less than ${maxSizeMB}MB`, 'error');
            return;
        }

        // Show upload status immediately
        this.showImageUploadStatus('📤 Uploading image...', 'loading');

        // Use EXACTLY the same approach as working admin.html and test
        const IMGUR_CLIENT_ID = '4d83e353ac99be2';
        const formData = new FormData();
        formData.append('image', file);
        
        fetch('https://api.imgur.com/3/image', {
            method: 'POST',
            headers: {
                'Authorization': 'Client-ID ' + IMGUR_CLIENT_ID,
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            },
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success && data.data && data.data.link) {
                // Success - store the URL and update UI
                this.uploadedImageUrl = data.data.link;
                this.showImageUploadStatus('✅ Image uploaded successfully!', 'success');
                console.log('Image URL ready:', this.uploadedImageUrl);
                
                // Show preview (disabled for testing)
                // this.showImagePreview(file);
            } else {
                this.showImageUploadStatus('❌ Upload failed: Invalid response', 'error');
            }
        })
        .catch(error => {
            console.error('Upload failed:', error);
            this.showImageUploadStatus('❌ Upload failed: ' + error.message, 'error');
        });
    }

    showImagePreview(file) {
        const preview = document.getElementById('image-preview');
        const reader = new FileReader();
        
        reader.onload = (e) => {
            preview.innerHTML = `
                <div class="image-preview-container">
                    <img src="${e.target.result}" alt="Selfie preview">
                </div>
            `;
        };
        
        reader.readAsDataURL(file);
    }

    showImageUploadStatus(message, type = 'loading') {
        const preview = document.getElementById('image-preview');
        
        preview.innerHTML = `
            <div class="upload-status">
                <div class="status-${type}">${message}</div>
            </div>
        `;
    }

    // This method is now replaced by handlePostToHive and handleGenerateJSON
    // Kept for backward compatibility if needed

    async handlePostToHive() {
        if (!this.uploadedImageUrl) {
            this.showFormError('Please upload a selfie first');
            document.getElementById('selfie').focus();
            return;
        }

        const intro = document.getElementById('intro').value.trim();
        const onboardedBy = document.getElementById('onboarded-by').value.trim();

        if (!intro || !onboardedBy) {
            this.showFormError('Please fill in all required fields');
            return;
        }

        // Show loading state
        const postButton = document.getElementById('postToHive');
        const originalText = postButton.textContent;
        postButton.disabled = true;
        postButton.textContent = 'Posting to Hive...';

        try {
            // Create post data
            const postData = {
                intro,
                onboardedBy,
                imageUrl: this.uploadedImageUrl
            };

            // Generate post content
            const title = `I was onboarded to Hive by @${postData.onboardedBy}`;
            const body = this.generatePostBody(postData);
            const jsonMetadata = this.generateJsonMetadata(postData);
            
            // Post to Hive
            const result = await this.hiveIntegration.postToHive(
                this.currentUser,
                this.postingKey,
                title,
                body,
                jsonMetadata,
                'hive-115276'
            );

            // Show success and open debug window
            this.showFormSuccess('✅ Successfully posted to Hive!');
            this.openDebugWindow({
                imageUrl: this.uploadedImageUrl,
                postUrl: result.url,
                transactionId: result.transactionId
            });

            // Clear credentials after successful post
            this.clearCredentials();

        } catch (error) {
            postButton.disabled = false;
            postButton.textContent = originalText;
            this.showFormError('Failed to post to Hive: ' + error.message);
        }
    }

    async handleGenerateJSON() {
        if (!this.uploadedImageUrl) {
            this.showFormError('Please upload a selfie first');
            document.getElementById('selfie').focus();
            return;
        }

        const intro = document.getElementById('intro').value.trim();
        const onboardedBy = document.getElementById('onboarded-by').value.trim();

        if (!intro || !onboardedBy) {
            this.showFormError('Please fill in all required fields');
            return;
        }

        // Show loading state
        const jsonButton = document.getElementById('generateJSON');
        const originalText = jsonButton.textContent;
        jsonButton.disabled = true;
        jsonButton.textContent = 'Generating...';

        try {
            await this.createHivePost({
                intro,
                onboardedBy,
                imageUrl: this.uploadedImageUrl
            });

            // Show success and open debug window
            this.showFormSuccess('✅ JSON file generated and downloaded!');
            this.openDebugWindow({
                imageUrl: this.uploadedImageUrl,
                postUrl: null,
                transactionId: null
            });

            // Reset button
            jsonButton.disabled = false;
            jsonButton.textContent = originalText;

        } catch (error) {
            jsonButton.disabled = false;
            jsonButton.textContent = originalText;
            this.showFormError('Failed to generate JSON: ' + error.message);
        }
    }

    openDebugWindow(data) {
        const debugWindow = document.getElementById('debugWindow');
        
        // Populate debug information
        document.getElementById('imageUrlDisplay').textContent = data.imageUrl || 'Not available';
        document.getElementById('postUrlDisplay').textContent = data.postUrl || 'Not posted to Hive';
        document.getElementById('transactionIdDisplay').textContent = data.transactionId || 'Not available';
        
        // Show debug window
        debugWindow.style.display = 'block';
    }

    closeDebugWindow() {
        const debugWindow = document.getElementById('debugWindow');
        debugWindow.style.display = 'none';
    }

    async copyToClipboard(elementId) {
        const element = document.getElementById(elementId);
        const text = element.textContent;
        
        if (text && text !== 'Not available' && text !== 'Not posted to Hive') {
            try {
                await navigator.clipboard.writeText(text);
                
                // Show temporary feedback
                const button = event.target;
                const originalText = button.textContent;
                button.textContent = 'Copied!';
                button.disabled = true;
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.disabled = false;
                }, 2000);
                
            } catch (error) {
                console.error('Failed to copy to clipboard:', error);
            }
        }
    }

    // Update the existing method to remove the form handling
    async handleOnboardingSubmit() {
        // This method is now handled by the individual button handlers
        // Keep for backward compatibility if needed
    }

    async createHivePost(data) {
        // Use the same community as the real app (from the screenshot)
        const hardcodedCommunity = 'hive-115276';
        
        const title = `I was onboarded to Hive by @${data.onboardedBy}`;
        const body = this.generatePostBody(data);
        const jsonMetadata = this.generateJsonMetadata(data);
        const permlink = this.generatePermlink(title);
        
        // Generate the complete posting operation JSON
        const postingOperation = this.generatePostingOperation(title, body, jsonMetadata, permlink, hardcodedCommunity);
        
        // Save as JSON file instead of posting
        await this.savePostAsJSON(postingOperation, permlink);
        
        return Promise.resolve({
            success: true,
            permlink: permlink,
            saved_as_json: true
        });
    }

    generatePostBody(data) {
        return `![Selfie](${data.imageUrl})

${data.intro}`;
    }

    generateJsonMetadata(data) {
        // Generate hardcoded lightning address
        const lightningAddress = `${this.currentUser}@sats.v4v.app`;
        
        return {
            tags: ['introduceyourself', 'checkin'],
            app: 'checkinwithxyz/1.0.0',
            username: this.currentUser,
            image: [data.imageUrl],
            country: 'Ecuador',
            onboarder: data.onboardedBy,
            introductionText: data.intro,
            communityName: 'hive-115276',
            lightningAddress: lightningAddress,
            developer: 'sagarkothari88'
        };
    }

    getCommunityName(communityId) {
        const communities = {
            'hive-120586': 'Ecuador Community',
            'hive-193816': 'Spanish Community'
        };
        return communities[communityId] || 'the Community';
    }

    clearCredentials() {
        // Clear all stored credentials
        localStorage.removeItem('hive_username');
        localStorage.removeItem('hive_posting_key');
        this.currentUser = null;
        this.postingKey = null;
        this.uploadedImageUrl = null;
    }

    logout() {
        this.clearCredentials();
        this.showLoginPage();
        this.clearForms();
    }

    clearForms() {
        const loginForm = document.getElementById('login-form');
        const onboardingForm = document.getElementById('onboarding-form');
        const imagePreview = document.getElementById('image-preview');
        
        if (loginForm) loginForm.reset();
        if (onboardingForm) onboardingForm.reset();
        if (imagePreview) imagePreview.innerHTML = '';
    }

    showLoginPage() {
        document.getElementById('login-page').classList.remove('hidden');
        document.getElementById('posting-page').classList.add('hidden');
    }

    showPostingPage() {
        // Update the username in the banner
        document.getElementById('current-username').textContent = `@${this.currentUser}`;
        
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('posting-page').classList.remove('hidden');
    }

    showFormError(message) {
        this.showFormMessage(message, 'error');
    }

    showFormSuccess(message) {
        this.showFormMessage(message, 'success');
    }

    showFormMessage(message, type) {
        const form = document.getElementById('onboarding-form');
        const existingMessage = document.getElementById('form-message');
        
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.id = 'form-message';
        messageDiv.className = `form-message form-message-${type}`;
        messageDiv.innerHTML = message;
        
        form.insertBefore(messageDiv, form.firstChild);
        
        // Auto-remove after 5 seconds for non-success messages
        if (type !== 'success') {
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 5000);
        }
    }

    showLoginError(message) {
        this.showLoginMessage(message, 'error');
    }

    showLoginLoading(message) {
        this.showLoginMessage(message, 'loading');
    }

    showLoginSuccess(message) {
        this.showLoginMessage(message, 'success');
    }

    showLoginMessage(message, type) {
        const form = document.getElementById('login-form');
        const existingMessage = document.getElementById('login-message');
        
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.id = 'login-message';
        messageDiv.className = `form-message form-message-${type}`;
        messageDiv.innerHTML = message;
        
        form.insertBefore(messageDiv, form.firstChild);
        
        // Auto-remove after 5 seconds for non-loading and non-success messages
        if (type === 'error') {
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 5000);
        }
    }

    generatePermlink(title) {
        // Create permlink from title, similar to how Hive does it
        const timestamp = Date.now();
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 200) + '-' + timestamp;
    }

    generatePostingOperation(title, body, jsonMetadata, permlink, community) {
        return {
            operations: [
                [
                    'comment',
                    {
                        parent_author: '',
                        parent_permlink: community, // Community ID as parent permlink
                        author: this.currentUser,
                        permlink: permlink,
                        title: title,
                        body: body,
                        json_metadata: JSON.stringify(jsonMetadata)
                    }
                ],
                [
                    'comment_options',
                    {
                        author: this.currentUser,
                        permlink: permlink,
                        max_accepted_payout: '1000000.000 HBD',
                        percent_hbd: 10000,
                        allow_votes: true,
                        allow_curation_rewards: true,
                        extensions: [
                            [
                                0,
                                {
                                    beneficiaries: [
                                        {
                                            account: 'threespeakselfie',
                                            weight: 8000
                                        }
                                    ]
                                }
                            ]
                        ]
                    }
                ]
            ],
            posting_data: {
                community: community,
                category: 'onboarding',
                title: title,
                permlink: permlink,
                tags: jsonMetadata.tags,
                app: jsonMetadata.app,
                beneficiaries: [
                    {
                        account: 'threespeakselfie',
                        weight: 8000
                    }
                ]
            }
        };
    }

    async savePostAsJSON(postingOperation, permlink) {
        // Create a downloadable JSON file
        const jsonString = JSON.stringify(postingOperation, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = `hive-post-${this.currentUser}-${permlink.substring(0, 20)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Post operation saved as JSON:', postingOperation);
    }

    // Add method to show detailed debug info during image upload
    async handleImageUploadDebug(file, username, postingKey) {
        console.log('=== Image Upload Debug ===');
        console.log('File:', file.name, file.size, file.type);
        console.log('Username:', username);
        console.log('Posting key length:', postingKey.length);
        
        try {
            // Step 1: Create signature
            console.log('Step 1: Creating signature...');
            const signature = await this.imageUploadService.createImageSignature(file, postingKey);
            console.log('Signature created:', signature);
            
            // Step 2: Upload to Hive
            console.log('Step 2: Uploading to Hive...');
            const imageUrl = await this.imageUploadService.uploadToHiveImageService(file, username, signature);
            console.log('Upload successful:', imageUrl);
            
            return imageUrl;
        } catch (error) {
            console.error('Upload failed:', error);
            throw error;
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CheckinEcuadorApp();
});
