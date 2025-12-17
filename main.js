// Bible Verse Clock - Main Application Script

// Main Application Structure
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    setupServiceWorker();
    createAppStructure();
    setupEventListeners();
    startClock();
    loadFavorites();
    displayVerseOfDay();
    
    // Show welcome message on first visit
    if (!localStorage.getItem('bibleClockFirstVisit')) {
        showWelcomeMessage();
        localStorage.setItem('bibleClockFirstVisit', 'true');
    }
}

// Setup Service Worker for PWA
function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed: ', error);
                });
        });
    }
}

// Create app structure
function createAppStructure() {
    const app = document.getElementById('app') || document.body;
    
    app.innerHTML = `
        <header>
            <h1>Bible Verse Clock</h1>
            <div class="clock" id="clock">00:00:00</div>
        </header>
        
        <main>
            <div class="verse-container">
                <div id="verseDisplay" class="verse"></div>
                <div id="verseOfDayDisplay" class="verse verse-of-day"></div>
                <div id="favoriteVerseDisplay" class="verse favorite-verse"></div>
                <div id="searchResultDisplay" class="verse search-result"></div>
            </div>
            
            <div class="control-panel">
                <button id="favoriteBtn">❤ Favorite</button>
                <button id="shareBtn">Share</button>
                <button id="searchBtn">Search</button>
                <button id="categoriesBtn">Categories</button>
                <button id="devotionalBtn">Devotional</button>
            </div>
            
            <div id="searchPanel" class="search-panel">
                <input type="text" id="searchInput" placeholder="Search for verses...">
                <button id="closeSearchBtn">Close</button>
                <div id="searchResults"></div>
            </div>
            
            <div id="categoriesPanel" class="categories-panel">
                <h3>Categories</h3>
                <div class="category-buttons">
                    <button data-category="all" class="active">All</button>
                    <button data-category="faith">Faith</button>
                    <button data-category="love">Love</button>
                    <button data-category="peace">Peace</button>
                    <button data-category="encouragement">Encouragement</button>
                    <button data-category="wisdom">Wisdom</button>
                </div>
                <button id="closeCategoriesBtn">Close</button>
            </div>
        </main>
        
        <div id="favoritesPanel" class="favorites-panel">
            <h3>My Favorites</h3>
            <div id="favoritesList"></div>
            <button id="closeFavoritesBtn">Close</button>
        </div>
    `;
    
    // Add app styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        :root {
            --primary-color: #3a5a78;
            --accent-color: #d2a860;
            --text-color: #333;
            --light-text: #777;
            --bg-color: #f8f9fa;
            --card-bg: #fff;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: var(--bg-color);
            color: var(--text-color);
            line-height: 1.6;
        }
        
        header {
            background-color: var(--primary-color);
            color: white;
            padding: 1rem;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        h1 {
            margin: 0;
            font-size: 1.5rem;
        }
        
        .clock {
            font-size: 2rem;
            font-weight: bold;
            margin: 0.5rem 0;
        }
        
        main {
            padding: 1rem;
            max-width: 800px;
            margin: 0 auto;
        }
        
        .verse-container {
            background-color: var(--card-bg);
            border-radius: 8px;
            padding: 1.5rem;
            margin: 1rem 0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            min-height: 150px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        .verse {
            font-size: 1.1rem;
            text-align: center;
            line-height: 1.8;
        }
        
        .verse-of-day {
            display: none;
            color: var(--accent-color);
            font-weight: 500;
        }
        
        .favorite-verse {
            display: none;
        }
        
        .search-result {
            display: none;
        }
        
        .control-panel {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin: 1rem 0;
        }
        
        button {
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 0.5rem 1rem;
            cursor: pointer;
            font-family: inherit;
            font-size: 0.9rem;
            transition: background-color 0.2s;
        }
        
        button:hover {
            background-color: #2d4861;
        }
        
        button.active {
            background-color: var(--accent-color);
        }
        
        .search-panel {
            background-color: var(--card-bg);
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            display: none;
        }
        
        .search-panel input {
            width: 100%;
            padding: 0.7rem;
            margin-bottom: 1rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-family: inherit;
            font-size: 1rem;
        }
        
        .categories-panel {
            background-color: var(--card-bg);
            border-radius: 8px;
            padding: 1rem;
            margin: 1rem 0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            display: none;
        }
        
        .category-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin: 1rem 0;
        }
        
        .favorites-panel {
            position: fixed;
            top: 0;
            left: -300px;
            width: 300px;
            height: 100vh;
            background-color: var(--card-bg);
            padding: 1.5rem;
            box-shadow: 2px 0 8px rgba(0, 0, 0, 0.2);
            overflow-y: auto;
            transition: left 0.3s ease;
            z-index: 900;
        }
        
        .favorites-panel.open {
            left: 0;
        }
        
        @media (max-width: 600px) {
            .control-panel {
                flex-direction: column;
            }
            
            .favorites-panel {
                width: 100%;
                left: -100%;
            }
        }

        /* Theme Toggle */
        .theme-toggle {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
        }

        /* Dark Theme */
        body.dark-theme {
            --primary-color: #1e3a5a;
            --accent-color: #ffc247;
            --text-color: #f0f0f0;
            --light-text: #aaa;
            --bg-color: #121212;
            --card-bg: #1e1e1e;
        }

        body.dark-theme .verse-container {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        /* Modal Styles */
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            transition: all 0.3s ease;
        }
        
        .modal-content {
            background-color: var(--card-bg);
            margin: 15% auto;
            padding: 2rem;
            border-radius: 10px;
            width: 80%;
            max-width: 600px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            position: relative;
            transition: all 0.3s ease;
            color: var(--text-color);
        }
        
        .close-button {
            position: absolute;
            top: 10px;
            right: 15px;
            color: var(--light-text);
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
        }
        
        .close-button:hover {
            color: var(--accent-color);
        }
    `;
    
    document.head.appendChild(styleSheet);
}

// Setup Event Listeners
function setupEventListeners() {
    // Favorite button
    document.getElementById('favoriteBtn').addEventListener('click', toggleFavorite);
    
    // Share button
    document.getElementById('shareBtn').addEventListener('click', shareVerse);
    
    // Search functionality
    document.getElementById('searchBtn').addEventListener('click', () => {
        document.getElementById('searchPanel').style.display = 'block';
    });
    
    document.getElementById('closeSearchBtn').addEventListener('click', () => {
        document.getElementById('searchPanel').style.display = 'none';
    });
    
    document.getElementById('searchInput').addEventListener('input', searchVerses);
    
    // Categories
    document.getElementById('categoriesBtn').addEventListener('click', () => {
        document.getElementById('categoriesPanel').style.display = 'block';
    });
    
    document.getElementById('closeCategoriesBtn').addEventListener('click', () => {
        document.getElementById('categoriesPanel').style.display = 'none';
    });
    
    document.querySelectorAll('.category-buttons button').forEach(button => {
        button.addEventListener('click', (e) => {
            // Remove active class from all buttons
            document.querySelectorAll('.category-buttons button').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            e.target.classList.add('active');
            
            // Filter verses by category
            filterByCategory(e.target.getAttribute('data-category'));
        });
    });
    
    // Devotional button
    document.getElementById('devotionalBtn').addEventListener('click', showDevotional);
    
    // Add Theme Toggle Button to Header
    const header = document.querySelector('header');
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '🌙'; // Moon emoji for dark mode
    themeToggle.addEventListener('click', toggleTheme);
    header.appendChild(themeToggle);
    
    // Load saved theme preference
    if (localStorage.getItem('bibleClockTheme') === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.innerHTML = '☀️'; // Sun emoji for light mode
    }
}

// Toggle between light and dark theme
function toggleTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    
    if (document.body.classList.contains('dark-theme')) {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('bibleClockTheme', 'light');
        themeToggle.innerHTML = '🌙';
    } else {
        document.body.classList.add('dark-theme');
        localStorage.setItem('bibleClockTheme', 'dark');
        themeToggle.innerHTML = '☀️';
    }
}// Start the clock
function startClock() {
    updateClock();
    setInterval(updateClock, 1000);
}

// Update the clock display
function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;
    
    // Update verse every minute
    if (seconds === '00') {
        updateVerse(hours, minutes);
    }
}

// Update the verse based on time
function updateVerse(hours, minutes) {
    const timeKey = `${hours}:${minutes}`;
    
    // Try to find exact match
    let verse = verseCollection[timeKey];
    
    // If no exact match, try to find closest match
    if (!verse) {
        verse = getClosestVerse(timeKey);
    }
    
    // If category filter is active, apply it
    if (window.currentCategoryFilter) {
        let categoryMatches = false;
        
        // Look through all verses to find a match for both time and category
        for (const key in verseCollection) {
            const currentVerse = verseCollection[key];
            if (currentVerse.categories.includes(window.currentCategoryFilter)) {
                // Calculate time difference
                const [vHours, vMinutes] = key.split(':').map(Number);
                const [cHours, cMinutes] = timeKey.split(':').map(Number);
                
                const vTotalMinutes = vHours * 60 + vMinutes;
                const cTotalMinutes = cHours * 60 + cMinutes;
                
                const diff = Math.abs(vTotalMinutes - cTotalMinutes);
                
                // If it's within 30 minutes and matches category, use it
                if (diff <= 30) {
                    verse = currentVerse;
                    categoryMatches = true;
                    break;
                }
            }
        }
        
        // If no nearby verse matches the category, just use the original verse
        if (!categoryMatches) {
            verse = verseCollection[timeKey] || getClosestVerse(timeKey);
        }
    }
    
    const verseElement = document.getElementById('verseDisplay');
    verseElement.textContent = verse.text;
    verseElement.setAttribute('data-reference', verse.text.split(' - ')[0]);
    
    // Check if this verse is favorited
    updateFavoriteButtonState();
}

// Get closest verse if exact time not found
function getClosestVerse(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const targetMinutes = hours * 60 + minutes;
    
    let closestVerse = null;
    let closestDistance = Infinity;
    
    for (const time in verseCollection) {
        const [verseHours, verseMinutes] = time.split(':').map(Number);
        const verseMinutesTotal = verseHours * 60 + verseMinutes;
        const distance = Math.abs(verseMinutesTotal - targetMinutes);
        
        if (distance < closestDistance) {
            closestDistance = distance;
            closestVerse = verseCollection[time];
        }
    }
    
    return closestVerse || {
        text: "Psalm 119:105 - Your word is a lamp for my feet, a light on my path.",
        categories: ["wisdom", "faith"]
    };
}

// Display verse of the day
function displayVerseOfDay() {
    // Get today's date in a simple format (e.g., "2025-03-10")
    const today = new Date().toISOString().split('T')[0];
    
    // Use the date to seed a simple randomization
    const dateHash = hashString(today);
    
    // Get all verse keys
    const verseKeys = Object.keys(verseCollection);
    
    // Use the date hash to select a verse
    const selectedVerseKey = verseKeys[dateHash % verseKeys.length];
    const verseOfDay = verseCollection[selectedVerseKey];
    
    // Display the verse of the day
    const verseOfDayElement = document.getElementById('verseOfDayDisplay');
    verseOfDayElement.textContent = `Verse of the Day: ${verseOfDay.text}`;
    verseOfDayElement.style.display = 'block';
    
    // Hide verse of day after 10 seconds and show current time verse
    setTimeout(() => {
        verseOfDayElement.style.display = 'none';
    }, 10000);
}

// Simple string hash function
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

// Toggle favorite status of current verse
function toggleFavorite() {
    let verseElement = document.getElementById('verseDisplay');
    
    // Check which verse is currently visible
    if (verseElement.style.display === 'none') {
        if (document.getElementById('favoriteVerseDisplay').style.display !== 'none') {
            verseElement = document.getElementById('favoriteVerseDisplay');
        } else if (document.getElementById('searchResultDisplay').style.display !== 'none') {
            verseElement = document.getElementById('searchResultDisplay');
        } else if (document.getElementById('verseOfDayDisplay').style.display !== 'none') {
            verseElement = document.getElementById('verseOfDayDisplay');
        }
    }
    
    const verseText = verseElement.textContent.replace('Verse of the Day: ', '');
    const reference = verseElement.getAttribute('data-reference') || verseText.split(' - ')[0];
    
    // Get existing favorites
    let favorites = JSON.parse(localStorage.getItem('bibleClockFavorites') || '[]');
    
    // Check if already favorited
    const isFavorite = favorites.some(fav => fav.text === verseText);
    
    if (isFavorite) {
        // Remove from favorites
        favorites = favorites.filter(fav => fav.text !== verseText);
        showToast('Removed from favorites');
    } else {
        // Add to favorites
        favorites.push({
            text: verseText,
            reference: reference,
            timestamp: new Date().toISOString()
        });
        showToast('Added to favorites');
    }
    
    // Save favorites
    localStorage.setItem('bibleClockFavorites', JSON.stringify(favorites));
    
    // Update favorite button state
    updateFavoriteButtonState();
    
    // Update favorites list if visible
    if (document.querySelector) // Update favorites list if visible
    if (document.querySelector('.favorites-panel.open')) {
        displayFavorites();
    }
    
    // Trigger sync if online
    if (navigator.onLine && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(registration => {
            registration.sync.register('sync-favorites');
        });
    }
}

// Update favorite button state based on current verse
function updateFavoriteButtonState() {
    let verseElement = document.getElementById('verseDisplay');
    
    // Check which verse is currently visible
    if (verseElement.style.display === 'none') {
        if (document.getElementById('favoriteVerseDisplay').style.display !== 'none') {
            verseElement = document.getElementById('favoriteVerseDisplay');
        } else if (document.getElementById('searchResultDisplay').style.display !== 'none') {
            verseElement = document.getElementById('searchResultDisplay');
        } else if (document.getElementById('verseOfDayDisplay').style.display !== 'none') {
            verseElement = document.getElementById('verseOfDayDisplay');
        }
    }
    
    const verseText = verseElement.textContent.replace('Verse of the Day: ', '');
    const favoriteBtn = document.getElementById('favoriteBtn');
    
    // Get existing favorites
    const favorites = JSON.parse(localStorage.getItem('bibleClockFavorites') || '[]');
    
    // Check if current verse is favorited
    const isFavorite = favorites.some(fav => fav.text === verseText);
    
    // Update button appearance
    if (isFavorite) {
        favoriteBtn.innerHTML = '❤ Favorited';
        favoriteBtn.classList.add('active');
    } else {
        favoriteBtn.innerHTML = '❤ Favorite';
        favoriteBtn.classList.remove('active');
    }
}

// Load and display favorites
function loadFavorites() {
    // Add favorites button to control panel if not already there
    if (!document.getElementById('favoritesListBtn')) {
        const favoritesBtn = document.createElement('button');
        favoritesBtn.id = 'favoritesListBtn';
        favoritesBtn.textContent = 'My Favorites';
        favoritesBtn.addEventListener('click', () => {
            document.getElementById('favoritesPanel').classList.add('open');
            displayFavorites();
        });
        
        document.querySelector('.control-panel').appendChild(favoritesBtn);
    }
    
    // Add close button event listener
    document.getElementById('closeFavoritesBtn').addEventListener('click', () => {
        document.getElementById('favoritesPanel').classList.remove('open');
    });
}

// Display favorites in the panel
function displayFavorites() {
    const favoritesList = document.getElementById('favoritesList');
    const favorites = JSON.parse(localStorage.getItem('bibleClockFavorites') || '[]');
    
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p>No favorites yet. Add some by clicking the ❤ button.</p>';
        return;
    }
    
    // Sort favorites by newest first
    favorites.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Create HTML for favorites
    favoritesList.innerHTML = '';
    favorites.forEach(favorite => {
        const favoriteItem = document.createElement('div');
        favoriteItem.className = 'favorite-item';
        
        const reference = favorite.reference || favorite.text.split(' - ')[0];
        const verseText = favorite.text.split(' - ')[1] || favorite.text;
        
        favoriteItem.innerHTML = `
            <div class="favorite-reference">${reference}</div>
            <div class="favorite-text">${verseText}</div>
            <div class="favorite-actions">
                <button class="display-favorite" data-verse="${favorite.text}">Display</button>
                <button class="remove-favorite" data-verse="${favorite.text}">Remove</button>
            </div>
        `;
        
        favoritesList.appendChild(favoriteItem);
    });
    
    // Add styles for favorites
    if (!document.getElementById('favorites-styles')) {
        const favoritesStyles = document.createElement('style');
        favoritesStyles.id = 'favorites-styles';
        favoritesStyles.textContent = `
            .favorite-item {
                margin-bottom: 1rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid #eee;
            }
            
            .favorite-reference {
                font-weight: bold;
                color: var(--primary-color);
            }
            
            .favorite-text {
                margin: 0.5rem 0;
            }
            
            .favorite-actions {
                display: flex;
                gap: 0.5rem;
            }
            
            .favorite-actions button {
                padding: 0.3rem 0.6rem;
                font-size: 0.8rem;
            }
            
            .display-favorite {
                background-color: var(--primary-color);
            }
            
            .remove-favorite {
                background-color: #e74c3c;
            }
        `;
        
        document.head.appendChild(favoritesStyles);
    }
    
    // Add event listeners for favorite actions
    document.querySelectorAll('.display-favorite').forEach(button => {
        button.addEventListener('click', (e) => {
            const verseText = e.target.getAttribute('data-verse');
            displayFavoriteVerse(verseText);
            document.getElementById('favoritesPanel').classList.remove('open');
        });
    });
    
    document.querySelectorAll('.remove-favorite').forEach(button => {
        button.addEventListener('click', (e) => {
            const verseText = e.target.getAttribute('data-verse');
            removeFavorite(verseText);
        });
    });
}

// Display a favorite verse
function displayFavoriteVerse(verseText) {
    const currentVerseElement = document.getElementById('verseDisplay');
    const favoriteVerseElement = document.getElementById('favoriteVerseDisplay');
    
    // Hide current verse
    currentVerseElement.style.display = 'none';
    
    // Display favorite verse
    favoriteVerseElement.textContent = verseText;
    favoriteVerseElement.style.display = 'block';
    
    // Set data attribute for favorite button functionality
    favoriteVerseElement.setAttribute('data-reference', verseText.split(' - ')[0]);
    
    // Update favorite button state
    updateFavoriteButtonState();
    
    // Show toast
    showToast('Displaying favorite verse');
    
    // Return to current verse after 30 seconds
    setTimeout(() => {
        favoriteVerseElement.style.display = 'none';
        currentVerseElement.style.display = 'block';
        updateFavoriteButtonState();
    }, 30000);
}

// Remove a verse from favorites
function removeFavorite(verseText) {
    let favorites = JSON.parse(localStorage.getItem('bibleClockFavorites') || '[]');
    
    // Remove from favorites
    favorites = favorites.filter(fav => fav.text !== verseText);
    
    // Save updated favorites
    localStorage.setItem('bibleClockFavorites', JSON.stringify(favorites));
    
    // Update display
    displayFavorites();
    updateFavoriteButtonState();
    
    // Show toast
    showToast('Removed from favorites');
}

// Share current verse
function shareVerse() {
    // Determine which verse is currently visible
    let verseText;
    
    if (document.getElementById('verseDisplay').style.display !== 'none') {
        verseText = document.getElementById('verseDisplay').textContent;
    } else if (document.getElementById('favoriteVerseDisplay').style.display !== 'none') {
        verseText = document.getElementById('favoriteVerseDisplay').textContent;
    } else if (document.getElementById('searchResultDisplay').style.display !== 'none') {
        verseText = document.getElementById('searchResultDisplay').textContent;
    } else if (document.getElementById('verseOfDayDisplay').style.display !== 'none') {
        verseText = document.getElementById('verseOfDayDisplay').textContent.replace('Verse of the Day: ', '');
    } else {
        showToast('No verse to share');
        return;
    }
    
    // Use Web Share API if available
    if (navigator.share) {
        navigator.share({
            title: 'Bible Verse Clock',
            text: verseText,
            url: window.location.href
        })
        .then(() => showToast('Shared successfully'))
        .catch(error => {
            console.error('Error sharing:', error);
            fallbackShare(verseText);
        });
    } else {
        fallbackShare(verseText);
    }
}

// Fallback share method
function fallbackShare(text) {
    // Create a textarea, copy text to clipboard
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed'; // Avoid scrolling to bottom
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    
    try {
        document.execCommand('copy');
        showToast('Verse copied to clipboard');
    } catch (err) {
        console.error('Failed to copy verse:', err);
        showToast('Unable to copy verse');
    }
    
    document.body.removeChild(textarea);
}

// Search verses
function searchVerses() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const searchResults = document.getElementById('searchResults');
    
    // Clear previous results
    searchResults.innerHTML = '';
    
    if (searchTerm.length < 2) {
        return;
    }
    
    // Search in verse collection
    let resultsFound = 0;
    for (const timeKey in verseCollection) {
        const verse = verseCollection[timeKey];
        const verseText = verse.text.toLowerCase();
        
        // If verse text or categories contain search term
        if (verseText.includes(searchTerm) || verse.categories.some(cat => cat.includes(searchTerm))) {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            
            // Extract reference from verse text
            const reference = verse.text.split(' - ')[0];
            
            resultItem.innerHTML = `
                <div class="search-reference">${reference} (${timeKey})</div>
                <div class="search-text">${verse.text.split(' - ')[1]}</div>
                <button class="view-result" data-verse="${verse.text}" data-time="${timeKey}">View</button>
            `;
            
            searchResults.appendChild(resultItem);
            resultsFound++;
            
            // Limit results to avoid overwhelming the UI
            if (resultsFound >= 10) {
                break;
            }
        }
    }
    
    // Show message if no results found
    if (resultsFound === 0) {
        searchResults.innerHTML = '<p>No verses found matching your search.</p>';
    } else {
        // Add styles for search results
        if (!document.getElementById('search-styles')) {
            const searchStyles = document.createElement('style');
            searchStyles.id = 'search-styles';
            searchStyles.textContent = `
                .search-result-item {
                    margin-bottom: 1rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #eee;
                }
                
                .search-reference {
                    font-weight: bold;
                    color: var(--primary-color);
                }
                
                .search-text {
                    margin: 0.5rem 0;
                }
                
                .view-result {
                    background-color: var(--accent-color);
                    padding: 0.3rem 0.6rem;
                    font-size: 0.8rem;
                }
            `;
            
            document.head.appendChild(searchStyles);
        }
        
        // Add event listeners for view buttons
        document.querySelectorAll('.view-result').forEach(button => {
            button.addEventListener('click', (e) => {
                const verseText = e.target.getAttribute('data-verse');
                displaySearchResult(verseText);
                document.getElementById('searchPanel').style.display = 'none';
            });
        });
    }
} // Display search result
function displaySearchResult(verseText) {
    const currentVerseElement = document.getElementById('verseDisplay');
    const searchResultElement = document.getElementById('searchResultDisplay');
    
    // Hide current verse
    currentVerseElement.style.display = 'none';
    
    // Display search result
    searchResultElement.textContent = verseText;
    searchResultElement.style.display = 'block';
    
    // Set data attribute for favorite button functionality
    searchResultElement.setAttribute('data-reference', verseText.split(' - ')[0]);
    
    // Update favorite button state
    updateFavoriteButtonState();
    
    // Show toast
    showToast('Displaying search result');
    
    // Add close button
    if (!document.getElementById('closeSearchResultBtn')) {
        const closeBtn = document.createElement('button');
        closeBtn.id = 'closeSearchResultBtn';
        closeBtn.textContent = 'Return to Current Verse';
        closeBtn.className = 'close-search-result-btn';
        closeBtn.addEventListener('click', () => {
            searchResultElement.style.display = 'none';
            currentVerseElement.style.display = 'block';
            document.body.removeChild(closeBtn);
            updateFavoriteButtonState();
        });
        
        // Add styles for button
        const btnStyle = document.createElement('style');
        btnStyle.textContent = `
            .close-search-result-btn {
                position: fixed;
                bottom: 1rem;
                left: 50%;
                transform: translateX(-50%);
                background-color: var(--primary-color);
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 4px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                z-index: 100;
            }
        `;
        document.head.appendChild(btnStyle);
        
        document.body.appendChild(closeBtn);
    }
}

// Filter verses by category
function filterByCategory(category) {
    // Note: since we're not showing a list of verses but rather time-based verses,
    // we'll need to implement category filtering differently.
    
    // For this implementation, we'll set a global filter for the updateVerse function
    window.currentCategoryFilter = category === 'all' ? null : category;
    
    // Update the current verse based on the filter
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    updateVerse(hours, minutes);
    
    // Show toast about filtering
    showToast(category === 'all' ? 'Showing all verses' : `Filtering by "${category}"`);
    
    // Hide categories panel
    document.getElementById('categoriesPanel').style.display = 'none';
}

// Show devotional for current verse
function showDevotional() {
    // Determine which verse is currently visible
    let verseToUse;
    
    if (document.getElementById('verseOfDayDisplay').style.display !== 'none') {
        verseToUse = document.getElementById('verseOfDayDisplay').textContent.replace('Verse of the Day: ', '');
    } else if (document.getElementById('verseDisplay').style.display !== 'none') {
        verseToUse = document.getElementById('verseDisplay').textContent;
    } else if (document.getElementById('favoriteVerseDisplay').style.display !== 'none') {
        verseToUse = document.getElementById('favoriteVerseDisplay').textContent;
    } else if (document.getElementById('searchResultDisplay').style.display !== 'none') {
        verseToUse = document.getElementById('searchResultDisplay').textContent;
    } else {
        const now = new Date();
        const timeKey = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        verseToUse = verseCollection[timeKey]?.text || getClosestVerse(timeKey).text;
    }
    
    const devotional = getDevotionalForVerse(verseToUse);
    
    // Create devotional modal
    const devotionalModal = document.createElement('div');
    devotionalModal.className = 'modal';
    devotionalModal.innerHTML = `
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <h2>${devotional.title}</h2>
            <p class="verse-text">${verseToUse}</p>
            <div class="devotional-content">
                ${devotional.content}
            </div>
            <div class="devotional-prayer">
                <h3>Prayer Focus</h3>
                <p>Take a moment to pray about how you can apply this verse in your life today.</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(devotionalModal);
    
    // Show the modal
    setTimeout(() => {
        devotionalModal.style.display = "block";
    }, 100);
    
    // Close button functionality
    const closeButton = devotionalModal.querySelector(".close-button");
    closeButton.onclick = function() {
        devotionalModal.style.display = "none";
        setTimeout(() => {
            document.body.removeChild(devotionalModal);
        }, 300);
    };
    
    // Close when clicking outside
    window.onclick = function(event) {
        if (event.target === devotionalModal) {
            devotionalModal.style.display = "none";
            setTimeout(() => {
                document.body.removeChild(devotionalModal);
            }, 300);
        }
    };
    
    // Add styles for devotional
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
        .devotional-content {
            margin: 1.5rem 0;
            line-height: 1.6;
            color: var(--text-color);
        }
        
        .devotional-prayer {
            background-color: #f8f8f8;
            padding: 1rem;
            border-radius: 5px;
            margin-top: 1.5rem;
        }
        
        .verse-text {
            font-style: italic;
            margin: 1rem 0;
            padding: 0.75rem;
            background-color: rgba(0, 0, 0, 0.05);
            border-radius: 4px;
            border-left: 3px solid var(--accent-color);
        }
        
        body.dark-theme .devotional-prayer {
            background-color: #2c2c2c;
        }
        
        @media (max-width: 600px) {
            .modal-content {
                margin: 20% auto;
                width: 90%;
                padding: 1.5rem;
            }
        }
    `;

    document.head.appendChild(styleSheet);
}

// Show welcome message on first visit
function showWelcomeMessage() {
    // Create welcome modal
    const welcomeModal = document.createElement('div');
    welcomeModal.className = 'modal welcome-modal';
    welcomeModal.innerHTML = `
        <div class="modal-content">
            <h2>Welcome to Bible Verse Clock!</h2>
            <p>This app shows you a Bible verse based on the current time.</p>
            <ul>
                <li>Each time corresponds to a meaningful verse</li>
                <li>Save your favorite verses</li>
                <li>Search for specific verses</li>
                <li>Filter by categories</li>
                <li>Read daily devotionals</li>
                <li>Works offline</li>
            </ul>
            <p>May God's Word bring light to your day!</p>
            <button class="welcome-close-btn">Get Started</button>
        </div>
    `;
    
    document.body.appendChild(welcomeModal);
    
    // Add styles for welcome modal
    const welcomeStyles = document.createElement('style');
    welcomeStyles.textContent = `
        .welcome-modal {
            display: flex;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            align-items: center;
            justify-content: center;
        }
        
        .welcome-modal .modal-content {
            background-color: var(--card-bg);
            padding: 2rem;
            border-radius: 8px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        .welcome-modal h2 {
            color: var(--primary-color);
            margin-top: 0;
        }
        
        .welcome-modal ul {
            text-align: left;
            margin: 1.5rem 0;
            padding-left: 1.5rem;
        }
        
        .welcome-modal li {
            margin-bottom: 0.5rem;
        }
        
        .welcome-close-btn {
            background-color: var(--accent-color);
            padding: 0.75rem 2rem;
            margin-top: 1rem;
            font-size: 1rem;
        }
    `;
    
    document.head.appendChild(welcomeStyles);
    
    // Close button functionality
    const closeButton = welcomeModal.querySelector('.welcome-close-btn');
    closeButton.onclick = function() {
        welcomeModal.style.display = 'none';
        setTimeout(() => {
            document.body.removeChild(welcomeModal);
        }, 300);
    };
}

// Show toast message
function showToast(message) {
    // Remove existing toast if present
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        document.body.removeChild(existingToast);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    // Add toast styles if not already added
    if (!document.getElementById('toast-styles')) {
        const toastStyles = document.createElement('style');
        toastStyles.id = 'toast-styles';
        toastStyles.textContent = `
            .toast {
                position: fixed;
                bottom: 2rem;
                left: 50%;
                transform: translateX(-50%);
                background-color: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: 4px;
                font-size: 0.9rem;
                z-index: 1000;
                animation: fadeInOut 3s ease forwards;
            }
            
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, 20px); }
                10% { opacity: 1; transform: translate(-50%, 0); }
                90% { opacity: 1; transform: translate(-50%, 0); }
                100% { opacity: 0; transform: translate(-50%, -20px); }
            }
        `;
        
        document.head.appendChild(toastStyles);
    }
    
    // Add to DOM
    document.body.appendChild(toast);
    
    // Remove after animation
    setTimeout(() => {
        if (document.body.contains(toast)) {
            document.body.removeChild(toast);
        }
    }, 3000);
}

// Initialize features when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Enable dark theme if it's night time (after 6 PM or before 6 AM)
    const currentHour = new Date().getHours();
    if ((currentHour >= 18 || currentHour < 6) && !localStorage.getItem('bibleClockTheme')) {
        document.body.classList.add('dark-theme');
        localStorage.setItem('bibleClockTheme', 'dark');
    }
});
