let allBooks = [];

// Fetch data from JSON file
async function loadLibrary() {
  try {
    const base = window.location.href.replace(/\/[^/]*$/, '/');
    const response = await fetch(base + 'data/books.json');

    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    const data = await response.json();
    console.log('Data received:', data);

    if (Array.isArray(data)) {
      allBooks = data;
    } else if (Array.isArray(data.books)) {
      allBooks = data.books;
    } else {
      throw new Error(`Expected an array but got: ${typeof data}`);
    }

    populateLanguageFilter(allBooks);
    renderLibrary(allBooks);

  } catch (error) {
    console.error('Could not load library data:', error);
    document.getElementById('libraryGrid').innerHTML =
      `<div class="no-results">⚠️ Could not load library. Error: ${error.message}</div>`;
  }
}

// Build language dropdown from whatever languages exist in the data
function populateLanguageFilter(books) {
  const select = document.getElementById('languageFilter');
  const languages = [...new Set(books.map(b => b.language).filter(Boolean))].sort();

  languages.forEach(lang => {
    const opt = document.createElement('option');
    opt.value = lang;
    opt.textContent = lang;
    select.appendChild(opt);
  });
}

// Render book cards
function renderLibrary(books) {
  const grid  = document.getElementById('libraryGrid');
  const count = document.getElementById('resultsCount');

  if (!Array.isArray(books)) {
    console.error('renderLibrary expected an array, got:', books);
    grid.innerHTML = `<div class="no-results">⚠️ Library data is malformed.</div>`;
    return;
  }

  count.textContent = `Showing ${books.length} item${books.length !== 1 ? 's' : ''}`;

  if (books.length === 0) {
    grid.innerHTML = `<div class="no-results">📭 No results found.</div>`;
    return;
  }

  grid.innerHTML = books.map(book => `
    <div class="book-card">
      <img src="${book.cover}" alt="${book.title}" />
      <div class="book-info">
        <h3>${book.title}</h3>
        <p class="author">by ${book.author} · ${book.year}</p>
        <span class="category">${book.category}</span>
        ${book.language  ? `<span class="language-badge">${book.language}</span>` : ''}
        ${book.fileType  ? `<span class="file-badge">${book.fileType}${book.fileSize ? ' · ' + book.fileSize : ''}</span>` : ''}
        <p class="description">${book.description}</p>
        <div class="card-actions">
          <a href="${book.link}" target="_blank">Open →</a>
          ${book.fileType ? `<a href="${book.link}" download class="btn-download">⬇ Download</a>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

// Filter and sort
function applyFilters() {
  const query    = document.getElementById('searchInput').value.toLowerCase();
  const language = document.getElementById('languageFilter').value;
  const category = document.getElementById('categoryFilter').value;
  const sort     = document.getElementById('sortOrder').value;

  let filtered = allBooks.filter(book => {
    const matchesSearch   = book.title.toLowerCase().includes(query) ||
                            book.author.toLowerCase().includes(query);
    const matchesLanguage = language === 'all' || book.language === language;
    const matchesCategory = category === 'all' || book.category === category;
    return matchesSearch && matchesLanguage && matchesCategory;
  });

  filtered.sort((a, b) => {
    if (sort === 'year')   return b.year - a.year;
    if (sort === 'author') return a.author.localeCompare(b.author);
    return a.title.localeCompare(b.title);
  });

  renderLibrary(filtered);
}

// Event Listeners
document.getElementById('searchInput').addEventListener('input', applyFilters);
document.getElementById('languageFilter').addEventListener('change', applyFilters);
document.getElementById('categoryFilter').addEventListener('change', applyFilters);
document.getElementById('sortOrder').addEventListener('change', applyFilters);

// Initialize
loadLibrary();
