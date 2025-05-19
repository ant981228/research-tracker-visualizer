/**
 * DataProcessor class
 * Handles parsing, processing, and transforming research session data
 */
class DataProcessor {
    constructor() {
        this.rawData = null;
        this.graphData = null;
        this.timelineData = null;
    }

    /**
     * Parse research data from JSON string or file
     * @param {string|File} data - JSON string or File object
     * @returns {Promise} Promise that resolves with processed data
     */
    async parseData(data) {
        try {
            // If data is a File object, read it
            if (data instanceof File) {
                const fileContents = await this._readFile(data);
                this.rawData = JSON.parse(fileContents);
            } 
            // If data is a string, parse it directly
            else if (typeof data === 'string') {
                this.rawData = JSON.parse(data);
            }
            // If data is already an object (e.g. from fetch)
            else if (typeof data === 'object') {
                this.rawData = data;
            }
            else {
                throw new Error('Invalid data format');
            }

            // Process the data
            this._processData();
            return {
                raw: this.rawData,
                graph: this.graphData,
                timeline: this.timelineData
            };
        } catch (error) {
            console.error('Error parsing research data:', error);
            throw error;
        }
    }

    /**
     * Read file contents as text
     * @param {File} file - File object to read
     * @returns {Promise<string>} Promise with file contents
     */
    async _readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => resolve(event.target.result);
            reader.onerror = (error) => reject(error);
            reader.readAsText(file);
        });
    }

    /**
     * Process raw data into formats needed for visualization
     * @private
     */
    _processData() {
        if (!this.rawData) {
            throw new Error('No data to process');
        }

        // Create graph data structure (nodes and links)
        this._createGraphData();
        
        // Create timeline data structure
        this._createTimelineData();
    }

    /**
     * Create graph data structure (nodes and links)
     * @private
     */
    _createGraphData() {
        console.log("Creating graph data from:", this.rawData);
        const nodes = [];
        const links = [];
        const nodeMap = new Map(); // Map to track nodes by URL
        
        // Add searches as nodes
        if (this.rawData.searches && this.rawData.searches.length) {
            this.rawData.searches.forEach(search => {
                const nodeId = `search-${this._safeUrl(search.url)}`;
                const node = {
                    id: nodeId,
                    url: search.url,
                    type: 'search',
                    label: search.query,
                    engine: search.engine,
                    query: search.query,
                    timestamp: search.timestamp,
                    hasNotes: search.notes && search.notes.length > 0,
                    notes: search.notes || [],
                    params: search.params || {},
                    // Add display properties for force graph
                    val: 5, // Base node size
                    color: '#3498db' // Blue for search nodes
                };
                
                nodes.push(node);
                nodeMap.set(search.url, nodeId);
            });
        }
        
        // Add pages as nodes and create links from searches
        if (this.rawData.contentPages && this.rawData.contentPages.length) {
            this.rawData.contentPages.forEach(page => {
                const nodeId = `page-${this._safeUrl(page.url)}`;
                let metadata = page.metadata || {};
                
                const node = {
                    id: nodeId,
                    url: page.url,
                    type: 'page',
                    label: page.title || metadata.title || this._extractDomain(page.url),
                    title: page.title || metadata.title,
                    timestamp: page.timestamp,
                    hasNotes: page.notes && page.notes.length > 0,
                    notes: page.notes || [],
                    metadata: metadata,
                    // Add display properties for force graph
                    val: 4, // Base node size
                    color: '#2ecc71' // Green for page nodes
                };
                
                nodes.push(node);
                nodeMap.set(page.url, nodeId);
                
                // Create link from source search if it exists
                if (page.sourceSearch && page.sourceSearch.url) {
                    const sourceId = nodeMap.get(page.sourceSearch.url);
                    
                    if (sourceId) {
                        links.push({
                            source: sourceId,
                            target: nodeId,
                            value: 1, // Can be weighted based on importance
                            type: 'search_to_page'
                        });
                    }
                }
            });
        }
        
        // Add note nodes that aren't attached to searches or pages
        // First, gather all standalone notes from chronological events
        const standaloneNotes = this.rawData.chronologicalEvents 
            ? this.rawData.chronologicalEvents.filter(event => event.type === 'note' && event.orphaned)
            : [];
            
        if (standaloneNotes.length) {
            standaloneNotes.forEach((note, index) => {
                const nodeId = `note-${index}-${Date.now()}`;
                const node = {
                    id: nodeId,
                    type: 'note',
                    label: note.content.substring(0, 30) + (note.content.length > 30 ? '...' : ''),
                    content: note.content,
                    timestamp: note.timestamp,
                    url: note.url, // URL the note was added on, but not associated with
                    // Add display properties for force graph
                    val: 3, // Base node size
                    color: '#f1c40f' // Yellow for note nodes
                };
                
                nodes.push(node);
                
                // Try to link to the page it was added on
                const pageId = nodeMap.get(note.url);
                if (pageId) {
                    links.push({
                        source: pageId,
                        target: nodeId,
                        value: 1,
                        type: 'page_to_note'
                    });
                }
            });
        }
        
        // Ensure all links reference nodes by ID string, not objects
        // This is critical for force-graph library to work
        const simplifiedLinks = links.map(link => ({
            source: typeof link.source === 'string' ? link.source : link.source.id,
            target: typeof link.target === 'string' ? link.target : link.target.id,
            value: link.value || 1,
            type: link.type
        }));
        
        console.log("Created graph data:", { nodes, links: simplifiedLinks });
        this.graphData = { nodes, links: simplifiedLinks };
    }

    /**
     * Create timeline data structure
     * @private
     */
    _createTimelineData() {
        if (!this.rawData.chronologicalEvents || !this.rawData.chronologicalEvents.length) {
            this.timelineData = [];
            return;
        }
        
        // Sort events by timestamp
        const events = [...this.rawData.chronologicalEvents].sort((a, b) => {
            return new Date(a.timestamp) - new Date(b.timestamp);
        });
        
        // Process events into a more UI-friendly format
        this.timelineData = events.map(event => {
            const baseEntry = {
                type: event.type,
                timestamp: event.timestamp,
                url: event.url
            };
            
            // Handle different types of events
            if (event.type === 'search') {
                return {
                    ...baseEntry,
                    engine: event.engine,
                    query: event.query,
                    notes: event.notes || [],
                    label: `Search: "${event.query}"`,
                    description: `${this._getEngineName(event.engine)}`,
                    hasNotes: event.notes && event.notes.length > 0
                };
            }
            else if (event.type === 'pageVisit') {
                const metadata = event.metadata || {};
                return {
                    ...baseEntry,
                    title: event.title || metadata.title,
                    sourceSearch: event.sourceSearch,
                    metadata: metadata,
                    notes: event.notes || [],
                    label: event.title || metadata.title || this._extractDomain(event.url),
                    description: metadata.description || '',
                    hasNotes: event.notes && event.notes.length > 0
                };
            }
            else if (event.type === 'note') {
                return {
                    ...baseEntry,
                    content: event.content,
                    orphaned: event.orphaned,
                    label: 'Note added',
                    description: event.content
                };
            }
            
            return baseEntry;
        });
    }

    /**
     * Helper to make URLs safe for use as node IDs
     * @param {string} url - The URL to process
     * @returns {string} - URL safe for use as an ID
     * @private
     */
    _safeUrl(url) {
        return url.replace(/[^\w]/g, '_');
    }

    /**
     * Extract domain from URL
     * @param {string} url - Full URL
     * @returns {string} - Domain name
     * @private
     */
    _extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        } catch (e) {
            return url;
        }
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

    /**
     * Filter graph data based on node types to show
     * @param {Object} options - Filter options
     * @param {boolean} options.showSearches - Whether to show search nodes
     * @param {boolean} options.showPages - Whether to show page nodes
     * @param {boolean} options.showNotes - Whether to show note nodes
     * @returns {Object} - Filtered graph data
     */
    filterGraphData(options = { showSearches: true, showPages: true, showNotes: true }) {
        if (!this.graphData) {
            console.warn('No graph data available for filtering');
            return { nodes: [], links: [] };
        }
        
        const { showSearches, showPages, showNotes } = options;
        
        // Filter nodes
        const nodes = this.graphData.nodes.filter(node => {
            if (node.type === 'search' && !showSearches) return false;
            if (node.type === 'page' && !showPages) return false;
            if (node.type === 'note' && !showNotes) return false;
            return true;
        });
        
        // Get IDs of visible nodes
        const visibleNodeIds = new Set(nodes.map(n => n.id));
        
        // Filter links to only include those between visible nodes
        const links = this.graphData.links.filter(link => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;
            return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
        });
        
        // Ensure all links reference nodes by ID string, not objects
        const simplifiedLinks = links.map(link => ({
            source: typeof link.source === 'string' ? link.source : link.source.id,
            target: typeof link.target === 'string' ? link.target : link.target.id,
            value: link.value || 1,
            type: link.type
        }));
        
        console.log('Filtered graph data:', { nodes, links: simplifiedLinks });
        return { nodes, links: simplifiedLinks };
    }
}