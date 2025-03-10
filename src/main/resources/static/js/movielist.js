

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
            this.moviesData = await API.movies.getAll();
            this.renderMovies();
        } catch (error) {
            this.showError('Kunne ikke indlæse film. Prøv igen senere.');
        }
    },

    // Render movies to the DOM
    renderMovies() {
        if (!this.moviesData.length) {
            this.container.innerHTML = '<p class="no-results">Der er ingen film at vise i øjeblikket :(</p>';
            return;
        }

        this.container.innerHTML = '';

        this.moviesData.forEach(movie => {
            if (!movie.isActive) return; // Skip inactive movies

            const movieElement = document.createElement('div');
            movieElement.className = 'movie-item';

            // placeholder billede
            const imageSrc = `/images/placeholder-movie.jpg`;

            movieElement.innerHTML = `
                <div class="movie-poster">
                    <img src="${imageSrc}" alt="${movie.title}">
                </div>
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <p class="movie-genre">${movie.genre} | ${movie.duration} min | ${this.formatAgeRestriction(movie.ageRestriction)}</p>
                    <p class="movie-description">${this.truncateText(movie.description, 150)}</p>
                    <h4>Forestillinger:</h4>
                    <div class="showing-list" id="showings-${movie.movieID}">
                        <p class="loading-showings">Indlæser forestillinger...</p>
                    </div>
                </div>
            `;

            this.container.appendChild(movieElement);

            // Load showings for this movie
            this.loadShowingsForMovie(movie.movieID);
        });
    },

    // Load and display showings for specific movie
    async loadShowingsForMovie(movieId) {
        try {
            const showings = await API.showings.getAll();
            const movieShowings = showings.filter(showing =>
                showing.movie.movieID === movieId && showing.isActive
            );

            const showingsList = document.getElementById(`showings-${movieId}`);

            if (!movieShowings.length) {
                showingsList.innerHTML = '<p>Ingen planlagte forestillinger.</p>';
                return;
            }

            // Sort showings by date and time
            movieShowings.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

            showingsList.innerHTML = '';

            movieShowings.forEach(showing => {
                const showingElement = document.createElement('div');
                showingElement.className = 'showing-item';

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

            // Add event listeners to booking buttons
            const bookButtons = showingsList.querySelectorAll('.book-btn');
            bookButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const showingId = button.getAttribute('data-showing-id');
                    ReservationModal.openForShowing(showingId);
                });
            });
        } catch (error) {
            const showingsList = document.getElementById(`showings-${movieId}`);
            showingsList.innerHTML = '<p class="error">Kunne ikke indlæse forestillinger :(</p>';
        }
    },

    // Helper methods
    formatDate(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('da-DK', options);
    },

    formatTime(date) {
        return date.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
    },

    formatAgeRestriction(age) {
        if (age === 0) return 'Tilladt for alle';
        return `${age}+`;
    },

    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    showError(message) {
        this.container.innerHTML = `<p class="error">${message}</p>`;
    }
};