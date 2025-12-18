const express = require('express');
const bodyParser = require('body-parser');
const natural = require('natural');
const sw = require('stopword');
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;
const fs = require('fs');
const { TfIdf } = natural;
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

let documents = []; 
let docTitles = [];
let docTypes = {};
let docPaths = {};
let originalDocsContent = {}; 

try {
    const rawCorpus = JSON.parse(fs.readFileSync('corpus.json', 'utf8'));
    
    for (const title in rawCorpus) {
        const item = rawCorpus[title];
        docTitles.push(title);
        docTypes[title] = item.type;
        
        let contentToIndex = "";
        let originalContent = "";
        let imagePath = null; 
        
        if (item.type === 'document') {
            contentToIndex = item.content;
            originalContent = item.content;
        } else if (item.type === 'image') {
            contentToIndex = `${item.content || ''} ${item.tags || ''}`;
            originalContent = `${item.content} [TAGS: ${item.tags}]`; 
            imagePath = `/img/${title}`;
        }
        
        documents.push(contentToIndex);
        originalDocsContent[title] = originalContent; 
        docPaths[title] = imagePath; 
    }
    console.log(`Loaded ${documents.length} items from corpus.json.`);
} catch (error) {
    console.error("Error loading corpus.json:", error.message);
    process.exit(1);
}

const tfidf = new TfIdf();

console.log("Building Index...");
documents.forEach((doc, i) => {
    const processedDocTokens = getPreprocessedDoc(doc); 
    
    tfidf.addDocument(processedDocTokens, docTitles[i]); 
});
console.log("Index Complete. Ready to search.");

function getPreprocessedDoc(docContent) {
    const tokens = tokenizer.tokenize(docContent.toLowerCase());
    
    const tokensWithoutStopWords = sw.removeStopwords(tokens, sw.en);

    const stemmedTokens = tokensWithoutStopWords
        .filter(token => typeof token === 'string' && token.trim().length > 0) 
        .map(token => stemmer.stem(token));
        
    return stemmedTokens; 
}

app.post('/search', (req, res) => {
    const query = req.body.query;
    const filter = req.body.filter;

    if (!query) {
        return res.status(400).json({ error: "Query is required." });
    }

    const tokens = tokenizer.tokenize(query.toLowerCase());
    const filteredTokens = sw.removeStopwords(tokens, sw.en);
    const removedStopWords = tokens.filter(word => !filteredTokens.includes(word));
    const query_stemmed_Words = filteredTokens.map(word => natural.PorterStemmer.stem(word));

    console.log("========================================");
    
    console.log("1. Original Query: ", query);
    console.log("2. Stop Words Removed: ", removedStopWords);
    console.log("3. After Stemming: ", query_stemmed_Words);
    
    console.log("========================================");

    const scores = [];
    
    tfidf.tfidfs(query_stemmed_Words, function (i, measure) {
        const doc_name = docTitles[i];
        
        if (filter === 'all' || docTypes[doc_name] === filter) {
            const snippetContent = originalDocsContent[doc_name];
            
            scores.push({
                doc_name: doc_name,
                type: docTypes[doc_name],
                score: measure,
                snippet: snippetContent.substring(0, 100) + '...',
                imageURL: docPaths[doc_name]
            });
        }
    });

    scores.sort((a, b) => b.score - a.score);
    const results = scores.filter(s => s.score > 0).slice(0, 5);

    res.json({ query: query, results: results });
});

app.get('/corpus-info', (req, res) => {
    const corpusInfo = [];
    
    docTitles.forEach((title, i) => {
        const contentToIndex = documents[i]; 
        const originalContent = originalDocsContent[title];
        
        const tokensArray = getPreprocessedDoc(contentToIndex);
        
        const termWeights = {};
        tfidf.listTerms(i).forEach(item => {
            termWeights[item.term] = item.tfidf.toFixed(4);
        });

        corpusInfo.push({
            title: title,
            type: docTypes[title],
            original: originalContent,
            
            preprocessed: tokensArray.join(' '), 
            
            weights: termWeights
        });
    });

    res.json(corpusInfo);
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});