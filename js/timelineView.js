/**
 * TimelineView class
 * Handles rendering and interaction with the chronological timeline
 */
class TimelineView {
    constructor(containerId, detailsCallback) {
        this.container = document.getElementById(containerId);
        this.detailsCallback = detailsCallback;
        this.data = null;
        this.expandedSearches = new Set(); // Track expanded searches
    }

    /**
     * Initialize the timeline view
     */
    initialize() {
        if (!this.container) {
            console.error('Timeline container not found');
            return;
        }
        
        // Clear any existing content
        this.container.innerHTML = '';
    }

    /**
     * Update the timeline with new data
     * @param {Array} data - Timeline events data
     */
    update(data) {
        if (!this.container) this.initialize();
        
        this.data = data;
        this._renderTimeline();
    }
    
    /**
     * Update which searches are expanded
     * @param {Set} expandedSearches - Set of search URLs that should be expanded
     */
    updateExpandedSearches(expandedSearches) {
        this.expandedSearches = expandedSearches;
        this._renderTimeline();
    }

    /**
     * Render the timeline entries
     * @private
     */
    _renderTimeline() {
        if (!this.data || !this.container) return;
        
        // Clear existing content
        this.container.innerHTML = '';
        
        // If no data, show a message
        if (this.data.length === 0) {
            this.container.innerHTML = '<div class="timeline-empty">No timeline data available</div>';
            return;
        }
        
        // Create a wrapper div with a title
        const timelineWrapper = document.createElement('div');
        timelineWrapper.className = 'timeline-wrapper';
        
        // Sort events by timestamp
        const sortedEvents = [...this.data].sort((a, b) => {
            return new Date(a.timestamp) - new Date(b.timestamp);
        });
        
        // Group the events by search and page visit
        // Each search will be a group with its associated page visits
        const eventGroups = this._groupEventsBySearch(sortedEvents);
        
        // Create date groupings with time formatting
        let currentDate = null;
        let currentDateGroup = null;
        
        // Iterate over the event groups
        eventGroups.forEach(group => {
            // Get the date for the first event in the group
            // (which is either a search or an unrelated page visit)
            const firstEvent = group.search || group.pages[0];
            const eventDate = new Date(firstEvent.timestamp);
            const dateStr = eventDate.toLocaleDateString();
            
            // If this is a new date, create a new date group
            if (dateStr !== currentDate) {
                currentDate = dateStr;
                
                // Create date header
                const dateHeader = document.createElement('div');
                dateHeader.className = 'timeline-date-header';
                dateHeader.textContent = dateStr;
                timelineWrapper.appendChild(dateHeader);
                
                // Create new date group
                currentDateGroup = document.createElement('div');
                currentDateGroup.className = 'timeline-date-group';
                timelineWrapper.appendChild(currentDateGroup);
            }
            
            // If this group has a search, create a search section with collapsible pages
            if (group.search) {
                const searchGroup = document.createElement('div');
                searchGroup.className = 'timeline-search-group';
                
                // Create the search entry
                const searchEntry = this._createTimelineEntry(group.search);
                searchEntry.classList.add('collapsible');
                
                // Add expanded/collapsed state
                const isExpanded = this.expandedSearches.has(group.search.url);
                searchEntry.classList.toggle('expanded', isExpanded);
                
                // Add toggle icon
                const toggleIcon = document.createElement('div');
                toggleIcon.className = 'collapse-toggle';
                toggleIcon.innerHTML = isExpanded ? '▼' : '▶';
                searchEntry.insertBefore(toggleIcon, searchEntry.firstChild);
                
                // Add click handler for toggling search expansion
                toggleIcon.addEventListener('click', (e) => {
                    e.stopPropagation(); // Don't trigger the entry click
                    
                    // Get the current expanded state from the DOM
                    const currentlyExpanded = searchEntry.classList.contains('expanded');
                    
                    // Toggle expanded state (opposite of current state)
                    const isNowExpanded = !currentlyExpanded;
                    searchEntry.classList.toggle('expanded', isNowExpanded);
                    toggleIcon.innerHTML = isNowExpanded ? '▼' : '▶';
                    
                    // Update the content pages visibility
                    const pagesContainer = searchGroup.querySelector('.timeline-pages-container');
                    pagesContainer.classList.toggle('hidden', !isNowExpanded);
                    
                    // Update the expanded searches set
                    if (isNowExpanded) {
                        this.expandedSearches.add(group.search.url);
                    } else {
                        this.expandedSearches.delete(group.search.url);
                    }
                });
                
                // Find and remove the details button that was added in _createTimelineEntry
                const existingButtonsContainer = searchEntry.querySelector('.timeline-buttons-container');
                if (existingButtonsContainer) {
                    const detailsButton = existingButtonsContainer.querySelector('.details-button');
                    if (detailsButton) {
                        detailsButton.addEventListener('click', (e) => {
                            e.stopPropagation(); // Don't trigger the entry click (collapse/expand)
                            this.detailsCallback(group.search);
                        });
                    }
                }
                
                // Add the search entry to the search group
                searchGroup.appendChild(searchEntry);
                
                // Create container for pages related to this search
                const pagesContainer = document.createElement('div');
                pagesContainer.className = 'timeline-pages-container';
                pagesContainer.classList.toggle('hidden', !isExpanded);
                
                // Add each page visit related to this search
                group.pages.forEach(page => {
                    const pageEntry = this._createTimelineEntry(page);
                    pageEntry.classList.add('page-entry');
                    pagesContainer.appendChild(pageEntry);
                });
                
                // Add the pages container to the search group
                searchGroup.appendChild(pagesContainer);
                
                // Add the search group to the current date group
                currentDateGroup.appendChild(searchGroup);
            } else {
                // This group just has unrelated pages (not from a search)
                group.pages.forEach(page => {
                    const pageEntry = this._createTimelineEntry(page);
                    currentDateGroup.appendChild(pageEntry);
                });
            }
        });
        
        this.container.appendChild(timelineWrapper);
    }

