/**
 * Main JavaScript for Team Voting System Frontend
 * Handles common functionality across all pages
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

/**
 * Initialize the application
 */
async function initializeApp() {
    try {
        // Load teams for home page if teams list exists
        if (document.getElementById('teams-list')) {
            await loadTeamsForHomePage();
        }

        // Set up global event listeners
        setupGlobalEventListeners();

        // Check authentication status and update navigation
        updateNavigationAuth();

    } catch (error) {
        console.error('Failed to initialize app:', error);
    }
}

/**
 * Load teams for home page preview
 */
async function loadTeamsForHomePage() {
    const teamsContainer = document.getElementById('teams-list');
    
    try {
        const teams = await api.getTeams();
        const votingResults = await api.getVotingResults();
        
        if (teams.length === 0) {
            teamsContainer.innerHTML = `
                <div class="team-card">
                    <div class="team-header">
                        <div class="team-avatar"><i class="fas fa-plus"></i></div>
                        <div class="team-name">No Teams Yet</div>
                    </div>
                    <p style="margin-top: 1rem; color: var(--gray-500);">
                        Teams will appear here once created by administrators.
                    </p>
                </div>
            `;
            return;
        }

        // Show limited number of teams on home page
        const previewTeams = teams.slice(0, 6);
        
        teamsContainer.innerHTML = previewTeams.map(team => {
            const voteData = votingResults.find(v => v.name === team.name);
            const votes = voteData ? voteData.stats.votes : 0;
            
            return `
                <div class="team-card">
                    <div class="team-header">
                        <div class="team-avatar">
                            ${team.avatar ? 
                                `<img src="${team.avatar}" alt="${team.name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : 
                                team.name.charAt(0)
                            }
                        </div>
                        <div class="team-name">${team.name}</div>
                    </div>
                    
                    <div class="team-stats">
                        <div class="stat">
                            <span class="stat-value">${votes}</span>
                            <span class="stat-label">Votes</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value" id="home-team-members-${team.id}">-</span>
                            <span class="stat-label">Members</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Load member counts asynchronously
        previewTeams.forEach(team => {
            loadTeamMembersForHome(team.id);
        });

    } catch (error) {
        console.error('Failed to load teams for home page:', error);
        teamsContainer.innerHTML = `
            <div class="team-card">
                <div class="team-header">
                    <div class="team-avatar"><i class="fas fa-exclamation-triangle"></i></div>
                    <div class="team-name">Failed to Load</div>
                </div>
                <p style="margin-top: 1rem; color: var(--danger-color);">
                    Unable to load teams. Please check your connection.
                </p>
            </div>
        `;
    }
}

/**
 * Load team member count for home page
 */
async function loadTeamMembersForHome(teamId) {
    try {
        const teamData = await api.getTeamMembers(teamId);
        const memberCount = teamData.members ? teamData.members.length : 0;
        
        const element = document.getElementById(`home-team-members-${teamId}`);
        if (element) {
            element.textContent = memberCount;
        }
    } catch (error) {
        // Silent fail for member count - not critical for home page
        const element = document.getElementById(`home-team-members-${teamId}`);
        if (element) {
            element.textContent = '0';
        }
    }
}

/**
 * Set up global event listeners
 */
function setupGlobalEventListeners() {
    // Handle mobile navigation if implemented
    setupMobileNavigation();
    
    // Handle keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Handle page visibility changes for real-time updates
    setupVisibilityHandling();
}

/**
 * Setup mobile navigation
 */
function setupMobileNavigation() {
    // Add mobile menu toggle if needed in the future
    const navbar = document.querySelector('.navbar');
    
    // Add scroll effect to navbar
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K for quick navigation search (future feature)
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            // Implement quick search/navigation
        }
        
        // Escape key to close modals
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

/**
 * Setup page visibility handling for real-time updates
 */
function setupVisibilityHandling() {
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            // Page became visible, refresh data if needed
            refreshPageData();
        }
    });
}

/**
 * Update navigation based on authentication status
 */
async function updateNavigationAuth() {
    try {
        const isAuth = await api.isAuthenticated();
        const navLinks = document.querySelectorAll('.nav-link');
        
        // You could add authentication status indicators here
        // For now, all links are always visible as per the current design
        
    } catch (error) {
        // Handle authentication check error silently
    }
}

/**
 * Refresh page data when page becomes visible again
 */
function refreshPageData() {
    const currentPage = getCurrentPage();
    
    switch (currentPage) {
        case 'index':
            if (document.getElementById('teams-list')) {
                loadTeamsForHomePage();
            }
            break;
        case 'results':
            if (typeof loadResults === 'function') {
                loadResults();
            }
            break;
        case 'vote':
            if (typeof loadTeams === 'function') {
                loadTeams();
            }
            break;
    }
}

/**
 * Get current page identifier
 */
function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    return filename.replace('.html', '');
}

/**
 * Close all open modals
 */
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.add('hidden');
    });
}

/**
 * Utility function to show notifications/alerts
 */
function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles for notifications
    if (!document.getElementById('notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 1rem;
                right: 1rem;
                z-index: 1000;
                min-width: 300px;
                padding: 1rem;
                border-radius: var(--border-radius);
                box-shadow: var(--shadow-lg);
                animation: slideInRight 0.3s ease;
            }
            
            .notification-info {
                background-color: var(--gray-50);
                border-left: 4px solid var(--primary-color);
                color: var(--gray-800);
            }
            
            .notification-success {
                background-color: #dcfce7;
                border-left: 4px solid var(--success-color);
                color: #166534;
            }
            
            .notification-warning {
                background-color: #fffbeb;
                border-left: 4px solid var(--warning-color);
                color: #92400e;
            }
            
            .notification-error {
                background-color: #fef2f2;
                border-left: 4px solid var(--danger-color);
                color: #991b1b;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                margin-left: auto;
                opacity: 0.7;
                transition: opacity 0.2s;
            }
            
            .notification-close:hover {
                opacity: 1;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove notification after duration
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, duration);
}

/**
 * Get appropriate icon for notification type
 */
function getNotificationIcon(type) {
    const icons = {
        info: 'info-circle',
        success: 'check-circle',
        warning: 'exclamation-triangle',
        error: 'exclamation-circle'
    };
    return icons[type] || 'info-circle';
}

/**
 * Format date/time for display
 */
function formatDateTime(dateString, options = {}) {
    const date = new Date(dateString);
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
}

/**
 * Debounce function for search/input handling
 */
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Throttle function for scroll/resize handling
 */
function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Copied to clipboard!', 'success');
        return true;
    } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            showNotification('Copied to clipboard!', 'success');
            return true;
        } catch (err) {
            showNotification('Failed to copy to clipboard', 'error');
            return false;
        } finally {
            document.body.removeChild(textArea);
        }
    }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate URL format
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Generate random string (useful for tokens, IDs, etc.)
 */
function generateRandomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Format number with commas
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Calculate percentage
 */
function calculatePercentage(value, total, decimals = 1) {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(decimals);
}

// Export utilities for global use
window.VotingUtils = {
    showNotification,
    formatDateTime,
    debounce,
    throttle,
    copyToClipboard,
    isValidEmail,
    isValidUrl,
    generateRandomString,
    formatNumber,
    calculatePercentage
};