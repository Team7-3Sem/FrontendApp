const MovieList = {
    container: null,
    moviesData: [],

    // Initialize the module
    init() {
        this.container = document.getElementById('movie-list');
        this.loadMovies();
    },

    // Load movies from the API
    async loadMovies() {
        try {
            const response = await fetch("http://localhost:8080/kinogrisen/movies");

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            this.moviesData = await response.json();
            console.log('Loaded movies:', this.moviesData);
            this.renderMovies();
        } catch (error) {
            console.error("Error fetching movies:", error);
            this.showError('Kunne ikke indlæse film. Prøv igen senere.');
        }
    },

    // Render movies to the DOM
    renderMovies() {
        console.log("Rendering movies...", this.moviesData); // ✅ Debugging full data

        if (!Array.isArray(this.moviesData) || this.moviesData.length === 0) {
            console.warn("❌ No movies found in API response!");
            this.container.innerHTML = '<p class="no-results">Der er ingen film at vise i øjeblikket :(</p>';
            return;
        }

        this.container.innerHTML = ''; // Clear previous content

        this.moviesData.forEach((movie, index) => {
            console.log(`Processing movie #${index + 1}:`, movie);

            if (!movie || !movie.title) {
                console.error(`❌ Skipping invalid movie object at index ${index}:`, movie);
                return;
            }

            console.log(`🔍 isActive value:`, movie.isActive); // ✅ Debugging `isActive`


            const movieElement = document.createElement('div');
            movieElement.className = 'movie-item';

            const imageSrc = movie.imageUrl ? movie.imageUrl : "/images/placeholder-movie.jpg";

            movieElement.innerHTML = `
            <div class="movie-poster">
                <img src="${imageSrc}" alt="${movie.title}">
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <p class="movie-genre">${movie.genre} | ${movie.duration} min | ${this.formatAgeRestriction(movie.ageRestriction)}</p>
                <p class="movie-description">${this.truncateText(movie.description, 150)}</p>
                <p class="movie-dates">Vises fra ${this.formatDate(new Date(movie.releaseDate))} til ${this.formatDate(new Date(movie.endDate))}</p>
            </div>
        `;

            this.container.appendChild(movieElement);
        });

        console.log("✅ Finished rendering movies");
    }

,

    // Load and display showings for a specific movie
    async loadShowingsForMovie(movieId) {
        try {
            const response = await fetch("http://localhost:8080/kinogrisen/showings");

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const showings = await response.json();
            const movieShowings = showings.filter(showing =>
                showing.movie.movieID === movieId && showing.isActive
            );

            const showingsList = document.getElementById(`showings-${movieId}`);

            if (!movieShowings.length) {
                showingsList.innerHTML = '<p>Ingen planlagte forestillinger.</p>';
                return;
            }

            movieShowings.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
            showingsList.innerHTML = '';

            movieShowings.forEach(showing => {
                const showingElement = document.createElement("div");
                showingElement.className = "showing-item";

                const startTime = new Date(showing.startTime);

                showingElement.innerHTML = `
                    <div class="showing-info">
                        <span class="showing-date">${this.formatDate(startTime)}</span>
                        <span class="showing-time">${this.formatTime(startTime)}</span>
                        <span class="showing-theater">Sal ${showing.theater.theaterId}</span>
                    </div>
                    <button class="book-btn" data-showing-id="${showing.showingID}">
                        Reservér
                    </button>
                `;

                showingsList.appendChild(showingElement);
            });

            const bookButtons = showingsList.querySelectorAll(".book-btn");
            bookButtons.forEach(button => {
                button.addEventListener("click", () => {
                    const showingId = button.getAttribute("data-showing-id");
                    ReservationModal.openForShowing(showingId);
                });
            });
        } catch (error) {
            const showingsList = document.getElementById(`showings-${movieId}`);
            showingsList.innerHTML = '<p class="error">Kunne ikke indlæse forestillinger :(</p>';
        }
    },

    formatDate(date) {
        return date.toLocaleDateString("da-DK", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    },

    formatAgeRestriction(age) {
        return age === 0 ? "Tilladt for alle" : `${age}+`;
    },

    truncateText(text, maxLength) {
        if (!text) return "";
        return text.length <= maxLength ? text : text.substring(0, maxLength) + "...";
    },

    showError(message) {
        this.container.innerHTML = `<p class="error">${message}</p>`;
    }
};

// Initialize MovieList when the page loads
document.addEventListener("DOMContentLoaded", () => MovieList.init());