    /**
     * Create a single timeline entry element
     * @param {Object} event - Event data
     * @returns {HTMLElement} - Timeline entry DOM element
     * @private
     */
    _createTimelineEntry(event) {
        if (!event) return null;
        
        const entry = document.createElement('div');
        entry.className = `timeline-entry ${event.type}`;
        entry.setAttribute('data-timestamp', event.timestamp);
        entry.setAttribute('data-type', event.type);
        
        if (event.url) {
            entry.setAttribute('data-url', event.url);
        }
        
        // Format the timestamp as a readable time
        const time = new Date(event.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit' 
        });
        
        // Create timestamp container (for timestamp and note indicator)
        const timestampContainer = document.createElement('div');
        timestampContainer.className = 'timeline-timestamp-container';
        
        // Create timestamp element
        const timestamp = document.createElement('div');
        timestamp.className = 'timeline-timestamp';
        timestamp.textContent = time;
        timestampContainer.appendChild(timestamp);
        
        // Add note indicator next to timestamp if this is a page visit with notes
        if (event.type === 'pageVisit' && event.notes && event.notes.length > 0) {
            const noteIndicator = document.createElement('div');
            noteIndicator.className = 'note-indicator';
            noteIndicator.innerHTML = `<small>(${event.notes.length} note${event.notes.length > 1 ? 's' : ''})</small>`;
            timestampContainer.appendChild(noteIndicator);
        }
        
        entry.appendChild(timestampContainer);
        
        // Create content container
        const content = document.createElement('div');
        content.className = 'timeline-content';
        
        // Add appropriate content based on event type
        if (event.type === 'search') {
            content.innerHTML = `
                <h4>Search: "${event.query}"</h4>
                <div class="timeline-url">${this._getEngineName(event.engine)}</div>
            `;
            
            // Add notes if available
            if (event.notes && event.notes.length > 0) {
                const notesContainer = document.createElement('div');
                notesContainer.className = 'timeline-notes';
                
                event.notes.forEach(note => {
                    const noteEl = document.createElement('div');
                    noteEl.className = 'timeline-note';
                    noteEl.textContent = note.content;
                    notesContainer.appendChild(noteEl);
                });
                
                content.appendChild(notesContainer);
            }
        } 
        else if (event.type === 'pageVisit') {
            const metadata = event.metadata || {};
            
            // Prioritize metadata.title (more accurate) over event.title, fallback to URL
            const displayTitle = metadata.title || event.title;
            const displayUrl = event.url;
            
            if (displayTitle && displayTitle.trim()) {
                content.innerHTML = `
                    <h4>${displayTitle}</h4>
                `;
            } else {
                content.innerHTML = `
                    <h4>${displayUrl}</h4>
                `;
            }
            
            // Removed "From search" information as it's already visually indicated by the layout
            
            // Notes indicator now moved to the timestamp area
        } 
        else if (event.type === 'note') {
            content.innerHTML = `
                <h4>Note Added</h4>
                <div class="timeline-note-content">${event.content}</div>
                ${event.orphaned ? '<div class="timeline-orphaned">(Standalone note)</div>' : ''}
            `;
        }
        
        entry.appendChild(content);
        
        // Create buttons container
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'timeline-buttons-container';
        
