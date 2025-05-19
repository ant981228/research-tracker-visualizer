/**
 * RawView class
 * Handles rendering of raw data for inspection
 */
class RawView {
    constructor(sessionInfoId, rawDataId) {
        this.sessionInfoElement = document.getElementById(sessionInfoId);
        this.rawDataElement = document.getElementById(rawDataId);
        this.data = null;
    }

    /**
     * Initialize the raw data view
     */
    initialize() {
        if (!this.sessionInfoElement || !this.rawDataElement) {
            console.error('Raw data view elements not found');
            return;
        }
        
        // Clear any existing content
        this.sessionInfoElement.innerHTML = '';
        this.rawDataElement.innerHTML = '';
    }

    /**
     * Update the raw data view with new data
     * @param {Object} data - Research session data
     */
    update(data) {
        if (!this.sessionInfoElement || !this.rawDataElement) {
            this.initialize();
        }
        
        this.data = data;
        this._render();
    }

    /**
     * Render the raw data view
     * @private
     */
    _render() {
        if (!this.data) {
            this._showError('No data available');
            return;
        }
        
        try {
            // Render session information
            this._renderSessionInfo();
            
            // Render the full JSON data with syntax highlighting
            this._renderRawData();
        } catch (error) {
            this._showError(`Error rendering data: ${error.message}`);
        }
    }

    /**
     * Render session information
     * @private
     */
    _renderSessionInfo() {
        const sessionName = this.data.name || 'Unnamed Session';
        const startTime = new Date(this.data.startTime).toLocaleString();
        const endTime = this.data.endTime ? new Date(this.data.endTime).toLocaleString() : 'Not ended';
        
        const searchCount = this.data.searches ? this.data.searches.length : 0;
        const pageCount = this.data.contentPages ? this.data.contentPages.length : 0;
        const eventCount = this.data.chronologicalEvents ? this.data.chronologicalEvents.length : 0;
        
        let sessionHtml = `
            <h3>${sessionName}</h3>
            <div class="session-details">
                <div><strong>Session ID:</strong> ${this.data.id}</div>
                <div><strong>Started:</strong> ${startTime}</div>
                <div><strong>Ended:</strong> ${endTime}</div>
            </div>
            <div class="session-stats">
                <div><strong>Searches:</strong> ${searchCount}</div>
                <div><strong>Pages visited:</strong> ${pageCount}</div>
                <div><strong>Total events:</strong> ${eventCount}</div>
            </div>
        `;
        
        this.sessionInfoElement.innerHTML = sessionHtml;
    }

    /**
     * Render raw JSON data with syntax highlighting
     * @private
     */
    _renderRawData() {
        // Format the JSON with indentation
        const formattedJson = JSON.stringify(this.data, null, 2);
        
        // Apply simple syntax highlighting
        const highlightedJson = this._highlightJson(formattedJson);
        
        this.rawDataElement.innerHTML = highlightedJson;
    }

    /**
     * Apply syntax highlighting to JSON string
     * @param {string} json - JSON string
     * @returns {string} - HTML with syntax highlighting
     * @private
     */
    _highlightJson(json) {
        if (!json) return '';
        
        // Replace special characters with HTML entities
        let highlighted = json
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        // Apply colors to different parts of the JSON
        highlighted = highlighted
            // Strings
            .replace(/"([^"\\]*(\\.[^"\\]*)*)":/g, '<span style="color: #a33;">"$1":</span>')
            // Other strings
            .replace(/"([^"\\]*(\\.[^"\\]*)*)"([,\s\n]*)/g, '<span style="color: #383;">"$1"</span>$3')
            // Numbers
            .replace(/\b([-+]?(?:\d*\.?\d+))\b/g, '<span style="color: #33a;">$1</span>')
            // Keywords
            .replace(/\b(true|false|null)\b/g, '<span style="color: #a3a;">$1</span>');
        
        return highlighted;
    }

    /**
     * Show error message
     * @param {string} message - Error message
     * @private
     */
    _showError(message) {
        this.sessionInfoElement.innerHTML = `<div class="error">${message}</div>`;
        this.rawDataElement.innerHTML = '';
    }
}