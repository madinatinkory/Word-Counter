document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const textInput = document.getElementById('text-input');
  const wordCountEl = document.getElementById('word-count');
  const charCountEl = document.getElementById('char-count');
  const noSpaceCountEl = document.getElementById('no-space-count');
  const sentenceCountEl = document.getElementById('sentence-count');
  const readingTimeEl = document.getElementById('reading-time');
  const topWordsListEl = document.getElementById('top-words-list');
  const clearBtn = document.getElementById('clear-btn');

  // Constants
  const WORDS_PER_MINUTE = 200;
  const STOP_WORDS = new Set(['the', 'a', 'and']);

  /**
   * Calculates and updates text statistics based on input content.
   */
  function updateStats() {
    const text = textInput.value;

    // 1. Total Character Count
    const charCount = text.length;

    // 2. Character Count Excluding Spaces
    const noSpaceCount = text.replace(/\s/g, '').length;

    // 3. Raw Word Tokenization
    const trimmedText = text.trim();
    const rawWords = trimmedText ? trimmedText.split(/\s+/) : [];
    const wordCount = rawWords.length;

    // 4. Sentence Count
    const sentences = text.match(/[^.!?]+[.!?]+/g);
    const sentenceCount = sentences ? sentences.length : 0;

    // 5. Estimated Reading Time
    const rawMinutes = wordCount / WORDS_PER_MINUTE;
    let readingTimeText = '0 min';

    if (wordCount > 0) {
      if (rawMinutes < 1) {
        const seconds = Math.ceil(rawMinutes * 60);
        readingTimeText = `${seconds} sec`;
      } else {
        readingTimeText = `${Math.ceil(rawMinutes)} min`;
      }
    }

    // Update DOM Nodes for metrics
    wordCountEl.textContent = wordCount.toLocaleString();
    charCountEl.textContent = charCount.toLocaleString();
    noSpaceCountEl.textContent = noSpaceCount.toLocaleString();
    sentenceCountEl.textContent = sentenceCount.toLocaleString();
    readingTimeEl.textContent = readingTimeText;

    // Update Top 5 Used Words
    updateTopWords(rawWords);
  }

  /**
   * Cleans words, filters stop-words, and renders the top 5 most frequent words.
   * @param {string[]} rawWords - Array of uncleaned word tokens
   */
  function updateTopWords(rawWords) {
    const frequencyMap = new Map();

    rawWords.forEach((token) => {
      // Strip leading/trailing punctuation and convert to lowercase
      // Keeps internal alphanumeric chars & single quotes for contractions (e.g., "don't")
      const cleanedWord = token
        .toLowerCase()
        .replace(/^[^\w\d]+|[^\w\d]+$/g, '');

      // Ignore empty tokens or defined stop words
      if (cleanedWord && !STOP_WORDS.has(cleanedWord)) {
        frequencyMap.set(cleanedWord, (frequencyMap.get(cleanedWord) || 0) + 1);
      }
    });

    // Sort entries by count descending, then alphabetically ascending
    const sortedWords = Array.from(frequencyMap.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 5);

    // Render list
    topWordsListEl.innerHTML = '';

    if (sortedWords.length === 0) {
      topWordsListEl.innerHTML = '<li class="empty-state">No word data available</li>';
      return;
    }

    const fragment = document.createDocumentFragment();
    sortedWords.forEach(([word, count]) => {
      const li = document.createElement('li');
      li.className = 'word-badge';
      li.innerHTML = `<span>${escapeHTML(word)}</span> <span class="word-count-tag">${count}</span>`;
      fragment.appendChild(li);
    });

    topWordsListEl.appendChild(fragment);
  }

  /**
   * Helper utility to prevent HTML injection when rendering dynamic text.
   */
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag])
    );
  }

  /**
   * Resets the text area and sets all metrics back to zero.
   */
  function clearText() {
    textInput.value = '';
    updateStats();
    textInput.focus();
  }

  // Event Listeners
  textInput.addEventListener('input', updateStats);
  clearBtn.addEventListener('click', clearText);
});