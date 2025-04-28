// Constants
const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = "58a1f49d9b24a50a62643b06dae0cca0";

// State
const state = {
  currentTab: "home",
  currentCategory: "popular",
  currentPage: 1,
  totalPages: 1,
  likedMovies: new Set(),
  movies: [],
  allMovies: new Map(),
};

// Controller
function fetchMovies() {
  const url = `${BASE_URL}/movie/${state.currentCategory}?api_key=${API_KEY}&page=${state.currentPage}`;
  fetch(url)
    .then((resp) => {
      if (resp.ok) return resp.json();
    })
    .then((data) => {
      state.movies = data.results;
      state.totalPages = data.total_pages;
      data.results.forEach((movie) => {
        state.allMovies.set(movie.id, movie);
      });
      renderMovies();
    });
}

function handleCategoryChange(event) {
  state.currentCategory = event.target.value;
  state.currentPage = 1;
  fetchMovies();
}

function handlePageChange(delta) {
  state.currentPage = Math.max(1, state.currentPage + delta);
  fetchMovies();
}

function toggleLike(movieId) {
  movieId = Number(movieId);
  if (state.likedMovies.has(movieId)) {
    state.likedMovies.delete(movieId);
  } else {
    state.likedMovies.add(movieId);
  }

  const likeBtn = document.querySelector(`.like-btn[data-id="${movieId}"]`);
  if (likeBtn) {
    likeBtn.classList.toggle("ion-ios-heart");
    likeBtn.classList.toggle("ion-ios-heart-outline");
    likeBtn.style.color = state.likedMovies.has(movieId) ? "red" : "white";
  }

  if (state.currentTab === "liked") renderMovies();
}

function handleTabClick(tab) {
  state.currentTab = tab;
  renderMovies();
}

function fetchMovieDetails(movieId) {
  const url = `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`;
  fetch(url)
    .then((resp) => {
      if (resp.ok) return resp.json();
    })
    .then((data) => {
      renderMovieDetails(data);
    });
}

// View
function renderMovies() {
  const container = document.getElementById("movies-container");
  container.innerHTML = "";

  const moviesToDisplay =
    state.currentTab === "liked"
      ? Array.from(state.likedMovies)
          .map((id) => state.allMovies.get(id))
          .filter(Boolean)
      : state.movies;

  moviesToDisplay.forEach((movie) => {
    const card = createMovieCard(movie);
    container.insertAdjacentHTML("beforeend", card);
  });

  updatePagination();
}

function createMovieCard(movie) {
  const isLiked = state.likedMovies.has(movie.id);

  return `
    <div class="movie-card">
      <img src="https://image.tmdb.org/t/p/w500${
        movie.poster_path
      }" class="movie-poster">
      <div class="movie-info">
        <div class="movie-title" data-id="${movie.id}">${movie.title}</div>
        <div class="rating">
          <i class="ion-star"></i>
          ${movie.vote_average}
        </div>
        <i class="like-btn ion-ios-heart${isLiked ? "" : "-outline"}" 
           data-id="${movie.id}" style="color: ${
    isLiked ? "red" : "white"
  }"></i>
      </div>
    </div>
  `;
}

function updatePagination() {
  document.getElementById(
    "page-info"
  ).textContent = `${state.currentPage} / ${state.totalPages}`;

  document.getElementById("prev").disabled = state.currentPage === 1;
  document.getElementById("next").disabled =
    state.currentPage === state.totalPages;
}

function renderMovieDetails(movie) {
  const modalContent = document.getElementById("modal-content");

  modalContent.innerHTML = `
    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}">
    <h2>${movie.title}</h2>
    <h3>Overview</h3>
    <p>${movie.overview}</p>
    <h3>Genres</h3>
    <div class="genres">
      ${movie.genres.map((genre) => `<span>${genre.name}</span>`).join(",")}
    </div>
    <h3>Rating</h3>
    <p>${movie.vote_average}</p>
    <h3>Production companies</h3>
    <div class="production">
      ${movie.production_companies
        .map(
          (company) => `
        <img src="https://image.tmdb.org/t/p/w200${company.logo_path}" alt="${company.name}">
      `
        )
        .join(",")}
    </div>
  `;
  document.getElementById("modal").style.display = "block";
}

// Event Listeners
function setupEventListeners() {
  document
    .getElementById("home-tab")
    .addEventListener("click", () => handleTabClick("home"));
  document
    .getElementById("liked-tab")
    .addEventListener("click", () => handleTabClick("liked"));

  document
    .getElementById("category")
    .addEventListener("change", handleCategoryChange);

  document
    .getElementById("prev")
    .addEventListener("click", () => handlePageChange(-1));
  document
    .getElementById("next")
    .addEventListener("click", () => handlePageChange(1));

  document.getElementById("movies-container").addEventListener("click", (e) => {
    const movieCard = e.target.closest(".movie-card");
    if (!movieCard) return;

    if (e.target.closest(".like-btn")) {
      const movieId = e.target.closest(".like-btn").dataset.id;
      toggleLike(movieId);
    }

    if (e.target.closest(".movie-title")) {
      const movieId = e.target.closest(".movie-title").dataset.id;
      fetchMovieDetails(movieId);
    }
  });

  document.getElementById("close-modal").addEventListener("click", () => {
    document.getElementById("modal").style.display = "none";
  });
}

setupEventListeners();
fetchMovies();
