document.addEventListener("DOMContentLoaded", () => {
  const API_KEY = "56b9ed8422091d62e0ecee25c3d61824";
  const BASE_URL = "https://api.themoviedb.org/3";
  const IMG_URL = "https://image.tmdb.org/t/p/w500";

  // Containers
  const movieContainer = document.querySelector(".movies-container") || document.getElementById("movies");
  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");

  if (!movieContainer) {
    console.error("⚠️ movies container not found on this page!");
    return;
  }

  // Detect current page
  const path = window.location.pathname;

  if (path.includes("hollywood.html")) {
    fetchMovies("en");
  } else if (path.includes("bollywood.html")) {
    fetchMovies("hi");
  } else if (path.includes("tvshows.html")) {
    fetchTVShows();
  } else {
    fetchTrending();
  }

  // ==============================
  // 🎬 FETCH MOVIES (with pagination)
  // ==============================
  function fetchMovies(lang, page = 1) {
    fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=${lang}&page=${page}`)
      .then(res => res.json())
      .then(data => {
        showMovies(data.results, page !== 1); // append if not first page

        // If there are more pages, show "Load More" button
        if (data.page < data.total_pages) {
          createLoadMoreButton(lang, data.page + 1);
        }
      })
      .catch(err => console.error("Error fetching movies:", err));
  }

  function createLoadMoreButton(lang, nextPage) {
    let existingBtn = document.querySelector(".load-more");
    if (existingBtn) existingBtn.remove();

    const btn = document.createElement("button");
    btn.textContent = "Load More 🎬";
    btn.classList.add("load-more");
    btn.style.cssText = `
      display: block;
      margin: 30px auto;
      padding: 12px 25px;
      background: #ff5e00;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
    `;

    btn.addEventListener("click", () => {
      btn.remove();
      fetchMovies(lang, nextPage);
    });

    movieContainer.after(btn);
  }

  // ==============================
  // 📺 FETCH TV SHOWS
  // ==============================
  function fetchTVShows(page = 1) {
    fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}`)
      .then(res => res.json())
      .then(data => {
        showMovies(data.results, page !== 1);

        if (data.page < data.total_pages) {
          createTVLoadMoreButton(data.page + 1);
        }
      })
      .catch(err => console.error("Error fetching TV shows:", err));
  }

  function createTVLoadMoreButton(nextPage) {
    let existingBtn = document.querySelector(".load-more");
    if (existingBtn) existingBtn.remove();

    const btn = document.createElement("button");
    btn.textContent = "Load More 📺";
    btn.classList.add("load-more");
    btn.style.cssText = `
      display: block;
      margin: 30px auto;
      padding: 12px 25px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
    `;

    btn.addEventListener("click", () => {
      btn.remove();
      fetchTVShows(nextPage);
    });

    movieContainer.after(btn);
  }

  // ==============================
  // 🔥 FETCH TRENDING
  // ==============================
  function fetchTrending(page = 1) {
    fetch(`${BASE_URL}/trending/all/day?api_key=${API_KEY}&page=${page}`)
      .then(res => res.json())
      .then(data => {
        showMovies(data.results, page !== 1);

        if (data.page < data.total_pages) {
          createTrendingLoadMoreButton(data.page + 1);
        }
      })
      .catch(err => console.error("Error fetching trending:", err));
  }

  function createTrendingLoadMoreButton(nextPage) {
    let existingBtn = document.querySelector(".load-more");
    if (existingBtn) existingBtn.remove();

    const btn = document.createElement("button");
    btn.textContent = "Load More 🔥";
    btn.classList.add("load-more");
    btn.style.cssText = `
      display: block;
      margin: 30px auto;
      padding: 12px 25px;
      background: #ff2e63;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
    `;

    btn.addEventListener("click", () => {
      btn.remove();
      fetchTrending(nextPage);
    });

    movieContainer.after(btn);
  }

  // ==============================
  // 🎞️ SHOW MOVIES (append mode)
  // ==============================
  function showMovies(movies, append = false) {
    if (!append) movieContainer.innerHTML = "";

    if (!movies || movies.length === 0) {
      if (!append) movieContainer.innerHTML = "<p>No movies found.</p>";
      return;
    }

    movies.forEach(movie => {
      const card = document.createElement("div");
      card.classList.add("movie-card");
      card.innerHTML = `
        <img src="${movie.poster_path ? IMG_URL + movie.poster_path : ''}" alt="${movie.title || movie.name}">
        <h3>${movie.title || movie.name}</h3>
      `;
      card.addEventListener("click", () => openTrailer(movie.id));
      movieContainer.appendChild(card);
    });
  }

  // ==============================
  // 🎥 TRAILER POPUP
  // ==============================
  function openTrailer(movieId) {
    const modal = document.getElementById("trailerModal");
    const trailerFrame = document.getElementById("trailerFrame");
    const closeBtn = document.querySelector(".close");

    fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`)
      .then(res => res.json())
      .then(data => {
        const youtubeTrailer = data.results.find(video => video.site === "YouTube");
        if (youtubeTrailer) {
          trailerFrame.src = `https://www.youtube.com/embed/${youtubeTrailer.key}`;
          modal.style.display = "flex";
        } else {
          alert("No trailer available 😔");
        }
      });

    closeBtn.onclick = () => {
      modal.style.display = "none";
      trailerFrame.src = "";
    };

    window.onclick = e => {
      if (e.target === modal) {
        modal.style.display = "none";
        trailerFrame.src = "";
      }
    };
  }

  // ==============================
  // 🔍 SEARCH FEATURE
  // ==============================
  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", () => {
      const query = searchInput.value.trim();
      if (query) searchMovies(query);
    });
  }

  async function searchMovies(query) {
    try {
      const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
      const data = await res.json();
      showMovies(data.results);
    } catch (error) {
      console.error("Error searching movies:", error);
    }
  }
});

  document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");
    const searchBar = document.querySelector(".search-bar");

    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      searchBar.classList.toggle("active");
    });
  });

