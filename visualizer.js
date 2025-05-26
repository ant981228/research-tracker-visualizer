let sessionData = null;
let viewMode = 'teacher'; // Always teacher view
let feedbackData = {};
let removedPages = new Set();
let removedSearches = new Set(); // Store removed searches
let lastAction = null; // For undo functionality
let editedMetadata = {}; // Store edited metadata

// Sample data for demonstration
const sampleData = {
    "id": "demo-session-001",
    "name": "Climate Change Research Demo",
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
            "query": "antarctic ice sheet melting rate",
            "params": {
                "q": "antarctic ice sheet melting rate"
            },
            "url": "https://scholar.google.com/scholar?q=antarctic+ice+sheet+melting+rate",
            "timestamp": "2025-05-18T19:45:30.456Z",
            "tabId": 12346
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
                "description": "Recent studies show sea levels rising faster than previously predicted...",
                "publisher": "Scientific American",
                "quals": "PhD in Climate Science, MIT; Lead researcher at NOAA Climate Monitoring Division"
            },
            "notes": [
                {
                    "content": "Important data on acceleration of sea level rise - 3.4mm per year globally",
                    "timestamp": "2025-05-18T19:35:12.456Z"
                }
            ]
        },
        {
            "type": "pageVisit",
            "url": "https://climate.nasa.gov/vital-signs/sea-level/",
            "title": "Climate Change: Vital Signs of the Planet - Sea Level",
            "timestamp": "2025-05-18T19:38:20.123Z",
            "tabId": 12345,
            "sourceSearch": {
                "engine": "GOOGLE",
                "query": "climate change impact sea levels",
                "url": "https://www.google.com/search?q=climate+change+impact+sea+levels&tbm=nws",
                "timestamp": "2025-05-18T19:31:02.789Z"
            },
            "metadata": {
                "title": "Climate Change: Vital Signs of the Planet - Sea Level",
                "url": "https://climate.nasa.gov/vital-signs/sea-level/",
                "author": "NASA Climate Team",
                "publisher": "NASA",
                "publishDate": "2025-05-15",
                "quals": "NASA Goddard Institute for Space Studies; Earth Science Division",
                "journal": "NASA Climate Change and Global Warming",
                "doi": "10.1234/nasa.climate.2025"
            }
        }
    ],
    "chronologicalEvents": []
};

// Initialize the visualizer
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('fileInput').addEventListener('change', handleFileUpload);
    document.getElementById('loadSample').addEventListener('click', loadSampleData);
    
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', switchTab);
    });
    
    // Timeline filters
    document.getElementById('showSearches').addEventListener('change', updateTimeline);
    document.getElementById('showPages').addEventListener('change', updateTimeline);
    document.getElementById('showNotes').addEventListener('change', updateTimeline);
    document.getElementById('showFeedback').addEventListener('change', updateTimeline);
    
    // Export buttons
    document.getElementById('exportFeedback').addEventListener('click', exportFeedback);
    document.getElementById('exportModified').addEventListener('click', exportModifiedData);
    
    // Expand/Collapse buttons
    document.getElementById('expandAll').addEventListener('click', expandAll);
    document.getElementById('collapseAll').addEventListener('click', collapseAll);
    
    // Undo and restore buttons
    document.getElementById('undoBtn').addEventListener('click', performUndo);
    document.getElementById('restorePages').addEventListener('click', restoreAllRemovedPages);
    
    // Load saved data from localStorage
    loadSavedFeedback();
    loadRemovedPages();
    loadRemovedSearches();
    loadEditedMetadata();
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
    sessionData = sampleData;
    // Build chronological events from searches and pages
    sessionData.chronologicalEvents = [
        ...sessionData.searches,
        ...sessionData.contentPages
    ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    processSessionData();
}

function processSessionData() {
    if (!sessionData) return;
    
    // Clear previous session data
    removedPages.clear();
    removedSearches.clear();
    feedbackData = {};
    editedMetadata = {};
    
    // Load saved data for this session
    loadSavedFeedback();
    loadRemovedPages();
    loadRemovedSearches();
    loadEditedMetadata();
    
    // Show visualization sections
    document.getElementById('sessionInfo').classList.remove('hidden');
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
    
    // Update research summary
    updateResearchSummary();
}

