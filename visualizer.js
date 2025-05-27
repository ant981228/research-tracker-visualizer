let sessionData = null;
let viewMode = 'teacher'; // Always teacher view
let annotationData = {};
let removedPages = new Set();
let removedSearches = new Set(); // Store removed searches
let lastAction = null; // For undo functionality
let editedMetadata = {}; // Store edited metadata

// Sample data for demonstration
const sampleData = {
    "id": "demo-session-001",
    "name": "Sample Research Session",
    "startTime": "2025-05-26T14:00:00.000Z",
    "endTime": "2025-05-26T16:30:00.000Z",
    "searches": [
        {
            "type": "search",
            "engine": "GOOGLE",
            "domain": "google.com",
            "query": "climate change policy initiatives",
            "url": "https://www.google.com/search?q=climate+change+policy+initiatives",
            "timestamp": "2025-05-26T14:00:30.000Z",
            "tabId": 12345
        },
        {
            "type": "search",
            "engine": "GOOGLE_SCHOLAR",
            "domain": "scholar.google.com",
            "query": "renewable energy peer review studies",
            "url": "https://scholar.google.com/scholar?q=renewable+energy+peer+review+studies",
            "timestamp": "2025-05-26T14:15:00.000Z",
            "tabId": 12346
        },
        {
            "type": "search",
            "engine": "GOOGLE",
            "domain": "google.com",
            "query": "IPCC report 2025 summary",
            "url": "https://www.google.com/search?q=IPCC+report+2025+summary",
            "timestamp": "2025-05-26T14:30:00.000Z",
            "tabId": 12347
        },
        {
            "type": "search",
            "engine": "GOOGLE",
            "domain": "google.com",
            "query": "economic impact climate change developing nations",
            "url": "https://www.google.com/search?q=economic+impact+climate+change+developing+nations",
            "timestamp": "2025-05-26T15:00:00.000Z",
            "tabId": 12348
        }
    ],
    "contentPages": [
        // Government sources
        {
            "type": "pageVisit",
            "url": "https://www.epa.gov/climate-change/climate-change-impacts",
            "title": "Climate Change Impacts | US EPA",
            "timestamp": "2025-05-26T14:02:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE",
                "query": "climate change policy initiatives"
            },
            "metadata": {
                "title": "Climate Change Impacts by Sector",
                "publisher": "Environmental Protection Agency",
                "publishDate": "2025-04-15",
                "contentType": "report"
            }
        },
        {
            "type": "pageVisit",
            "url": "https://www.noaa.gov/climate/2025-state-of-climate",
            "title": "2025 State of the Climate Report | NOAA",
            "timestamp": "2025-05-26T14:04:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE",
                "query": "climate change policy initiatives"
            },
            "metadata": {
                "title": "2025 State of the Climate",
                "publisher": "National Oceanic and Atmospheric Administration",
                "publishDate": "2025-05-01"
            }
        },
        
        // Journal articles
        {
            "type": "pageVisit",
            "url": "https://www.nature.com/articles/s41558-025-01234-5",
            "title": "Accelerating renewable energy transition in developing economies",
            "timestamp": "2025-05-26T14:18:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE_SCHOLAR",
                "query": "renewable energy peer review studies"
            },
            "metadata": {
                "title": "Accelerating renewable energy transition in developing economies",
                "authors": ["Chen, L.", "Smith, J.", "Kumar, P."],
                "journal": "Nature Climate Change",
                "publishDate": "2025-03-12",
                "doi": "10.1038/s41558-025-01234-5",
                "contentType": "journal-article"
            }
        },
        {
            "type": "pageVisit",
            "url": "https://www.sciencedirect.com/science/article/pii/S0360544225001234",
            "title": "Grid integration challenges for renewable energy systems",
            "timestamp": "2025-05-26T14:20:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE_SCHOLAR",
                "query": "renewable energy peer review studies"
            },
            "metadata": {
                "title": "Grid integration challenges for renewable energy systems: A comprehensive review",
                "authors": ["Johnson, M.", "Williams, K.", "Zhang, W."],
                "journal": "Energy",
                "publishDate": "2025-04-01",
                "doi": "10.1016/j.energy.2025.01234",
                "pmid": "38234567",
                "contentType": "journal-article"
            }
        },
        
        // Preprints
        {
            "type": "pageVisit",
            "url": "https://arxiv.org/abs/2505.12345",
            "title": "Machine Learning Applications in Climate Modeling",
            "timestamp": "2025-05-26T14:22:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE_SCHOLAR",
                "query": "renewable energy peer review studies"
            },
            "metadata": {
                "title": "Machine Learning Applications in Climate Modeling: A Systematic Approach",
                "authors": ["Patel, R.", "Thompson, A."],
                "publishDate": "2025-05-10",
                "arxivId": "2505.12345",
                "contentType": "preprint"
            }
        },
        {
            "type": "pageVisit",
            "url": "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4567890",
            "title": "Economic Policy Responses to Climate Change",
            "timestamp": "2025-05-26T15:05:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE",
                "query": "economic impact climate change developing nations"
            },
            "metadata": {
                "title": "Economic Policy Responses to Climate Change in Emerging Markets",
                "author": "Martinez, C.",
                "publishDate": "2025-05-20",
                "doi": "10.2139/ssrn.4567890",
                "contentType": "preprint"
            }
        },
        
        // Think tanks
        {
            "type": "pageVisit",
            "url": "https://www.brookings.edu/articles/climate-policy-2025-outlook/",
            "title": "Climate Policy in 2025: Global Outlook | Brookings",
            "timestamp": "2025-05-26T14:06:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE",
                "query": "climate change policy initiatives"
            },
            "metadata": {
                "title": "Climate Policy in 2025: A Global Outlook",
                "author": "Sarah Johnson",
                "publisher": "Brookings Institution",
                "publishDate": "2025-05-05"
            }
        },
        {
            "type": "pageVisit",
            "url": "https://www.rand.org/pubs/research_reports/RRA2025-1.html",
            "title": "National Security Implications of Climate Change",
            "timestamp": "2025-05-26T14:08:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE",
                "query": "climate change policy initiatives"
            },
            "metadata": {
                "title": "National Security Implications of Climate Change: A 2025 Assessment",
                "authors": ["Davis, M.", "Roberts, J."],
                "publisher": "RAND Corporation",
                "publishDate": "2025-04-20",
                "contentType": "report"
            }
        },
        
        // News organizations
        {
            "type": "pageVisit",
            "url": "https://www.nytimes.com/2025/05/15/climate/renewable-energy-milestone.html",
            "title": "U.S. Reaches Historic Renewable Energy Milestone",
            "timestamp": "2025-05-26T14:10:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE",
                "query": "climate change policy initiatives"
            },
            "metadata": {
                "title": "U.S. Reaches Historic Renewable Energy Milestone",
                "author": "Lisa Chen",
                "publisher": "The New York Times",
                "publishDate": "2025-05-15"
            }
        },
        {
            "type": "pageVisit",
            "url": "https://www.bbc.com/news/science-environment-67890123",
            "title": "Climate summit agrees on new emissions targets",
            "timestamp": "2025-05-26T14:32:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE",
                "query": "IPCC report 2025 summary"
            },
            "metadata": {
                "title": "Climate summit agrees on new emissions targets",
                "publisher": "BBC News",
                "publishDate": "2025-05-22"
            }
        },
        
        // Science media
        {
            "type": "pageVisit",
            "url": "https://www.scientificamerican.com/article/climate-tipping-points-2025/",
            "title": "Climate Tipping Points: What We Know in 2025",
            "timestamp": "2025-05-26T14:35:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE",
                "query": "IPCC report 2025 summary"
            },
            "metadata": {
                "title": "Climate Tipping Points: What We Know in 2025",
                "author": "Michael Brown",
                "publisher": "Scientific American",
                "publishDate": "2025-05-18"
            }
        },
        
        // Database
        {
            "type": "pageVisit",
            "url": "https://www.jstor.org/stable/10.2307/48678901",
            "title": "Historical Climate Data Analysis 1850-2025",
            "timestamp": "2025-05-26T14:25:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE_SCHOLAR",
                "query": "renewable energy peer review studies"
            },
            "metadata": {
                "title": "Historical Climate Data Analysis 1850-2025",
                "authors": ["Wilson, R.", "Garcia, M."],
                "journal": "Journal of Climate History",
                "publishDate": "2025-02-15",
                "jstorId": "48678901"
            }
        },
        
        // University
        {
            "type": "pageVisit",
            "url": "https://climate.mit.edu/research/renewable-energy-storage",
            "title": "Renewable Energy Storage Solutions | MIT Climate",
            "timestamp": "2025-05-26T14:28:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE_SCHOLAR",
                "query": "renewable energy peer review studies"
            },
            "metadata": {
                "title": "Advances in Renewable Energy Storage Solutions",
                "publisher": "MIT Climate Portal",
                "publishDate": "2025-04-30"
            }
        },
        
        // Encyclopedia
        {
            "type": "pageVisit",
            "url": "https://www.britannica.com/science/climate-change-2025-update",
            "title": "Climate Change | Britannica",
            "timestamp": "2025-05-26T14:38:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE",
                "query": "IPCC report 2025 summary"
            },
            "metadata": {
                "title": "Climate Change - 2025 Update",
                "publisher": "Encyclopedia Britannica",
                "publishDate": "2025-05-01"
            }
        },
        
        // Wikipedia
        {
            "type": "pageVisit",
            "url": "https://en.wikipedia.org/wiki/Paris_Agreement",
            "title": "Paris Agreement - Wikipedia",
            "timestamp": "2025-05-26T14:40:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE",
                "query": "IPCC report 2025 summary"
            },
            "metadata": {
                "title": "Paris Agreement",
                "publisher": "Wikipedia"
            }
        },
        
        // Blog
        {
            "type": "pageVisit",
            "url": "https://medium.com/@climateexpert/future-of-renewable-energy-2025",
            "title": "The Future of Renewable Energy in 2025 and Beyond",
            "timestamp": "2025-05-26T15:10:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE",
                "query": "economic impact climate change developing nations"
            },
            "metadata": {
                "title": "The Future of Renewable Energy in 2025 and Beyond",
                "author": "Alex Thompson",
                "publisher": "Medium",
                "publishDate": "2025-05-10"
            }
        },
        
        // Social media
        {
            "type": "pageVisit",
            "url": "https://twitter.com/UN/status/1234567890123456789",
            "title": "UN Climate Action on X",
            "timestamp": "2025-05-26T15:15:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE",
                "query": "economic impact climate change developing nations"
            },
            "metadata": {
                "title": "UN announces new climate fund for developing nations",
                "publisher": "Twitter/X",
                "publishDate": "2025-05-25"
            }
        },
        
        // Direct visits (orphaned pages)
        {
            "type": "pageVisit",
            "url": "https://www.ipcc.ch/report/ar7/wg1/",
            "title": "IPCC Seventh Assessment Report",
            "timestamp": "2025-05-26T15:45:00.000Z",
            "metadata": {
                "title": "Climate Change 2025: The Physical Science Basis",
                "publisher": "Intergovernmental Panel on Climate Change",
                "publishDate": "2025-03-01",
                "contentType": "report"
            }
        },
        {
            "type": "pageVisit",
            "url": "https://www.worldbank.org/en/topic/climatechange/report/2025",
            "title": "Climate Change Action Plan 2025-2030",
            "timestamp": "2025-05-26T16:00:00.000Z",
            "metadata": {
                "title": "Climate Change Action Plan 2025-2030",
                "publisher": "World Bank",
                "publishDate": "2025-04-10",
                "contentType": "report"
            }
        }
    ],
    "chronologicalEvents": []
};

// Initialize the visualizer
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('fileInput').addEventListener('change', function(e) {
        // Update filename display
        const fileName = e.target.files[0]?.name || 'No JSON file chosen';
        document.getElementById('fileInputName').textContent = fileName;
        
        // Handle the file upload
        if (e.target.files[0]) {
            handleFileUpload(e);
        }
    });
    
    document.getElementById('docxInput').addEventListener('change', function(e) {
        // Update filename display
        const fileName = e.target.files[0]?.name || 'No DOCX file chosen';
        document.getElementById('docxInputName').textContent = fileName;
        
        // Handle the DOCX file upload
        if (e.target.files[0]) {
            parseDOCXFile(e.target.files[0]);
        }
    });
    
    document.getElementById('loadSample').addEventListener('click', loadSampleData);
    
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(function(button) {
        button.addEventListener('click', switchTab);
    });
    
    // Timeline filters
    document.getElementById('showPages').addEventListener('change', updateTimeline);
    document.getElementById('showMetadata').addEventListener('change', updateTimeline);
    document.getElementById('showNotes').addEventListener('change', updateTimeline);
    document.getElementById('showAnnotations').addEventListener('change', updateTimeline);
    
    // Export buttons
    document.getElementById('exportAnnotations').addEventListener('click', exportAnnotations);
    document.getElementById('exportModified').addEventListener('click', exportModifiedData);
    
    // Expand/Collapse buttons
    document.getElementById('expandAll').addEventListener('click', expandAll);
    document.getElementById('collapseAll').addEventListener('click', collapseAll);
    
    // Undo and restore buttons
    document.getElementById('undoBtn').addEventListener('click', performUndo);
    document.getElementById('restorePages').addEventListener('click', restoreAllRemovedPages);
    
    // Font selector buttons
    document.querySelectorAll('.font-btn').forEach(function(button) {
        button.addEventListener('click', function() {
            setFont(this.dataset.font);
        });
    });
    
    // Load saved data from localStorage
    loadSavedAnnotations();
    loadRemovedPages();
    loadRemovedSearches();
    loadEditedMetadata();
    loadSavedFont();
});

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            sessionData = JSON.parse(e.target.result);
            processSessionData();
        } catch (error) {
            alert('Error parsing JSON file: ' + error.message);
        }
    };
    reader.readAsText(file);
}

