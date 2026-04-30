// recommendationModel.js
// This file contains the Machine Learning logic used for recommendations.
// Model used: Content-Based Recommendation with TF-IDF, Cosine Similarity, and KNN.

function getRecommendationsFromModel(dataset, selectedId, k) {
    // Find the position of the item that the user clicked.
    const selectedIndex = dataset.findIndex((item) => item.id === selectedId);

    // If the selected item is not found, return no recommendations.
    if (selectedIndex === -1) {
        return [];
    }

    // ML Step 1: Convert every item into a TF-IDF vector using its tags.
    // Example: "book study math" becomes a list of numbers.
    const tfidfVectors = buildTfidfVectors(dataset);

    // ML Step 3: Apply KNN by selecting the K items nearest to the selected item.
    return getKNearestNeighbors(dataset, tfidfVectors, selectedIndex, k);
}

function getKNearestNeighbors(dataset, tfidfVectors, selectedIndex, k) {
    // This is the vector of the item selected by the user.
    const selectedItemVector = tfidfVectors[selectedIndex];
    const selectedItem = dataset[selectedIndex];
    const similarityResults = [];

    for (let index = 0; index < dataset.length; index++) {
        // Do not compare the selected item with itself.
        if (index === selectedIndex) {
            continue;
        }

        const comparedItem = dataset[index];
        const comparedItemVector = tfidfVectors[index];

        // ML Step 2: Use cosine similarity to measure how close two TF-IDF vectors are.
        const similarityScore = cosineSimilarity(selectedItemVector, comparedItemVector);

        similarityResults.push({
            item: comparedItem,
            score: similarityScore,
            matchingTags: getMatchingTags(selectedItem, comparedItem)
        });
    }

    // KNN: Sort all items from most similar to least similar.
    similarityResults.sort((a, b) => b.score - a.score);

    // KNN: Select only the top K nearest neighbors as recommendations.
    return similarityResults.slice(0, k);
}

function buildTfidfVectors(dataset) {
    const documents = [];
    const vocabulary = [];

    for (const item of dataset) {
        // Each item's tags are treated like one small document.
        const documentWords = tokenizeModelText(item.tags);
        documents.push(documentWords);

        for (const word of documentWords) {
            // Vocabulary means the list of all unique words from all item tags.
            if (!vocabulary.includes(word)) {
                vocabulary.push(word);
            }
        }
    }

    const totalDocuments = documents.length;
    const tfidfVectors = [];

    for (const document of documents) {
        const vector = [];

        for (const term of vocabulary) {
            // TF-IDF = Term Frequency * Inverse Document Frequency.
            // This gives higher weight to important tags and lower weight to common tags.
            const tf = termFrequency(term, document);
            const idf = inverseDocumentFrequency(term, documents, totalDocuments);
            const tfidfScore = tf * idf;

            vector.push(tfidfScore);
        }

        tfidfVectors.push(vector);
    }

    return tfidfVectors;
}

function termFrequency(term, document) {
    if (document.length === 0) {
        return 0;
    }

    // TF shows how often a tag appears in one item's tag list.
    let matchingWordCount = 0;

    for (const word of document) {
        if (word === term) {
            matchingWordCount++;
        }
    }

    return matchingWordCount / document.length;
}

function inverseDocumentFrequency(term, documents, totalDocuments) {
    let documentsWithTerm = 0;

    for (const document of documents) {
        if (document.includes(term)) {
            documentsWithTerm++;
        }
    }

    if (documentsWithTerm === 0) {
        return 0;
    }

    // IDF reduces the importance of tags that appear in many items.
    return Math.log(totalDocuments / documentsWithTerm);
}

function cosineSimilarity(vectorA, vectorB) {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vectorA.length; i++) {
        const valueFromVectorA = vectorA[i];
        const valueFromVectorB = vectorB[i];

        // Dot product multiplies matching positions from both vectors.
        dotProduct += valueFromVectorA * valueFromVectorB;

        // Magnitude is the length of each vector.
        magnitudeA += valueFromVectorA * valueFromVectorA;
        magnitudeB += valueFromVectorB * valueFromVectorB;
    }

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    // Cosine similarity compares vector direction, returning a score from 0 to 1.
    // Higher score means the two items are more similar.
    return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

function getMatchingTags(selectedItem, comparedItem) {
    const selectedTags = tokenizeModelText(selectedItem.tags);
    const comparedTags = tokenizeModelText(comparedItem.tags);
    const matchingTags = [];

    for (const tag of selectedTags) {
        if (comparedTags.includes(tag)) {
            matchingTags.push(tag);
        }
    }

    return matchingTags;
}

function tokenizeModelText(text) {
    return cleanModelText(text).split(" ").filter(Boolean);
}

function cleanModelText(text) {
    return String(text)
        .toLowerCase()
        .replace(/#/g, "")
        .replace(/[^a-z0-9 ]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}
