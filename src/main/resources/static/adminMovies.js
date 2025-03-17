/**
 * Admin Movies Module
 */
const AdminMovies = {
    container: null,
    movieData: [],

    // Initialize
    init() {
        this.container = document.getElementById('movies-container');
        this.loadMovies();
        this.addEventListeners();
    },

    // Fetch movies from API
    async loadMovies() {
        try {
            const loading = this.container.querySelector('.loading');
            if (loading) loading.textContent = 'Indlæser film...';

            this.movieData = await API.movies.getAll();
            await this.loadReservationCounts();
            this.renderMovies();
        } catch (error) {
            this.showError('Kunne ikke indlæse film. Prøv igen senere.');
        }
    },

    async loadReservationCounts() {
        const countPromises = this.movieData.map(async (movie) => {
            try {
                const count = await API.movies.getReservationCount(movie.movieID);
                movie.reservationCount = count;
            } catch (error) {
                movie.reservationCount = 'Fejl';
            }
        });
        await Promise.all(countPromises);
    },

    setupMovieForm() {
        const formContainer = document.getElementById('movie-form-container');
        formContainer.innerHTML = `
        <form id="movie-form">
            <label for="movie-title">Titel *</label>
            <input type="text" id="movie-title" required maxlength="100">

            <label for="movie-genre">Genre *</label>
            <input type="text" id="movie-genre" required>

            <label for="movie-duration">Varighed (minutter) *</label>
            <input type="number" id="movie-duration" min="1" required>

            <label for="movie-age">Aldersgrænse *</label>
            <input type="number" id="movie-age" min="0" max="21" required>

            <label for="movie-description">Beskrivelse</label>
            <textarea id="movie-description" maxlength="500"></textarea>

            <label for="movie-release-date">Startdato *</label>
            <input type="date" id="movie-release-date" required>

            <label for="movie-end-date">Slutdato *</label>
            <input type="date" id="movie-end-date" required>

            <label>
                <input type="checkbox" id="movie-active" checked>
                Aktiv
            </label>

            <button type="submit">Gem</button>
        </form>
    `;

        // Add event listener to the form
        document.getElementById('movie-form').addEventListener('submit', (event) => {
            event.preventDefault();
            AdminMovies.handleMovieSubmit();
        });
    },


    renderMovies() {
        if (!this.movieData || this.movieData.length === 0) {
            this.container.innerHTML = '<p class="no-results">Der er ingen film at vise.</p>';
            return;
        }

        const table = document.createElement('table');
        table.className = 'data-table';

        // Create table header
        const tableHead = document.createElement('thead');
        tableHead.innerHTML = `
            <tr>
                <th>ID</th>
                <th>Navn</th>
                <th>Genre</th>
                <th>Aldersgrænse</th>
                <th>Beskrivelse</th>
                <th>Varighed</th>
                <th>Startdato</th>
                <th>Slutdato</th>
                <th>Er Aktiv</th>
                <th>Reservationer</th>
                <th>Handlinger</th>
            </tr>    
        `;
        table.appendChild(tableHead);

        const tableBody = document.createElement('tbody');
        this.movieData.forEach(movie => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${movie.movieID}</td>
                <td>${movie.title}</td>
                <td>${movie.genre}</td>
                <td>${movie.ageRestriction}</td>
                <td>${movie.description}</td>
                <td>${movie.duration}</td>
                <td>${movie.releaseDate}</td>
                <td>${movie.endDate}</td>
                <td>${movie.isActive ? 'Ja' : 'Nej'}</td>
                <td>${movie.reservationCount}</td>
                <td>
                    <button class="btn-edit" data-id="${movie.movieID}">Rediger</button>
                    <button class="btn-delete" data-id="${movie.movieID}">Slet</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        table.appendChild(tableBody);
        this.container.innerHTML = '';
        this.container.appendChild(table);
    },

    // Add event listeners to action buttons
    addEventListeners() {
        document.getElementById("create-movie-btn").addEventListener("click", () => {
            this.openCreateModal();
        });

        this.container.addEventListener('click', (event) => {
            const button = event.target;
            const movieID = button.getAttribute('data-id');

            if (button.classList.contains('btn-edit')) {
                const movie = this.movieData.find(m => m.movieID == movieID);
                this.openEditModal(movie);
            } else if (button.classList.contains('btn-delete')) {
                this.deleteMovie(movieID);
            }
        });

        document.querySelectorAll(".close-modal").forEach(button => {
            button.addEventListener("click", () => {
                document.getElementById("movie-modal").style.display = "none";
            });
        });
    },

    // Open create movie modal
    openCreateModal() {
        this.setupMovieForm();

        const movieId = document.getElementById('movie-id');
        const movieTitle = document.getElementById('movie-title');
        const movieGenre = document.getElementById('movie-genre');
        const movieDuration = document.getElementById('movie-duration');
        const movieAge = document.getElementById('movie-age');
        const movieDescription = document.getElementById('movie-description');
        const movieReleaseDate = document.getElementById('movie-release-date');
        const movieEndDate = document.getElementById('movie-end-date');
        const movieActive = document.getElementById('movie-active');

        if (!movieTitle || !movieGenre) {
            console.error("❌ Form fields not found! Check if `setupMovieForm()` ran correctly.");
            return;
        }

        document.getElementById('movie-id').value = '';
        document.getElementById('movie-title').value = '';
        document.getElementById('movie-genre').value = '';
        document.getElementById('movie-duration').value = '';
        document.getElementById('movie-age').value = '';
        document.getElementById('movie-description').value = '';
        document.getElementById('movie-release-date').value = '';
        document.getElementById('movie-end-date').value = '';
        document.getElementById('movie-active').checked = true;

        this.showModal('Opret ny film');
    },

    // Open edit movie modal
    openEditModal(movie) {
        this.setupMovieForm();

        // Fill form with existing data
        document.getElementById('movie-id').value = movie.movieID;
        document.getElementById('movie-title').value = movie.title;
        document.getElementById('movie-genre').value = movie.genre;
        document.getElementById('movie-duration').value = movie.duration;
        document.getElementById('movie-age').value = movie.ageRestriction;
        document.getElementById('movie-description').value = movie.description;
        document.getElementById('movie-release-date').value = movie.releaseDate;
        document.getElementById('movie-end-date').value = movie.endDate;
        document.getElementById('movie-active').checked = movie.active;

        this.showModal('Rediger film');
    },

    showModal(title) {
        document.getElementById("movie-modal").style.display = "block";
        document.getElementById("movie-modal-title").innerText = title;
    },

    async deleteMovie(movieID) {
        if (confirm('Er du sikker på, at du vil slette denne film?')) {
            try {
                await API.movies.delete(movieID);
                alert('Filmen er slettet.');
                this.loadMovies();
            } catch (error) {
                alert('Kunne ikke slette filmen. Prøv igen senere.');
            }
        }
    },

    showError(message) {
        this.container.innerHTML = `<p class="error">${message}</p>`;
    },

    closeModal() {
        document.getElementById("movie-modal").style.display = "none";
    }
};

// Initialize module when page loads
window.addEventListener('DOMContentLoaded', () => AdminMovies.init());