function loadSampleData() {
    // Clear file input when loading sample data
    const fileInput = document.getElementById('fileInput');
    fileInput.value = '';
    document.getElementById('fileInputName').textContent = 'No JSON file chosen';
    
    sessionData = sampleData;
    // Build chronological events from searches and pages
    sessionData.chronologicalEvents = sessionData.searches.concat(sessionData.contentPages).sort(function(a, b) {
        return new Date(a.timestamp) - new Date(b.timestamp);
    });
    
    processSessionData();
}

function processSessionData() {
    if (!sessionData) return;
    
    // Clear previous session data
    removedPages.clear();
    removedSearches.clear();
    annotationData = {};
    editedMetadata = {};
    
    // Load saved data for this session
    loadSavedAnnotations();
    loadRemovedPages();
    loadRemovedSearches();
    loadEditedMetadata();
    
    // Match cards to pages if DOCX was loaded
    if (parsedCards.length > 0) {
        matchCardsToPages();
    }
    
    // Show visualization sections
    document.getElementById('sessionInfo').classList.remove('hidden');
    document.getElementById('actionsBox').classList.remove('hidden');
    document.getElementById('visualization').classList.remove('hidden');
    
    // Update session info
    updateSessionInfo();
    
    // Update all views
    updateTimeline();
    updateStatistics();
}

function updateSessionInfo() {
    document.getElementById('sessionName').textContent = sessionData.name;
    
    const startTime = new Date(sessionData.startTime);
    const endTime = new Date(sessionData.endTime);
    const duration = Math.round((endTime - startTime) / 1000 / 60); // minutes
    
    document.getElementById('sessionDuration').textContent = `Duration: ${duration} minutes`;
    document.getElementById('searchCount').textContent = `Searches: ${sessionData.searches.length}`;
    document.getElementById('pageCount').textContent = `Pages visited: ${sessionData.contentPages.length}`;
    
    const noteCount = sessionData.searches.reduce((count, search) => count + (search.notes?.length || 0), 0) +
                     sessionData.contentPages.reduce((count, page) => count + (page.notes?.length || 0), 0);
    document.getElementById('noteCount').textContent = `Notes: ${noteCount}`;
}

function updateTimeline() {
    const showPages = document.getElementById('showPages').checked;
    const showMetadata = document.getElementById('showMetadata').checked;
    const showNotes = document.getElementById('showNotes').checked;
    const showAnnotations = document.getElementById('showAnnotations').checked;
    
    const timelineContent = document.getElementById('timelineContent');
    timelineContent.innerHTML = '';
    
    // Group searches and their related pages
    const searchGroups = groupSearchesAndPages();
    
    // Create timeline items for each search group
    searchGroups.forEach((group, groupIndex) => {
        const searchContainer = createSearchContainer(group, groupIndex, showPages, showNotes, showAnnotations, showMetadata);
        timelineContent.appendChild(searchContainer);
    });
    
    // Add orphaned pages (pages without a source search, excluding removed and filtered pages)
    const orphanedPages = sessionData.contentPages.filter(page => !page.sourceSearch && !shouldFilterPage(page));
    const orphanedPagesFiltered = [];
    orphanedPages.forEach((page, index) => {
        const pageId = `orphan-${index}`;
        if (!removedPages.has(pageId)) {
            orphanedPagesFiltered.push({ page, pageId });
        }
    });
    
    if (showPages && orphanedPagesFiltered.length > 0) {
        const orphanContainer = document.createElement('div');
        orphanContainer.className = 'search-group';
        
        const orphanHeader = document.createElement('div');
        orphanHeader.className = 'orphan-header';
        orphanHeader.innerHTML = '<strong>Direct Page Visits</strong>';
        orphanContainer.appendChild(orphanHeader);
        
        orphanedPagesFiltered.forEach(({ page, pageId }) => {
            const pageItem = createPageItem(page, pageId, showNotes, showAnnotations, showMetadata);
            orphanContainer.appendChild(pageItem);
        });
        
        timelineContent.appendChild(orphanContainer);
    }
}

function createTimelineItem(event, index) {
    const item = document.createElement('div');
    item.className = 'timeline-item';
    item.dataset.eventIndex = index;
    
    const eventId = `${event.type}-${index}`;
    const annotation = annotationData[eventId];
    
    if (annotation) {
        item.classList.add('has-annotation');
        if (annotation.quality === 'excellent') {
            item.classList.add('excellent-source');
        }
    }
    
    const time = document.createElement('div');
    time.className = 'timeline-time';
    time.textContent = formatTime(event.timestamp);
    
    const icon = document.createElement('div');
    icon.className = 'timeline-icon';
    
    const content = document.createElement('div');
    content.className = 'timeline-content';
    
    if (event.type === 'search') {
        item.classList.add('search-event');
        icon.textContent = '🔍';
        
        const titleDiv = document.createElement('div');
        const title = document.createElement('span');
        title.className = 'event-title';
        title.textContent = `Search: "${event.query}"`;
        titleDiv.appendChild(title);
        
        const details = document.createElement('div');
        details.className = 'event-details';
        details.textContent = `${event.engine} - ${event.domain}`;
        
        content.appendChild(titleDiv);
        content.appendChild(details);
        
        if (event.notes && event.notes.length > 0) {
            event.notes.forEach(note => {
                const noteDiv = document.createElement('div');
                noteDiv.className = 'event-note';
                noteDiv.textContent = `Student note: ${note.content}`;
                content.appendChild(noteDiv);
            });
        }
    } else if (event.type === 'pageVisit') {
        item.classList.add('page-event');
        icon.textContent = '📄';
        
        const titleDiv = document.createElement('div');
        const title = document.createElement('span');
        title.className = 'event-title';
        // Prefer metadata.title over top-level title as it's usually more accurate
        let pageTitle = (event.metadata && event.metadata.title) || event.title;
        
        // If no title available, show a cleaned-up version of the URL
        if (!pageTitle || pageTitle.trim() === '') {
            const url = new URL(event.url);
            // Remove common prefixes and clean up the path
            pageTitle = url.pathname.split('/').filter(p => p).pop() || url.hostname;
            pageTitle = pageTitle.replace(/[-_]/g, ' ').replace(/\.\w+$/, ''); // Remove file extensions
            pageTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1); // Capitalize
        }
        
        title.textContent = pageTitle;
        title.title = event.url; // Add URL as tooltip
        titleDiv.appendChild(title);
        
        // Add source type indicator for pages
        if (event.metadata && viewMode === 'teacher') {
            const sourceType = assessSourceType(event);
            const typeBadge = document.createElement('span');
            typeBadge.className = `source-type type-${sourceType}`;
            typeBadge.textContent = getSourceTypeLabel(sourceType);
            titleDiv.appendChild(typeBadge);
        }
        
        const details = document.createElement('div');
        details.className = 'event-details';
        const domain = new URL(event.url).hostname;
        details.textContent = domain;
        
        if (event.sourceSearch) {
            details.textContent += ` (from search: "${event.sourceSearch.query}")`;
        }
        
        content.appendChild(titleDiv);
        content.appendChild(details);
        
        // Add metadata section for pages
        if (event.metadata && Object.keys(event.metadata).length > 0) {
            const metadataSection = document.createElement('div');
            metadataSection.className = 'metadata-section';
            
            if (event.metadata.author) {
                const authorDiv = document.createElement('div');
                authorDiv.className = 'metadata-item';
                authorDiv.innerHTML = `<span class="metadata-label">Author:</span><span class="metadata-value">${event.metadata.author}</span>`;
                metadataSection.appendChild(authorDiv);
            }
            
            if (event.metadata.publishDate) {
                const dateDiv = document.createElement('div');
                dateDiv.className = 'metadata-item';
                dateDiv.innerHTML = `<span class="metadata-label">Published:</span><span class="metadata-value">${event.metadata.publishDate}</span>`;
                metadataSection.appendChild(dateDiv);
            }
            
            if (event.metadata.publisher) {
                const publisherDiv = document.createElement('div');
                publisherDiv.className = 'metadata-item';
                publisherDiv.innerHTML = `<span class="metadata-label">Publisher:</span><span class="metadata-value">${event.metadata.publisher}</span>`;
                metadataSection.appendChild(publisherDiv);
            }
            
            if (event.metadata.journal) {
                const journalDiv = document.createElement('div');
                journalDiv.className = 'metadata-item';
                journalDiv.innerHTML = `<span class="metadata-label">Journal:</span><span class="metadata-value">${event.metadata.journal}</span>`;
                metadataSection.appendChild(journalDiv);
            }
            
            if (event.metadata.doi) {
                const doiDiv = document.createElement('div');
                doiDiv.className = 'metadata-item';
                doiDiv.innerHTML = `<span class="metadata-label">DOI:</span><span class="metadata-value">${event.metadata.doi}</span>`;
                metadataSection.appendChild(doiDiv);
            }
            
            if (event.metadata.quals) {
                const qualsDiv = document.createElement('div');
                qualsDiv.className = 'metadata-item';
                qualsDiv.innerHTML = `<span class="metadata-label">Quals:</span><span class="metadata-value">${event.metadata.quals}</span>`;
                metadataSection.appendChild(qualsDiv);
            }
            
            content.appendChild(metadataSection);
        }
        
        if (event.notes && event.notes.length > 0) {
            event.notes.forEach(note => {
                const noteDiv = document.createElement('div');
                noteDiv.className = 'event-note';
                noteDiv.textContent = `Student note: ${note.content}`;
                content.appendChild(noteDiv);
            });
        }
    } else if (event.type === 'note') {
        item.classList.add('note-event');
        icon.textContent = '📝';
        
        const title = document.createElement('div');
        title.className = 'event-title';
        title.textContent = 'Note';
        
        const noteContent = document.createElement('div');
        noteContent.className = 'event-note';
        noteContent.textContent = event.content;
        
        content.appendChild(title);
        content.appendChild(noteContent);
    }
    
    // Add annotation section
    const showAnnotations = document.getElementById('showAnnotations').checked;
    if (showAnnotations && (viewMode === 'teacher' || annotation)) {
        if (annotation) {
            const annotationDiv = createAnnotationDisplay(annotation, eventId);
            content.appendChild(annotationDiv);
        }
        
        if (viewMode === 'teacher' && !annotation) {
            const addAnnotationBtn = document.createElement('button');
            addAnnotationBtn.className = 'add-annotation-btn';
            addAnnotationBtn.textContent = 'Add Annotation';
            addAnnotationBtn.onclick = () => showAnnotationForm(eventId, event);
            content.appendChild(addAnnotationBtn);
        }
    }
    
    item.appendChild(time);
    item.appendChild(icon);
    item.appendChild(content);
    
    return item;
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
}


