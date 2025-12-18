async function executeSearch() {
    const query = document.getElementById('query-input').value;
    const filter = document.querySelector('input[name="resultFilter"]:checked').value;
    
    if (!query) {
        document.getElementById('results-area').innerHTML = '<p class="guide-text">Enter keywords to start searching.</p>';
        return;
    }

    const resultsArea = document.getElementById('results-area');
    resultsArea.innerHTML = 'Searching...';

    try {
        const response = await fetch('/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query, filter: filter }) 
        });

        if (!response.ok) {
            throw new Error('Network connection failed or server error.');
        }
        const data = await response.json();

        let html = `<h2>Search Results for: "${data.query}"</h2>`;
        if (data.results.length === 0) {
            html += '<p>No relevant documents found.</p>';
        } else {
            data.results.forEach(item => {
                const typeIcon = item.type === 'image' ? '🖼️ Image' : '📄 Document';
                const scoreColor = item.score > 5 ? '#ffc107' : '#66bb6a';
                
                let mediaDisplay = '';
                if (item.imageURL) {
                    mediaDisplay = `<img src="${item.imageURL}" alt="${item.doc_name} preview" class="result-image">`;
                }

                html += `
                    <div class="result-item">
                        <h3>${typeIcon}: ${item.doc_name}</h3>
                        ${mediaDisplay}
                        <p>Relevance Score (TF-IDF Measure): <span class="score" style="color: ${scoreColor};">${item.score.toFixed(4)}</span></p>
                        <p>Snippet: <em>${item.snippet}</em></p>
                        <p class="explanation">Retrieval used stemming, stopword removal, and TF-IDF for ranking.</p>
                    </div>
                `;
            });
        }
        resultsArea.innerHTML = html;

    } catch (error) {
        console.error('Fetch error:', error);
        resultsArea.innerHTML = `<p style="color: red;">Error retrieving data: ${error.message}</p>`;
    }
}

document.getElementById('search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    executeSearch();
});

document.querySelectorAll('input[name="resultFilter"]').forEach(radio => {
    radio.addEventListener('change', executeSearch);
});


const modal = document.getElementById('corpus-modal');
const showBtn = document.getElementById('show-corpus-btn');
const closeBtn = document.querySelector('.close-button');
const corpusList = document.getElementById('corpus-list');

async function loadCorpusDetails() {
    corpusList.innerHTML = 'Loading indexing data...';
    try {
        const response = await fetch('/corpus-info');
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server Error (${response.status}): Check your server console for details.`);
        }
        
        const data = await response.json();
        
        let html = '';
        data.forEach(doc => {
            let weightsHtml = '<ul>';
            for (const [term, weight] of Object.entries(doc.weights)) {
                weightsHtml += `<li>${term}: ${weight}</li>`;
            }
            weightsHtml += '</ul>';
            
            const typeIcon = doc.type === 'image' ? '🖼️ Image' : '📄 Document';

            html += `
                <div class="doc-process-item">
                    <h3>${typeIcon}: ${doc.title}</h3>
                    <details>
                        <summary>Show Details</summary>
                        <p><strong>Original Content:</strong> ${doc.original}</p>
                        <p style="color: #4fc3f7;"><strong>After Processing & Stemming (Indexed Roots):</strong> ${doc.preprocessed}</p>
                        <h4>TF-IDF Weights for Stemmed Terms:</h4>
                        ${weightsHtml}
                    </details>
                </div>
            `;
        });
        
        corpusList.innerHTML = html;
        
    } catch (error) {
        corpusList.innerHTML = `<p style="color: red;">Error loading data: ${error.message}</p>`;
    }
}

showBtn.onclick = function() {
    modal.style.display = "block";
    loadCorpusDetails();
}

closeBtn.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}