function updateTimeline() {
    const showSearches = document.getElementById('showSearches').checked;
    const showPages = document.getElementById('showPages').checked;
    const showNotes = document.getElementById('showNotes').checked;
    const showFeedback = document.getElementById('showFeedback').checked;
    
    const timelineContent = document.getElementById('timelineContent');
    timelineContent.innerHTML = '';
    
    // Group searches and their related pages
    const searchGroups = groupSearchesAndPages();
    
    // Create timeline items for each search group
    searchGroups.forEach((group, groupIndex) => {
        if (!showSearches && group.pages.length === 0) return;
        
        const searchContainer = createSearchContainer(group, groupIndex, showPages, showNotes, showFeedback);
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
            const pageItem = createPageItem(page, pageId, showNotes, showFeedback);
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
    const feedback = feedbackData[eventId];
    
    if (feedback) {
        item.classList.add('has-feedback');
        if (feedback.quality === 'excellent') {
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
        
        // Add source quality indicator for pages
        if (event.metadata && viewMode === 'teacher') {
            const quality = assessSourceQuality(event);
            const qualityBadge = document.createElement('span');
            qualityBadge.className = `source-quality quality-${quality}`;
            qualityBadge.textContent = quality.charAt(0).toUpperCase() + quality.slice(1);
            titleDiv.appendChild(qualityBadge);
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
    
    // Add teacher feedback section
    if (viewMode === 'teacher' || (feedback && document.getElementById('showFeedback').checked)) {
        if (feedback) {
            const feedbackDiv = createFeedbackDisplay(feedback, eventId);
            content.appendChild(feedbackDiv);
        }
        
        if (viewMode === 'teacher' && !feedback) {
            const addFeedbackBtn = document.createElement('button');
            addFeedbackBtn.className = 'add-feedback-btn';
            addFeedbackBtn.textContent = 'Add Feedback';
            addFeedbackBtn.onclick = () => showFeedbackForm(eventId, event);
            content.appendChild(addFeedbackBtn);
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

// Teacher feedback functions
function assessSourceQuality(page) {
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
    
    // Check if we have academic identifiers (very strong signal)
    if (metadata.doi || metadata.pmid || metadata.arxivId || metadata.jstorId) {
        return 'excellent';
    }
    
    // Check content type from metadata
    if (metadata.contentType) {
        if (['journal-article', 'preprint', 'academic-article', 'report'].includes(metadata.contentType)) {
            return 'excellent';
        }
    }
    
    // Academic and government sources
    const normalizedDomain = domain.replace(/-/g, '.');
    if (domain.endsWith('.edu') || domain.endsWith('.gov') || 
        normalizedDomain.endsWith('.edu') || normalizedDomain.endsWith('.gov') ||
        domainMatches(domain, 'scholar.google') || domainMatches(domain, 'jstor.org') ||
        domainMatches(domain, 'pubmed') || domainMatches(domain, 'nature.com') ||
        domainMatches(domain, 'sciencedirect.com') || domainMatches(domain, 'arxiv.org') ||
        domainMatches(domain, 'doi.org') || domainMatches(domain, 'springer.com') ||
        domainMatches(domain, 'wiley.com') || domainMatches(domain, 'elsevier.com') ||
        domainMatches(domain, 'ncbi.nlm.nih.gov') || domainMatches(domain, 'nber.org') ||
        domainMatches(domain, 'dukeupress.edu') || domainMatches(domain, 'ssrn.com') ||
        domainMatches(domain, 'sagepub.com')) {
        return 'excellent';
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
        domainMatches(domain, 'rstreet.org') || domainMatches(domain, 'aspeninstitute.org')) {
        return 'excellent';
    }
    
    // Reputable news and organizations
    if (domain.includes('nytimes.com') || domain.includes('washingtonpost.com') ||
        domain.includes('bbc.com') || domain.includes('reuters.com') ||
        domain.includes('apnews.com') || domain.includes('npr.org') ||
        domain.includes('scientificamerican.com') || domain.includes('theguardian.com') ||
        domain.includes('wsj.com') || domain.includes('bloomberg.com') || 
        domain.includes('cnn.com') || domain.includes('cnbc.com') ||
        domain.includes('cbsnews.com') || domain.includes('abcnews.go.com') || 
        domain.includes('nbcnews.com') || domain.includes('latimes.com') || 
        domain.includes('theglobeandmail.com') || domain.includes('nypost.com') || 
        domain.includes('usnews.com') || domain.includes('dw.com') || 
        domain.includes('timesofindia.indiatimes.com') || domain.includes('indianexpress.com') || 
        domain.includes('hindustantimes.com') || domain.includes('thehill.com') ||
        domain.includes('thedailybeast.com') || domain.includes('newsweek.com') ||
        domain.includes('bangkokpost.com') || domain.includes('japantimes.co.jp') ||
        domain.includes('economist.com') || domain.includes('ft.com') || 
        domain.includes('nationalreview.com')) {
        return 'good';
    }
    
    // Encyclopedia and reference sources
    if (domain.includes('britannica.com') || domain.includes('stanford.edu/entries')) {
        return 'good';
    }
    
    // Social media and user-generated content
    if (domain.includes('wikipedia.org') || domain.includes('reddit.com') ||
        domain.includes('twitter.com') || domain.includes('x.com') ||
        domain.includes('facebook.com') || domain.includes('youtube.com') ||
        domain.includes('instagram.com') || domain.includes('tiktok.com')) {
        return 'questionable';
    }
    
    // Blogs and personal sites (unless they have academic metadata)
    if ((domain.includes('blogspot.com') || domain.includes('wordpress.com') ||
         domain.includes('medium.com') || domain.includes('substack.com')) &&
        !metadata.doi && !metadata.pmid) {
        return 'questionable';
    }
    
    // Default
    return 'good';
}

function createFeedbackDisplay(feedback, eventId) {
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = 'teacher-feedback';
    
    const header = document.createElement('div');
    header.className = 'feedback-header';
    
    const label = document.createElement('div');
    label.className = 'feedback-label';
    label.textContent = 'Teacher Feedback:';
    header.appendChild(label);
    
    if (viewMode === 'teacher') {
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-feedback-btn';
        editBtn.textContent = 'Edit';
        editBtn.onclick = function() { showFeedbackForm(eventId, null, feedback, this); };
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-feedback-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteFeedback(eventId);
        
        buttonContainer.appendChild(editBtn);
        buttonContainer.appendChild(deleteBtn);
        header.appendChild(buttonContainer);
    }
    
    const content = document.createElement('div');
    content.className = 'feedback-content';
    content.textContent = feedback.content;
    
    feedbackDiv.appendChild(header);
    feedbackDiv.appendChild(content);
    
    return feedbackDiv;
}

function showFeedbackForm(eventId, event, existingFeedback = null, buttonElement = null) {
    const form = document.createElement('div');
    form.className = 'feedback-form';
    form.id = `feedback-form-${eventId}`;
    
    const textarea = document.createElement('textarea');
    textarea.className = 'feedback-textarea';
    textarea.placeholder = 'Enter your feedback here...';
    if (existingFeedback) {
        textarea.value = existingFeedback.content;
    }
    
    const actions = document.createElement('div');
    actions.className = 'feedback-actions';
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-feedback-btn';
    saveBtn.textContent = 'Save Feedback';
    saveBtn.onclick = () => saveFeedback(eventId, textarea.value, event);
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-feedback-btn';
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
        if (existingFeedback) {
            // For edit button, replace the parent feedback div
            const feedbackDiv = buttonElement.closest('.teacher-feedback');
            if (feedbackDiv) {
                feedbackDiv.replaceWith(form);
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

function saveFeedback(eventId, content, event) {
    if (!content.trim()) return;
    
    // Save previous state for undo
    const previousFeedback = feedbackData[eventId] ? { ...feedbackData[eventId] } : null;
    
    feedbackData[eventId] = {
        content: content.trim(),
        timestamp: new Date().toISOString(),
        quality: event && event.type === 'pageVisit' ? assessSourceQuality(event) : null
    };
    
    // Track action for undo
    lastAction = {
        type: 'feedback',
        eventId: eventId,
        previousValue: previousFeedback,
        newValue: { ...feedbackData[eventId] }
    };
    enableUndoButton();
    
    // Save to localStorage
    localStorage.setItem(`feedback-${sessionData.id}`, JSON.stringify(feedbackData));
    
    // Refresh timeline
    updateTimeline();
}

function loadSavedFeedback() {
    if (sessionData && sessionData.id) {
        const saved = localStorage.getItem(`feedback-${sessionData.id}`);
        if (saved) {
            feedbackData = JSON.parse(saved);
        }
    }
}

function deleteFeedback(eventId) {
    if (confirm('Are you sure you want to delete this feedback?')) {
        // Save previous state for undo
        const previousFeedback = feedbackData[eventId] ? { ...feedbackData[eventId] } : null;
        
        delete feedbackData[eventId];
        
        // Track action for undo
        lastAction = {
            type: 'deleteFeedback',
            eventId: eventId,
            previousValue: previousFeedback
        };
        enableUndoButton();
        
        // Save to localStorage
        localStorage.setItem(`feedback-${sessionData.id}`, JSON.stringify(feedbackData));
        
        // Refresh timeline
        updateTimeline();
    }
}

function updateResearchSummary() {
    const summaryDiv = document.getElementById('researchSummary');
    summaryDiv.style.display = 'block';
    
    // Calculate statistics
    const uniqueDomains = new Set();
    const sourceTypes = { excellent: 0, good: 0, questionable: 0, poor: 0 };
    let totalTimeSpent = 0;
    let searchRefinements = 0;
    
    sessionData.contentPages.forEach(page => {
        if (!shouldFilterPage(page)) {
            const domain = new URL(page.url).hostname;
            uniqueDomains.add(domain);
            const quality = assessSourceQuality(page);
            sourceTypes[quality]++;
        }
    });
    
    // Look for search refinements
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were']);
    
    function getSignificantWords(query) {
        return query.toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.has(word));
    }
    
    for (let i = 1; i < sessionData.searches.length; i++) {
        const currentWords = getSignificantWords(sessionData.searches[i].query);
        const previousWords = getSignificantWords(sessionData.searches[i-1].query);
        
        // Check if current search shares at least half the words with previous search
        // and has additional words (indicating refinement)
        const sharedWords = currentWords.filter(word => previousWords.includes(word));
        const isRefinement = sharedWords.length >= previousWords.length / 2 && 
                           currentWords.length > previousWords.length;
        
        // Also check if it's the same engine (refinements typically use same search engine)
        if (isRefinement && sessionData.searches[i].engine === sessionData.searches[i-1].engine) {
            searchRefinements++;
        }
    }
    
    summaryDiv.innerHTML = `
        <h3>Research Quality Summary</h3>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-value">${uniqueDomains.size}</div>
                <div class="summary-label">Unique Sources</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">${sourceTypes.excellent}</div>
                <div class="summary-label">Academic Sources</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">${searchRefinements}</div>
                <div class="summary-label">Search Refinements</div>
            </div>
            <div class="summary-item">
                <div class="summary-value">${Object.values(sourceTypes).reduce((a, b) => a + b, 0) > 0 ? 
                    Math.round((sourceTypes.excellent + sourceTypes.good) / Object.values(sourceTypes).reduce((a, b) => a + b, 0) * 100) : 0}%</div>
                <div class="summary-label">Quality Sources</div>
            </div>
        </div>
    `;
}

function exportFeedback() {
    const exportData = {
        sessionId: sessionData.id,
        sessionName: sessionData.name,
        studentName: sessionData.studentName || 'Unknown Student',
        exportDate: new Date().toISOString(),
        feedback: feedbackData,
        summary: {
            totalEvents: sessionData.chronologicalEvents.length,
            searches: sessionData.searches.length,
            pagesVisited: sessionData.contentPages.length,
            feedbackProvided: Object.keys(feedbackData).length
        }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-${sessionData.name.replace(/[^a-z0-9]/gi, '_')}-${new Date().toISOString().split('T')[0]}.json`;
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

function createSearchContainer(group, groupIndex, showPages, showNotes, showFeedback) {
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
    
    // Add teacher feedback options
    const searchId = `search-group-${groupIndex}`;
    const feedback = feedbackData[searchId];
    
    if (viewMode === 'teacher' || (feedback && showFeedback)) {
        if (feedback) {
            const feedbackDiv = createFeedbackDisplay(feedback, searchId);
            searchInfo.appendChild(feedbackDiv);
        }
        
        if (viewMode === 'teacher' && !feedback) {
            const addFeedbackBtn = document.createElement('button');
            addFeedbackBtn.className = 'add-feedback-btn';
            addFeedbackBtn.textContent = 'Add Annotation';
            addFeedbackBtn.onclick = function() { showFeedbackForm(searchId, group.searches[0], null, this); };
            searchInfo.appendChild(addFeedbackBtn);
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
                const pageItem = createPageItem(page, pageId, showNotes, showFeedback);
                pagesContainer.appendChild(pageItem);
            }
        });
        
        container.appendChild(pagesContainer);
    }
    
    return container;
}

function createPageItem(page, pageId, showNotes, showFeedback) {
    const item = document.createElement('div');
    item.className = 'page-item';
    
    const time = document.createElement('span');
    time.className = 'page-time';
    time.textContent = formatTime(page.timestamp);
    
    const icon = document.createElement('span');
    icon.className = 'page-icon';
    icon.textContent = '📄';
    
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
    
    // Add source quality indicator
    if (page.metadata && viewMode === 'teacher') {
        const quality = assessSourceQuality(page);
        const qualityBadge = document.createElement('span');
        qualityBadge.className = `source-quality quality-${quality}`;
        qualityBadge.textContent = quality.charAt(0).toUpperCase() + quality.slice(1);
        titleDiv.appendChild(qualityBadge);
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
    
    if (hasOriginalMetadata || hasEditedMetadata) {
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
    
    content.appendChild(actionButtons);
    
    // Add teacher feedback
    const feedback = feedbackData[pageId];
    
    if (viewMode === 'teacher' || (feedback && showFeedback)) {
        if (feedback) {
            const feedbackDiv = createFeedbackDisplay(feedback, pageId);
            content.appendChild(feedbackDiv);
        }
        
        if (viewMode === 'teacher' && !feedback) {
            const addFeedbackBtn = document.createElement('button');
            addFeedbackBtn.className = 'add-feedback-btn';
            addFeedbackBtn.textContent = 'Add Annotation';
            addFeedbackBtn.onclick = function() { showFeedbackForm(pageId, page, null, this); };
            content.appendChild(addFeedbackBtn);
        }
    }
    
    item.appendChild(time);
    item.appendChild(icon);
    item.appendChild(content);
    
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

function enableUndoButton() {
    const undoBtn = document.getElementById('undoBtn');
    if (undoBtn) {
        undoBtn.disabled = false;
        // Update button text to show what will be undone
        if (lastAction) {
            switch (lastAction.type) {
                case 'feedback':
                    undoBtn.textContent = 'Undo Annotation';
                    break;
                case 'deleteFeedback':
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
        case 'feedback':
            // Restore previous feedback state
            if (lastAction.previousValue) {
                feedbackData[lastAction.eventId] = lastAction.previousValue;
            } else {
                delete feedbackData[lastAction.eventId];
            }
            localStorage.setItem(`feedback-${sessionData.id}`, JSON.stringify(feedbackData));
            break;
            
        case 'deleteFeedback':
            // Restore deleted feedback
            if (lastAction.previousValue) {
                feedbackData[lastAction.eventId] = lastAction.previousValue;
                localStorage.setItem(`feedback-${sessionData.id}`, JSON.stringify(feedbackData));
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
            // Re-remove all previously removed pages
            removedPages = new Set(lastAction.previousRemovedPages);
            if (sessionData && sessionData.id) {
                localStorage.setItem(`removed-pages-${sessionData.id}`, JSON.stringify(Array.from(removedPages)));
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
    }
    
    lastAction = null;
    disableUndoButton();
    updateTimeline();
}

function restoreAllRemovedPages() {
    if (removedPages.size === 0) {
        alert('No pages have been removed.');
        return;
    }
    
    const count = removedPages.size;
    const confirmMessage = `Restore ${count} removed page${count > 1 ? 's' : ''}?`;
    
    if (confirm(confirmMessage)) {
        // Track action for undo (store all removed pages)
        lastAction = {
            type: 'restoreAll',
            previousRemovedPages: new Set(removedPages)
        };
        enableUndoButton();
        
        clearRemovedPages();
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
    modifiedData.teacherAnnotations = feedbackData;
    
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