function updateStatistics() {
    console.log("updateStatistics called");
    const statsContent = document.getElementById('statsContent');
    console.log("statsContent element:", statsContent);
    statsContent.innerHTML = '';
    
    // Session duration
    const durationCard = createStatCard('Session Duration', calculateDuration(), 'minutes');
    statsContent.appendChild(durationCard);
    console.log("Session duration card added");
    
    // Total events
    const totalEvents = sessionData.chronologicalEvents.length;
    const eventsCard = createStatCard('Total Events', totalEvents, 'events');
    statsContent.appendChild(eventsCard);
    console.log("Total events card added");
    
    // Average pages per search
    const totalSearches = sessionData.searches.length;
    const totalPages = sessionData.contentPages.length;
    const avgPages = totalSearches > 0 ? (totalPages / totalSearches).toFixed(1) : 0;
    const avgPagesCard = createStatCard('Average Pages per Search', avgPages, 'pages');
    statsContent.appendChild(avgPagesCard);
    console.log("Average pages card added, calling createSourceTypesChart next");
    
    // Search engines used
    const searchEngines = {};
    sessionData.searches.forEach(search => {
        searchEngines[search.engine] = (searchEngines[search.engine] || 0) + 1;
    });
    
    const enginesCard = document.createElement('div');
    enginesCard.className = 'stat-card';
    enginesCard.innerHTML = '<h3>Search Engines Used</h3>';
    const enginesList = document.createElement('ul');
    enginesList.className = 'search-engine-list';
    
    Object.entries(searchEngines).forEach(([engine, count]) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${engine}</span><span>${count}</span>`;
        enginesList.appendChild(li);
    });
    
    enginesCard.appendChild(enginesList);
    statsContent.appendChild(enginesCard);
    
    // Top domains visited
    const domains = {};
    sessionData.contentPages.forEach(page => {
        const domain = new URL(page.url).hostname;
        domains[domain] = (domains[domain] || 0) + 1;
    });
    
    const sortedDomains = Object.entries(domains)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const domainsCard = document.createElement('div');
    domainsCard.className = 'stat-card';
    domainsCard.innerHTML = '<h3>Top Domains Visited</h3>';
    const domainsList = document.createElement('ul');
    domainsList.className = 'domain-list';
    
    sortedDomains.forEach(([domain, count]) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${domain}</span><span>${count}</span>`;
        domainsList.appendChild(li);
    });
    
    domainsCard.appendChild(domainsList);
    statsContent.appendChild(domainsCard);
    
    // Source types pie chart
    console.log("About to call createSourceTypesChart");
    const sourceTypesCard = createSourceTypesChart();
    console.log("createSourceTypesChart returned:", sourceTypesCard);
    statsContent.appendChild(sourceTypesCard);
    console.log("Source types card appended to statsContent");
}

function createStatCard(label, value, unit) {
    const card = document.createElement('div');
    card.className = 'stat-card';
    card.innerHTML = `
        <h3>${label}</h3>
        <div class="stat-value">${value}</div>
        <div class="stat-label">${unit}</div>
    `;
    return card;
}

function calculateDuration() {
    const startTime = new Date(sessionData.startTime);
    const endTime = new Date(sessionData.endTime);
    return Math.round((endTime - startTime) / 1000 / 60);
}

function createSourceTypesChart() {
    console.log("createSourceTypesChart called");
    console.log("contentPages length:", sessionData.contentPages ? sessionData.contentPages.length : "undefined");
    
    // Count source types
    var sourceTypes = {};
    sessionData.contentPages.forEach(function(page) {
        if (!shouldFilterPage(page)) {
            var sourceType = assessSourceType(page);
            var label = getSourceTypeLabel(sourceType);
            sourceTypes[label] = (sourceTypes[label] || 0) + 1;
        }
    });
    
    console.log("Source types found:", Object.keys(sourceTypes).length);
    console.log("Source types object:", sourceTypes);
    
    // Create card
    var card = document.createElement('div');
    card.className = 'stat-card source-types-card';
    card.innerHTML = '<h3>Source Types</h3>';
    
    if (Object.keys(sourceTypes).length === 0) {
        card.innerHTML += '<p class="no-data">No source data available</p>';
        return card;
    }
    
    // Create pie chart container
    var chartContainer = document.createElement('div');
    chartContainer.className = 'pie-chart-container';
    
    var pieChart = document.createElement('div');
    pieChart.className = 'pie-chart';
    
    var legend = document.createElement('div');
    legend.className = 'chart-legend';
    
    // Calculate total and create pie chart using conic-gradient
    var total = Object.keys(sourceTypes).reduce(function(sum, key) {
        return sum + sourceTypes[key];
    }, 0);
    
    // Vivid colors for different source types
    var colors = [
        '#27ae60', '#3498db', '#e74c3c', '#f39c12', '#9b59b6',
        '#1abc9c', '#e67e22', '#2ecc71', '#34495e', '#f1c40f',
        '#e91e63', '#ff5722', '#607d8b', '#795548'
    ];
    
    // Create conic-gradient string
    var gradientParts = [];
    var currentAngle = 0;
    var index = 0;
    
    Object.keys(sourceTypes).forEach(function(type) {
        var count = sourceTypes[type];
        var percentage = (count / total) * 100;
        var angle = (count / total) * 360;
        var color = colors[index % colors.length];
        
        gradientParts.push(color + ' ' + currentAngle + 'deg ' + (currentAngle + angle) + 'deg');
        
        // Create legend item
        var legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = '<div class="legend-color" style="background-color: ' + color + '"></div>' +
                              '<span class="legend-label">' + type + '</span>' +
                              '<span class="legend-value">' + count + ' (' + percentage.toFixed(1) + '%)</span>';
        legend.appendChild(legendItem);
        
        currentAngle += angle;
        index++;
    });
    
    // Create SVG pie chart for better compatibility
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '196');
    svg.setAttribute('height', '196');
    svg.setAttribute('viewBox', '0 0 196 196');
    
    var radius = 90;
    var centerX = 98;
    var centerY = 98;
    currentAngle = 0;
    index = 0;
    
    Object.keys(sourceTypes).forEach(function(type) {
        var count = sourceTypes[type];
        var angle = (count / total) * 360;
        var color = colors[index % colors.length];
        
        if (angle > 0) {
            var startAngleRad = (currentAngle - 90) * Math.PI / 180;
            var endAngleRad = (currentAngle + angle - 90) * Math.PI / 180;
            
            var x1 = centerX + radius * Math.cos(startAngleRad);
            var y1 = centerY + radius * Math.sin(startAngleRad);
            var x2 = centerX + radius * Math.cos(endAngleRad);
            var y2 = centerY + radius * Math.sin(endAngleRad);
            
            var largeArcFlag = angle > 180 ? 1 : 0;
            
            var pathData = 'M ' + centerX + ' ' + centerY + 
                          ' L ' + x1 + ' ' + y1 + 
                          ' A ' + radius + ' ' + radius + ' 0 ' + largeArcFlag + ' 1 ' + x2 + ' ' + y2 + 
                          ' Z';
            
            var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', pathData);
            path.setAttribute('fill', color);
            path.setAttribute('stroke', '#fff');
            path.setAttribute('stroke-width', '2');
            
            svg.appendChild(path);
        }
        
        currentAngle += angle;
        index++;
    });
    
    pieChart.appendChild(svg);
    
    // Add tooltip functionality
    var tooltip = document.createElement('div');
    tooltip.className = 'pie-tooltip';
    tooltip.style.display = 'none';
    card.appendChild(tooltip);
    
    // Store slice data for hover detection
    var sliceData = [];
    currentAngle = 0;
    Object.keys(sourceTypes).forEach(function(type) {
        var count = sourceTypes[type];
        var percentage = (count / total) * 100;
        var angle = (count / total) * 360;
        sliceData.push({
            type: type,
            count: count,
            percentage: percentage,
            startAngle: currentAngle,
            endAngle: currentAngle + angle
        });
        currentAngle += angle;
    });
    
    // Add mouse event listeners for tooltip
    pieChart.addEventListener('mousemove', function(e) {
        var rect = pieChart.getBoundingClientRect();
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        var x = e.clientX - rect.left - centerX;
        var y = e.clientY - rect.top - centerY;
        
        // Calculate angle from center
        var angle = Math.atan2(y, x) * 180 / Math.PI;
        if (angle < 0) angle += 360;
        // Adjust for SVG starting point (top)
        angle = (angle + 90) % 360;
        
        // Find which slice this angle belongs to
        var hoveredSlice = null;
        for (var i = 0; i < sliceData.length; i++) {
            if (angle >= sliceData[i].startAngle && angle < sliceData[i].endAngle) {
                hoveredSlice = sliceData[i];
                break;
            }
        }
        
        if (hoveredSlice) {
            var pageText = hoveredSlice.count === 1 ? 'page' : 'pages';
            tooltip.innerHTML = '<strong>' + hoveredSlice.type + '</strong><br>' +
                               hoveredSlice.count + ' ' + pageText + ' (' + hoveredSlice.percentage.toFixed(1) + '%)';
            tooltip.style.display = 'block';
            tooltip.style.left = (e.pageX - 100) + 'px';
            tooltip.style.top = (e.pageY - 50) + 'px';
        }
    });
    
    pieChart.addEventListener('mouseleave', function() {
        tooltip.style.display = 'none';
    });
    
    chartContainer.appendChild(pieChart);
    chartContainer.appendChild(legend);
    card.appendChild(chartContainer);
    
    return card;
}

function switchTab(event) {
    const targetTab = event.target.getAttribute('data-tab');
    
    // Update button states
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update content visibility
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(targetTab).classList.add('active');
}

// Annotation functions
function assessSourceType(page) {
    const url = page.url.toLowerCase();
    let domain = new URL(page.url).hostname.toLowerCase();
    const metadata = page.metadata || {};
    
    // Helper function to check if domain matches (including proxy versions)
    const domainMatches = (checkDomain, pattern) => {
        // Check original domain
        if (checkDomain.includes(pattern)) return true;
        
        // Normalize both domain and pattern by removing punctuation
        const normalizedDomain = checkDomain.replace(/[-_.]/g, '');
        const normalizedPattern = pattern.replace(/[-_.]/g, '');
        
        // Check if normalized domain contains normalized pattern
        return normalizedDomain.includes(normalizedPattern);
    };
    
    // Check content type from metadata first
    if (metadata.contentType) {
        if (metadata.contentType === 'journal-article') return 'journal';
        if (metadata.contentType === 'preprint') return 'preprint';
        if (metadata.contentType === 'report') return 'report';
    }
    
    // Check for specific academic identifiers
    if (metadata.arxivId || domainMatches(domain, 'arxiv.org')) return 'preprint';
    if (metadata.doi && domainMatches(domain, 'ssrn.com')) return 'preprint';
    
    // Government sources
    const normalizedDomain = domain.replace(/-/g, '.');
    if (domain.endsWith('.gov') || normalizedDomain.endsWith('.gov')) {
        return 'government';
    }
    
    // Academic journals and publishers
    if (metadata.doi || metadata.pmid || metadata.jstorId ||
        domainMatches(domain, 'nature.com') || domainMatches(domain, 'sciencedirect.com') ||
        domainMatches(domain, 'springer.com') || domainMatches(domain, 'wiley.com') ||
        domainMatches(domain, 'elsevier.com') || domainMatches(domain, 'sagepub.com') ||
        domainMatches(domain, 'tandfonline.com') || domainMatches(domain, 'cambridge.org') ||
        domainMatches(domain, 'oxford.ac') || domainMatches(domain, 'oup.com') ||
        domainMatches(domain, 'dukeupress.edu') || domainMatches(domain, 'doi.org')) {
        return 'journal';
    }
    
    // Research databases
    if (domainMatches(domain, 'jstor.org') || domainMatches(domain, 'pubmed') ||
        domainMatches(domain, 'ncbi.nlm.nih.gov') || domainMatches(domain, 'scholar.google')) {
        return 'database';
    }
    
    // Think tanks and research organizations
    if (domainMatches(domain, 'brookings.edu') || domainMatches(domain, 'rand.org') ||
        domainMatches(domain, 'pewresearch.org') || domainMatches(domain, 'cato.org') ||
        domainMatches(domain, 'heritage.org') || domainMatches(domain, 'urban.org') ||
        domainMatches(domain, 'bakerinstitute.org') || domainMatches(domain, 'carnegieendowment.org') ||
        domainMatches(domain, 'americanprogress.org') || domainMatches(domain, 'atlanticcouncil.org') ||
        domainMatches(domain, 'hudson.org') || domainMatches(domain, 'cnas.org') ||
        domainMatches(domain, 'taxpolicycenter.org') || domainMatches(domain, 'rff.org') || 
        domainMatches(domain, 'resources.org') || domainMatches(domain, 'hoover.org') ||
        domainMatches(domain, 'fpri.org') || domainMatches(domain, 'reason.org') ||
        domainMatches(domain, 'cbpp.org') || domainMatches(domain, 'mercatus.org') ||
        domainMatches(domain, 'epi.org') || domainMatches(domain, 'milkeninstitute.org') ||
        domainMatches(domain, 'thirdway.org') || domainMatches(domain, 'cei.org') ||
        domainMatches(domain, 'rstreet.org') || domainMatches(domain, 'aspeninstitute.org') ||
        domainMatches(domain, 'nber.org')) {
        return 'thinktank';
    }
    
    // News organizations
    if (domain.includes('nytimes.com') || domain.includes('washingtonpost.com') ||
        domain.includes('bbc.com') || domain.includes('reuters.com') ||
        domain.includes('apnews.com') || domain.includes('npr.org') ||
        domain.includes('theguardian.com') || domain.includes('wsj.com') || 
        domain.includes('bloomberg.com') || domain.includes('cnn.com') || 
        domain.includes('cnbc.com') || domain.includes('cbsnews.com') || 
        domain.includes('abcnews.go.com') || domain.includes('nbcnews.com') || 
        domain.includes('latimes.com') || domain.includes('theglobeandmail.com') || 
        domain.includes('nypost.com') || domain.includes('usnews.com') || 
        domain.includes('dw.com') || domain.includes('timesofindia.indiatimes.com') || 
        domain.includes('indianexpress.com') || domain.includes('hindustantimes.com') || 
        domain.includes('thehill.com') || domain.includes('thedailybeast.com') || 
        domain.includes('newsweek.com') || domain.includes('bangkokpost.com') || 
        domain.includes('japantimes.co.jp') || domain.includes('economist.com') || 
        domain.includes('ft.com') || domain.includes('nationalreview.com')) {
        return 'news';
    }
    
    // Science media
    if (domain.includes('scientificamerican.com') || domain.includes('sciencenews.org') ||
        domain.includes('phys.org') || domain.includes('sciencedaily.com')) {
        return 'science-media';
    }
    
    // Encyclopedia and reference sources
    if (domain.includes('britannica.com') || domain.includes('stanford.edu/entries')) {
        return 'encyclopedia';
    }
    
    // Wikipedia
    if (domain.includes('wikipedia.org')) {
        return 'wikipedia';
    }
    
    // Social media
    if (domain.includes('reddit.com') || domain.includes('twitter.com') || 
        domain.includes('x.com') || domain.includes('facebook.com') || 
        domain.includes('youtube.com') || domain.includes('instagram.com') || 
        domain.includes('tiktok.com')) {
        return 'social';
    }
    
    // Blogs
    if (domain.includes('blogspot.com') || domain.includes('wordpress.com') ||
        domain.includes('medium.com') || domain.includes('substack.com')) {
        return 'blog';
    }
    
    // University (general .edu that aren't journals or think tanks)
    if (domain.endsWith('.edu') || normalizedDomain.endsWith('.edu')) {
        return 'university';
    }
    
    // Default
    return 'website';
}

