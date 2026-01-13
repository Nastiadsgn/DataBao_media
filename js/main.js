// AI Agent Chat Functionality
document.addEventListener('DOMContentLoaded', function() {
    initAgentChat();
    initNewsFilters();
    initTickerClose();
});

function initTickerClose() {
    const ticker = document.querySelector('.breaking-ticker');
    const closeBtn = document.querySelector('.ticker-close');
    
    if (!ticker || !closeBtn) return;
    
    closeBtn.addEventListener('click', function() {
        ticker.style.display = 'none';
    });
}

function initAgentChat() {
    const trigger = document.getElementById('agent-trigger');
    const expanded = document.getElementById('agent-expanded');
    const expandedChat = document.getElementById('agent-expanded-chat');
    const suggestions = document.getElementById('agent-suggestions');
    const expandedInput = document.getElementById('agent-expanded-input');
    const expandedSend = document.getElementById('agent-expanded-send');
    const expandButton = document.querySelector('.agent-expanded-expand');
    const closeButton = document.querySelector('.agent-expanded-close');
    const chatTabsContainer = document.querySelector('.agent-chat-tabs-scroll');
    const newChatButton = document.getElementById('agent-new-chat');

    if (!trigger || !expanded) return;

    // Chat tabs state
    let chatSessions = {};
    let activeTabId = '1';
    let tabCounter = 1;

    // State persistence keys
    const STORAGE_KEY = 'agentChatState';
    const TABS_STORAGE_KEY = 'agentChatTabs';

    // Save state to localStorage
    function saveState() {
        const state = {
            isActive: expanded.classList.contains('active'),
            isDocked: expanded.classList.contains('docked'),
            messages: expandedChat ? expandedChat.innerHTML : '',
            hasMessages: expandedChat ? expandedChat.classList.contains('has-messages') : false,
            suggestionsHidden: suggestions ? suggestions.classList.contains('hidden') : false,
            inputValue: expandedInput ? expandedInput.value : ''
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        
        // Also save tabs state
        if (typeof saveTabsState === 'function') {
            saveTabsState();
        }
    }

    // Save state before page unload (navigation)
    window.addEventListener('beforeunload', saveState);

    // Restore state from localStorage
    function restoreState() {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (!savedState) return;

        try {
            const state = JSON.parse(savedState);
            
            if (state.isActive) {
                trigger.classList.add('hidden');
                expanded.classList.add('active');
                backdrop.classList.add('active');
                
                if (state.isDocked) {
                    expanded.classList.add('docked');
                    document.body.classList.add('agent-docked');
                }
                
                if (state.hasMessages && expandedChat) {
                    expandedChat.classList.add('has-messages');
                    // Remove any typing indicators from saved state
                    const cleanMessages = state.messages.replace(/<div class="agent-chat-message agent-chat-typing-container">[\s\S]*?<\/div>\s*<\/div>/g, '');
                    expandedChat.innerHTML = cleanMessages;
                }
                
                if (state.suggestionsHidden && suggestions) {
                    suggestions.classList.add('hidden');
                }

                // Restore input value
                if (state.inputValue && expandedInput) {
                    expandedInput.value = state.inputValue;
                    if (expandedSend && state.inputValue.trim()) {
                        expandedSend.classList.add('has-content');
                    }
                }
            }
        } catch (e) {
            console.error('Error restoring agent state:', e);
        }
    }

    // Create backdrop for closing
    let backdrop = document.getElementById('agent-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'agent-backdrop';
        backdrop.className = 'agent-backdrop';
        document.body.appendChild(backdrop);
        
        // Add backdrop styles
        const style = document.createElement('style');
        style.textContent = `
            .agent-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: transparent;
                z-index: 999;
                opacity: 0;
                visibility: hidden;
                pointer-events: none;
                transition: all 0.25s ease;
            }
            .agent-backdrop.active {
                opacity: 1;
                visibility: visible;
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }

    // Restore state on page load
    restoreState();

    // Open expanded chat
    trigger.addEventListener('click', function() {
        trigger.classList.add('hidden');
        expanded.classList.add('active');
        backdrop.classList.add('active');
        if (expandedInput) {
            expandedInput.focus();
        }
        saveState();
    });

    // Toggle docked sidebar mode on expand button click
    if (expandButton) {
        expandButton.addEventListener('click', function() {
            expanded.classList.toggle('docked');
            document.body.classList.toggle('agent-docked');
            saveState();
        });
    }

    // Close agent on close button click
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            closeAgent();
        });
    }

    function closeAgent() {
        // Save current state before closing
        saveState();
        
        trigger.classList.remove('hidden');
        expanded.classList.remove('active');
        expanded.classList.remove('docked');
        backdrop.classList.remove('active');
        document.body.classList.remove('agent-docked');
        
        // Note: We do NOT reset chat state or clear localStorage
        // This preserves chat history for next time the user opens the agent
    }
    
    // Separate function to clear all chat history if needed
    function clearAllHistory() {
        // Reset chat state
        if (expandedChat) {
            expandedChat.classList.remove('has-messages');
            expandedChat.innerHTML = '';
        }
        if (suggestions) {
            suggestions.classList.remove('hidden');
        }
        if (expandedInput) {
            expandedInput.value = '';
        }
        
        // Reset tabs to initial state
        chatSessions = {};
        chatSessions['1'] = {
            id: '1',
            title: 'New chat',
            messages: '',
            hasMessages: false,
            suggestionsHidden: false,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
        activeTabId = '1';
        tabCounter = 1;
        if (chatTabsContainer) {
            renderTabs();
        }
        
        // Clear saved state
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TABS_STORAGE_KEY);
    }
    
    // Expose clearAllHistory globally for external access if needed
    window.clearAgentChatHistory = clearAllHistory;

    // Handle suggestion clicks
    const suggestionButtons = document.querySelectorAll('.agent-suggestion');
    suggestionButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const prompt = this.getAttribute('data-prompt');
            if (prompt && expandedInput) {
                expandedInput.value = prompt;
                expandedInput.focus();
                handleSendMessage();
            }
        });
    });

    // Handle send button
    if (expandedSend) {
        expandedSend.addEventListener('click', handleSendMessage);
    }

    // Handle Enter key in input
    if (expandedInput) {
        expandedInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });

        // Update send button state
        expandedInput.addEventListener('input', function() {
            if (expandedSend) {
                if (this.value.trim()) {
                    expandedSend.classList.add('has-content');
                } else {
                    expandedSend.classList.remove('has-content');
                }
            }
        });
    }

    function handleSendMessage() {
        if (!expandedInput || !expandedInput.value.trim()) return;

        const message = expandedInput.value.trim();
        expandedInput.value = '';
        if (expandedSend) expandedSend.classList.remove('has-content');

        // Hide suggestions, show chat
        if (suggestions) suggestions.classList.add('hidden');
        if (expandedChat) expandedChat.classList.add('has-messages');

        // Add user message
        addChatMessage(message, true);

        // Simulate AI response
        setTimeout(() => {
            showTypingIndicator();
            setTimeout(() => {
                removeTypingIndicator();
                addChatMessage(generateAIResponse(message), false);
                saveState(); // Save after AI response
            }, 1500);
        }, 300);
    }

    function addChatMessage(text, isUser) {
        if (!expandedChat) return;

        const aiIconPath = 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z';
        
        const messageHTML = `
            <div class="agent-chat-message ${isUser ? 'user' : ''}">
                ${!isUser ? `
                <div class="agent-chat-message-avatar">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="${aiIconPath}"/>
                    </svg>
                </div>
                ` : ''}
                <div class="agent-chat-message-content">
                    <p>${text}</p>
                </div>
            </div>
        `;
        
        expandedChat.insertAdjacentHTML('beforeend', messageHTML);
        expandedChat.scrollTop = expandedChat.scrollHeight;
        
        // Save state after adding message
        saveState();
    }

    function showTypingIndicator() {
        if (!expandedChat) return;

        const aiIconPath = 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z';
        
        const typingHTML = `
            <div class="agent-chat-message agent-chat-typing-container">
                <div class="agent-chat-message-avatar">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="${aiIconPath}"/>
                    </svg>
                </div>
                <div class="agent-chat-message-content">
                    <div class="agent-chat-typing">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;
        
        expandedChat.insertAdjacentHTML('beforeend', typingHTML);
        expandedChat.scrollTop = expandedChat.scrollHeight;
    }

    function removeTypingIndicator() {
        if (!expandedChat) return;
        const typing = expandedChat.querySelector('.agent-chat-typing-container');
        if (typing) typing.remove();
    }

    function generateAIResponse(message) {
        const responses = [
            "Based on my analysis of the available data, here's what I found regarding your query about " + message.toLowerCase().substring(0, 30) + "...",
            "I've reviewed the relevant information. The key insights are that market conditions continue to evolve positively.",
            "Looking at the data, there are several important factors to consider. Revenue growth has been steady at 12% YoY.",
            "According to recent reports, the company has shown strong performance in key metrics across all regions.",
            "The analysis indicates positive trends in the areas you mentioned. Let me break this down further for you."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // ============================================
    // Chat Tabs Management
    // ============================================

    function initChatTabs() {
        // Load saved tabs state
        const savedTabs = localStorage.getItem(TABS_STORAGE_KEY);
        if (savedTabs) {
            try {
                const parsed = JSON.parse(savedTabs);
                chatSessions = parsed.sessions || {};
                activeTabId = parsed.activeTabId || '1';
                tabCounter = parsed.tabCounter || 1;
                renderTabs();
                switchToTab(activeTabId);
            } catch (e) {
                console.error('Error loading tabs:', e);
                initDefaultTab();
            }
        } else {
            initDefaultTab();
        }
    }

    function initDefaultTab() {
        chatSessions['1'] = {
            id: '1',
            title: 'New chat',
            messages: '',
            hasMessages: false,
            suggestionsHidden: false,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
        activeTabId = '1';
        tabCounter = 1;
    }

    function saveTabsState() {
        // Save current tab's content before saving
        if (activeTabId && chatSessions[activeTabId]) {
            chatSessions[activeTabId].messages = expandedChat ? expandedChat.innerHTML : '';
            chatSessions[activeTabId].hasMessages = expandedChat ? expandedChat.classList.contains('has-messages') : false;
            chatSessions[activeTabId].suggestionsHidden = suggestions ? suggestions.classList.contains('hidden') : false;
            chatSessions[activeTabId].lastUpdated = new Date().toISOString();
        }
        
        const state = {
            sessions: chatSessions,
            activeTabId: activeTabId,
            tabCounter: tabCounter
        };
        localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(state));
    }

    function renderTabs() {
        if (!chatTabsContainer) return;
        
        chatTabsContainer.innerHTML = '';
        
        Object.values(chatSessions).forEach(session => {
            const tab = document.createElement('div');
            tab.className = `agent-chat-tab${session.id === activeTabId ? ' active' : ''}`;
            tab.dataset.tabId = session.id;
            
            tab.innerHTML = `
                <span class="agent-chat-tab-title">${session.title}</span>
                <button class="agent-chat-tab-close" aria-label="Close tab">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            `;
            
            // Tab click handler
            tab.addEventListener('click', (e) => {
                if (!e.target.closest('.agent-chat-tab-close')) {
                    switchToTab(session.id);
                }
            });
            
            // Close button handler
            const closeBtn = tab.querySelector('.agent-chat-tab-close');
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeTab(session.id);
            });
            
            chatTabsContainer.appendChild(tab);
        });
    }

    function switchToTab(tabId) {
        if (!chatSessions[tabId]) return;
        
        // Save current tab's state
        if (activeTabId && chatSessions[activeTabId]) {
            chatSessions[activeTabId].messages = expandedChat ? expandedChat.innerHTML : '';
            chatSessions[activeTabId].hasMessages = expandedChat ? expandedChat.classList.contains('has-messages') : false;
            chatSessions[activeTabId].suggestionsHidden = suggestions ? suggestions.classList.contains('hidden') : false;
        }
        
        activeTabId = tabId;
        const session = chatSessions[tabId];
        
        // Update tab UI
        document.querySelectorAll('.agent-chat-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tabId === tabId);
        });
        
        // Restore tab content
        if (expandedChat) {
            expandedChat.innerHTML = session.messages || '';
            expandedChat.classList.toggle('has-messages', session.hasMessages);
        }
        if (suggestions) {
            suggestions.classList.toggle('hidden', session.suggestionsHidden);
        }
        if (expandedInput) {
            expandedInput.value = '';
            expandedInput.focus();
        }
        
        saveTabsState();
    }

    function createNewChat() {
        // Save current tab first
        if (activeTabId && chatSessions[activeTabId]) {
            chatSessions[activeTabId].messages = expandedChat ? expandedChat.innerHTML : '';
            chatSessions[activeTabId].hasMessages = expandedChat ? expandedChat.classList.contains('has-messages') : false;
            chatSessions[activeTabId].suggestionsHidden = suggestions ? suggestions.classList.contains('hidden') : false;
            chatSessions[activeTabId].lastUpdated = new Date().toISOString();
        }
        
        tabCounter++;
        const newId = String(tabCounter);
        
        chatSessions[newId] = {
            id: newId,
            title: 'New chat',
            messages: '',
            hasMessages: false,
            suggestionsHidden: false,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
        
        renderTabs();
        switchToTab(newId);
    }

    function closeTab(tabId) {
        const tabIds = Object.keys(chatSessions);
        
        // Don't close the last tab
        if (tabIds.length <= 1) return;
        
        delete chatSessions[tabId];
        
        // If closing active tab, switch to another
        if (tabId === activeTabId) {
            const remainingIds = Object.keys(chatSessions);
            activeTabId = remainingIds[remainingIds.length - 1];
        }
        
        renderTabs();
        switchToTab(activeTabId);
    }

    function updateTabTitle(message) {
        if (!activeTabId || !chatSessions[activeTabId]) return;
        
        // Only update if it's still "New chat"
        if (chatSessions[activeTabId].title === 'New chat') {
            // Truncate message for tab title
            const title = message.length > 20 ? message.substring(0, 20) + '...' : message;
            chatSessions[activeTabId].title = title;
            renderTabs();
        }
    }

    // New chat button handler
    if (newChatButton) {
        newChatButton.addEventListener('click', createNewChat);
    }

    // Initialize tabs
    initChatTabs();

    // Update the original handleSendMessage to update tab title
    const originalHandleSendMessage = handleSendMessage;
    handleSendMessage = function() {
        const message = expandedInput ? expandedInput.value.trim() : '';
        if (message) {
            updateTabTitle(message);
        }
        originalHandleSendMessage();
    };
}

function initNewsFilters() {
    const filterButtons = document.querySelectorAll('.news-filter');
    const newsCards = document.querySelectorAll('.news-grid .story-card[data-category]');
    
    if (!filterButtons.length || !newsCards.length) return;

    // Add styles for filtering animation
    const style = document.createElement('style');
    style.textContent = `
        .news-filter {
            background: unset;
            background-color: var(--color-white);
            border: none;
            padding: var(--space-2) var(--space-3);
            font-size: var(--text-sm);
            font-weight: var(--weight-medium);
            color: var(--color-ink-500);
            cursor: pointer;
            border-radius: var(--radius-md);
            transition: all var(--duration-fast) var(--ease-default);
        }
        .news-filter:hover {
            color: var(--color-ink-700);
            background: var(--color-paper-100);
        }
        .news-filter.active {
            color: var(--color-primary-700);
            background: var(--color-white);
        }
        .news-grid .story-card {
            transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .news-grid .story-card.filtered-out {
            opacity: 0;
            transform: scale(0.95);
            position: absolute;
            pointer-events: none;
            visibility: hidden;
        }
        .news-grid {
            position: relative;
        }
    `;
    document.head.appendChild(style);

    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const filter = this.getAttribute('data-filter');

            // Filter cards
            newsCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.classList.remove('filtered-out');
                } else {
                    card.classList.add('filtered-out');
                }
            });
        });
    });
}
