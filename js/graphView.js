/**
 * GraphView class
 * Handles rendering and interaction with the force-directed graph
 */
class GraphView {
    constructor(containerId, detailsCallback) {
        this.container = document.getElementById(containerId);
        this.detailsCallback = detailsCallback;
        this.graph = null;
        this.data = null;
        this.filterOptions = {
            showSearches: true,
            showPages: true,
            showNotes: true
        };
    }

    /**
     * Initialize the graph visualization
     */
    initialize() {
        if (!this.container) {
            console.error('Graph container not found');
            return;
        }

        console.log('Initializing graph with container:', this.container);
        
        // Make sure container has dimensions
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.minHeight = '400px';
        this.container.style.visibility = 'visible';
        this.container.style.display = 'block';

        // Create the Force Graph instance
        this.graph = ForceGraph()
            .backgroundColor('#ffffff')
            .nodeRelSize(6)
            .nodeVal(node => {
                // Make nodes with notes larger
                if (node.hasNotes) return 8;
                // Make search nodes larger than pages
                return node.type === 'search' ? 6 : 4;
            })
            .nodeLabel(node => this._getNodeTooltip(node))
            .nodeColor(node => this._getNodeColor(node))
            .linkDirectionalArrowLength(4)
            .linkDirectionalArrowRelPos(1)
            .linkWidth(link => 1.5)
            .linkColor(() => '#999')
            .linkDirectionalParticles(2) // Add particles to show direction
            .linkDirectionalParticleWidth(2)
            .nodeCanvasObject((node, ctx, globalScale) => {
                // Add custom node rendering
                const label = node.name;
                const fontSize = 6;
                const textWidth = ctx.measureText(label).width;
                const size = Math.max(5, node.val) / globalScale;
                
                // Draw node circle
                ctx.beginPath();
                ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
                ctx.fillStyle = node.color;
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 0.5 / globalScale;
                ctx.stroke();
                
                // Draw text label if zoomed in enough
                if (globalScale > 0.4) {
                    ctx.font = `${fontSize}px Sans-Serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#333';
                    ctx.fillText(label, node.x, node.y + size + 4);
                }
            })
            .onNodeClick(node => {
                if (node && node.originalData) {
                    this.detailsCallback(node.originalData);
                }
            })
            .graphData({ nodes: [], links: [] });

        // Set the container
        this.graph(this.container);
        
        // Add forces immediately for chronological layout
        this.graph
            .d3Force('link', d3.forceLink().id(d => d.id).distance(60))
            .d3Force('charge', d3.forceManyBody().strength(-150))
            .d3Force('x', this._createChronologicalForce()) // X position based on time
            .d3Force('y', d3.forceY(d => this._getNodeTypeY(d.type)).strength(0.5)) // Y position based on type
            .d3Force('collision', d3.forceCollide(node => Math.sqrt(node.val || 1) * 6));

        // Set up window resize handler
        window.addEventListener('resize', this._handleResize.bind(this));
        this._handleResize();
    }

    /**
     * Update the graph with new data
     * @param {Object} data - Graph data (nodes and links)
     */
    update(data) {
        console.log('Updating graph with data:', data);
        
        if (!this.graph) this.initialize();

        this.data = data;
        
        // Make sure the container is visible before updating
        this.container.style.visibility = 'visible';
        this.container.style.height = '100%';
        this.container.style.minHeight = '400px';
        this.container.style.display = 'block';
        
        // For debugging
        this.container.style.border = '1px solid red';
        
        // Force a resize to ensure the graph container has dimensions and apply filters
        setTimeout(() => {
            this._handleResize();
            this._applyFiltersAndUpdate();
            
            // Log graph data after updating
            console.log('Graph data after update:', this.graph.graphData());
        }, 300);
    }

    /**
     * Apply filters to the graph data and update the visualization
     * @private
     */
    _applyFiltersAndUpdate() {
        if (!this.data || !this.graph) {
            console.warn('No data or graph instance available');
            return;
        }

        // Create a direct reference to the data without using DataProcessor again
        // This will simplify our debugging
        let filteredData;
        try {
            // When creating filteredData, make a deep copy to avoid reference issues
            const nodes = this.data.nodes.filter(node => {
                if (node.type === 'search' && !this.filterOptions.showSearches) return false;
                if (node.type === 'page' && !this.filterOptions.showPages) return false;
                if (node.type === 'note' && !this.filterOptions.showNotes) return false;
                return true;
            });
            
            // Get IDs of visible nodes for filtering links
            const visibleNodeIds = new Set(nodes.map(n => n.id));
            
            // Filter links to only include those between visible nodes
            const links = this.data.links.filter(link => {
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
            });
            
            filteredData = { nodes, links };
        } catch (error) {
            console.error('Error filtering graph data:', error);
            filteredData = { nodes: [], links: [] };
        }
        
        console.log("Applying filtered graph data:", filteredData);
        
        if (filteredData && filteredData.nodes && filteredData.nodes.length > 0) {
            // Parse timestamps for chronological sorting
            // Find earliest and latest timestamps for normalization
            let earliestTime = Infinity;
            let latestTime = -Infinity;
            
            filteredData.nodes.forEach(node => {
                if (node.timestamp) {
                    const time = new Date(node.timestamp).getTime();
                    if (time < earliestTime) earliestTime = time;
                    if (time > latestTime) latestTime = time;
                }
            });
            
            // Create enhanced graph nodes with time properties
            const graphNodes = filteredData.nodes.map(node => {
                const timestamp = node.timestamp ? new Date(node.timestamp).getTime() : null;
                
                // Calculate normalized time position (0-1)
                const timePosition = timestamp ? 
                    (timestamp - earliestTime) / Math.max(1, latestTime - earliestTime) : 
                    0.5; // Default to middle if no timestamp
                
                return {
                    id: node.id,
                    name: node.label || node.title || 'Unknown',
                    type: node.type, // Needed for Y positioning
                    val: node.hasNotes ? 8 : (node.type === 'search' ? 6 : 4),
                    color: this._getNodeColor(node),
                    timestamp: timestamp,
                    timePosition: timePosition,
                    hasNotes: node.hasNotes,
                    // Keep original data for tooltips and details
                    originalData: node
                };
            });
            
            // Sort nodes chronologically for better initial layout
            graphNodes.sort((a, b) => {
                if (!a.timestamp && !b.timestamp) return 0;
                if (!a.timestamp) return 1;
                if (!b.timestamp) return -1;
                return a.timestamp - b.timestamp;
            });
            
            // Create a map of nodes by ID for quick lookup
            const nodesById = {};
            graphNodes.forEach(node => { nodesById[node.id] = node; });
            
            // Create enhanced links with just source and target IDs
            const graphLinks = filteredData.links
                .map(link => {
                    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                    
                    // Only create links where both nodes exist
                    if (nodesById[sourceId] && nodesById[targetId]) {
                        return {
                            source: sourceId,
                            target: targetId,
                            value: link.value || 1,
                            type: link.type || 'default'
                        };
                    }
                    return null;
                })
                .filter(link => link !== null);
            
            console.log('Chronological graph data:', { 
                nodes: graphNodes, 
                links: graphLinks,
                timeRange: { earliest: new Date(earliestTime), latest: new Date(latestTime) }
            });
            
            // Apply the graph data
            this.graph.graphData({
                nodes: graphNodes,
                links: graphLinks
            });
            
            // Update forces for chronological layout
            this.graph
                .d3Force('x', this._createChronologicalForce()) // X position based on time
                .d3Force('y', d3.forceY(d => this._getNodeTypeY(d.type)).strength(0.5)); // Y position based on type
            
            // Reheat the simulation to make sure it animates
            this.graph.reheatSimulation();
            
            // Run simulation for a bit to settle nodes, then zoom to fit
            setTimeout(() => {
                this.graph.zoomToFit(400, 20);
            }, 500);
        } else {
            console.warn("No nodes to display in graph after filtering.");
            // Set empty data to clear the graph
            this.graph.graphData({ nodes: [], links: [] });
        }
    }

    /**
     * Update graph filter options
     * @param {Object} options - Filter options
     * @param {boolean} options.showSearches - Whether to show search nodes
     * @param {boolean} options.showPages - Whether to show page nodes
     * @param {boolean} options.showNotes - Whether to show note nodes
     */
    updateFilters(options) {
        this.filterOptions = { ...this.filterOptions, ...options };
        this._applyFiltersAndUpdate();
    }

    /**
     * Get the color for a node based on its type
     * @param {Object} node - Node data
     * @returns {string} - Color string (hex or CSS color)
     * @private
     */
    _getNodeColor(node) {
        switch (node.type) {
            case 'search':
                return '#3498db'; // Blue
            case 'page':
                return '#2ecc71'; // Green
            case 'note':
                return '#f1c40f'; // Yellow
            default:
                return '#95a5a6'; // Grey
        }
    }

    /**
     * Generate tooltip HTML for a node
     * @param {Object} node - Node data
     * @returns {string} - HTML tooltip content
     * @private
     */
    _getNodeTooltip(node) {
        if (node.type === 'search') {
            return `<div class="graph-tooltip">
                <div class="tooltip-title">${node.query}</div>
                <div class="tooltip-subtitle">${this._getEngineName(node.engine)}</div>
                ${node.hasNotes ? '<div class="tooltip-notes">Has notes</div>' : ''}
            </div>`;
        } 
        else if (node.type === 'page') {
            return `<div class="graph-tooltip">
                <div class="tooltip-title">${node.title || 'Untitled'}</div>
                <div class="tooltip-subtitle">${this._truncateUrl(node.url)}</div>
                ${node.hasNotes ? '<div class="tooltip-notes">Has notes</div>' : ''}
            </div>`;
        }
        else if (node.type === 'note') {
            return `<div class="graph-tooltip">
                <div class="tooltip-title">Note</div>
                <div class="tooltip-content">${node.content.substring(0, 50)}${node.content.length > 50 ? '...' : ''}</div>
            </div>`;
        }
        
        return node.label || 'Unknown';
    }

    /**
     * Handle window resize
     * @private
     */
    _handleResize() {
        if (!this.graph) return;
        
        // Update the size of the graph
        const width = this.container.clientWidth || 800;
        const height = this.container.clientHeight || 600;
        
        console.log(`Resizing graph to ${width}x${height}`);
        
        this.graph
            .width(width)
            .height(height);
            
        // If we have graph data, make sure it's still correctly displayed
        if (this.graph.graphData().nodes.length > 0) {
            setTimeout(() => this.graph.zoomToFit(400, 20), 100);
        }
    }

    /**
     * Create a force for chronological layout along X axis
     * @returns {d3.Force} - D3 force for X positioning
     * @private
     */
    _createChronologicalForce() {
        return d3.forceX(node => {
            // Use the container width for positioning
            const width = this.container.clientWidth || 800;
            const padding = 100; // Padding from edges
            
            // Position nodes based on their timePosition (0-1)
            // or place them in the middle if no timestamp
            if (node.timePosition !== undefined) {
                return padding + (width - 2 * padding) * node.timePosition;
            }
            return width / 2; // Default to middle
        }).strength(0.8); // Strong force to maintain chronology
    }
    
    /**
     * Get Y position based on node type for clearer separation
     * @param {string} type - Node type (search, page, note)
     * @returns {number} - Y position value
     * @private
     */
    _getNodeTypeY(type) {
        const height = this.container.clientHeight || 600;
        const centerY = height / 2;
        
        // Position searches at top, pages in middle, notes at bottom
        switch(type) {
            case 'search': return centerY - 150;
            case 'page': return centerY;
            case 'note': return centerY + 150;
            default: return centerY;
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
     * Truncate URL for display
     * @param {string} url - Full URL
     * @returns {string} - Truncated URL
     * @private
     */
    _truncateUrl(url) {
        try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname;
            const path = urlObj.pathname;
            
            if (path && path.length > 15) {
                return `${hostname}${path.substring(0, 15)}...`;
            }
            
            return `${hostname}${path}`;
        } catch (e) {
            return url.length > 25 ? url.substring(0, 25) + '...' : url;
        }
    }
}