function getSourceTypeLabel(type) {
    const labels = {
        'journal': 'Journal',
        'preprint': 'Preprint',
        'government': 'Government',
        'thinktank': 'Think Tank',
        'news': 'News',
        'science-media': 'Science Media',
        'encyclopedia': 'Encyclopedia',
        'wikipedia': 'Wikipedia',
        'database': 'Database',
        'university': 'University',
        'social': 'Social Media',
        'blog': 'Blog',
        'report': 'Report',
        'website': 'Website'
    };
    return labels[type] || 'Website';
}

function createAnnotationDisplay(annotation, eventId) {
    const annotationDiv = document.createElement('div');
    annotationDiv.className = 'teacher-annotation';
    
    const header = document.createElement('div');
    header.className = 'annotation-header';
    
    const label = document.createElement('div');
    label.className = 'annotation-label';
    label.textContent = 'Annotation:';
    header.appendChild(label);
    
    if (viewMode === 'teacher') {
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-annotation-btn';
        editBtn.textContent = 'Edit';
        editBtn.onclick = function() { showAnnotationForm(eventId, null, annotation, this); };
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-annotation-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteAnnotation(eventId);
        
        buttonContainer.appendChild(editBtn);
        buttonContainer.appendChild(deleteBtn);
        header.appendChild(buttonContainer);
    }
    
    const content = document.createElement('div');
    content.className = 'annotation-content';
    content.textContent = annotation.content;
    
    annotationDiv.appendChild(header);
    annotationDiv.appendChild(content);
    
    return annotationDiv;
}

function showAnnotationForm(eventId, event, existingAnnotation = null, buttonElement = null) {
    const form = document.createElement('div');
    form.className = 'annotation-form';
    form.id = `annotation-form-${eventId}`;
    
    const textarea = document.createElement('textarea');
    textarea.className = 'annotation-textarea';
    textarea.placeholder = 'Enter your annotation here...';
    if (existingAnnotation) {
        textarea.value = existingAnnotation.content;
    }
    
    const actions = document.createElement('div');
    actions.className = 'annotation-actions';
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-annotation-btn';
    saveBtn.textContent = 'Save Annotation';
    saveBtn.onclick = () => saveAnnotation(eventId, textarea.value, event);
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-annotation-btn';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => {
        form.remove();
        updateTimeline();
    };
    
    actions.appendChild(saveBtn);
    actions.appendChild(cancelBtn);
    
    form.appendChild(textarea);
    form.appendChild(actions);
    
    // If we have a button element reference, use it directly
    if (buttonElement) {
        if (existingAnnotation) {
            // For edit button, replace the parent annotation div
            const annotationDiv = buttonElement.closest('.teacher-annotation');
            if (annotationDiv) {
                annotationDiv.replaceWith(form);
            }
        } else {
            // For add button, replace the button itself
            buttonElement.replaceWith(form);
        }
    } else {
        // Fallback to the old method if no button reference provided
        updateTimeline();
    }
}

function saveAnnotation(eventId, content, event) {
    if (!content.trim()) return;
    
    // Save previous state for undo
    const previousAnnotation = annotationData[eventId] ? { ...annotationData[eventId] } : null;
    
    annotationData[eventId] = {
        content: content.trim(),
        timestamp: new Date().toISOString(),
        sourceType: event && event.type === 'pageVisit' ? assessSourceType(event) : null
    };
    
    // Track action for undo
    lastAction = {
        type: 'annotation',
        eventId: eventId,
        previousValue: previousAnnotation,
        newValue: { ...annotationData[eventId] }
    };
    enableUndoButton();
    
    // Save to localStorage
    localStorage.setItem(`annotations-${sessionData.id}`, JSON.stringify(annotationData));
    
    // Refresh timeline
    updateTimeline();
}

function loadSavedAnnotations() {
    if (sessionData && sessionData.id) {
        const saved = localStorage.getItem(`annotations-${sessionData.id}`);
        if (saved) {
            annotationData = JSON.parse(saved);
        }
    }
}

function deleteAnnotation(eventId) {
    if (confirm('Are you sure you want to delete this annotation?')) {
        // Save previous state for undo
        const previousAnnotation = annotationData[eventId] ? { ...annotationData[eventId] } : null;
        
        delete annotationData[eventId];
        
        // Track action for undo
        lastAction = {
            type: 'deleteAnnotation',
            eventId: eventId,
            previousValue: previousAnnotation
        };
        enableUndoButton();
        
        // Save to localStorage
        localStorage.setItem(`annotations-${sessionData.id}`, JSON.stringify(annotationData));
        
        // Refresh timeline
        updateTimeline();
    }
}

// Research summary function removed - no longer needed