        // Add visit button for searches and page visits
        if (event.url && (event.type === 'search' || event.type === 'pageVisit')) {
            const visitButton = document.createElement('a');
            visitButton.className = 'visit-button';
            visitButton.textContent = event.type === 'search' ? 'Visit Search' : 'Visit Page';
            visitButton.href = event.url;
            visitButton.target = '_blank';
            visitButton.rel = 'noopener noreferrer';
            visitButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Don't trigger any parent click handlers
            });
            buttonContainer.appendChild(visitButton);
        }
        
        // Add details button
        if (event.type === 'search' || event.type === 'pageVisit' || event.type === 'note') {
            const detailsButton = document.createElement('button');
            detailsButton.className = 'details-button';
            detailsButton.textContent = 'Details';
            detailsButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Don't trigger any parent click handlers
                
                // For pageVisit, rename to 'page' for consistency with showNodeDetails expectations
                if (event.type === 'pageVisit') {
                    const pageData = {
                        ...event,
                        type: 'page'
                    };
                    this.detailsCallback(pageData);
                } else {
                    this.detailsCallback(event);
                }
            });
            buttonContainer.appendChild(detailsButton);
        }
        
        // Add cards button directly (only for page visits)
        // It will have an initial "0 Cards" text that can be updated later
        if (event.type === 'pageVisit') {
            const cardsButton = document.createElement('button');
            cardsButton.className = 'view-cards-btn';
            cardsButton.textContent = '0 Cards';
            
            // Store page info in data attributes for later update
            cardsButton.setAttribute('data-url', event.url || '');
            cardsButton.setAttribute('data-title', event.title || '');
            
            // Set disabled initially - will be enabled if matching sections are found
            cardsButton.disabled = true;
            
            buttonContainer.appendChild(cardsButton);
            
            // Add note button for page visits
            const addNoteButton = document.createElement('button');
            addNoteButton.className = 'add-note-btn';
            addNoteButton.textContent = 'Add Note';
            addNoteButton.setAttribute('data-page-url', event.url);
            addNoteButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Don't trigger any parent click handlers
                
                // Call the global showAddNoteModal function
                if (typeof showAddNoteModal === 'function') {
                    showAddNoteModal(event.url);
                }
            });
            
            buttonContainer.appendChild(addNoteButton);
            
            // Add remove button for page visits
            const removeButton = document.createElement('button');
            removeButton.className = 'remove-item-btn';
            removeButton.textContent = 'Remove Item';
            removeButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Don't trigger any parent click handlers
                
                // Remove the timeline entry from the DOM
                entry.remove();
            });
            
            buttonContainer.appendChild(removeButton);
        }
        
        entry.appendChild(buttonContainer);
        
        return entry;
    }

    /**
     * Group events by search and their related page visits
     * @param {Array} events - Timeline events data
     * @returns {Array} - Array of event groups
     * @private
     */
    _groupEventsBySearch(events) {
        const searchMap = new Map(); // Map of search URL to search event
        const searchPages = new Map(); // Map of search URL to array of related page visits
        const unrelatedPages = []; // Pages not related to any search
        
        // First, identify all searches
        events.forEach(event => {
            if (event.type === 'search') {
                searchMap.set(event.url, event);
                searchPages.set(event.url, []);
            }
        });
        
        // Then, associate pages with searches
        events.forEach(event => {
            if (event.type === 'pageVisit') {
                if (event.sourceSearch && event.sourceSearch.url && searchMap.has(event.sourceSearch.url)) {
                    // This page visit is related to a search
                    const pages = searchPages.get(event.sourceSearch.url);
                    pages.push(event);
                } else {
                    // This page visit is not related to any search
                    unrelatedPages.push(event);
                }
            }
        });
        
        // Build the result array
        const result = [];
        
        // Add each search with its pages
        searchMap.forEach((search, url) => {
            const pages = searchPages.get(url) || [];
            result.push({
                search: search,
                pages: pages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            });
        });
        
        // Add unrelated pages, grouped by themselves
        if (unrelatedPages.length > 0) {
            result.push({
                search: null,
                pages: unrelatedPages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            });
        }
        
        // Sort the groups by the timestamp of their first event
        return result.sort((a, b) => {
            const aTime = new Date(a.search ? a.search.timestamp : a.pages[0].timestamp);
            const bTime = new Date(b.search ? b.search.timestamp : b.pages[0].timestamp);
            return aTime - bTime;
        });
    }

    /**
     * Get user-friendly name for search engine
     * @param {string} engineCode - Engine identifier (e.g., "GOOGLE")
     * @returns {string} - User-friendly engine name
     * @private
     */
    _getEngineName(engineCode) {
        const engineMap = {
            'GOOGLE': 'Google Search',
            'GOOGLE_SCHOLAR': 'Google Scholar',
            'BING': 'Bing Search',
            'DUCKDUCKGO': 'DuckDuckGo',
            'GOOGLE_NEWS': 'Google News'
        };
        
        return engineMap[engineCode] || engineCode;
    }
}