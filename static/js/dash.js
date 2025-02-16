let currentType = 'jobs'; // Default tab type
const resultsContainer = document.getElementById('results');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error-message');

// Automatically load default jobs on page load
window.addEventListener('load', autoSearch);

// Setup tab switching
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentType = tab.dataset.type;
        toggleFilters();
        clearResults();
        autoSearch();
    });
});

// Toggle filters visibility
function toggleFilters() {
    document.getElementById('job-filters').style.display = currentType === 'jobs' ? 'block' : 'none';
    document.getElementById('scholarship-filters').style.display = currentType === 'scholarships' ? 'block' : 'none';
    document.getElementById('internship-filters').style.display = currentType === 'internships' ? 'block' : 'none';
}

// Handle form submission for keyword search
document.getElementById('search-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const keywords = document.getElementById('keywords').value.trim();
    if (!keywords) return showError('Please enter keywords to search');
    await searchOpportunities(keywords);
});

// Automatically search with default keywords
function autoSearch() {
    const defaultKeywords = currentType === 'jobs' ? 'Developer' : currentType === 'scholarships' ? 'Scholarship' : 'Internship';
    searchOpportunities(defaultKeywords);
}

// Search internships based on keyword and type
async function fetchInternships(keyword = '') {
    await searchOpportunities(keyword || "Internship");
}

// Fetch opportunities based on keyword and filters
async function searchOpportunities(keywords) {
    showLoading();
    clearError();
    clearResults();

    const filters = {
        jobs: document.getElementById('job-type')?.value || '',
        scholarships: document.getElementById('scholarship-type')?.value || '',
        internships: document.getElementById('internship-type')?.value || ''
    };
    const location = document.getElementById('location').value.trim();
    const endpoint = `/api/${currentType}?keywords=${encodeURIComponent(keywords)}&type=${encodeURIComponent(filters[currentType])}&location=${encodeURIComponent(location)}`;

    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        data.length ? displayResults(data, keywords) : showError('No results found. Try different keywords.');
    } catch (error) {
        showError('An error occurred while fetching results. Please try again.');
        console.error('Error:', error);
    } finally {
        hideLoading();
    }
}

// Format date in YYYY-MM-DD format
function formatDate(dateString) {
    if (!dateString) return 'Recently posted';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Display search results
function displayResults(results, keyword) {
    results.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';

        const highlightedTitle = highlightKeyword(item.title || 'Untitled', keyword);
        const highlightedSnippet = highlightKeyword(item.snippet || '', keyword);
        const internshipType = highlightKeyword(item.type || 'Not specified', keyword);

        card.innerHTML = `
            <h3 class="text-xl font-bold text-gray-900">${highlightedTitle}</h3>
            <div class="card-content text-gray-600">
                <p><strong>Company:</strong> ${highlightKeyword(item.company || 'Not specified', keyword)}</p>
                <p><strong>Location:</strong> ${highlightKeyword(item.location || 'Not specified', keyword)}</p>
                <p><strong>Type:</strong> ${internshipType}</p> <!-- Displaying Internship Type -->
                <p class="mt-2">${highlightKeyword(item.snippet || item.description || 'No description available', keyword)}</p>
            </div>
            <div class="card-footer">
                <span class="text-gray-500">Posted: ${formatDate(item.updated || item.last_updated)}</span>
                <a href="${item.link || '#'}" target="_blank" class="apply-btn">Apply Now</a>
            </div>
        `;
        resultsContainer.appendChild(card);
    });
}

// Highlight keyword within text
function highlightKeyword(text, keyword) {
    return keyword ? text.replace(new RegExp(`(${keyword})`, 'gi'), '<span class="highlight">$1</span>') : text;
}

function showLoading() { loadingElement.style.display = 'block'; }
function hideLoading() { loadingElement.style.display = 'none'; }
function showError(message) { errorElement.innerText = message; }
function clearError() { errorElement.innerText = ''; }
function clearResults() { resultsContainer.innerHTML = ''; }