function exportAnnotations() {
    if (!sessionData || Object.keys(annotationData).length === 0) {
        alert('No annotations to export');
        return;
    }
    
    let textContent = `RESEARCH ANNOTATIONS\n`;
    textContent += `Session: ${sessionData.name}\n`;
    textContent += `Student: ${sessionData.studentName || 'Unknown Student'}\n`;
    textContent += `Export Date: ${new Date().toLocaleString()}\n`;
    textContent += `${'='.repeat(60)}\n\n`;
    
    let entryCount = 0;
    
    // Process search groups and their associated pages
    const searchGroups = groupSearchesAndPages();
    searchGroups.forEach((group, groupIndex) => {
        const searchId = `search-group-${groupIndex}`;
        const hasSearchAnnotation = annotationData[searchId];
        
        // Check if any pages in this group have annotations
        const pagesWithAnnotations = [];
        group.pages.forEach((page, pageIndex) => {
            const pageId = `page-${groupIndex}-${pageIndex}`;
            if (annotationData[pageId]) {
                pagesWithAnnotations.push({ page, pageId, pageIndex });
            }
        });
        
        // Only output if there are annotations for this search or its pages
        if (hasSearchAnnotation || pagesWithAnnotations.length > 0) {
            entryCount++;
            textContent += `\nSEARCH #${entryCount}\n`;
            textContent += `Query: "${group.query}" on ${group.engine}\n`;
            textContent += `Time: ${new Date(group.firstTimestamp).toLocaleString()}\n`;
            
            if (hasSearchAnnotation) {
                textContent += `\nSEARCH ANNOTATION:\n${annotationData[searchId].content}\n`;
            }
            
            // Add associated pages with annotations
            if (pagesWithAnnotations.length > 0) {
                textContent += `\nASSOCIATED PAGES WITH ANNOTATIONS:\n`;
                pagesWithAnnotations.forEach(({ page, pageId }, idx) => {
                    textContent += `\n  Page ${idx + 1}: ${page.title || 'Untitled Page'}\n`;
                    textContent += `  URL: ${page.url}\n`;
                    textContent += `  Time: ${new Date(page.timestamp).toLocaleString()}\n`;
                    textContent += `  ANNOTATION: ${annotationData[pageId].content}\n`;
                });
            }
            
            textContent += `\n${'-'.repeat(60)}\n`;
        }
    });
    
    // Process orphaned pages (pages without a source search)
    const orphanedPages = sessionData.contentPages.filter(page => !page.sourceSearch);
    let hasOrphanedAnnotations = false;
    
    orphanedPages.forEach((page, index) => {
        const orphanId = `page-orphan-${index}`;
        if (annotationData[orphanId]) {
            if (!hasOrphanedAnnotations) {
                textContent += `\nDIRECT PAGE VISITS (No Associated Search)\n`;
                textContent += `${'='.repeat(40)}\n`;
                hasOrphanedAnnotations = true;
            }
            
            entryCount++;
            textContent += `\nPAGE #${entryCount}\n`;
            textContent += `Title: ${page.title || 'Untitled Page'}\n`;
            textContent += `URL: ${page.url}\n`;
            textContent += `Time: ${new Date(page.timestamp).toLocaleString()}\n`;
            textContent += `\nANNOTATION:\n${annotationData[orphanId].content}\n`;
            textContent += `\n${'-'.repeat(60)}\n`;
        }
    });
    
    if (entryCount === 0) {
        textContent += `\nNo annotations found.\n`;
    }
    
    // Create and download the text file
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `annotations-${sessionData.name.replace(/[^a-z0-9]/gi, '_')}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// New functions for hierarchical timeline
function shouldFilterPage(page) {
    const url = page.url.toLowerCase();
    const domain = new URL(page.url).hostname.toLowerCase();
    
    // Filter browser internal pages
    if (url.startsWith('chrome://') || 
        url.startsWith('about:') || 
        url.startsWith('edge://') || 
        url.startsWith('firefox://') ||
        url.startsWith('chrome-extension://') ||
        url.startsWith('moz-extension://')) {
        return true;
    }
    
    // Filter piracy/shadow library sites
    const pirateDomainsPatterns = [
        'sci-hub', 'scihub',
        'annas-archive', 'anna-archive',
        'z-lib', 'zlib', 'zlibrary', 'z-library',
        'libgen', 'library.lol',
        'bookfi', 'bookzz', 'b-ok',
        'pdfdrive', 'pdf-drive'
    ];
    
    if (pirateDomainsPatterns.some(pattern => domain.includes(pattern))) {
        return true;
    }
    
    // Filter download/file sharing sites
    const fileShareDomains = [
        'mediafire.com', 'mega.nz', 'megaupload.com',
        'rapidshare.com', 'uploaded.net', 'depositfiles.com',
        'sendspace.com', '4shared.com', 'wetransfer.com'
    ];
    
    if (fileShareDomains.includes(domain)) {
        return true;
    }
    
    // Filter URL shorteners (often used to hide actual destinations)
    const urlShorteners = [
        'bit.ly', 'tinyurl.com', 'goo.gl', 'ow.ly',
        'is.gd', 'buff.ly', 'short.link', 'shorte.st'
    ];
    
    if (urlShorteners.includes(domain)) {
        return true;
    }
    
    // Filter blank pages and error pages
    if (!page.title || 
        page.title === 'New Tab' || 
        page.title === 'Blank' ||
        page.title.includes('404') ||
        page.title.includes('Error') ||
        page.title.includes('Not Found')) {
        return true;
    }
    
    // Filter login/auth pages
    if (url.includes('/login') || 
        url.includes('/signin') || 
        url.includes('/auth') ||
        url.includes('/oauth') ||
        page.title.toLowerCase().includes('sign in') ||
        page.title.toLowerCase().includes('log in')) {
        return true;
    }
    
    // Filter specific domains
    const excludedDomains = [
        'www.library.dartmouth.edu',
        'library.dartmouth.edu',
        'search.library.dartmouth.edu'
    ];
    
    if (excludedDomains.includes(domain)) {
        return true;
    }
    
    return false;
}

function groupSearchesAndPages() {
    const groups = [];
    const searchMap = new Map();
    
    // Group searches by query and engine (excluding removed searches)
    sessionData.searches.forEach((search, index) => {
        const key = `${search.engine}-${search.query}`;
        
        // Skip if this search group was removed
        if (removedSearches.has(key)) return;
        
        if (!searchMap.has(key)) {
            searchMap.set(key, {
                searches: [],
                pages: [],
                firstTimestamp: search.timestamp,
                query: search.query,
                engine: search.engine,
                domain: search.domain
            });
        }
        const group = searchMap.get(key);
        group.searches.push({ ...search, originalIndex: index });
    });
    
    // Add pages to their corresponding search groups (excluding removed and filtered pages)
    sessionData.contentPages.forEach((page, index) => {
        if (!shouldFilterPage(page) && page.sourceSearch) {
            const key = `${page.sourceSearch.engine}-${page.sourceSearch.query}`;
            const group = searchMap.get(key);
            if (group) {
                group.pages.push({ ...page, originalIndex: index });
            }
        }
    });
    
    // Convert map to array and sort by first timestamp
    searchMap.forEach(group => groups.push(group));
    groups.sort((a, b) => new Date(a.firstTimestamp) - new Date(b.firstTimestamp));
    
    return groups;
}

function createSearchContainer(group, groupIndex, showPages, showNotes, showAnnotations, showMetadata) {
    const container = document.createElement('div');
    container.className = 'search-group';
    container.dataset.groupIndex = groupIndex;
    
    // Create search header with toggle
    const searchHeader = document.createElement('div');
    searchHeader.className = 'search-header';
    
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-btn';
    toggleBtn.innerHTML = '▼';
    toggleBtn.onclick = () => toggleSearchGroup(groupIndex);
    
    const searchContent = document.createElement('div');
    searchContent.className = 'search-content';
    
    // Show first search timestamp
    const time = document.createElement('span');
    time.className = 'search-time';
    time.textContent = formatTime(group.firstTimestamp);
    
    const icon = document.createElement('span');
    icon.className = 'search-icon';
    icon.textContent = '🔍';
    
    const searchInfo = document.createElement('div');
    searchInfo.className = 'search-info';
    
    const query = document.createElement('div');
    query.className = 'search-query';
    query.textContent = `Search: "${group.query}"`;
    
    const details = document.createElement('div');
    details.className = 'search-details';
    details.textContent = `${group.engine} - ${group.domain}`;
    if (group.searches.length > 1) {
        details.textContent += ` (${group.searches.length} searches)`;
    }
    
    searchInfo.appendChild(query);
    searchInfo.appendChild(details);
    
    // Add notes from all searches in this group
    if (showNotes) {
        group.searches.forEach(search => {
            if (search.notes && search.notes.length > 0) {
                search.notes.forEach(note => {
                    const noteDiv = document.createElement('div');
                    noteDiv.className = 'event-note';
                    noteDiv.textContent = `Student note: ${note.content}`;
                    searchInfo.appendChild(noteDiv);
                });
            }
        });
    }
    
    // Add remove search button
    if (viewMode === 'teacher') {
        const searchActions = document.createElement('div');
        searchActions.className = 'search-actions';
        
        const removeSearchBtn = document.createElement('button');
        removeSearchBtn.className = 'remove-search-btn';
        removeSearchBtn.textContent = 'Remove Search & Pages';
        removeSearchBtn.onclick = () => removeSearchAndPages(groupIndex, group);
        searchActions.appendChild(removeSearchBtn);
        
        searchInfo.appendChild(searchActions);
    }
    
    // Add annotation options
    const searchId = `search-group-${groupIndex}`;
    const annotation = annotationData[searchId];
    
    if (showAnnotations && (viewMode === 'teacher' || annotation)) {
        if (annotation) {
            const annotationDiv = createAnnotationDisplay(annotation, searchId);
            searchInfo.appendChild(annotationDiv);
        }
        
        if (viewMode === 'teacher' && !annotation) {
            const addAnnotationBtn = document.createElement('button');
            addAnnotationBtn.className = 'add-annotation-btn';
            addAnnotationBtn.textContent = 'Add Annotation';
            addAnnotationBtn.onclick = function() { showAnnotationForm(searchId, group.searches[0], null, this); };
            searchInfo.appendChild(addAnnotationBtn);
        }
    }
    
    searchContent.appendChild(time);
    searchContent.appendChild(icon);
    searchContent.appendChild(searchInfo);
    
    searchHeader.appendChild(toggleBtn);
    searchHeader.appendChild(searchContent);
    container.appendChild(searchHeader);
    
    // Create pages container
    if (showPages && group.pages.length > 0) {
        const pagesContainer = document.createElement('div');
        pagesContainer.className = 'pages-container';
        pagesContainer.dataset.groupIndex = groupIndex;
        
        group.pages.forEach((page, pageIndex) => {
            const pageId = `page-${groupIndex}-${pageIndex}`;
            if (!removedPages.has(pageId)) {
                const pageItem = createPageItem(page, pageId, showNotes, showAnnotations, showMetadata);
                pagesContainer.appendChild(pageItem);
            }
        });
        
        container.appendChild(pagesContainer);
    }
    
    return container;
}

function createPageItem(page, pageId, showNotes, showAnnotations, showMetadata) {
    const item = document.createElement('div');
    item.className = 'page-item';
    
    const time = document.createElement('span');
    time.className = 'page-time';
    time.textContent = formatTime(page.timestamp);
    
    const icon = document.createElement('span');
    icon.className = 'page-icon';
    icon.textContent = '📄';
    
    const contentWrapper = document.createElement('div');
    contentWrapper.style.display = 'flex';
    contentWrapper.style.width = '100%';
    contentWrapper.style.alignItems = 'center';
    
    const content = document.createElement('div');
    content.className = 'page-content';
    
    const titleDiv = document.createElement('div');
    const title = document.createElement('span');
    title.className = 'page-title';
    
    // Check for edited metadata first
    const edited = editedMetadata[pageId];
    let pageTitle;
    
    if (edited && edited.title) {
        pageTitle = edited.title;
    } else {
        // Prefer metadata.title over top-level title as it's usually more accurate
        pageTitle = (page.metadata && page.metadata.title) || page.title;
    }
    
    // If no title available, show a cleaned-up version of the URL
    if (!pageTitle || pageTitle.trim() === '') {
        const url = new URL(page.url);
        // Remove common prefixes and clean up the path
        pageTitle = url.pathname.split('/').filter(p => p).pop() || url.hostname;
        pageTitle = pageTitle.replace(/[-_]/g, ' ').replace(/\.\w+$/, ''); // Remove file extensions
        pageTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1); // Capitalize
    }
    
    title.textContent = pageTitle;
    title.title = page.url; // Add URL as tooltip
    titleDiv.appendChild(title);
    
    // Add source type indicator
    if (page.metadata && viewMode === 'teacher') {
        const sourceType = assessSourceType(page);
        const typeBadge = document.createElement('span');
        typeBadge.className = `source-type type-${sourceType}`;
        typeBadge.textContent = getSourceTypeLabel(sourceType);
        titleDiv.appendChild(typeBadge);
    }
    
    const details = document.createElement('div');
    details.className = 'page-details';
    const domain = new URL(page.url).hostname;
    details.textContent = domain;
    
    content.appendChild(titleDiv);
    content.appendChild(details);
    
    // Add metadata section
    const hasOriginalMetadata = page.metadata && Object.keys(page.metadata).length > 0;
    const hasEditedMetadata = edited && Object.keys(edited).length > 0;
    
    if (showMetadata && (hasOriginalMetadata || hasEditedMetadata)) {
        const metadataSection = document.createElement('div');
        metadataSection.className = 'metadata-section';
        
        // Use edited metadata if available, otherwise use original
        const metadata = page.metadata || {};
        const author = (edited && edited.author) || metadata.author;
        const authors = (edited && edited.authors) || metadata.authors;
        const publishDate = (edited && edited.publishDate) || metadata.publishDate;
        const publisher = (edited && edited.publisher) || metadata.publisher;
        const contentType = (edited && edited.contentType) || metadata.contentType;
        
        // Academic identifiers
        const doi = (edited && edited.doi) || metadata.doi;
        const pmid = (edited && edited.pmid) || metadata.pmid;
        const arxivId = (edited && edited.arxivId) || metadata.arxivId;
        const citationKey = (edited && edited.citationKey) || metadata.citationKey;
        const journal = (edited && edited.journal) || metadata.journal;
        
        // Display author(s)
        if (author || authors) {
            const authorDiv = document.createElement('div');
            authorDiv.className = 'metadata-item';
            const authorText = authors ? authors.join(', ') : author;
            authorDiv.innerHTML = `<span class="metadata-label">Author${authors && authors.length > 1 ? 's' : ''}:</span><span class="metadata-value">${authorText}</span>`;
            metadataSection.appendChild(authorDiv);
        }
        
        if (publishDate) {
            const dateDiv = document.createElement('div');
            dateDiv.className = 'metadata-item';
            dateDiv.innerHTML = `<span class="metadata-label">Published:</span><span class="metadata-value">${publishDate}</span>`;
            metadataSection.appendChild(dateDiv);
        }
        
        if (publisher) {
            const publisherDiv = document.createElement('div');
            publisherDiv.className = 'metadata-item';
            publisherDiv.innerHTML = `<span class="metadata-label">Publisher:</span><span class="metadata-value">${publisher}</span>`;
            metadataSection.appendChild(publisherDiv);
        }
        
        if (journal) {
            const journalDiv = document.createElement('div');
            journalDiv.className = 'metadata-item';
            journalDiv.innerHTML = `<span class="metadata-label">Journal:</span><span class="metadata-value">${journal}</span>`;
            metadataSection.appendChild(journalDiv);
        }
        
        if (contentType) {
            const typeDiv = document.createElement('div');
            typeDiv.className = 'metadata-item';
            typeDiv.innerHTML = `<span class="metadata-label">Type:</span><span class="metadata-value">${contentType}</span>`;
            metadataSection.appendChild(typeDiv);
        }
        
        // Show citation identifiers
        if (doi || pmid || arxivId || citationKey) {
            const citationDiv = document.createElement('div');
            citationDiv.className = 'metadata-item citation-ids';
            let citationHtml = '<span class="metadata-label">IDs:</span><span class="metadata-value">';
            const ids = [];
            if (doi) ids.push(`DOI: ${doi}`);
            if (pmid) ids.push(`PMID: ${pmid}`);
            if (arxivId) ids.push(`arXiv: ${arxivId}`);
            if (citationKey && !doi && !pmid && !arxivId) ids.push(citationKey);
            citationHtml += ids.join(' | ') + '</span>';
            citationDiv.innerHTML = citationHtml;
            metadataSection.appendChild(citationDiv);
        }
        
        // Show extraction info in teacher mode
        if (viewMode === 'teacher' && metadata.extractorType) {
            const extractorDiv = document.createElement('div');
            extractorDiv.className = 'metadata-item extractor-info';
            extractorDiv.innerHTML = `<span class="metadata-label">Extracted:</span><span class="metadata-value">${metadata.extractorType}${metadata.extractorSite ? ' (' + metadata.extractorSite + ')' : ''}</span>`;
            metadataSection.appendChild(extractorDiv);
        }
        
        content.appendChild(metadataSection);
    }
    
    // Add notes
    if (showNotes && page.notes && page.notes.length > 0) {
        page.notes.forEach(note => {
            const noteDiv = document.createElement('div');
            noteDiv.className = 'event-note';
            noteDiv.textContent = `Student note: ${note.content}`;
            content.appendChild(noteDiv);
        });
    }
    
    // Add action buttons
    const actionButtons = document.createElement('div');
    actionButtons.className = 'page-actions';
    
    // Visit page button
    const visitBtn = document.createElement('button');
    visitBtn.className = 'visit-page-btn';
    visitBtn.textContent = 'Visit Page';
    visitBtn.onclick = () => window.open(page.url, '_blank');
    actionButtons.appendChild(visitBtn);
    
    // View cards button
    const viewCardsBtn = document.createElement('button');
    const cardCount = page.cards ? page.cards.length : 0;
    
    if (cardCount === 0) {
        viewCardsBtn.className = 'view-cards-btn disabled';
        viewCardsBtn.textContent = 'No Cards';
        viewCardsBtn.disabled = true;
    } else if (cardCount === 1) {
        viewCardsBtn.className = 'view-cards-btn';
        viewCardsBtn.textContent = 'View 1 Card';
        viewCardsBtn.onclick = () => viewCards(pageId, page);
    } else {
        viewCardsBtn.className = 'view-cards-btn';
        viewCardsBtn.textContent = `View ${cardCount} Cards`;
        viewCardsBtn.onclick = () => viewCards(pageId, page);
    }
    actionButtons.appendChild(viewCardsBtn);
    
    // Edit metadata button
    const editMetaBtn = document.createElement('button');
    editMetaBtn.className = 'edit-meta-btn';
    editMetaBtn.textContent = 'Edit Metadata';
    editMetaBtn.onclick = function() { showMetadataForm(pageId, page, this); };
    actionButtons.appendChild(editMetaBtn);
    
    // Remove button (teacher view only)
    if (viewMode === 'teacher') {
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-page-btn';
        removeBtn.textContent = 'Remove';
        removeBtn.onclick = () => removePage(pageId, page);
        actionButtons.appendChild(removeBtn);
    }
    
    // Don't append actionButtons to content anymore
    
    // Add annotations
    const annotation = annotationData[pageId];
    
    if (showAnnotations && (viewMode === 'teacher' || annotation)) {
        if (annotation) {
            const annotationDiv = createAnnotationDisplay(annotation, pageId);
            content.appendChild(annotationDiv);
        }
        
        if (viewMode === 'teacher' && !annotation) {
            const addAnnotationBtn = document.createElement('button');
            addAnnotationBtn.className = 'add-annotation-btn';
            addAnnotationBtn.textContent = 'Add Annotation';
            addAnnotationBtn.onclick = function() { showAnnotationForm(pageId, page, null, this); };
            content.appendChild(addAnnotationBtn);
        }
    }
    
    // Add content to wrapper
    contentWrapper.appendChild(content);
    contentWrapper.appendChild(actionButtons);
    
    // Check if content is too narrow and switch to vertical layout
    const checkLayout = () => {
        const contentWidth = content.offsetWidth;
        if (contentWidth < 400) {
            actionButtons.classList.add('vertical');
        } else {
            actionButtons.classList.remove('vertical');
        }
    };
    
    // Check layout after DOM updates
    setTimeout(checkLayout, 0);
    
    // Add resize observer to check layout on size changes
    if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(checkLayout);
        resizeObserver.observe(content);
    }
    
    item.appendChild(time);
    item.appendChild(icon);
    item.appendChild(contentWrapper);
    
    return item;
}

function toggleSearchGroup(groupIndex) {
    const container = document.querySelector(`.pages-container[data-group-index="${groupIndex}"]`);
    const toggleBtn = document.querySelector(`.search-group[data-group-index="${groupIndex}"] .toggle-btn`);
    
    if (container) {
        if (container.style.display === 'none') {
            container.style.display = 'block';
            toggleBtn.innerHTML = '▼';
        } else {
            container.style.display = 'none';
            toggleBtn.innerHTML = '▶';
        }
    }
}

function removePage(pageId, page) {
    // Get the page title, preferring metadata.title
    const pageTitle = (page.metadata && page.metadata.title) || page.title || 'this page';
    const confirmMessage = `Are you sure you want to remove "${pageTitle}" from view?\n\nThis won't delete the page from the original data, just hide it from this view.`;
    
    if (confirm(confirmMessage)) {
        removedPages.add(pageId);
        
        // Track action for undo
        lastAction = {
            type: 'removePage',
            pageId: pageId,
            pageData: page
        };
        enableUndoButton();
        
        // Save to localStorage
        if (sessionData && sessionData.id) {
            localStorage.setItem(`removed-pages-${sessionData.id}`, JSON.stringify(Array.from(removedPages)));
        }
        
        // Refresh timeline
        updateTimeline();
    }
}

