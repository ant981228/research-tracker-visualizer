/**
 * Research Tracker Visualizer - Main Application
 */
document.addEventListener('DOMContentLoaded', () => {
    // Main application state
    const state = {
        isDataLoaded: false,
        currentView: 'timeline',  // 'timeline' or 'raw'
        data: null,
        detailsOpen: false,
        expandedSearches: new Set() // Track which searches are expanded
    };

    // DOM Elements
    const elements = {
        fileInput: document.getElementById('file-input'),
        fileName: document.getElementById('file-name'),
        importBtn: document.getElementById('import-btn'),
        sampleDataBtn: document.getElementById('sample-data-btn'),
        uploadSection: document.getElementById('upload-section'),
        visualizationContainer: document.getElementById('visualization-container'),
        viewButtons: document.querySelectorAll('.view-selector button'),
        viewPanes: document.querySelectorAll('.view-pane'),
        timelineSettings: {
            expandAllBtn: document.getElementById('expand-all-btn'),
            collapseAllBtn: document.getElementById('collapse-all-btn')
        },
        detailsPanel: document.getElementById('details-panel'),
        closeDetails: document.getElementById('close-details'),
        detailsContent: document.getElementById('details-content')
    };

    // Initialize components
    const dataProcessor = new DataProcessor();
    const timelineView = new TimelineView('timeline-container', showNodeDetails);
    const rawView = new RawView('session-info', 'raw-data');

    // Set up event listeners
    function setupEventListeners() {
        // File input change
        elements.fileInput.addEventListener('change', handleFileSelect);
        
        // Import button click
        elements.importBtn.addEventListener('click', importData);
        
        // Sample data button click
        elements.sampleDataBtn.addEventListener('click', loadSampleData);
        
        // View selector buttons
        elements.viewButtons.forEach(button => {
            button.addEventListener('click', () => switchView(button.getAttribute('data-view')));
        });
        
        // Timeline expand/collapse buttons
        if (elements.timelineSettings.expandAllBtn) {
            elements.timelineSettings.expandAllBtn.addEventListener('click', expandAllSearches);
        }
        
        if (elements.timelineSettings.collapseAllBtn) {
            elements.timelineSettings.collapseAllBtn.addEventListener('click', collapseAllSearches);
        }
        
        // Details panel close button
        elements.closeDetails.addEventListener('click', closeDetails);
    }

    /**
     * Handle file selection
     * @param {Event} event - Change event from file input
     */
    function handleFileSelect(event) {
        const file = event.target.files[0];
        
        if (file) {
            elements.fileName.textContent = file.name;
            elements.importBtn.disabled = false;
        } else {
            elements.fileName.textContent = 'No file selected';
            elements.importBtn.disabled = true;
        }
    }

    /**
     * Import data from the selected file
     */
    async function importData() {
        try {
            const file = elements.fileInput.files[0];
            
            if (!file) {
                showError('Please select a file to import');
                return;
            }
            
            // Process the data
            const data = await dataProcessor.parseData(file);
            
            if (!data || !data.raw) {
                showError('Invalid data format');
                return;
            }
            
            // Store the data and update the UI
            state.data = data;
            state.isDataLoaded = true;
            
            // Show visualization and hide upload section
            showVisualization();
            
            // Initialize views with data
            initializeViews();
        } catch (error) {
            showError(`Error importing data: ${error.message}`);
        }
    }

    /**
     * Load sample data
     */
    async function loadSampleData() {
        try {
            console.log('Loading sample data');
            // Use the correct path to the sample data
            const sampleData = {
              "id": "loj2zpmqr6bs3",
              "name": "Research on Climate Change",
              "startTime": "2025-05-18T19:30:45.123Z",
              "endTime": "2025-05-18T20:45:12.456Z",
              "searches": [
                {
                  "type": "search",
                  "engine": "GOOGLE",
                  "domain": "google.com",
                  "query": "climate change impact sea levels",
                  "params": {
                    "q": "climate change impact sea levels",
                    "tbm": "nws"
                  },
                  "url": "https://www.google.com/search?q=climate+change+impact+sea+levels&tbm=nws",
                  "timestamp": "2025-05-18T19:31:02.789Z",
                  "tabId": 12345,
                  "notes": [
                    {
                      "content": "Starting my research on sea level rise",
                      "timestamp": "2025-05-18T19:31:15.123Z"
                    }
                  ]
                },
                {
                  "type": "search",
                  "engine": "GOOGLE_SCHOLAR",
                  "domain": "scholar.google.com",
                  "query": "sea level rise projections 2025",
                  "params": {
                    "q": "sea level rise projections 2025"
                  },
                  "url": "https://scholar.google.com/scholar?q=sea+level+rise+projections+2025",
                  "timestamp": "2025-05-18T19:35:30.456Z",
                  "tabId": 12346
                },
                {
                  "type": "search",
                  "engine": "GOOGLE",
                  "domain": "google.com",
                  "query": "coastal cities at risk sea level rise",
                  "params": {
                    "q": "coastal cities at risk sea level rise"
                  },
                  "url": "https://www.google.com/search?q=coastal+cities+at+risk+sea+level+rise",
                  "timestamp": "2025-05-18T20:05:12.789Z",
                  "tabId": 12347
                }
              ],
              "contentPages": [
                {
                  "type": "pageVisit",
                  "url": "https://www.scientificamerican.com/article/sea-level-rise-projections/",
                  "title": "New Sea Level Rise Projections Alarm Scientists",
                  "timestamp": "2025-05-18T19:32:45.789Z",
                  "tabId": 12345,
                  "sourceSearch": {
                    "engine": "GOOGLE",
                    "query": "climate change impact sea levels",
                    "url": "https://www.google.com/search?q=climate+change+impact+sea+levels&tbm=nws",
                    "timestamp": "2025-05-18T19:31:02.789Z"
                  },
                  "metadata": {
                    "title": "New Sea Level Rise Projections Alarm Scientists",
                    "url": "https://www.scientificamerican.com/article/sea-level-rise-projections/",
                    "author": "Jane Smith",
                    "publishDate": "2025-05-10",
                    "description": "Recent studies show sea levels rising faster than previously predicted..."
                  },
                  "notes": [
                    {
                      "content": "Important data on acceleration of sea level rise",
                      "timestamp": "2025-05-18T19:35:12.456Z"
                    }
                  ]
                },
                {
                  "type": "pageVisit",
                  "url": "https://climate.nasa.gov/news/3021/2023-was-hottest-year-on-record/",
                  "title": "2023 Was Hottest Year on Record",
                  "timestamp": "2025-05-18T19:37:30.123Z",
                  "tabId": 12345,
                  "sourceSearch": {
                    "engine": "GOOGLE",
                    "query": "climate change impact sea levels",
                    "url": "https://www.google.com/search?q=climate+change+impact+sea+levels&tbm=nws",
                    "timestamp": "2025-05-18T19:31:02.789Z"
                  },
                  "metadata": {
                    "title": "2023 Was Hottest Year on Record",
                    "url": "https://climate.nasa.gov/news/3021/2023-was-hottest-year-on-record/",
                    "author": "NASA Climate Team",
                    "publishDate": "2024-01-15",
                    "description": "NASA and NOAA find that 2023 global temperatures set an all-time record high."
                  }
                },
                {
                  "type": "pageVisit",
                  "url": "https://www.nature.com/articles/s41586-024-07245-y",
                  "title": "Accelerated sea level rise in coastal regions",
                  "timestamp": "2025-05-18T19:40:15.456Z",
                  "tabId": 12346,
                  "sourceSearch": {
                    "engine": "GOOGLE_SCHOLAR",
                    "query": "sea level rise projections 2025",
                    "url": "https://scholar.google.com/scholar?q=sea+level+rise+projections+2025",
                    "timestamp": "2025-05-18T19:35:30.456Z"
                  },
                  "metadata": {
                    "title": "Accelerated sea level rise in coastal regions",
                    "url": "https://www.nature.com/articles/s41586-024-07245-y",
                    "author": "Robert Johnson et al.",
                    "publishDate": "2024-03-22",
                    "description": "New satellite measurements reveal faster than expected sea level rise in key coastal areas."
                  },
                  "notes": [
                    {
                      "content": "Key study for thesis - contains data on acceleration rates for Miami and NYC",
                      "timestamp": "2025-05-18T19:42:10.123Z"
                    }
                  ]
                },
                {
                  "type": "pageVisit",
                  "url": "https://www.pnas.org/doi/10.1073/pnas.2023423118",
                  "title": "Economic impacts of sea level rise on coastal infrastructure",
                  "timestamp": "2025-05-18T19:50:23.789Z",
                  "tabId": 12346,
                  "sourceSearch": {
                    "engine": "GOOGLE_SCHOLAR",
                    "query": "sea level rise projections 2025",
                    "url": "https://scholar.google.com/scholar?q=sea+level+rise+projections+2025",
                    "timestamp": "2025-05-18T19:35:30.456Z"
                  },
                  "metadata": {
                    "title": "Economic impacts of sea level rise on coastal infrastructure",
                    "url": "https://www.pnas.org/doi/10.1073/pnas.2023423118",
                    "author": "Sarah Williams, Michael Chen",
                    "publishDate": "2023-09-05",
                    "description": "Analysis of economic consequences of sea level rise on critical infrastructure in 25 major coastal cities."
                  }
                },
                {
                  "type": "pageVisit",
                  "url": "https://www.cnn.com/2024/05/01/us/miami-sea-level-rise-plan/index.html",
                  "title": "Miami unveils $5 billion sea level rise adaptation plan",
                  "timestamp": "2025-05-18T20:10:45.123Z",
                  "tabId": 12347,
                  "sourceSearch": {
                    "engine": "GOOGLE",
                    "query": "coastal cities at risk sea level rise",
                    "url": "https://www.google.com/search?q=coastal+cities+at+risk+sea+level+rise",
                    "timestamp": "2025-05-18T20:05:12.789Z"
                  },
                  "metadata": {
                    "title": "Miami unveils $5 billion sea level rise adaptation plan",
                    "url": "https://www.cnn.com/2024/05/01/us/miami-sea-level-rise-plan/index.html",
                    "author": "CNN Staff",
                    "publishDate": "2024-05-01",
                    "description": "Miami announces comprehensive plan to address rising sea levels with infrastructure improvements."
                  },
                  "notes": [
                    {
                      "content": "Great example of adaptation planning - cite in policy section",
                      "timestamp": "2025-05-18T20:12:30.456Z"
                    }
                  ]
                },
                {
                  "type": "pageVisit",
                  "url": "https://www.newyorker.com/magazine/2024/03/15/sinking-cities-sea-level-rise",
                  "title": "The Sinking Cities: How Sea Level Rise Is Claiming Urban Areas",
                  "timestamp": "2025-05-18T20:20:18.789Z",
                  "tabId": 12347,
                  "sourceSearch": {
                    "engine": "GOOGLE",
                    "query": "coastal cities at risk sea level rise",
                    "url": "https://www.google.com/search?q=coastal+cities+at+risk+sea+level+rise",
                    "timestamp": "2025-05-18T20:05:12.789Z"
                  },
                  "metadata": {
                    "title": "The Sinking Cities: How Sea Level Rise Is Claiming Urban Areas",
                    "url": "https://www.newyorker.com/magazine/2024/03/15/sinking-cities-sea-level-rise",
                    "author": "Elizabeth Kolbert",
                    "publishDate": "2024-03-15",
                    "description": "An in-depth look at how coastal cities worldwide are facing existential threats from rising seas."
                  }
                }
              ],
              "chronologicalEvents": [
                {
                  "type": "search",
                  "engine": "GOOGLE",
                  "domain": "google.com",
                  "query": "climate change impact sea levels",
                  "params": {
                    "q": "climate change impact sea levels",
                    "tbm": "nws"
                  },
                  "url": "https://www.google.com/search?q=climate+change+impact+sea+levels&tbm=nws",
                  "timestamp": "2025-05-18T19:31:02.789Z",
                  "tabId": 12345,
                  "notes": [
                    {
                      "content": "Starting my research on sea level rise",
                      "timestamp": "2025-05-18T19:31:15.123Z"
                    }
                  ]
                },
                {
                  "type": "pageVisit",
                  "url": "https://www.scientificamerican.com/article/sea-level-rise-projections/",
                  "title": "New Sea Level Rise Projections Alarm Scientists",
                  "timestamp": "2025-05-18T19:32:45.789Z",
                  "tabId": 12345,
                  "sourceSearch": {
                    "engine": "GOOGLE",
                    "query": "climate change impact sea levels",
                    "url": "https://www.google.com/search?q=climate+change+impact+sea+levels&tbm=nws",
                    "timestamp": "2025-05-18T19:31:02.789Z"
                  },
                  "metadata": {
                    "title": "New Sea Level Rise Projections Alarm Scientists",
                    "url": "https://www.scientificamerican.com/article/sea-level-rise-projections/",
                    "author": "Jane Smith",
                    "publishDate": "2025-05-10",
                    "description": "Recent studies show sea levels rising faster than previously predicted..."
                  },
                  "notes": [
                    {
                      "content": "Important data on acceleration of sea level rise",
                      "timestamp": "2025-05-18T19:35:12.456Z"
                    }
                  ]
                },
                {
                  "type": "search",
                  "engine": "GOOGLE_SCHOLAR",
                  "domain": "scholar.google.com",
                  "query": "sea level rise projections 2025",
                  "params": {
                    "q": "sea level rise projections 2025"
                  },
                  "url": "https://scholar.google.com/scholar?q=sea+level+rise+projections+2025",
                  "timestamp": "2025-05-18T19:35:30.456Z",
                  "tabId": 12346
                },
                {
                  "type": "pageVisit",
                  "url": "https://climate.nasa.gov/news/3021/2023-was-hottest-year-on-record/",
                  "title": "2023 Was Hottest Year on Record",
                  "timestamp": "2025-05-18T19:37:30.123Z",
                  "tabId": 12345,
                  "sourceSearch": {
                    "engine": "GOOGLE",
                    "query": "climate change impact sea levels",
                    "url": "https://www.google.com/search?q=climate+change+impact+sea+levels&tbm=nws",
                    "timestamp": "2025-05-18T19:31:02.789Z"
                  },
                  "metadata": {
                    "title": "2023 Was Hottest Year on Record",
                    "url": "https://climate.nasa.gov/news/3021/2023-was-hottest-year-on-record/",
                    "author": "NASA Climate Team",
                    "publishDate": "2024-01-15",
                    "description": "NASA and NOAA find that 2023 global temperatures set an all-time record high."
                  }
                },
                {
                  "type": "pageVisit",
                  "url": "https://www.nature.com/articles/s41586-024-07245-y",
                  "title": "Accelerated sea level rise in coastal regions",
                  "timestamp": "2025-05-18T19:40:15.456Z",
                  "tabId": 12346,
                  "sourceSearch": {
                    "engine": "GOOGLE_SCHOLAR",
                    "query": "sea level rise projections 2025",
                    "url": "https://scholar.google.com/scholar?q=sea+level+rise+projections+2025",
                    "timestamp": "2025-05-18T19:35:30.456Z"
                  },
                  "metadata": {
                    "title": "Accelerated sea level rise in coastal regions",
                    "url": "https://www.nature.com/articles/s41586-024-07245-y",
                    "author": "Robert Johnson et al.",
                    "publishDate": "2024-03-22",
                    "description": "New satellite measurements reveal faster than expected sea level rise in key coastal areas."
                  },
                  "notes": [
                    {
                      "content": "Key study for thesis - contains data on acceleration rates for Miami and NYC",
                      "timestamp": "2025-05-18T19:42:10.123Z"
                    }
                  ]
                },
                {
                  "type": "pageVisit",
                  "url": "https://www.pnas.org/doi/10.1073/pnas.2023423118",
                  "title": "Economic impacts of sea level rise on coastal infrastructure",
                  "timestamp": "2025-05-18T19:50:23.789Z",
                  "tabId": 12346,
                  "sourceSearch": {
                    "engine": "GOOGLE_SCHOLAR",
                    "query": "sea level rise projections 2025",
                    "url": "https://scholar.google.com/scholar?q=sea+level+rise+projections+2025",
                    "timestamp": "2025-05-18T19:35:30.456Z"
                  },
                  "metadata": {
                    "title": "Economic impacts of sea level rise on coastal infrastructure",
                    "url": "https://www.pnas.org/doi/10.1073/pnas.2023423118",
                    "author": "Sarah Williams, Michael Chen",
                    "publishDate": "2023-09-05",
                    "description": "Analysis of economic consequences of sea level rise on critical infrastructure in 25 major coastal cities."
                  }
                },
                {
                  "type": "search",
                  "engine": "GOOGLE",
                  "domain": "google.com",
                  "query": "coastal cities at risk sea level rise",
                  "params": {
                    "q": "coastal cities at risk sea level rise"
                  },
                  "url": "https://www.google.com/search?q=coastal+cities+at+risk+sea+level+rise",
                  "timestamp": "2025-05-18T20:05:12.789Z",
                  "tabId": 12347
                },
                {
                  "type": "pageVisit",
                  "url": "https://www.cnn.com/2024/05/01/us/miami-sea-level-rise-plan/index.html",
                  "title": "Miami unveils $5 billion sea level rise adaptation plan",
                  "timestamp": "2025-05-18T20:10:45.123Z",
                  "tabId": 12347,
                  "sourceSearch": {
                    "engine": "GOOGLE",
                    "query": "coastal cities at risk sea level rise",
                    "url": "https://www.google.com/search?q=coastal+cities+at+risk+sea+level+rise",
                    "timestamp": "2025-05-18T20:05:12.789Z"
                  },
                  "metadata": {
                    "title": "Miami unveils $5 billion sea level rise adaptation plan",
                    "url": "https://www.cnn.com/2024/05/01/us/miami-sea-level-rise-plan/index.html",
                    "author": "CNN Staff",
                    "publishDate": "2024-05-01",
                    "description": "Miami announces comprehensive plan to address rising sea levels with infrastructure improvements."
                  },
                  "notes": [
                    {
                      "content": "Great example of adaptation planning - cite in policy section",
                      "timestamp": "2025-05-18T20:12:30.456Z"
                    }
                  ]
                },
                {
                  "type": "pageVisit",
                  "url": "https://www.newyorker.com/magazine/2024/03/15/sinking-cities-sea-level-rise",
                  "title": "The Sinking Cities: How Sea Level Rise Is Claiming Urban Areas",
                  "timestamp": "2025-05-18T20:20:18.789Z",
                  "tabId": 12347,
                  "sourceSearch": {
                    "engine": "GOOGLE",
                    "query": "coastal cities at risk sea level rise",
                    "url": "https://www.google.com/search?q=coastal+cities+at+risk+sea+level+rise",
                    "timestamp": "2025-05-18T20:05:12.789Z"
                  },
                  "metadata": {
                    "title": "The Sinking Cities: How Sea Level Rise Is Claiming Urban Areas",
                    "url": "https://www.newyorker.com/magazine/2024/03/15/sinking-cities-sea-level-rise",
                    "author": "Elizabeth Kolbert",
                    "publishDate": "2024-03-15",
                    "description": "An in-depth look at how coastal cities worldwide are facing existential threats from rising seas."
                  }
                }
              ]
            };
            
            console.log('Sample data loaded:', sampleData);
            
            // Process the data
            const data = await dataProcessor.parseData(sampleData);
            console.log('Data processed:', data);
            
            // Store the data and update the UI
            state.data = data;
            state.isDataLoaded = true;
            
            // Show visualization and hide upload section
            showVisualization();
            
            // Initialize views with data
            initializeViews();
        } catch (error) {
            console.error('Error loading sample data:', error);
            showError(`Error loading sample data: ${error.message}`);
        }
    }

    /**
     * Initialize views with current data
     */
    function initializeViews() {
        if (!state.data) {
            console.warn('No data available to initialize views');
            return;
        }
        
        console.log('Initializing views with data');
        
        // Initialize all searches as expanded by default
        expandAllSearches();
        
        // Initialize timeline and raw views
        timelineView.update(state.data.timeline);
        timelineView.updateExpandedSearches(state.expandedSearches);
        rawView.update(state.data.raw);
        
        // Show the current view
        switchView(state.currentView);
    }

    /**
     * Switch between visualization views
     * @param {string} viewName - Name of the view to switch to
     */
    function switchView(viewName) {
        if (!viewName || !['timeline', 'raw'].includes(viewName)) {
            return;
        }
        
        console.log(`Switching to ${viewName} view`);
        
        // Update state
        state.currentView = viewName;
        
        // Update button active states
        elements.viewButtons.forEach(button => {
            if (button.getAttribute('data-view') === viewName) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // First make all view panes visible but with zero opacity for measurement
        elements.viewPanes.forEach(pane => {
            pane.classList.remove('hidden');
            pane.style.opacity = '0';
        });
        
        // Wait a moment for layout to calculate, then show only the active one
        setTimeout(() => {
            elements.viewPanes.forEach(pane => {
                if (pane.id === `${viewName}-view`) {
                    pane.style.opacity = '1';
                } else {
                    pane.classList.add('hidden');
                    pane.style.opacity = '1'; // Reset for next time
                }
            });
            
            // Special handling for specific views if needed in the future
            if (viewName === 'timeline') {
                // Ensure timeline is properly rendered
                if (state.data && state.data.timeline) {
                    timelineView.update(state.data.timeline);
                }
            }
        }, 50);
    }

    /**
     * Expand all search entries in the timeline
     */
    function expandAllSearches() {
        // Add all search URLs to the expanded set
        if (state.data && state.data.timeline) {
            state.data.timeline.forEach(event => {
                if (event.type === 'search') {
                    state.expandedSearches.add(event.url);
                }
            });
            
            // Update the timeline view
            timelineView.updateExpandedSearches(state.expandedSearches);
        }
    }
    
    /**
     * Collapse all search entries in the timeline
     */
    function collapseAllSearches() {
        // Clear all expanded searches
        state.expandedSearches.clear();
        
        // Update the timeline view
        if (state.data && state.data.timeline) {
            timelineView.updateExpandedSearches(state.expandedSearches);
        }
    }

    /**
     * Show node details in the details panel
     * @param {Object} node - Node data
     */
    function showNodeDetails(node) {
        if (!node) return;
        
        let content = '';
        
        if (node.type === 'search') {
            content = `
                <div class="details-header">
                    <h4>Search Query</h4>
                    <div class="details-type search">${getEngineName(node.engine)}</div>
                </div>
                <div class="details-body">
                    <div class="details-query">"${node.query}"</div>
                    <div class="details-timestamp">
                        <strong>Time:</strong> ${formatDate(node.timestamp)}
                    </div>
                    <div class="details-url-container">
                        <a href="${node.url}" class="visit-page-btn" target="_blank">Visit Search Page</a>
                    </div>
                </div>
            `;
            
            // Add notes if available
            if (node.notes && node.notes.length > 0) {
                content += '<div class="details-notes"><h4>Notes</h4>';
                
                node.notes.forEach(note => {
                    content += `
                        <div class="details-note">
                            <div class="note-content">${note.content}</div>
                            <div class="note-timestamp">${formatDate(note.timestamp)}</div>
                        </div>
                    `;
                });
                
                content += '</div>';
            }
        } 
        else if (node.type === 'page') {
            const metadata = node.metadata || {};
            
            content = `
                <div class="details-header">
                    <h4>Page Visit</h4>
                    <div class="details-type page">Web Page</div>
                </div>
                <div class="details-body">
                    <div class="details-title">${node.title || 'Untitled'}</div>
                    <div class="details-timestamp">
                        <strong>Visited:</strong> ${formatDate(node.timestamp)}
                    </div>
                    <div class="details-url-container">
                        <a href="${node.url}" class="visit-page-btn" target="_blank">Visit Page</a>
                    </div>
                </div>
            `;
            
            // Add metadata if available
            if (metadata) {
                content += '<div class="details-metadata">';
                
                if (metadata.author) {
                    content += `<div><strong>Author:</strong> ${metadata.author}</div>`;
                }
                
                if (metadata.publishDate) {
                    content += `<div><strong>Published:</strong> ${metadata.publishDate}</div>`;
                }
                
                if (metadata.description) {
                    content += `<div class="details-description">${metadata.description}</div>`;
                }
                
                content += '</div>';
            }
            
            // Add notes if available
            if (node.notes && node.notes.length > 0) {
                content += '<div class="details-notes"><h4>Notes</h4>';
                
                node.notes.forEach(note => {
                    content += `
                        <div class="details-note">
                            <div class="note-content">${note.content}</div>
                            <div class="note-timestamp">${formatDate(note.timestamp)}</div>
                        </div>
                    `;
                });
                
                content += '</div>';
            }
        } 
        else if (node.type === 'note') {
            content = `
                <div class="details-header">
                    <h4>Note</h4>
                    <div class="details-type note">Standalone Note</div>
                </div>
                <div class="details-body">
                    <div class="details-timestamp">
                        <strong>Added:</strong> ${formatDate(node.timestamp)}
                    </div>
                    <div class="details-content">${node.content}</div>
                </div>
            `;
            
            if (node.url) {
                content += `
                    <div class="details-url-container">
                        <a href="${node.url}" class="visit-page-btn" target="_blank">Visit Original Page</a>
                    </div>
                `;
            }
        }
        
        // Update the details content
        elements.detailsContent.innerHTML = content;
        
        // Show the details panel
        elements.detailsPanel.classList.add('open');
        state.detailsOpen = true;
    }

    /**
     * Close the details panel
     */
    function closeDetails() {
        elements.detailsPanel.classList.remove('open');
        state.detailsOpen = false;
    }

    /**
     * Show visualization and hide upload section
     */
    function showVisualization() {
        elements.uploadSection.classList.add('hidden');
        elements.visualizationContainer.classList.remove('hidden');
    }

    /**
     * Show an error message to the user
     * @param {string} message - Error message
     */
    function showError(message) {
        alert(message);
        console.error(message);
    }

    /**
     * Format a timestamp as a readable date
     * @param {string} timestamp - ISO timestamp
     * @returns {string} - Formatted date and time
     */
    function formatDate(timestamp) {
        try {
            const date = new Date(timestamp);
            return date.toLocaleString();
        } catch (e) {
            return timestamp;
        }
    }

    /**
     * Get user-friendly name for search engine
     * @param {string} engineCode - Engine identifier (e.g., "GOOGLE")
     * @returns {string} - User-friendly engine name
     */
    function getEngineName(engineCode) {
        const engineMap = {
            'GOOGLE': 'Google Search',
            'GOOGLE_SCHOLAR': 'Google Scholar',
            'BING': 'Bing Search',
            'DUCKDUCKGO': 'DuckDuckGo',
            'GOOGLE_NEWS': 'Google News'
        };
        
        return engineMap[engineCode] || engineCode;
    }

    // Initialize application
    function init() {
        setupEventListeners();
        
        // Initialize all views with a small delay to ensure DOM is ready
        setTimeout(() => {
            console.log('Initializing views');
            timelineView.initialize();
            rawView.initialize();
        }, 100);
    }

    // Start the application
    init();
});