# 🌪️ Vector Space Information Retrieval System

![Project Status](https://img.shields.io/badge/Status-Completed-success?style=flat-square)
![Tech Stack](https://img.shields.io/badge/Stack-Node.js%20|%20Express%20|%20Natural-blue?style=flat-square)

A comprehensive **Information Retrieval (IR) System** developed as a university project. This engine implements the **Vector Space Model (VSM)** to rank documents based on relevance using **TF-IDF** weighting, **Stemming**, and **Stopword Removal**.

![prv](https://github.com/user-attachments/assets/9836869f-2ad6-4bd5-8f55-cef9e600f0b6)

## 🚀 Key Features

* **Vector Space Model:** Ranks results based on cosine similarity and TF-IDF scores.
* **NLP Pipeline:**
    * **Tokenization:** Breaks down text into meaningful units.
    * **Stopword Removal:** Filters out common words (e.g., "the", "is") using the `stopword` library.
    * **Stemming:** Reduces words to their root form (e.g., "calculates" → "calcul") using Porter Stemmer.
* **Multimedia Support:** Indexes both text documents and images (via tags).
* **In-Depth Analysis:** Provides a "Corpus Details" view to inspect term weights and preprocessed tokens.
* **Modern UI:** Clean, dark-themed interface built with Vanilla JS and CSS.

## 🛠️ Technical Architecture

The system is built using **Node.js** and **Express**. It utilizes the `natural` library for NLP tasks.

### Preprocessing Logic
The search engine ensures that the **query processing** matches the **document indexing** exactly:
1.  Query is tokenized.
2.  Stopwords are removed.
3.  Remaining tokens are stemmed.
4.  TF-IDF scores are calculated against the indexed corpus.

## 📦 Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/AmjedElian/Information-Retrieval-System.git](https://github.com/AmjedElian/Information-Retrieval-System.git)
    cd Information-Retrieval-System
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the server:**
    ```bash
    node server.js
    ```

4.  **Access the application:**
    Open your browser and navigate to `http://localhost:3000`.

## 📂 Project Structure

* `server.js`: The backend logic handling indexing and the TF-IDF algorithm.
* `corpus.json`: The dataset containing documents and image metadata.
* `public/`: Contains frontend assets (`index.html`, `style.css`, `client.js`).

---
**Developed by Amjed Elian**