function loadRemovedPages() {
    if (sessionData && sessionData.id) {
        const saved = localStorage.getItem(`removed-pages-${sessionData.id}`);
        if (saved) {
            removedPages = new Set(JSON.parse(saved));
        }
    }
}

function clearRemovedPages() {
    removedPages.clear();
    if (sessionData && sessionData.id) {
        localStorage.removeItem(`removed-pages-${sessionData.id}`);
    }
    updateTimeline();
}

function clearRemovedSearches() {
    removedSearches.clear();
    if (sessionData && sessionData.id) {
        localStorage.removeItem(`removed-searches-${sessionData.id}`);
    }
    updateTimeline();
}

function enableUndoButton() {
    const undoBtn = document.getElementById('undoBtn');
    if (undoBtn) {
        undoBtn.disabled = false;
        // Update button text to show what will be undone
        if (lastAction) {
            switch (lastAction.type) {
                case 'annotation':
                    undoBtn.textContent = 'Undo Annotation';
                    break;
                case 'deleteAnnotation':
                    undoBtn.textContent = 'Undo Delete';
                    break;
                case 'removePage':
                    undoBtn.textContent = 'Undo Remove';
                    break;
                case 'restoreAll':
                    undoBtn.textContent = 'Undo Restore';
                    break;
                case 'editMetadata':
                    undoBtn.textContent = 'Undo Edit';
                    break;
                case 'removeSearch':
                    undoBtn.textContent = 'Undo Remove Search';
                    break;
                case 'unlinkCard':
                    undoBtn.textContent = 'Undo Unlink';
                    break;
                default:
                    undoBtn.textContent = 'Undo';
            }
        }
    }
}

function disableUndoButton() {
    const undoBtn = document.getElementById('undoBtn');
    if (undoBtn) {
        undoBtn.disabled = true;
        undoBtn.textContent = 'Undo';
    }
}

function performUndo() {
    if (!lastAction) return;
    
    switch (lastAction.type) {
        case 'annotation':
            // Restore previous annotation state
            if (lastAction.previousValue) {
                annotationData[lastAction.eventId] = lastAction.previousValue;
            } else {
                delete annotationData[lastAction.eventId];
            }
            localStorage.setItem(`annotations-${sessionData.id}`, JSON.stringify(annotationData));
            break;
            
        case 'deleteAnnotation':
            // Restore deleted annotation
            if (lastAction.previousValue) {
                annotationData[lastAction.eventId] = lastAction.previousValue;
                localStorage.setItem(`annotations-${sessionData.id}`, JSON.stringify(annotationData));
            }
            break;
            
        case 'removePage':
            // Restore removed page
            removedPages.delete(lastAction.pageId);
            if (sessionData && sessionData.id) {
                localStorage.setItem(`removed-pages-${sessionData.id}`, JSON.stringify(Array.from(removedPages)));
            }
            break;
            
        case 'restoreAll':
            // Re-remove all previously removed pages and searches
            if (lastAction.previousRemovedPages) {
                removedPages = new Set(lastAction.previousRemovedPages);
                if (sessionData && sessionData.id) {
                    localStorage.setItem(`removed-pages-${sessionData.id}`, JSON.stringify(Array.from(removedPages)));
                }
            }
            if (lastAction.previousRemovedSearches) {
                removedSearches = new Set(lastAction.previousRemovedSearches);
                if (sessionData && sessionData.id) {
                    localStorage.setItem(`removed-searches-${sessionData.id}`, JSON.stringify(Array.from(removedSearches)));
                }
            }
            break;
            
        case 'editMetadata':
            // Restore previous metadata state
            if (lastAction.previousValue) {
                editedMetadata[lastAction.pageId] = lastAction.previousValue;
            } else {
                delete editedMetadata[lastAction.pageId];
            }
            if (sessionData && sessionData.id) {
                localStorage.setItem(`edited-metadata-${sessionData.id}`, JSON.stringify(editedMetadata));
            }
            break;
            
        case 'removeSearch':
            // Restore removed search
            removedSearches.delete(lastAction.searchKey);
            // Restore pages
            lastAction.removedPageIds.forEach(pageId => {
                removedPages.delete(pageId);
            });
            saveRemovedSearches();
            if (sessionData && sessionData.id) {
                localStorage.setItem(`removed-pages-${sessionData.id}`, JSON.stringify(Array.from(removedPages)));
            }
            break;
            
        case 'unlinkCard':
            // Restore the unlinked card to all affected pages
            lastAction.affectedPages.forEach(({page, pageId}) => {
                if (!page.cards) {
                    page.cards = [];
                }
                // Add the card back
                page.cards.push(lastAction.card);
                
                // Sort cards by score again to maintain order
                page.cards.sort((a, b) => b.matchScore - a.matchScore);
            });
            
            // If the cards modal is open for the primary page, refresh it
            const modal = document.getElementById('cardsModal');
            if (modal && modal.style.display === 'block' && lastAction.primaryPageId) {
                const primaryPage = lastAction.affectedPages.find(
                    ap => ap.pageId === lastAction.primaryPageId
                )?.page;
                if (primaryPage) {
                    showCardsModal(lastAction.primaryPageId, primaryPage);
                }
            }
            break;
    }
    
    lastAction = null;
    disableUndoButton();
    updateTimeline();
}

function restoreAllRemovedPages() {
    const pageCount = removedPages.size;
    const searchCount = removedSearches.size;
    
    if (pageCount === 0 && searchCount === 0) {
        alert('No items have been removed.');
        return;
    }
    
    let confirmMessage = 'Restore ';
    const items = [];
    if (pageCount > 0) {
        items.push(`${pageCount} page${pageCount > 1 ? 's' : ''}`);
    }
    if (searchCount > 0) {
        items.push(`${searchCount} search${searchCount > 1 ? 'es' : ''}`);
    }
    confirmMessage += items.join(' and ') + '?';
    
    if (confirm(confirmMessage)) {
        // Track action for undo (store all removed items)
        lastAction = {
            type: 'restoreAll',
            previousRemovedPages: new Set(removedPages),
            previousRemovedSearches: new Set(removedSearches)
        };
        enableUndoButton();
        
        clearRemovedPages();
        clearRemovedSearches();
    }
}

function showMetadataForm(pageId, page, buttonElement) {
    const form = document.createElement('div');
    form.className = 'metadata-form';
    
    const edited = editedMetadata[pageId] || {};
    const original = page.metadata || {};
    
    // Create two columns for better organization
    const formColumns = document.createElement('div');
    formColumns.className = 'metadata-form-columns';
    formColumns.style.display = 'grid';
    formColumns.style.gridTemplateColumns = '1fr 1fr';
    formColumns.style.gap = '15px';
    
    const leftColumn = document.createElement('div');
    const rightColumn = document.createElement('div');
    
    // Title field (full width)
    const titleGroup = document.createElement('div');
    titleGroup.className = 'form-group';
    titleGroup.style.gridColumn = 'span 2';
    titleGroup.innerHTML = '<label>Title:</label>';
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.className = 'metadata-input';
    titleInput.value = edited.title || original.title || page.title || '';
    titleInput.placeholder = 'Enter page title';
    titleGroup.appendChild(titleInput);
    
    // Author field
    const authorGroup = document.createElement('div');
    authorGroup.className = 'form-group';
    authorGroup.innerHTML = '<label>Author(s):</label>';
    const authorInput = document.createElement('input');
    authorInput.type = 'text';
    authorInput.className = 'metadata-input';
    // Handle authors array or single author
    const authorValue = edited.author || original.author || 
                       (original.authors ? original.authors.join(', ') : '') || '';
    authorInput.value = authorValue;
    authorInput.placeholder = 'Enter author name(s)';
    authorGroup.appendChild(authorInput);
    leftColumn.appendChild(authorGroup);
    
    // Publish date field
    const dateGroup = document.createElement('div');
    dateGroup.className = 'form-group';
    dateGroup.innerHTML = '<label>Publish Date:</label>';
    const dateInput = document.createElement('input');
    dateInput.type = 'text';
    dateInput.className = 'metadata-input';
    dateInput.value = edited.publishDate || original.publishDate || '';
    dateInput.placeholder = 'e.g., 2025-05-15';
    dateGroup.appendChild(dateInput);
    rightColumn.appendChild(dateGroup);
    
    // Publisher field
    const publisherGroup = document.createElement('div');
    publisherGroup.className = 'form-group';
    publisherGroup.innerHTML = '<label>Publisher:</label>';
    const publisherInput = document.createElement('input');
    publisherInput.type = 'text';
    publisherInput.className = 'metadata-input';
    publisherInput.value = edited.publisher || original.publisher || '';
    publisherInput.placeholder = 'Enter publisher name';
    publisherGroup.appendChild(publisherInput);
    leftColumn.appendChild(publisherGroup);
    
    // Journal field
    const journalGroup = document.createElement('div');
    journalGroup.className = 'form-group';
    journalGroup.innerHTML = '<label>Journal:</label>';
    const journalInput = document.createElement('input');
    journalInput.type = 'text';
    journalInput.className = 'metadata-input';
    journalInput.value = edited.journal || original.journal || '';
    journalInput.placeholder = 'Enter journal name';
    journalGroup.appendChild(journalInput);
    rightColumn.appendChild(journalGroup);
    
    // DOI field
    const doiGroup = document.createElement('div');
    doiGroup.className = 'form-group';
    doiGroup.innerHTML = '<label>DOI:</label>';
    const doiInput = document.createElement('input');
    doiInput.type = 'text';
    doiInput.className = 'metadata-input';
    doiInput.value = edited.doi || original.doi || '';
    doiInput.placeholder = '10.xxxx/xxxxx';
    doiGroup.appendChild(doiInput);
    leftColumn.appendChild(doiGroup);
    
    // Quals field (full width)
    const qualsGroup = document.createElement('div');
    qualsGroup.className = 'form-group';
    qualsGroup.style.gridColumn = 'span 2';
    qualsGroup.innerHTML = '<label>Quals:</label>';
    const qualsInput = document.createElement('textarea');
    qualsInput.className = 'metadata-input';
    qualsInput.value = edited.quals || original.quals || '';
    qualsInput.placeholder = 'Enter qualification information';
    qualsInput.rows = 3;
    qualsGroup.appendChild(qualsInput);
    
    // Content Type field
    const typeGroup = document.createElement('div');
    typeGroup.className = 'form-group';
    typeGroup.innerHTML = '<label>Content Type:</label>';
    const typeSelect = document.createElement('select');
    typeSelect.className = 'metadata-input';
    
    const typeOptions = [
        { value: '', label: '-- Select Type --' },
        { value: 'journal-article', label: 'Journal Article' },
        { value: 'preprint', label: 'Preprint' },
        { value: 'news-article', label: 'News Article' },
        { value: 'report', label: 'Report' },
        { value: 'book', label: 'Book' },
        { value: 'encyclopedia-article', label: 'Encyclopedia Article' },
        { value: 'social-media-post', label: 'Social Media Post' },
        { value: 'website', label: 'Website' },
        { value: 'other', label: 'Other' }
    ];
    
    typeOptions.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        if ((edited.contentType || original.contentType || '') === opt.value) {
            option.selected = true;
        }
        typeSelect.appendChild(option);
    });
    
    typeGroup.appendChild(typeSelect);
    rightColumn.appendChild(typeGroup);
    
    // Actions
    const actions = document.createElement('div');
    actions.className = 'metadata-actions';
    actions.style.gridColumn = 'span 2';
    actions.style.marginTop = '15px';
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-metadata-btn';
    saveBtn.textContent = 'Save';
    saveBtn.onclick = () => {
        const newMetadata = {
            title: titleInput.value.trim(),
            author: authorInput.value.trim(),
            publishDate: dateInput.value.trim(),
            publisher: publisherInput.value.trim(),
            journal: journalInput.value.trim(),
            doi: doiInput.value.trim(),
            quals: qualsInput.value.trim(),
            contentType: typeSelect.value
        };
        
        // Handle authors as array if multiple authors separated by commas
        if (newMetadata.author && newMetadata.author.includes(',')) {
            newMetadata.authors = newMetadata.author.split(',').map(a => a.trim());
        }
        
        // Mark as manually edited
        newMetadata.manuallyEdited = true;
        newMetadata.editTimestamp = new Date().toISOString();
        
        // Remove empty fields
        Object.keys(newMetadata).forEach(key => {
            if (!newMetadata[key]) delete newMetadata[key];
        });
        
        saveMetadata(pageId, newMetadata, page);
        form.remove();
    };
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-metadata-btn';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => {
        form.remove();
        updateTimeline();
    };
    
    actions.appendChild(saveBtn);
    actions.appendChild(cancelBtn);
    
    // Assemble form
    form.appendChild(titleGroup);
    formColumns.appendChild(leftColumn);
    formColumns.appendChild(rightColumn);
    form.appendChild(formColumns);
    form.appendChild(qualsGroup);
    form.appendChild(actions);
    
    // Show original extraction info if available
    if (original.extractorType) {
        const infoDiv = document.createElement('div');
        infoDiv.className = 'metadata-info';
        infoDiv.style.fontSize = '0.85em';
        infoDiv.style.color = '#666';
        infoDiv.style.marginTop = '10px';
        infoDiv.textContent = `Originally extracted via ${original.extractorType}${original.extractorSite ? ' from ' + original.extractorSite : ''}`;
        form.appendChild(infoDiv);
    }
    
    // Replace button with form
    buttonElement.replaceWith(form);
}

