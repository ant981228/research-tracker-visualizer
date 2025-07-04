let sessionData = null;
let viewMode = 'teacher'; // Always teacher view
let commentData = {};
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
    document.getElementById('showComments').addEventListener('change', updateTimeline);
    
    // Export buttons
    document.getElementById('exportComments').addEventListener('click', exportComments);
    document.getElementById('exportModified').addEventListener('click', exportModifiedData);
    
    // Expand/Collapse buttons
    document.getElementById('expandAll').addEventListener('click', expandAll);
    document.getElementById('collapseAll').addEventListener('click', collapseAll);
    
    // Undo and restore buttons
    document.getElementById('undoBtn').addEventListener('click', performUndo);
    document.getElementById('restorePages').addEventListener('click', restoreAllRemovedPages);
    
    // Sidebar toggle
    document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
    
    // Font selector buttons
    document.querySelectorAll('.font-btn').forEach(function(button) {
        button.addEventListener('click', function() {
            setFont(this.dataset.font);
        });
    });
    
    // Load saved data from localStorage
    loadSavedComments();
    loadRemovedPages();
    loadRemovedSearches();
    loadEditedMetadata();
    loadSavedFont();
    loadSavedSidebarState();
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
    commentData = {};
    editedMetadata = {};
    
    // Load teacher comments from imported JSON if available
    if (sessionData.teacherComments) {
        commentData = { ...sessionData.teacherComments };
        console.log('Loaded teacher comments from JSON:', Object.keys(commentData).length, 'comments');
    }
    
    // Load saved data for this session (this will override JSON comments if localStorage has newer data)
    loadSavedComments();
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
    const showComments = document.getElementById('showComments').checked;
    
    const timelineContent = document.getElementById('timelineContent');
    timelineContent.innerHTML = '';
    
    // Group searches and their related pages
    const searchGroups = groupSearchesAndPages();
    
    // Create timeline items for each search group
    searchGroups.forEach((group, groupIndex) => {
        const searchContainer = createSearchContainer(group, groupIndex, showPages, showNotes, showComments, showMetadata);
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
            const pageItem = createPageItem(page, pageId, showNotes, showComments, showMetadata);
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
    const comment = commentData[eventId];
    
    if (comment) {
        item.classList.add('has-comment');
        if (comment.quality === 'excellent') {
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
                noteDiv.textContent = `Note: ${note.content}`;
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
                noteDiv.textContent = `Note: ${note.content}`;
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
    
    // Add comment section
    const showComments = document.getElementById('showComments').checked;
    if (showComments && (viewMode === 'teacher' || comment)) {
        if (comment) {
            const commentDiv = createCommentDisplay(comment, eventId);
            content.appendChild(commentDiv);
        }
        
        if (viewMode === 'teacher' && !comment) {
            const addCommentBtn = document.createElement('button');
            addCommentBtn.className = 'add-comment-btn';
            addCommentBtn.textContent = 'Add Comment';
            addCommentBtn.onclick = () => showCommentForm(eventId, event);
            content.appendChild(addCommentBtn);
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
    const statsContent = document.getElementById('statsContent');
    statsContent.innerHTML = '';
    
    // Session duration
    const durationCard = createStatCard('Session Duration', calculateDuration(), 'minutes');
    statsContent.appendChild(durationCard);
    
    // Total events
    const totalEvents = sessionData.chronologicalEvents.length;
    const eventsCard = createStatCard('Total Events', totalEvents, 'events');
    statsContent.appendChild(eventsCard);
    
    // Average pages per search
    // Group searches by query and engine to deduplicate
    const searchGroups = new Map();
    sessionData.searches.forEach(search => {
        const key = `${search.engine}-${search.query}`;
        if (!searchGroups.has(key)) {
            searchGroups.set(key, true);
        }
    });
    const totalUniqueSearches = searchGroups.size;
    
    // Count only pages associated with searches (exclude direct visits, filtered pages, and removed pages)
    const groups = groupSearchesAndPages();
    let pagesFromSearches = 0;
    
    // Count pages from search groups that aren't filtered or removed
    groups.forEach((group, groupIndex) => {
        group.pages.forEach((page, pageIndex) => {
            const pageId = `page-${groupIndex}-${pageIndex}`;
            if (!removedPages.has(pageId)) {
                pagesFromSearches++;
            }
        });
    });
    
    const avgPages = totalUniqueSearches > 0 ? (pagesFromSearches / totalUniqueSearches).toFixed(1) : 0;
    const avgPagesCard = createStatCard('Average Pages per Search', avgPages, 'pages');
    statsContent.appendChild(avgPagesCard);
    
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
    const sourceTypesCard = createSourceTypesChart();
    statsContent.appendChild(sourceTypesCard);
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
    // Count source types
    var sourceTypes = {};
    sessionData.contentPages.forEach(function(page) {
        if (!shouldFilterPage(page)) {
            var sourceType = assessSourceType(page);
            var label = getSourceTypeLabel(sourceType);
            sourceTypes[label] = (sourceTypes[label] || 0) + 1;
        }
    });
    
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
    
    // Apply the complete conic-gradient to the pie chart
    pieChart.style.background = 'conic-gradient(' + gradientParts.join(', ') + ')';
    
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
        // Adjust for CSS conic-gradient starting point (top)
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

// Text utility functions
function isTextContent(content) {
    if (!content || typeof content !== 'string') {
        return false;
    }
    
    // Check if content looks like image data
    if (content.startsWith('data:image/') || content.startsWith('data:video/') || 
        content.startsWith('data:audio/') || content.startsWith('data:application/pdf')) {
        return false;
    }
    
    // Check if content is mostly binary data (has many non-printable characters)
    const printableRegex = /[\x20-\x7E\s]/;
    const printableChars = content.split('').filter(char => printableRegex.test(char)).length;
    const printableRatio = printableChars / content.length;
    
    return printableRatio > 0.8; // At least 80% printable characters
}

function truncateText(text, maxLength = 150) {
    if (!text || typeof text !== 'string') {
        return '';
    }
    
    // Only show text content
    if (!isTextContent(text)) {
        return '[Non-text content]';
    }
    
    if (text.length <= maxLength) {
        return text;
    }
    
    // Try to truncate at word boundary
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.8) {
        return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated + '...';
}

function createExpandableText(text, maxLength = 150) {
    if (!text || typeof text !== 'string') {
        return document.createTextNode('');
    }
    
    if (!isTextContent(text)) {
        const span = document.createElement('span');
        span.textContent = '[Non-text content]';
        span.className = 'non-text-content';
        return span;
    }
    
    if (text.length <= maxLength) {
        return document.createTextNode(text);
    }
    
    const container = document.createElement('span');
    container.className = 'expandable-text';
    
    const truncated = truncateText(text, maxLength);
    const truncatedSpan = document.createElement('span');
    truncatedSpan.textContent = truncated;
    
    const expandBtn = document.createElement('button');
    expandBtn.className = 'expand-text-btn';
    expandBtn.textContent = 'Show more';
    expandBtn.onclick = function() {
        if (truncatedSpan.textContent === truncated) {
            truncatedSpan.textContent = text;
            expandBtn.textContent = 'Show less';
        } else {
            truncatedSpan.textContent = truncated;
            expandBtn.textContent = 'Show more';
        }
    };
    
    container.appendChild(truncatedSpan);
    container.appendChild(document.createTextNode(' '));
    container.appendChild(expandBtn);
    
    return container;
}

// Comment functions
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
        domain.includes('ft.com') || domain.includes('nationalreview.com') || 
        domain.includes('vox.com')) {
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

function createCommentDisplay(comment, eventId) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'teacher-comment';
    
    const header = document.createElement('div');
    header.className = 'comment-header';
    
    const label = document.createElement('div');
    label.className = 'comment-label';
    label.textContent = 'Comment:';
    header.appendChild(label);
    
    if (viewMode === 'teacher') {
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-comment-btn';
        editBtn.textContent = 'Edit';
        editBtn.onclick = function() { showCommentForm(eventId, null, comment, this); };
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-comment-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteComment(eventId);
        
        buttonContainer.appendChild(editBtn);
        buttonContainer.appendChild(deleteBtn);
        header.appendChild(buttonContainer);
    }
    
    const content = document.createElement('div');
    content.className = 'comment-content';
    
    const commentElement = createExpandableText(comment.content, 150);
    if (commentElement.nodeType === Node.TEXT_NODE) {
        content.textContent = comment.content;
    } else {
        content.appendChild(commentElement);
    }
    
    commentDiv.appendChild(header);
    commentDiv.appendChild(content);
    
    return commentDiv;
}

function showCommentForm(eventId, event, existingComment = null, buttonElement = null) {
    const form = document.createElement('div');
    form.className = 'comment-form';
    form.id = `comment-form-${eventId}`;
    
    const textarea = document.createElement('textarea');
    textarea.className = 'comment-textarea';
    textarea.placeholder = 'Enter your comment here...';
    if (existingComment) {
        textarea.value = existingComment.content;
    }
    
    const actions = document.createElement('div');
    actions.className = 'comment-actions';
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-comment-btn';
    saveBtn.textContent = 'Save Comment';
    saveBtn.onclick = () => saveComment(eventId, textarea.value, event);
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-comment-btn';
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
        if (existingComment) {
            // For edit button, replace the parent comment div
            const commentDiv = buttonElement.closest('.teacher-comment');
            if (commentDiv) {
                commentDiv.replaceWith(form);
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

function saveComment(eventId, content, event) {
    if (!content.trim()) return;
    
    // Save previous state for undo
    const previousComment = commentData[eventId] ? { ...commentData[eventId] } : null;
    
    commentData[eventId] = {
        content: content.trim(),
        timestamp: new Date().toISOString(),
        sourceType: event && event.type === 'pageVisit' ? assessSourceType(event) : null
    };
    
    // Track action for undo
    lastAction = {
        type: 'comment',
        eventId: eventId,
        previousValue: previousComment,
        newValue: { ...commentData[eventId] }
    };
    enableUndoButton();
    
    // Save to localStorage
    localStorage.setItem(`comments-${sessionData.id}`, JSON.stringify(commentData));
    
    // Refresh timeline
    updateTimeline();
}

function loadSavedComments() {
    if (sessionData && sessionData.id) {
        const saved = localStorage.getItem(`comments-${sessionData.id}`);
        if (saved) {
            const savedComments = JSON.parse(saved);
            // Merge saved comments with imported comments, prioritizing localStorage
            commentData = { ...commentData, ...savedComments };
            console.log('Merged localStorage comments with imported comments');
        } else if (Object.keys(commentData).length > 0) {
            console.log('Using imported comments from JSON file');
        }
    }
}

function deleteComment(eventId) {
    if (confirm('Are you sure you want to delete this comment?')) {
        // Save previous state for undo
        const previousComment = commentData[eventId] ? { ...commentData[eventId] } : null;
        
        delete commentData[eventId];
        
        // Track action for undo
        lastAction = {
            type: 'deleteComment',
            eventId: eventId,
            previousValue: previousComment
        };
        enableUndoButton();
        
        // Save to localStorage
        localStorage.setItem(`comments-${sessionData.id}`, JSON.stringify(commentData));
        
        // Refresh timeline
        updateTimeline();
    }
}

// Research summary function removed - no longer needed

function exportComments() {
    if (!sessionData || Object.keys(commentData).length === 0) {
        alert('No comments to export');
        return;
    }
    
    let textContent = `RESEARCH COMMENTS\n`;
    textContent += `Session: ${sessionData.name}\n`;
    textContent += `Student: ${sessionData.studentName || 'Unknown Student'}\n`;
    textContent += `Export Date: ${new Date().toLocaleString()}\n`;
    textContent += `${'='.repeat(60)}\n\n`;
    
    let entryCount = 0;
    
    // Process search groups and their associated pages
    const searchGroups = groupSearchesAndPages();
    searchGroups.forEach((group, groupIndex) => {
        const searchId = `search-group-${groupIndex}`;
        const hasSearchComment = commentData[searchId];
        
        // Check if any pages in this group have comments
        const pagesWithComments = [];
        group.pages.forEach((page, pageIndex) => {
            const pageId = `page-${groupIndex}-${pageIndex}`;
            if (commentData[pageId]) {
                pagesWithComments.push({ page, pageId, pageIndex });
            }
        });
        
        // Only output if there are comments for this search or its pages
        if (hasSearchComment || pagesWithComments.length > 0) {
            entryCount++;
            textContent += `\nSEARCH #${entryCount}\n`;
            textContent += `Query: "${group.query}" on ${group.engine}\n`;
            textContent += `Time: ${new Date(group.firstTimestamp).toLocaleString()}\n`;
            
            if (hasSearchComment) {
                textContent += `\nSEARCH COMMENT:\n${commentData[searchId].content}\n`;
            }
            
            // Add associated pages with comments
            if (pagesWithComments.length > 0) {
                textContent += `\nASSOCIATED PAGES WITH COMMENTS:\n`;
                pagesWithComments.forEach(({ page, pageId }, idx) => {
                    textContent += `\n  Page ${idx + 1}: ${page.title || 'Untitled Page'}\n`;
                    textContent += `  URL: ${page.url}\n`;
                    textContent += `  Time: ${new Date(page.timestamp).toLocaleString()}\n`;
                    textContent += `  COMMENT: ${commentData[pageId].content}\n`;
                });
            }
            
            textContent += `\n${'-'.repeat(60)}\n`;
        }
    });
    
    // Process orphaned pages (pages without a source search)
    const orphanedPages = sessionData.contentPages.filter(page => !page.sourceSearch);
    let hasOrphanedComments = false;
    
    orphanedPages.forEach((page, index) => {
        const orphanId = `page-orphan-${index}`;
        if (commentData[orphanId]) {
            if (!hasOrphanedComments) {
                textContent += `\nDIRECT PAGE VISITS (No Associated Search)\n`;
                textContent += `${'='.repeat(40)}\n`;
                hasOrphanedComments = true;
            }
            
            entryCount++;
            textContent += `\nPAGE #${entryCount}\n`;
            textContent += `Title: ${page.title || 'Untitled Page'}\n`;
            textContent += `URL: ${page.url}\n`;
            textContent += `Time: ${new Date(page.timestamp).toLocaleString()}\n`;
            textContent += `\nCOMMENT:\n${commentData[orphanId].content}\n`;
            textContent += `\n${'-'.repeat(60)}\n`;
        }
    });
    
    if (entryCount === 0) {
        textContent += `\nNo comments found.\n`;
    }
    
    // Create and download the text file
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comments-${sessionData.name.replace(/[^a-z0-9]/gi, '_')}-${new Date().toISOString().split('T')[0]}.txt`;
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

function createSearchContainer(group, groupIndex, showPages, showNotes, showComments, showMetadata) {
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
    // Use expandable text for search queries
    const searchQueryText = `Search: "${group.query}"`;
    const queryElement = createExpandableText(searchQueryText, 120);
    if (queryElement.nodeType === Node.TEXT_NODE) {
        query.textContent = searchQueryText;
    } else {
        query.appendChild(queryElement);
    }
    
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
                    
                    const notePrefix = document.createElement('span');
                    notePrefix.textContent = 'Note: ';
                    noteDiv.appendChild(notePrefix);
                    
                    const noteElement = createExpandableText(note.content, 120);
                    if (noteElement.nodeType === Node.TEXT_NODE) {
                        noteDiv.appendChild(noteElement);
                    } else {
                        noteDiv.appendChild(noteElement);
                    }
                    
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
    
    // Add comment options
    const searchId = `search-group-${groupIndex}`;
    const comment = commentData[searchId];
    
    if (showComments && (viewMode === 'teacher' || comment)) {
        if (comment) {
            const commentDiv = createCommentDisplay(comment, searchId);
            searchInfo.appendChild(commentDiv);
        }
        
        if (viewMode === 'teacher' && !comment) {
            const addCommentBtn = document.createElement('button');
            addCommentBtn.className = 'add-comment-btn';
            addCommentBtn.textContent = 'Add Comment';
            addCommentBtn.onclick = function() { showCommentForm(searchId, group.searches[0], null, this); };
            searchInfo.appendChild(addCommentBtn);
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
                const pageItem = createPageItem(page, pageId, showNotes, showComments, showMetadata);
                pagesContainer.appendChild(pageItem);
            }
        });
        
        container.appendChild(pagesContainer);
    }
    
    return container;
}

function createPageItem(page, pageId, showNotes, showComments, showMetadata) {
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
    titleDiv.className = 'page-title-container';
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
    
    // Use expandable text for titles
    const titleElement = createExpandableText(pageTitle, 200);
    if (titleElement.nodeType === Node.TEXT_NODE) {
        title.textContent = pageTitle;
        titleDiv.appendChild(title);
    } else {
        title.appendChild(titleElement);
        titleDiv.appendChild(title);
    }
    title.title = page.url; // Add URL as tooltip
    
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
        const publicationInfo = (edited && edited.publicationInfo) || metadata.publicationInfo;
        const pages = (edited && edited.pages) || metadata.pages;
        
        // Display author(s)
        if (author || authors) {
            const authorDiv = document.createElement('div');
            authorDiv.className = 'metadata-item';
            const authorText = authors ? authors.join(', ') : author;
            const authorLabel = document.createElement('span');
            authorLabel.className = 'metadata-label';
            authorLabel.textContent = `Author${authors && authors.length > 1 ? 's' : ''}:`;
            
            const authorValue = document.createElement('span');
            authorValue.className = 'metadata-value';
            const authorElement = createExpandableText(authorText, 200);
            if (authorElement.nodeType === Node.TEXT_NODE) {
                authorValue.textContent = authorText;
            } else {
                authorValue.appendChild(authorElement);
            }
            
            authorDiv.appendChild(authorLabel);
            authorDiv.appendChild(authorValue);
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
            const publisherLabel = document.createElement('span');
            publisherLabel.className = 'metadata-label';
            publisherLabel.textContent = 'Publisher:';
            
            const publisherValue = document.createElement('span');
            publisherValue.className = 'metadata-value';
            const publisherElement = createExpandableText(publisher, 80);
            if (publisherElement.nodeType === Node.TEXT_NODE) {
                publisherValue.textContent = publisher;
            } else {
                publisherValue.appendChild(publisherElement);
            }
            
            publisherDiv.appendChild(publisherLabel);
            publisherDiv.appendChild(publisherValue);
            metadataSection.appendChild(publisherDiv);
        }
        
        if (journal) {
            const journalDiv = document.createElement('div');
            journalDiv.className = 'metadata-item';
            const journalLabel = document.createElement('span');
            journalLabel.className = 'metadata-label';
            journalLabel.textContent = 'Journal:';
            
            const journalValue = document.createElement('span');
            journalValue.className = 'metadata-value';
            const journalElement = createExpandableText(journal, 80);
            if (journalElement.nodeType === Node.TEXT_NODE) {
                journalValue.textContent = journal;
            } else {
                journalValue.appendChild(journalElement);
            }
            
            journalDiv.appendChild(journalLabel);
            journalDiv.appendChild(journalValue);
            metadataSection.appendChild(journalDiv);
        }
        
        if (publicationInfo) {
            const pubInfoDiv = document.createElement('div');
            pubInfoDiv.className = 'metadata-item';
            const pubInfoLabel = document.createElement('span');
            pubInfoLabel.className = 'metadata-label';
            pubInfoLabel.textContent = 'Publication Info:';
            
            const pubInfoValue = document.createElement('span');
            pubInfoValue.className = 'metadata-value';
            const pubInfoElement = createExpandableText(publicationInfo, 80);
            if (pubInfoElement.nodeType === Node.TEXT_NODE) {
                pubInfoValue.textContent = publicationInfo;
            } else {
                pubInfoValue.appendChild(pubInfoElement);
            }
            
            pubInfoDiv.appendChild(pubInfoLabel);
            pubInfoDiv.appendChild(pubInfoValue);
            metadataSection.appendChild(pubInfoDiv);
        }
        
        if (pages) {
            const pagesDiv = document.createElement('div');
            pagesDiv.className = 'metadata-item';
            pagesDiv.innerHTML = `<span class="metadata-label">Pages:</span><span class="metadata-value">${pages}</span>`;
            metadataSection.appendChild(pagesDiv);
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
        
        // Show metadata status indicators  
        const statusDiv = createMetadataStatusIndicators(metadata, edited);
        if (statusDiv) {
            statusDiv.style.marginTop = '8px';
            metadataSection.appendChild(statusDiv);
        }
        
        content.appendChild(metadataSection);
    }
    
    // Add notes
    if (showNotes && page.notes && page.notes.length > 0) {
        page.notes.forEach(note => {
            const noteDiv = document.createElement('div');
            noteDiv.className = 'event-note';
            
            const notePrefix = document.createElement('span');
            notePrefix.textContent = 'Note: ';
            noteDiv.appendChild(notePrefix);
            
            const noteElement = createExpandableText(note.content, 120);
            if (noteElement.nodeType === Node.TEXT_NODE) {
                noteDiv.appendChild(noteElement);
            } else {
                noteDiv.appendChild(noteElement);
            }
            
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
    
    // Add comments
    const comment = commentData[pageId];
    
    if (showComments && (viewMode === 'teacher' || comment)) {
        if (comment) {
            const commentDiv = createCommentDisplay(comment, pageId);
            content.appendChild(commentDiv);
        }
        
        if (viewMode === 'teacher' && !comment) {
            const addCommentBtn = document.createElement('button');
            addCommentBtn.className = 'add-comment-btn';
            addCommentBtn.textContent = 'Add Comment';
            addCommentBtn.onclick = function() { showCommentForm(pageId, page, null, this); };
            content.appendChild(addCommentBtn);
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
                case 'comment':
                    undoBtn.textContent = 'Undo Comment';
                    break;
                case 'deleteComment':
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
        case 'comment':
            // Restore previous comment state
            if (lastAction.previousValue) {
                commentData[lastAction.eventId] = lastAction.previousValue;
            } else {
                delete commentData[lastAction.eventId];
            }
            localStorage.setItem(`comments-${sessionData.id}`, JSON.stringify(commentData));
            break;
            
        case 'deleteComment':
            // Restore deleted comment
            if (lastAction.previousValue) {
                commentData[lastAction.eventId] = lastAction.previousValue;
                localStorage.setItem(`comments-${sessionData.id}`, JSON.stringify(commentData));
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
    const modal = document.getElementById('metadataModal');
    const formContainer = document.getElementById('metadataFormContainer');
    
    // Clear existing content and DOI flag
    formContainer.innerHTML = '';
    delete modal.dataset.filledFromDoi;
    
    // Store escape handler for cleanup
    let escapeHandler;
    
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
    
    // Publication Info field
    const pubInfoGroup = document.createElement('div');
    pubInfoGroup.className = 'form-group';
    pubInfoGroup.innerHTML = '<label>Publication Info:</label>';
    const pubInfoInput = document.createElement('input');
    pubInfoInput.type = 'text';
    pubInfoInput.className = 'metadata-input';
    pubInfoInput.value = edited.publicationInfo || original.publicationInfo || '';
    pubInfoInput.placeholder = 'e.g., Vol. 15, No. 3';
    pubInfoGroup.appendChild(pubInfoInput);
    leftColumn.appendChild(pubInfoGroup);
    
    // Pages field
    const pagesGroup = document.createElement('div');
    pagesGroup.className = 'form-group';
    pagesGroup.innerHTML = '<label>Pages:</label>';
    const pagesInput = document.createElement('input');
    pagesInput.type = 'text';
    pagesInput.className = 'metadata-input';
    pagesInput.value = edited.pages || original.pages || '';
    pagesInput.placeholder = 'e.g., 123-145';
    pagesGroup.appendChild(pagesInput);
    rightColumn.appendChild(pagesGroup);
    
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
            publicationInfo: pubInfoInput.value.trim(),
            pages: pagesInput.value.trim(),
            doi: doiInput.value.trim(),
            quals: qualsInput.value.trim(),
            contentType: typeSelect.value
        };
        
        // Handle authors as array if multiple authors separated by commas
        if (newMetadata.author && newMetadata.author.includes(',')) {
            newMetadata.authors = newMetadata.author.split(',').map(a => a.trim());
        }
        
        // Preserve existing metadata flags (extractorType, extractorSite, doiMetadata, etc.)
        const existingMetadata = { ...original, ...edited };
        if (existingMetadata.extractorType) newMetadata.extractorType = existingMetadata.extractorType;
        if (existingMetadata.extractorSite) newMetadata.extractorSite = existingMetadata.extractorSite;
        if (existingMetadata.doiMetadata) newMetadata.doiMetadata = existingMetadata.doiMetadata;
        if (existingMetadata.created) newMetadata.created = existingMetadata.created;
        if (existingMetadata.lastUpdated) newMetadata.lastUpdated = existingMetadata.lastUpdated;
        
        // Check if this form was filled from DOI and mark accordingly
        if (modal.dataset.filledFromDoi === 'true') {
            newMetadata.doiMetadata = true;
            // Clear the flag
            delete modal.dataset.filledFromDoi;
        }
        
        // Mark as manually edited
        newMetadata.manuallyEdited = true;
        newMetadata.editTimestamp = new Date().toISOString();
        
        // Remove empty fields
        Object.keys(newMetadata).forEach(key => {
            if (!newMetadata[key]) delete newMetadata[key];
        });
        
        saveMetadata(pageId, newMetadata, page);
        modal.style.display = 'none';
        document.removeEventListener('keydown', escapeHandler);
    };
    
    const fillFromDoiBtn = document.createElement('button');
    fillFromDoiBtn.className = 'fill-from-doi-btn';
    fillFromDoiBtn.textContent = 'Fill from DOI';
    fillFromDoiBtn.onclick = () => {
        showDoiInputModal(titleInput, authorInput, dateInput, publisherInput, journalInput, pubInfoInput, pagesInput, doiInput, qualsInput, typeSelect);
    };
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-metadata-btn';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => {
        modal.style.display = 'none';
        document.removeEventListener('keydown', escapeHandler);
    };
    
    actions.appendChild(saveBtn);
    actions.appendChild(fillFromDoiBtn);
    actions.appendChild(cancelBtn);
    
    // Assemble form
    form.appendChild(titleGroup);
    formColumns.appendChild(leftColumn);
    formColumns.appendChild(rightColumn);
    form.appendChild(formColumns);
    form.appendChild(qualsGroup);
    form.appendChild(actions);
    
    // Add metadata status indicators
    const statusDiv = createMetadataStatusIndicators(original, edited);
    if (statusDiv) {
        form.appendChild(statusDiv);
    }
    
    // Add form to modal and show it
    formContainer.appendChild(form);
    modal.style.display = 'block';
    
    // ESC key to close modal
    escapeHandler = function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
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
    
    // Add teacher comments as a new field
    modifiedData.teacherComments = commentData;
    
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
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(function(button) {
        button.addEventListener('click', function() {
            // Find the closest modal and close it
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Click outside modal to close
    document.getElementById('sectionsModal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });
    
    document.getElementById('metadataModal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });
});

// Function to calculate position-weighted match score
function calculateMatchScore(text, searchTerms, positionWeight = true, cutoffPosition = null) {
    if (!text || !searchTerms || searchTerms.length === 0) return 0;
    
    // If cutoffPosition is provided, only consider text up to that position
    const effectiveText = cutoffPosition !== null ? text.substring(0, cutoffPosition) : text;
    const lowerText = effectiveText.toLowerCase();
    const textLength = lowerText.length;
    let totalScore = 0;
    
    // Split text into paragraphs for position weighting
    const paragraphs = effectiveText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    searchTerms.forEach(term => {
        if (!term) return;
        const lowerTerm = term.toLowerCase();
        let position = lowerText.indexOf(lowerTerm);
        
        if (position !== -1) {
            // Base score for finding the term
            let score = 1;
            
            if (positionWeight && cutoffPosition === null) {
                // Find which paragraph contains this match
                let currentPos = 0;
                let paragraphIndex = 0;
                
                for (let i = 0; i < paragraphs.length; i++) {
                    const paraLength = paragraphs[i].length;
                    if (position >= currentPos && position < currentPos + paraLength) {
                        paragraphIndex = i;
                        break;
                    }
                    currentPos += paraLength + 2; // +2 for paragraph break
                }
                
                // Apply weighting based on paragraph number
                let positionFactor = 1.0;
                if (paragraphIndex < 3) {
                    // First 3 paragraphs get full weight
                    positionFactor = 1.0;
                } else {
                    // After paragraph 3, rapid exponential decay
                    // Paragraph 4: factor ≈ 0.37
                    // Paragraph 5: factor ≈ 0.14
                    // Paragraph 6: factor ≈ 0.05
                    const paragraphsAfter3 = paragraphIndex - 2;
                    positionFactor = Math.exp(-paragraphsAfter3);
                }
                
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
        
        // Detect URL in card text - look for http:// or https://
        const urlRegex = /https?:\/\/[^\s]+/;
        const urlMatch = cardText.match(urlRegex);
        const urlCutoffPosition = urlMatch ? urlMatch.index : null;
        
        if (cardIndex === 0) {
            console.log('Sample card text (first 200 chars):', cardText.substring(0, 200));
            if (urlCutoffPosition !== null) {
                console.log('URL found at position:', urlCutoffPosition);
            }
        }
        
        // Score each page
        const pageScores = sessionData.contentPages.map((page, pageIndex) => {
            let score = 0;
            const matchDetails = {
                urlMatch: false,
                titleMatch: false,
                authorMatch: false,
                dateMatch: false,
                publicationMatch: false,
                weightingMethod: urlCutoffPosition !== null ? 'URL cutoff' : 'Position-based'
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
            const publicationInfo = edited.publicationInfo || metadata.publicationInfo || '';
            const pages = edited.pages || metadata.pages || '';
            
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
                const urlScore = calculateMatchScore(cardText, urlParts, true, urlCutoffPosition);
                if (urlScore > 0) {
                    score += urlScore * 3; // Triple weight for URL matches
                    matchDetails.urlMatch = true;
                }
            }
            
            // Check title match (high priority)
            if (pageTitle) {
                const titleWords = pageTitle.split(/\s+/).filter(w => w.length > 3);
                const titleScore = calculateMatchScore(cardText, titleWords, true, urlCutoffPosition);
                if (titleScore > 0) {
                    score += titleScore * 2; // Double weight for title matches
                    matchDetails.titleMatch = true;
                }
            }
            
            // Check author match
            const allAuthors = [author, ...authors].filter(a => a);
            if (allAuthors.length > 0) {
                const authorScore = calculateMatchScore(cardText, allAuthors, true, urlCutoffPosition);
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
                const dateScore = calculateMatchScore(cardText, dateVariations, true, urlCutoffPosition);
                if (dateScore > 0) {
                    score += dateScore;
                    matchDetails.dateMatch = true;
                }
            }
            
            // Check publication match (publisher or journal)
            const publications = [publisher, journal].filter(p => p);
            if (publications.length > 0) {
                const pubScore = calculateMatchScore(cardText, publications, true, urlCutoffPosition);
                if (pubScore > 0) {
                    score += pubScore;
                    matchDetails.publicationMatch = true;
                }
            }
            
            // Strong bonuses for combinatorial matches
            if (matchDetails.authorMatch && matchDetails.dateMatch && matchDetails.publicationMatch) {
                score += 15; // Large bonus for author + date + publication match
            }
            
            if (matchDetails.urlMatch && matchDetails.titleMatch) {
                score += 20; // Very large bonus for URL + title match
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
            
            // If there's an extremely good match (>40), filter out weak matches
            if (maxScore > 40) {
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
        
        // Escape key to close
        const escapeHandler = function(e) {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                modal.style.display = 'none';
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
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
        
        const weightingMethod = card.matchDetails.weightingMethod || 'Unknown';
        
        cardDiv.innerHTML = `
            <div class="card-header">
                <h4>${card.header}</h4>
                <div class="match-info">
                    <span class="match-score">Score: ${card.matchScore.toFixed(2)}</span>
                    <span class="match-types">Matched: ${matchTypes.join(', ')}</span>
                    <span class="weighting-method">Method: ${weightingMethod}</span>
                    <button class="unlink-card-btn" onclick="unlinkCard('${pageId}', ${index})">Unlink</button>
                </div>
            </div>
            <div class="card-content">${card.content}</div>
        `;
        
        cardsContent.appendChild(cardDiv);
    });
    
    // Add escape key handler each time modal is shown
    const escapeHandler = function(e) {
        if (e.key === 'Escape') {
            modal.style.display = 'none';
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
    
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

// Sidebar toggle functions
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleIcon = document.querySelector('.toggle-icon');
    const isCollapsed = sidebar.classList.contains('collapsed');
    
    if (isCollapsed) {
        sidebar.classList.remove('collapsed');
        toggleIcon.textContent = '«';
        localStorage.setItem('sidebarCollapsed', 'false');
    } else {
        sidebar.classList.add('collapsed');
        toggleIcon.textContent = '»';
        localStorage.setItem('sidebarCollapsed', 'true');
    }
}

function loadSavedSidebarState() {
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    const toggleIcon = document.querySelector('.toggle-icon');
    
    if (isCollapsed) {
        document.getElementById('sidebar').classList.add('collapsed');
        toggleIcon.textContent = '»';
    } else {
        toggleIcon.textContent = '«';
    }
}

// DOI Autofill Functionality
function showDoiInputModal(titleInput, authorInput, dateInput, publisherInput, journalInput, pubInfoInput, pagesInput, doiInput, qualsInput, typeSelect) {
    const modal = document.getElementById('doiInputModal');
    const doiInputField = document.getElementById('doiInput');
    const fetchBtn = document.getElementById('fetchDoiBtn');
    const cancelBtn = document.getElementById('cancelDoiBtn');
    const closeBtn = document.querySelector('.close-doi-modal');
    
    // Clear previous input and status
    doiInputField.value = '';
    const statusDiv = document.getElementById('doiStatus');
    if (statusDiv) {
        statusDiv.style.display = 'none';
        statusDiv.className = 'doi-status';
    }
    
    // Store references to form inputs for later use
    modal.formInputs = {
        titleInput, authorInput, dateInput, publisherInput, 
        journalInput, pubInfoInput, pagesInput, doiInput, 
        qualsInput, typeSelect
    };
    
    // Show modal
    modal.style.display = 'block';
    doiInputField.focus();
    
    // Set up event handlers
    const handleFetch = () => fetchMetadataFromDoi(modal.formInputs);
    const handleCancel = () => {
        modal.style.display = 'none';
        cleanup();
    };
    const handleClose = () => {
        modal.style.display = 'none';
        cleanup();
    };
    const handleKeydown = (e) => {
        if (e.key === 'Escape') {
            modal.style.display = 'none';
            cleanup();
        } else if (e.key === 'Enter' && doiInputField.value.trim()) {
            e.preventDefault();
            fetchMetadataFromDoi(modal.formInputs);
        }
    };
    
    const cleanup = () => {
        fetchBtn.removeEventListener('click', handleFetch);
        cancelBtn.removeEventListener('click', handleCancel);
        closeBtn.removeEventListener('click', handleClose);
        document.removeEventListener('keydown', handleKeydown);
    };
    
    fetchBtn.addEventListener('click', handleFetch);
    cancelBtn.addEventListener('click', handleCancel);
    closeBtn.addEventListener('click', handleClose);
    document.addEventListener('keydown', handleKeydown);
}

async function fetchMetadataFromDoi(formInputs) {
    const doiInputField = document.getElementById('doiInput');
    const fetchBtn = document.getElementById('fetchDoiBtn');
    const statusDiv = document.getElementById('doiStatus');
    const doi = doiInputField.value.trim();
    
    // Clear previous status
    statusDiv.style.display = 'none';
    statusDiv.className = 'doi-status';
    
    if (!doi) {
        showDoiStatus('Please enter a DOI', 'error');
        return;
    }
    
    // Validate DOI format
    if (!doi.match(/^10\.\d{4,}(?:\.\d+)*\/[^\s]+/)) {
        showDoiStatus('Please enter a valid DOI (e.g., 10.1038/nature12373)', 'error');
        return;
    }
    
    // Show loading state
    fetchBtn.disabled = true;
    fetchBtn.textContent = 'Fetching...';
    showDoiStatus('🔄 Fetching metadata from DOI registry...', 'loading');
    
    try {
        const metadata = await fetchDOIMetadata(doi);
        
        if (metadata) {
            // Show success briefly
            showDoiStatus('✓ Metadata fetched successfully!', 'success');
            
            // Fill the form with fetched metadata
            fillMetadataForm(metadata, formInputs);
            
            // Auto-close DOI modal after short delay
            setTimeout(() => {
                document.getElementById('doiInputModal').style.display = 'none';
                // Clear the status for next time
                statusDiv.style.display = 'none';
            }, 1000);
            
        } else {
            showDoiStatus('Failed to fetch metadata for this DOI. Please check the DOI and try again.', 'error');
        }
    } catch (error) {
        console.error('Error fetching DOI metadata:', error);
        showDoiStatus('Error fetching metadata: ' + error.message, 'error');
    } finally {
        // Reset button state
        fetchBtn.disabled = false;
        fetchBtn.textContent = 'Fetch Metadata';
    }
}

function showDoiStatus(message, type) {
    const statusDiv = document.getElementById('doiStatus');
    statusDiv.textContent = message;
    statusDiv.className = `doi-status ${type}`;
    statusDiv.style.display = 'block';
}

async function fetchDOIMetadata(doi) {
    try {
        console.log('Fetching metadata for DOI:', doi);
        
        // Method 1: Try CrossRef API directly (most reliable)
        try {
            console.log('Trying CrossRef API...');
            const response = await fetch(`https://api.crossref.org/works/${doi}`);
            
            if (response.ok) {
                const crossrefData = await response.json();
                if (crossrefData.status === 'ok' && crossrefData.message) {
                    console.log('CrossRef data received:', crossrefData.message);
                    return convertCrossRefToMetadata(crossrefData.message, doi);
                }
            }
        } catch (e) {
            console.log('CrossRef API failed:', e.message);
        }
        
        // Method 2: Try different CORS proxy
        try {
            console.log('Trying CORS proxy...');
            const proxyUrl = 'https://corsproxy.io/?';
            const targetUrl = `https://doi.org/${encodeURIComponent(doi)}`;
            
            const response = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
                headers: {
                    'Accept': 'application/vnd.citationstyles.csl+json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('DOI metadata received via proxy:', data);
                return convertCSLToMetadata(data, doi);
            }
        } catch (e) {
            console.log('CORS proxy failed:', e.message);
        }
        
        // If both methods fail
        throw new Error('Unable to fetch DOI metadata. The DOI service may be unavailable.');
        
    } catch (error) {
        console.error('Error fetching DOI metadata:', error);
        return null;
    }
}

function convertCrossRefToMetadata(crossrefData, doi) {
    try {
        const metadata = {
            doi: doi,
            title: crossrefData.title ? crossrefData.title[0] : null,
            authors: [],
            publishDate: null,
            journal: crossrefData['container-title'] ? crossrefData['container-title'][0] : null,
            publicationInfo: null,
            pages: crossrefData.page,
            abstract: crossrefData.abstract,
            contentType: mapCrossRefTypeToContentType(crossrefData.type),
            doiMetadata: true  // Flag to indicate this came from DOI API
        };
        
        // Create publication info from volume and issue
        if (crossrefData.volume || crossrefData.issue) {
            const parts = [];
            if (crossrefData.volume) parts.push(`Vol. ${crossrefData.volume}`);
            if (crossrefData.issue) parts.push(`No. ${crossrefData.issue}`);
            metadata.publicationInfo = parts.join(', ');
        }
        
        // Process authors
        if (crossrefData.author && Array.isArray(crossrefData.author)) {
            metadata.authors = crossrefData.author.map(author => {
                if (author.given && author.family) {
                    return `${author.given} ${author.family}`;
                } else if (author.name) {
                    return author.name;
                } else if (author.family) {
                    return author.family;
                }
                return '';
            }).filter(name => name);
            
            metadata.author = metadata.authors.join(', ');
        }
        
        // Process publication date
        if (crossrefData.published && crossrefData.published['date-parts']) {
            const dateParts = crossrefData.published['date-parts'][0];
            if (dateParts && dateParts.length > 0) {
                const year = dateParts[0];
                const month = dateParts[1] || 1;
                const day = dateParts[2] || 1;
                metadata.publishDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }
        } else if (crossrefData.issued && crossrefData.issued['date-parts']) {
            const dateParts = crossrefData.issued['date-parts'][0];
            if (dateParts && dateParts.length > 0) {
                const year = dateParts[0];
                const month = dateParts[1] || 1;
                const day = dateParts[2] || 1;
                metadata.publishDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }
        }
        
        return metadata;
    } catch (error) {
        console.error('Error converting CrossRef data:', error);
        return null;
    }
}

function convertCSLToMetadata(data, doi) {
    try {
        // Convert CSL JSON to our metadata format
        const metadata = {
            doi: doi,
            title: data.title,
            authors: [],
            publishDate: null,
            journal: data['container-title'],
            publicationInfo: null,
            pages: data.page,
            abstract: data.abstract,
            contentType: mapCSLTypeToContentType(data.type),
            doiMetadata: true  // Flag to indicate this came from DOI API
        };
        
        // Create publication info from volume and issue
        if (data.volume || data.issue) {
            const parts = [];
            if (data.volume) parts.push(`Vol. ${data.volume}`);
            if (data.issue) parts.push(`No. ${data.issue}`);
            metadata.publicationInfo = parts.join(', ');
        }
        
        // Process authors
        if (data.author && Array.isArray(data.author)) {
            metadata.authors = data.author.map(author => {
                if (author.given && author.family) {
                    return `${author.given} ${author.family}`;
                } else if (author.name) {
                    return author.name;
                } else if (author.family) {
                    return author.family;
                }
                return '';
            }).filter(name => name);
            
            metadata.author = metadata.authors.join(', ');
        }
        
        // Process publication date
        if (data.published && data.published['date-parts']) {
            const dateParts = data.published['date-parts'][0];
            if (dateParts && dateParts.length > 0) {
                const year = dateParts[0];
                const month = dateParts[1] || 1;
                const day = dateParts[2] || 1;
                metadata.publishDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }
        } else if (data.issued && data.issued['date-parts']) {
            const dateParts = data.issued['date-parts'][0];
            if (dateParts && dateParts.length > 0) {
                const year = dateParts[0];
                const month = dateParts[1] || 1;
                const day = dateParts[2] || 1;
                metadata.publishDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }
        }
        
        return metadata;
    } catch (error) {
        console.error('Error converting CSL data:', error);
        return null;
    }
}

function mapCrossRefTypeToContentType(crossrefType) {
    const mapping = {
        'journal-article': 'journal-article',
        'book-chapter': 'book',
        'monograph': 'book',
        'report': 'report',
        'book': 'book',
        'thesis': 'thesis',
        'conference-paper': 'conference-paper',
        'proceedings-article': 'conference-paper'
    };
    
    return mapping[crossrefType] || 'other';
}

function mapCSLTypeToContentType(cslType) {
    const mapping = {
        'article-journal': 'journal-article',
        'article-magazine': 'magazine-article', 
        'article-newspaper': 'news-article',
        'book': 'book',
        'chapter': 'book-chapter',
        'paper-conference': 'conference-paper',
        'report': 'report',
        'thesis': 'thesis',
        'webpage': 'website',
        'post-weblog': 'blog-post'
    };
    
    return mapping[cslType] || 'other';
}

function fillMetadataForm(metadata, formInputs) {
    // Fill the form fields with the fetched metadata
    if (metadata.title) formInputs.titleInput.value = metadata.title;
    if (metadata.author) formInputs.authorInput.value = metadata.author;
    if (metadata.publishDate) formInputs.dateInput.value = metadata.publishDate;
    if (metadata.journal) formInputs.journalInput.value = metadata.journal;
    if (metadata.publicationInfo) formInputs.pubInfoInput.value = metadata.publicationInfo;
    if (metadata.pages) formInputs.pagesInput.value = metadata.pages;
    if (metadata.doi) formInputs.doiInput.value = metadata.doi;
    if (metadata.contentType) formInputs.typeSelect.value = metadata.contentType;
    
    // Mark that this form was filled from DOI (store on form container for save function to check)
    if (metadata.doiMetadata) {
        const modal = document.getElementById('metadataModal');
        if (modal) {
            modal.dataset.filledFromDoi = 'true';
        }
    }
    
    // Note: We don't fill publisher or quals since they're typically not in DOI metadata
}

function createMetadataStatusIndicators(originalMetadata, editedMetadata) {
    const metadata = { ...originalMetadata, ...editedMetadata };
    const infoItems = [];
    
    // Check if metadata came from DOI API
    if (metadata.doiMetadata) {
        infoItems.push({
            text: 'Metadata fetched from DOI registry',
            color: '#2e7d32',
            icon: '✓'
        });
    }
    // Check if this is from an automatic extractor
    else if (metadata.extractorType) {
        let extractorText = `Metadata extracted via ${metadata.extractorType}`;
        if (metadata.extractorSite) {
            extractorText += ` from ${metadata.extractorSite}`;
        }
        infoItems.push({
            text: extractorText,
            color: '#666',
            icon: '⚙'
        });
    }
    
    // Check if this is a repeat visit (has creation timestamp vs current visit)
    if (metadata.created && metadata.lastUpdated) {
        const created = new Date(metadata.created);
        const lastUpdated = new Date(metadata.lastUpdated);
        
        // If last updated is significantly after creation, this is likely a repeat visit
        if (lastUpdated.getTime() - created.getTime() > 60000) { // More than 1 minute difference
            infoItems.push({
                text: 'Metadata loaded from previous session',
                color: '#1976d2',
                icon: '↻'
            });
        }
    }
    
    // Check if manual edits were made
    if (metadata.manuallyEdited) {
        const editTime = metadata.editTimestamp ? new Date(metadata.editTimestamp) : null;
        let editText = 'Manual edits applied';
        if (editTime) {
            const now = new Date();
            const diffMinutes = Math.round((now.getTime() - editTime.getTime()) / 60000);
            if (diffMinutes < 1) {
                editText += ' (just now)';
            } else if (diffMinutes < 60) {
                editText += ` (${diffMinutes}m ago)`;
            } else if (diffMinutes < 1440) {
                editText += ` (${Math.round(diffMinutes / 60)}h ago)`;
            } else {
                editText += ` (${Math.round(diffMinutes / 1440)}d ago)`;
            }
        }
        infoItems.push({
            text: editText,
            color: '#f57c00',
            icon: '✏'
        });
    }
    
    // Render the info items
    if (infoItems.length > 0) {
        const infoDiv = document.createElement('div');
        infoDiv.className = 'metadata-status-info';
        infoDiv.style.border = '1px solid #e0e0e0';
        infoDiv.style.background = '#f9f9f9';
        infoDiv.style.padding = '8px';
        infoDiv.style.borderRadius = '4px';
        infoDiv.style.marginTop = '10px';
        infoDiv.style.fontSize = '0.85em';
        
        const infoHtml = infoItems.map(item => 
            `<div style="color: ${item.color}; margin: 2px 0; line-height: 1.3;">
                <span style="margin-right: 6px;">${item.icon}</span>${item.text}
            </div>`
        ).join('');
        
        infoDiv.innerHTML = infoHtml;
        return infoDiv;
    }
    
    return null;
}