class IPLookupApp {
    constructor() {
        this.elements = {
            ipInput: document.getElementById('ipInput'),
            searchBtn: document.getElementById('searchBtn'),
            getCurrentIpBtn: document.getElementById('getCurrentIpBtn'),
            results: document.getElementById('results'),
            resultsContent: document.getElementById('resultsContent'),
            error: document.getElementById('error')
        };
        
        this.steamCacheData = {
            v4: [],
            v6: []
        };
        this.communitiesTranslation = {};
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupEnterKey();
        this.setupRealTimeValidation();
        this.loadSteamCacheData();
    }
    
    bindEvents() {
        this.elements.searchBtn.addEventListener('click', () => this.searchIP());
        this.elements.getCurrentIpBtn.addEventListener('click', () => this.getCurrentIP());
    }
    
    setupEnterKey() {
        this.elements.ipInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchIP();
            }
        });
    }
    
    setupRealTimeValidation() {
        this.elements.ipInput.addEventListener('input', (e) => {
            const ip = e.target.value.trim();
            this.validateIPInput(ip);
        });
        
        this.elements.ipInput.addEventListener('blur', (e) => {
            const ip = e.target.value.trim();
            if (ip && !this.isValidIP(ip)) {
                this.showInputError('請輸入有效的 IPv4 或 IPv6 地址');
            } else {
                this.hideInputError();
            }
        });
    }
    
    validateIPInput(ip) {
        if (!ip) {
            this.hideInputError();
            this.elements.ipInput.classList.remove('valid', 'invalid');
            return;
        }
        
        if (this.isValidIP(ip)) {
            this.elements.ipInput.classList.remove('invalid');
            this.elements.ipInput.classList.add('valid');
            this.hideInputError();
        } else {
            this.elements.ipInput.classList.remove('valid');
            this.elements.ipInput.classList.add('invalid');
        }
    }
    
    showInputError(message) {
        let errorElement = this.elements.ipInput.parentNode.querySelector('.input-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'input-error';
            this.elements.ipInput.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    hideInputError() {
        const errorElement = this.elements.ipInput.parentNode.querySelector('.input-error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }
    
    async loadSteamCacheData() {
        try {
            console.log('Loading Steam cache data...');
            
            // Load IPv4 data
            const v4Response = await fetch('data/steam-cache-v4.json');
            if (v4Response.ok) {
                this.steamCacheData.v4 = await v4Response.json();
                console.log(`Loaded ${this.steamCacheData.v4.length} IPv4 entries`);
            }
            
            // Load IPv6 data
            const v6Response = await fetch('data/steam-cache-v6.json');
            if (v6Response.ok) {
                this.steamCacheData.v6 = await v6Response.json();
                console.log(`Loaded ${this.steamCacheData.v6.length} IPv6 entries`);
            }
            
            // Load communities translation
            const communitiesResponse = await fetch('data/communities.json');
            if (communitiesResponse.ok) {
                const communitiesData = await communitiesResponse.json();
                this.communitiesTranslation = {};
                communitiesData.forEach(item => {
                    this.communitiesTranslation[item.community] = item.description;
                });
                console.log(`Loaded ${Object.keys(this.communitiesTranslation).length} community translations`);
            }
            
            console.log('Steam cache data loaded successfully');
        } catch (error) {
            console.error('Error loading Steam cache data:', error);
        }
    }
    
    isIPInSteamCache(ip) {
        // Determine if it's IPv4 or IPv6
        const isIPv6 = ip.includes(':');
        const cacheData = isIPv6 ? this.steamCacheData.v6 : this.steamCacheData.v4;
        
        let bestMatch = null;
        let longestPrefix = -1;
        
        // Check if IP is in any of the prefixes and find the longest match
        for (const entry of cacheData) {
            if (this.ipInPrefix(ip, entry.prefix)) {
                const prefixLength = parseInt(entry.prefix.split('/')[1]);
                if (prefixLength > longestPrefix) {
                    longestPrefix = prefixLength;
                    bestMatch = entry;
                }
            }
        }
        
        return bestMatch;
    }
    
    ipInPrefix(ip, prefix) {
        // Simple prefix matching - for production use, consider using a proper IP library
        const [prefixIP, prefixLength] = prefix.split('/');
        const prefixLengthNum = parseInt(prefixLength);
        
        if (ip.includes(':')) {
            // IPv6 - simplified check
            return ip.startsWith(prefixIP.replace(/::.*$/, ''));
        } else {
            // IPv4 - simplified check
            const ipParts = ip.split('.').map(Number);
            const prefixParts = prefixIP.split('.').map(Number);
            
            // Check if IP matches the prefix
            for (let i = 0; i < Math.floor(prefixLengthNum / 8); i++) {
                if (ipParts[i] !== prefixParts[i]) {
                    return false;
                }
            }
            
            // Check the remaining bits
            const remainingBits = prefixLengthNum % 8;
            if (remainingBits > 0) {
                const mask = (0xFF << (8 - remainingBits)) & 0xFF;
                return (ipParts[Math.floor(prefixLengthNum / 8)] & mask) === (prefixParts[Math.floor(prefixLengthNum / 8)] & mask);
            }
            
            return true;
        }
    }
    
    formatCommunities(communities) {
        if (!communities || communities.length === 0) {
            return 'N/A';
        }
        else if (communities.length === 1) {
            return '自有網段';
        }
        
        return communities.map(community => {
            const translation = this.communitiesTranslation[community];
            if (translation) {
                return `${community} (${translation})`;
            } else {
                return community;
            }
        }).join(', ');
    }
    
    async getCurrentIP() {
        this.setLoading(true, this.elements.getCurrentIpBtn);
        this.hideError();
        
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            
            this.elements.ipInput.value = data.ip;
            this.searchIP();
        } catch (error) {
            this.showError('Failed to get current IP address. Please try again.');
            console.error('Error getting current IP:', error);
        } finally {
            this.setLoading(false, this.elements.getCurrentIpBtn);
        }
    }
    
    async searchIP() {
        const ip = this.elements.ipInput.value.trim();
        
        if (!ip) {
            this.showError('請輸入 IP 地址');
            return;
        }
        
        if (!this.isValidIP(ip)) {
            this.showError('請輸入有效的 IPv4 或 IPv6 地址');
            return;
        }
        
        this.setLoading(true, this.elements.searchBtn);
        this.hideError();
        
        try {
            // First check if IP is in Steam cache
            const steamCacheEntry = this.isIPInSteamCache(ip);
            
            // Get geolocation data
            const response = await fetch(`https://ipapi.co/${ip}/json/`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const geoData = await response.json();
            
            if (geoData.error) {
                throw new Error(geoData.reason || 'Invalid IP address');
            }
            
            // Combine Steam cache data with geolocation data
            this.displayResults(geoData, steamCacheEntry);
        } catch (error) {
            this.showError('Failed to get IP information. Please try again.');
            console.error('Error searching IP:', error);
        } finally {
            this.setLoading(false, this.elements.searchBtn);
        }
    }
    
    isValidIP(ip) {
        // Comprehensive IPv4 validation
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        
        // Comprehensive IPv6 validation (handles various formats)
        const ipv6Regex = /^(?:(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?:(?::[0-9a-fA-F]{1,4}){1,6})|:(?:(?::[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(?::[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(?:ffff(?::0{1,4}){0,1}:){0,1}(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])|(?:[0-9a-fA-F]{1,4}:){1,4}:(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
        
        return ipv4Regex.test(ip) || ipv6Regex.test(ip);
    }
    
    displayResults(geoData, steamCacheEntry) {
        let resultsHTML = `
            <div class="info-item">
                <span class="info-label">IP 地址</span>
                <span class="info-value">${geoData.ip || 'N/A'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">國家</span>
                <span class="info-value">${geoData.country_name || 'N/A'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">網路服務商</span>
                <span class="info-value">${geoData.org || 'N/A'}</span>
            </div>
        `;
        
        // Add Steam cache information if available
        if (steamCacheEntry) {
            resultsHTML += `
                <div class="info-item steam-cache-info">
                    <span class="info-label">Steam Cache 狀態</span>
                    <span class="info-value steam-cache-yes">✅ 在服務範圍內</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Steam Cache 網段</span>
                    <span class="info-value">${steamCacheEntry.prefix}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">AS 路徑</span>
                    <span class="info-value">${steamCacheEntry.aspath || 'N/A'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">BGP 社群資訊</span>
                    <span class="info-value">${this.formatCommunities(steamCacheEntry.communities)}</span>
                </div>
            `;
        } else {
            resultsHTML += `
                <div class="info-item steam-cache-info">
                    <span class="info-label">Steam Cache 狀態</span>
                    <span class="info-value steam-cache-no">❌ 不在服務範圍內</span>
                </div>
            `;
        }
        
        this.elements.resultsContent.innerHTML = resultsHTML;
        this.elements.results.style.display = 'block';
        
        // Scroll to results
        this.elements.results.scrollIntoView({ behavior: 'smooth' });
    }
    
    setLoading(isLoading, button) {
        const btnText = button.querySelector('.btn-text');
        const spinner = button.querySelector('.loading-spinner');
        
        if (isLoading) {
            button.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (spinner) spinner.style.display = 'block';
        } else {
            button.disabled = false;
            if (btnText) btnText.style.display = 'block';
            if (spinner) spinner.style.display = 'none';
        }
    }
    
    showError(message) {
        this.elements.error.textContent = message;
        this.elements.error.style.display = 'block';
    }
    
    hideError() {
        this.elements.error.style.display = 'none';
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new IPLookupApp();
}); 