function saveMetadata(pageId, metadata, page) {
    // Save previous state for undo
    const previousMetadata = editedMetadata[pageId] ? { ...editedMetadata[pageId] } : null;
    
    if (Object.keys(metadata).length > 0) {
        editedMetadata[pageId] = metadata;
    } else {
        delete editedMetadata[pageId];
    }
    
    // Track action for undo
    lastAction = {
        type: 'editMetadata',
        pageId: pageId,
        previousValue: previousMetadata,
        newValue: metadata
    };
    enableUndoButton();
    
    // Save to localStorage
    if (sessionData && sessionData.id) {
        localStorage.setItem(`edited-metadata-${sessionData.id}`, JSON.stringify(editedMetadata));
    }
    
    // Refresh timeline
    updateTimeline();
}

function loadEditedMetadata() {
    if (sessionData && sessionData.id) {
        const saved = localStorage.getItem(`edited-metadata-${sessionData.id}`);
        if (saved) {
            editedMetadata = JSON.parse(saved);
        }
    }
}

function expandAll() {
    document.querySelectorAll('.pages-container').forEach(container => {
        container.style.display = 'block';
    });
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.innerHTML = '▼';
    });
}

function collapseAll() {
    document.querySelectorAll('.pages-container').forEach(container => {
        container.style.display = 'none';
    });
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.innerHTML = '▶';
    });
}

function removeSearchAndPages(groupIndex, group) {
    const searchCount = group.searches.length;
    const pageCount = group.pages.length;
    const confirmMessage = `Remove ${searchCount} search${searchCount > 1 ? 'es' : ''} and ${pageCount} associated page${pageCount > 1 ? 's' : ''}?\n\nThis will hide the entire search group from view.`;
    
    if (confirm(confirmMessage)) {
        // Mark this search group as removed
        const searchKey = `${group.engine}-${group.query}`;
        removedSearches.add(searchKey);
        
        // Also remove all pages in this group
        group.pages.forEach((page, pageIndex) => {
            const pageId = `page-${groupIndex}-${pageIndex}`;
            removedPages.add(pageId);
        });
        
        // Track for undo
        lastAction = {
            type: 'removeSearch',
            searchKey: searchKey,
            groupData: group,
            removedPageIds: group.pages.map((page, pageIndex) => `page-${groupIndex}-${pageIndex}`)
        };
        enableUndoButton();
        
        // Save to localStorage
        saveRemovedSearches();
        if (sessionData && sessionData.id) {
            localStorage.setItem(`removed-pages-${sessionData.id}`, JSON.stringify(Array.from(removedPages)));
        }
        
        // Refresh timeline
        updateTimeline();
    }
}

function saveRemovedSearches() {
    if (sessionData && sessionData.id) {
        localStorage.setItem(`removed-searches-${sessionData.id}`, JSON.stringify(Array.from(removedSearches)));
    }
}

function loadRemovedSearches() {
    if (sessionData && sessionData.id) {
        const saved = localStorage.getItem(`removed-searches-${sessionData.id}`);
        if (saved) {
            removedSearches = new Set(JSON.parse(saved));
        }
    }
}

