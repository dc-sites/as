// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAEdEpK8B4WGR0iYZL5GKR20Q5p1MCU2l4",
  authDomain: "asianhub-9f45c.firebaseapp.com",
  projectId: "asianhub-9f45c",
  storageBucket: "asianhub-9f45c.firebasestorage.app",
  messagingSenderId: "297225882992",
  appId: "1:297225882992:web:59a3b7212c3ca2cdd1d3b5",
  measurementId: "G-8RYD4W7YBB"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let lastVisible = null;
const VIDEOS_PER_PAGE = 12;
let currentCollection = 'all';

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

themeToggle.addEventListener('click', () => {
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  themeToggle.innerHTML = newTheme === 'dark' 
    ? '<i class="fas fa-moon"></i> <span>Dark Mode</span>' 
    : '<i class="fas fa-sun"></i> <span>Light Mode</span>';
  localStorage.setItem('theme', newTheme);
});

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
themeToggle.innerHTML = savedTheme === 'dark' 
  ? '<i class="fas fa-moon"></i> <span>Dark Mode</span>' 
  : '<i class="fas fa-sun"></i> <span>Light Mode</span>';

// Fetch Videos with Cursor Pagination
async function loadVideos(isLoadMore = false) {
  const grid = document.getElementById('videoGrid');
  const loadBtn = document.getElementById('loadMoreBtn');
  
  if (!isLoadMore) {
    grid.innerHTML = '<p style="text-align:center; width:100%;">Loading...</p>';
  }

  let query = db.collection('videos').where('published', '==', true).orderBy('createdAt', 'desc').limit(VIDEOS_PER_PAGE);

  if (currentCollection !== 'all') {
    query = query.where('collection', '==', currentCollection);
  }

  if (isLoadMore && lastVisible) {
    query = query.startAfter(lastVisible);
  }

  try {
    const snapshot = await query.get();
    if (snapshot.empty) {
      loadBtn.style.display = 'none';
      if (!isLoadMore) grid.innerHTML = '<p style="text-align:center; width:100%;">No videos found.</p>';
      return;
    }

    lastVisible = snapshot.docs[snapshot.docs.length - 1];

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const card = document.createElement('div');
      card.className = 'video-card';
      card.innerHTML = `
        <div class="thumbnail-wrapper">
          <img src="${data.thumbnail}" alt="${data.title}" loading="lazy">
          <i class="fas fa-play-circle play-icon"></i>
        </div>
        <div class="card-info">
          <h3>${data.title}</h3>
          <p>${data.description}</p>
        </div>
      `;
      card.addEventListener('click', () => openModal(data));
      grid.appendChild(card);
    });

    loadBtn.style.display = snapshot.docs.length < VIDEOS_PER_PAGE ? 'none' : 'inline-block';
  } catch (error) {
    console.error("Error fetching videos:", error);
  }
}

// Modal & No-Download Logic
const modal = document.getElementById('videoModal');
const mainVideo = document.getElementById('mainVideo');

function openModal(data) {
  document.getElementById('modalTitle').textContent = data.title;
  document.getElementById('modalDesc').textContent = data.description;
  mainVideo.src = data.videoUrl;
  modal.classList.add('active');
  mainVideo.play();
}

document.getElementById('closeModal').addEventListener('click', () => {
  modal.classList.remove('active');
  mainVideo.pause();
  mainVideo.src = "";
});

// Prevent keyboard download shortcut (Ctrl+S / Cmd+S)
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
  }
});

// Collection Filters
document.getElementById('collectionFilters').addEventListener('click', async (e) => {
  if (e.target.classList.contains('filter-btn')) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    currentCollection = e.target.dataset.collection;
    lastVisible = null;
    await loadVideos(false);
  }
});

// Load More Button
document.getElementById('loadMoreBtn').addEventListener('click', () => {
  loadVideos(true);
});

// Initial Load
loadVideos(false);

// Dynamically load collections for filters
async function loadCollections() {
  const snapshot = await db.collection('videos').where('published', '==', true).get();
  const collections = new Set();
  snapshot.docs.forEach(doc => {
    if (doc.data().collection) collections.add(doc.data().collection);
  });
  
  const filterContainer = document.getElementById('collectionFilters');
  collections.forEach(col => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.collection = col;
    btn.textContent = col;
    filterContainer.appendChild(btn);
  });
}
loadCollections();
