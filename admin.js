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

document.getElementById('videoForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const submitBtn = e.target.querySelector('.submit-btn');
  submitBtn.textContent = 'Saving...';
  submitBtn.disabled = true;

  const videoData = {
    title: document.getElementById('title').value,
    description: document.getElementById('description').value,
    collection: document.getElementById('collection').value,
    videoUrl: document.getElementById('videoUrl').value,
    thumbnail: document.getElementById('thumbnail').value,
    published: document.getElementById('published').checked,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    await db.collection('videos').add(videoData);
    alert('Video added successfully!');
    e.target.reset();
  } catch (error) {
    console.error("Error adding video: ", error);
    alert('Failed to save video. Check console.');
  } finally {
    submitBtn.textContent = 'Save to Firebase';
    submitBtn.disabled = false;
  }
});