function exportModifiedData() {
    // Create a deep copy of the session data
    const modifiedData = JSON.parse(JSON.stringify(sessionData));
    
    // Apply metadata edits
    modifiedData.contentPages.forEach((page, index) => {
        const pageId = page.sourceSearch ? 
            `page-${getGroupIndex(page.sourceSearch)}-${getPageIndexInGroup(page, index)}` : 
            `orphan-${index}`;
        
        if (editedMetadata[pageId]) {
            if (!page.metadata) page.metadata = {};
            Object.assign(page.metadata, editedMetadata[pageId]);
            
            // Also update top-level title if edited
            if (editedMetadata[pageId].title) {
                page.title = editedMetadata[pageId].title;
            }
        }
    });
    
    // Remove filtered searches and their pages
    modifiedData.searches = modifiedData.searches.filter(search => {
        const key = `${search.engine}-${search.query}`;
        return !removedSearches.has(key);
    });
    
    // Remove individually removed pages and pages from removed searches
    modifiedData.contentPages = modifiedData.contentPages.filter((page, index) => {
        // Check if page's search was removed
        if (page.sourceSearch) {
            const searchKey = `${page.sourceSearch.engine}-${page.sourceSearch.query}`;
            if (removedSearches.has(searchKey)) return false;
        }
        
        // Check if page was individually removed
        const pageId = page.sourceSearch ? 
            `page-${getGroupIndex(page.sourceSearch)}-${getPageIndexInGroup(page, index)}` : 
            `orphan-${index}`;
        return !removedPages.has(pageId);
    });
    
    // Rebuild chronological events
    modifiedData.chronologicalEvents = [
        ...modifiedData.searches,
        ...modifiedData.contentPages
    ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Add teacher annotations as a new field
    modifiedData.teacherAnnotations = annotationData;
    
    // Export the modified data
    const blob = new Blob([JSON.stringify(modifiedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modified-${sessionData.name.replace(/[^a-z0-9]/gi, '_')}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Helper function to get group index for a search
function getGroupIndex(sourceSearch) {
    const groups = groupSearchesAndPages();
    const key = `${sourceSearch.engine}-${sourceSearch.query}`;
    return groups.findIndex(group => `${group.engine}-${group.query}` === key);
}

// Helper function to get page index within its group
function getPageIndexInGroup(page, originalIndex) {
    const groups = groupSearchesAndPages();
    if (page.sourceSearch) {
        const key = `${page.sourceSearch.engine}-${page.sourceSearch.query}`;
        const group = groups.find(g => `${g.engine}-${g.query}` === key);
        if (group) {
            return group.pages.findIndex(p => p.originalIndex === originalIndex);
        }
    }
    return originalIndex;
}

// Global variable to store parsed sections and cards
let parsedSections = [];
let parsedCards = [];

// Function to parse DOCX file
async function parseDOCXFile(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        
        // Use mammoth to convert DOCX to HTML
        const result = await mammoth.convertToHtml({
            arrayBuffer: arrayBuffer
        });
        
        // Parse the HTML to extract sections
        const parser = new DOMParser();
        const doc = parser.parseFromString(result.value, 'text/html');
        
        // Reset parsed sections and cards
        parsedSections = [];
        parsedCards = [];
        
        // Find all headers (h1, h2, h3, h4)
        const headers = doc.querySelectorAll('h1, h2, h3, h4');
        
        headers.forEach((header, index) => {
            const level = parseInt(header.tagName[1]);
            const headerText = header.textContent.trim();
            
            // Get all content between this header and the next header
            let content = [];
            let currentElement = header.nextElementSibling;
            
            while (currentElement && !['H1', 'H2', 'H3', 'H4'].includes(currentElement.tagName)) {
                content.push(currentElement.outerHTML);
                currentElement = currentElement.nextElementSibling;
            }
            
            const section = {
                level: level,
                header: headerText,
                content: content.join(''),
                contentText: content.map(html => {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = html;
                    return tempDiv.textContent || tempDiv.innerText || '';
                }).join(' '),
                index: index
            };
            
            parsedSections.push(section);
            
            // If this is a level 4 header, it's a card
            if (level === 4) {
                parsedCards.push(section);
            }
        });
        
        // Update the UI
        updateParsedSectionsUI();
        
        // Match cards to pages if session data exists
        if (sessionData) {
            matchCardsToPages();
        }
        
    } catch (error) {
        console.error('Error parsing DOCX file:', error);
        alert('Error parsing DOCX file. Please ensure it is a valid .docx file.');
    }
}

// Function to update the parsed sections UI
function updateParsedSectionsUI() {
    const link = document.getElementById('parsedSectionsLink');
    const sectionCount = parsedSections.length;
    
    if (sectionCount > 0) {
        link.textContent = `Parsed ${sectionCount} Section${sectionCount !== 1 ? 's' : ''}`;
        link.classList.remove('hidden');
    } else {
        link.classList.add('hidden');
    }
}

// Function to show parsed sections modal
function showParsedSectionsModal() {
    const modal = document.getElementById('sectionsModal');
    const sectionsList = document.getElementById('sectionsList');
    
    // Clear existing content
    sectionsList.innerHTML = '';
    
    // Populate sections
    parsedSections.forEach(section => {
        const li = document.createElement('li');
        li.className = `section-item section-level-${section.level}`;
        li.innerHTML = `<div class="section-header">${section.header}</div>`;
        sectionsList.appendChild(li);
    });
    
    modal.style.display = 'block';
}

// Set up modal event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Parsed sections link click handler
    document.getElementById('parsedSectionsLink').addEventListener('click', function(e) {
        e.preventDefault();
        showParsedSectionsModal();
    });
    
    // Modal close button
    document.querySelector('.close-modal').addEventListener('click', function() {
        document.getElementById('sectionsModal').style.display = 'none';
    });
    
    // Click outside modal to close
    document.getElementById('sectionsModal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });
});

// Function to calculate position-weighted match score
function calculateMatchScore(text, searchTerms, positionWeight = true) {
    if (!text || !searchTerms || searchTerms.length === 0) return 0;
    
    const lowerText = text.toLowerCase();
    const textLength = lowerText.length;
    let totalScore = 0;
    
    searchTerms.forEach(term => {
        if (!term) return;
        const lowerTerm = term.toLowerCase();
        let position = lowerText.indexOf(lowerTerm);
        
        if (position !== -1) {
            // Base score for finding the term
            let score = 1;
            
            if (positionWeight) {
                // Weight based on position - earlier matches get higher scores
                // Score decreases linearly from 2.0 at position 0 to 0.5 at end
                const positionFactor = 2.0 - (1.5 * (position / textLength));
                score *= positionFactor;
            }
            
            totalScore += score;
        }
    });
    
    return totalScore;
}

// Function to match cards to pages
function matchCardsToPages() {
    if (!sessionData || !sessionData.contentPages || parsedCards.length === 0) return;
    
    console.log('Matching cards to pages...', parsedCards.length, 'cards,', sessionData.contentPages.length, 'pages');
    
    // Reset all page cards
    sessionData.contentPages.forEach(page => {
        page.cards = [];
    });
    
    // Create a map to track which cards have been assigned
    const cardAssignments = new Map(); // cardIndex -> {pageIndex, score}
    
    // For each card, find the best matching pages
    parsedCards.forEach((card, cardIndex) => {
        const cardText = card.contentText;
        const cardHeader = card.header;
        
        if (cardIndex === 0) {
            console.log('Sample card text (first 200 chars):', cardText.substring(0, 200));
        }
        
        // Score each page
        const pageScores = sessionData.contentPages.map((page, pageIndex) => {
            let score = 0;
            const matchDetails = {
                urlMatch: false,
                titleMatch: false,
                authorMatch: false,
                dateMatch: false,
                publicationMatch: false
            };
            
            // Get page metadata
            const edited = editedMetadata[`page-${pageIndex}-0`] || {};
            const metadata = page.metadata || {};
            const pageTitle = edited.title || metadata.title || page.title || '';
            const pageUrl = page.url || '';
            const author = edited.author || metadata.author || '';
            const authors = edited.authors || metadata.authors || [];
            const publishDate = edited.publishDate || metadata.publishDate || '';
            const publisher = edited.publisher || metadata.publisher || '';
            const journal = edited.journal || metadata.journal || '';
            
            if (cardIndex === 0 && pageIndex === 0) {
                console.log('Sample page metadata:', {
                    title: pageTitle,
                    url: pageUrl,
                    author: author,
                    authors: authors,
                    publishDate: publishDate,
                    publisher: publisher,
                    journal: journal
                });
            }
            
            // Check URL match (highest priority)
            if (pageUrl) {
                const urlParts = pageUrl.split(/[\/\-\._?#&=]/).filter(p => p.length > 3);
                const urlScore = calculateMatchScore(cardText, urlParts);
                if (urlScore > 0) {
                    score += urlScore * 3; // Triple weight for URL matches
                    matchDetails.urlMatch = true;
                }
            }
            
            // Check title match (high priority)
            if (pageTitle) {
                const titleWords = pageTitle.split(/\s+/).filter(w => w.length > 3);
                const titleScore = calculateMatchScore(cardText, titleWords);
                if (titleScore > 0) {
                    score += titleScore * 2; // Double weight for title matches
                    matchDetails.titleMatch = true;
                }
            }
            
            // Check author match
            const allAuthors = [author, ...authors].filter(a => a);
            if (allAuthors.length > 0) {
                const authorScore = calculateMatchScore(cardText, allAuthors);
                if (authorScore > 0) {
                    score += authorScore;
                    matchDetails.authorMatch = true;
                }
            }
            
            // Check date match
            if (publishDate) {
                const dateVariations = [
                    publishDate,
                    publishDate.replace(/-/g, '/'),
                    publishDate.replace(/-/g, ' ')
                ];
                const dateScore = calculateMatchScore(cardText, dateVariations);
                if (dateScore > 0) {
                    score += dateScore;
                    matchDetails.dateMatch = true;
                }
            }
            
            // Check publication match (publisher or journal)
            const publications = [publisher, journal].filter(p => p);
            if (publications.length > 0) {
                const pubScore = calculateMatchScore(cardText, publications);
                if (pubScore > 0) {
                    score += pubScore;
                    matchDetails.publicationMatch = true;
                }
            }
            
            // Bonus if author + date + publication all match
            if (matchDetails.authorMatch && matchDetails.dateMatch && matchDetails.publicationMatch) {
                score += 2;
            }
            
            return {
                pageIndex: pageIndex,
                page: page,
                score: score,
                matchDetails: matchDetails
            };
        });
        
        // Sort by score and get matches above threshold
        const threshold = 1.5; // Minimum score to consider a match
        const validMatches = pageScores
            .filter(ps => ps.score >= threshold)
            .sort((a, b) => b.score - a.score);
        
        if (validMatches.length > 0) {
            // Find the best match
            const bestMatch = validMatches[0];
            
            // Check if this card was already assigned to a different page
            const existingAssignment = cardAssignments.get(cardIndex);
            
            if (!existingAssignment || existingAssignment.score < bestMatch.score) {
                // This is a better match, update assignment
                cardAssignments.set(cardIndex, {
                    pageIndex: bestMatch.pageIndex,
                    score: bestMatch.score,
                    page: bestMatch.page,
                    matchDetails: bestMatch.matchDetails
                });
            }
        }
    });
    
    // Now assign cards to pages based on the best matches
    cardAssignments.forEach((assignment, cardIndex) => {
        const card = parsedCards[cardIndex];
        const page = assignment.page;
        
        if (!page.cards) {
            page.cards = [];
        }
        
        page.cards.push({
            header: card.header,
            content: card.content,
            contentText: card.contentText,
            matchScore: assignment.score,
            matchDetails: assignment.matchDetails,
            cardIndex: cardIndex // Store for potential unlinking
        });
    });
    
    // Group pages by URL to handle same-URL pages
    const pagesByUrl = new Map();
    sessionData.contentPages.forEach((page, index) => {
        const url = page.url;
        if (!pagesByUrl.has(url)) {
            pagesByUrl.set(url, []);
        }
        pagesByUrl.get(url).push({page, index});
    });
    
    // For pages with the same URL, ensure they have the same cards
    pagesByUrl.forEach((pages, url) => {
        if (pages.length > 1) {
            // Combine all cards from all pages with this URL
            const allCards = [];
            pages.forEach(({page}) => {
                if (page.cards) {
                    allCards.push(...page.cards);
                }
            });
            
            // Remove duplicates based on cardIndex
            const uniqueCards = Array.from(
                new Map(allCards.map(card => [card.cardIndex, card])).values()
            );
            
            // Assign the same cards to all pages with this URL
            pages.forEach(({page}) => {
                page.cards = [...uniqueCards];
            });
        }
    });
    
    // Apply quality filtering - if a page has very high matches, remove low quality ones
    sessionData.contentPages.forEach(page => {
        if (page.cards && page.cards.length > 0) {
            const maxScore = Math.max(...page.cards.map(c => c.matchScore));
            
            // If there's an extremely good match (>80), filter out weak matches
            if (maxScore > 80) {
                const threshold = maxScore * 0.7; // Keep only matches within 70% of the best
                page.cards = page.cards.filter(card => card.matchScore >= threshold);
            }
        }
    });
    
    // Log matching results
    let totalMatches = 0;
    sessionData.contentPages.forEach(page => {
        if (page.cards && page.cards.length > 0) {
            totalMatches += page.cards.length;
        }
    });
    console.log('Card matching complete. Total matches:', totalMatches);
    
    // Update the timeline to reflect card counts
    updateTimeline();
}

// Function to view cards associated with a page
function viewCards(pageId, page) {
    if (!page.cards || page.cards.length === 0) {
        alert('No cards matched to this page.');
        return;
    }
    
    // Create and show modal with cards
    showCardsModal(pageId, page);
}

// Function to show cards modal
function showCardsModal(pageId, page) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('cardsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'cardsModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content cards-modal-content">
                <div class="modal-header">
                    <h3>Cards from: <span id="cardsPageTitle"></span></h3>
                    <button class="close-modal" onclick="document.getElementById('cardsModal').style.display='none'">&times;</button>
                </div>
                <div class="cards-modal-body">
                    <nav class="cards-nav">
                        <h4>Sections</h4>
                        <ul id="cardsNavList"></ul>
                    </nav>
                    <div id="cardsContent" class="cards-content-area"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Click outside to close
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // Update modal content
    const pageTitle = (page.metadata && page.metadata.title) || page.title || 'Unknown Page';
    document.getElementById('cardsPageTitle').textContent = pageTitle;
    
    const cardsContent = document.getElementById('cardsContent');
    cardsContent.innerHTML = '';
    
    // Sort cards by match score (highest first)
    const sortedCards = page.cards.slice().sort(function(a, b) { return b.matchScore - a.matchScore; });
    
    // Build navigation list
    const navList = document.getElementById('cardsNavList');
    navList.innerHTML = '';
    
    sortedCards.forEach((card, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card-item';
        cardDiv.id = `card-${index}`;
        
        // Add to navigation
        const navItem = document.createElement('li');
        navItem.className = 'cards-nav-item';
        navItem.innerHTML = `<a href="#card-${index}" onclick="document.getElementById('card-${index}').scrollIntoView({behavior: 'smooth', block: 'start'}); return false;">${card.header}</a>`;
        navList.appendChild(navItem);
        
        // Create match details string
        const matchTypes = [];
        if (card.matchDetails.urlMatch) matchTypes.push('URL');
        if (card.matchDetails.titleMatch) matchTypes.push('Title');
        if (card.matchDetails.authorMatch) matchTypes.push('Author');
        if (card.matchDetails.dateMatch) matchTypes.push('Date');
        if (card.matchDetails.publicationMatch) matchTypes.push('Publication');
        
        cardDiv.innerHTML = `
            <div class="card-header">
                <h4>${card.header}</h4>
                <div class="match-info">
                    <span class="match-score">Score: ${card.matchScore.toFixed(2)}</span>
                    <span class="match-types">Matched: ${matchTypes.join(', ')}</span>
                    <button class="unlink-card-btn" onclick="unlinkCard('${pageId}', ${index})">Unlink</button>
                </div>
            </div>
            <div class="card-content">${card.content}</div>
        `;
        
        cardsContent.appendChild(cardDiv);
    });
    
    modal.style.display = 'block';
}

// Function to unlink a card from a page
function unlinkCard(pageId, cardIndexInPage) {
    // Find the page
    let targetPage = null;
    
    // Check if it's an orphaned page
    if (pageId.startsWith('orphan-')) {
        const orphanIndex = parseInt(pageId.split('-')[1]);
        targetPage = sessionData.contentPages.filter(p => !p.sourceSearch)[orphanIndex];
    } else {
        // It's a grouped page
        const [_, groupIndex, pageIndex] = pageId.split('-').map(Number);
        const groups = groupSearchesAndPages();
        if (groups[groupIndex] && groups[groupIndex].pages[pageIndex]) {
            targetPage = groups[groupIndex].pages[pageIndex];
        }
    }
    
    if (targetPage && targetPage.cards && targetPage.cards[cardIndexInPage]) {
        // Store the card data for undo
        const removedCard = targetPage.cards[cardIndexInPage];
        const affectedPages = [];
        
        // Remove the card from the target page
        targetPage.cards.splice(cardIndexInPage, 1);
        affectedPages.push({
            page: targetPage,
            pageId: pageId
        });
        
        // If this page shares a URL with other pages, update them too
        const pageUrl = targetPage.url;
        sessionData.contentPages.forEach((page, idx) => {
            if (page !== targetPage && page.url === pageUrl && page.cards) {
                // Find and remove the same card from pages with the same URL
                const cardIndex = page.cards.findIndex(c => 
                    c.cardIndex === removedCard.cardIndex
                );
                if (cardIndex !== -1) {
                    page.cards.splice(cardIndex, 1);
                    
                    // Determine the pageId for this page
                    let thisPageId;
                    if (!page.sourceSearch) {
                        const orphanIndex = sessionData.contentPages.filter(p => !p.sourceSearch).indexOf(page);
                        thisPageId = `orphan-${orphanIndex}`;
                    } else {
                        // Find this page in the grouped structure
                        const groups = groupSearchesAndPages();
                        for (let gIdx = 0; gIdx < groups.length; gIdx++) {
                            const pIdx = groups[gIdx].pages.indexOf(page);
                            if (pIdx !== -1) {
                                thisPageId = `page-${gIdx}-${pIdx}`;
                                break;
                            }
                        }
                    }
                    
                    if (thisPageId) {
                        affectedPages.push({
                            page: page,
                            pageId: thisPageId
                        });
                    }
                }
            }
        });
        
        // Track action for undo
        lastAction = {
            type: 'unlinkCard',
            card: removedCard,
            affectedPages: affectedPages,
            primaryPageId: pageId
        };
        enableUndoButton();
        
        // Update the modal
        showCardsModal(pageId, targetPage);
        
        // Update the timeline to reflect the change
        updateTimeline();
    }
}

// Font management functions
function setFont(fontType) {
    const root = document.documentElement;
    
    // Update CSS variable based on font type
    switch(fontType) {
        case 'sans-serif':
            root.style.setProperty('--font-family', 'var(--font-sans-serif)');
            break;
        case 'serif':
            root.style.setProperty('--font-family', 'var(--font-serif)');
            break;
        case 'monospace':
            root.style.setProperty('--font-family', 'var(--font-monospace)');
            break;
        case 'dyslexia':
            root.style.setProperty('--font-family', 'var(--font-dyslexia)');
            break;
        default:
            root.style.setProperty('--font-family', 'var(--font-sans-serif)');
    }
    
    // Update active button
    document.querySelectorAll('.font-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-font="${fontType}"]`).classList.add('active');
    
    // Save preference
    localStorage.setItem('selectedFont', fontType);
}

function loadSavedFont() {
    const savedFont = localStorage.getItem('selectedFont') || 'sans-serif';
    setFont(savedFont);
}