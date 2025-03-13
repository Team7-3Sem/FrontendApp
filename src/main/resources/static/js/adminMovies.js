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

        // todo evt: Event listeners for admin funktionalitet?
    },

    // movies from api
    async loadMovies() {
        try {
            const loading = this.container.querySelector('.loading');
            if (loading) loading.textContent = 'Indlæser film...';

            this.movieData = await API.movies.getAll();
            this.renderMovies();
        } catch (error) {
            this.showError('Kunne ikke indlæse film. Prøv igen senere.');

        }
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
                <td>
                    <button class="btn-create" data-id="${movie.movieID}">Opret</button>
                    <button class="btn-view" data-id="${movie.movieID}">Vis</button>
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
        this.container.addEventListener('click', (event) => {
            const button = event.target;
            const movieID = button.getAttribute('data-id');

            if (button.classList.contains('btn-create')) {
                this.openCreateModal(movieID);
            } else if (button.classList.contains('btn-view')) {
                this.viewMovieDetails(movieID);
            } else if (button.classList.contains('btn-edit')) {
                const movie = this.movieData.find(m => m.movieID == movieID);
                this.openEditModal(movie);
            } else if (button.classList.contains('btn-delete')) {
                this.deleteMovie(movieID);
            }
        });
    },

    // View movie details
    async viewMovieDetails(movieID){
        try {
            const movie = this.movieData.find(m => m.movieID == movieID);

            if (!movie) {
                alert('Film blev ikke fundet.');
                return;
            }

            // Create model content for viewing theater details
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.display = 'block';

            modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">*</span>
                <h2>Film: ${movie.title}</h2>
                
                <div class="movie-details">
                    <p><strong>ID:</strong> ${movie.movieID}</p>
                    <p><strong>Genre:</strong>${movie.genre}</p>
                    <p><strong>Aldersgrænse:</strong>${movie.ageRestriction}</p>
                    <p><strong>Beskrivelse:</strong>${movie.description}</p>
                    <p><strong>Varighed:</strong>${movie.duration}</p>
                    <p><strong>Startdato</strong>${movie.releaseDate}</p>
                    <p><strong>Slutdato</strong>${movie.endDate}</p>
                    <p><strong>Er aktiv</strong>${movie.isActive}</p>
            `;

            document.body.appendChild(modal);

            const closeBtn = modal.querySelector('.close-modal');
            closeBtn.addEventListener('click', () =>{
                document.body.removeChild(modal);
            });
            // Close when clicking outside of modal
            window.addEventListener('click', (event) => {
                if (event.target === modal) {
                    document.body.removeChild(modal);
                }
            });

        } catch (error) {

            alert('Der opstod en fejl ved visning af biografsal-detaljer.');
        }
    },

    // Setup movie form in the modal
    setupMovieForm() {
        const formContainer = document.getElementById('movie-form-container');
        formContainer.innerHTML = `
            <form id="movie-form">
                <input type="hidden" id="movie-id">
                
                <div class="form-group">
                    <label for="movie-title">Titel *</label>
                    <input type="text" id="movie-title" required maxlength="100">
                </div>
                
                <div class="form-row">
                    <div class="form-column">
                        <div class="form-group">
                            <label for="movie-genre">Genre *</label>
                            <input type="text" id="movie-genre" required>
                        </div>
                    </div>
                    
                    <div class="form-column">
                        <div class="form-group">
                            <label for="movie-duration">Varighed (minutter) *</label>
                            <input type="number" id="movie-duration" min="1" required>
                        </div>
                    </div>
                    
                    <div class="form-column">
                        <div class="form-group">
                            <label for="movie-age">AldersgrÃ¦nse *</label>
                            <input type="number" id="movie-age" min="0" max="21" required>
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="movie-description">Beskrivelse</label>
                    <textarea id="movie-description" maxlength="500"></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-column">
                        <div class="form-group">
                            <label for="movie-release-date">Startdato *</label>
                            <input type="date" id="movie-release-date" required>
                        </div>
                    </div>
                    
                    <div class="form-column">
                        <div class="form-group">
                            <label for="movie-end-date">Slutdato *</label>
                            <input type="date" id="movie-end-date" required>
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="movie-active" checked>
                        Aktiv
                    </label>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="secondary-btn" id="cancel-movie">Annuller</button>
                    <button type="submit" class="primary-btn">Gem</button>
                </div>
            </form>
        `;

        // Add event listeners to form
        const form = document.getElementById('movie-form');
        form.addEventListener('submit', this.handleMovieSubmit.bind(this));

        document.getElementById('cancel-movie').addEventListener('click', this.closeModal.bind(this));
    },

    // Åbn oprettelsesmodal
    openCreateModal() {
        this.setupMovieForm();

        // Ryd formularen for oprettelse
        document.getElementById('movie-id').value = '';
        document.getElementById('movie-title').value = '';
        document.getElementById('movie-genre').value = '';
        document.getElementById('movie-duration').value = '';
        document.getElementById('movie-age').value = '';
        document.getElementById('movie-description').value = '';
        document.getElementById('movie-release-date').value = '';
        document.getElementById('movie-end-date').value = '';
        document.getElementById('movie-active').checked = true;

        // Vis modal
        this.showModal('Opret ny film');
    },

// Åbn redigeringsmodal
    openEditModal(movie) {
        this.setupMovieForm();

        // Udfyld formularen med eksisterende data
        document.getElementById('movie-id').value = movie.movieID;
        document.getElementById('movie-title').value = movie.title;
        document.getElementById('movie-genre').value = movie.genre;
        document.getElementById('movie-duration').value = movie.duration;
        document.getElementById('movie-age').value = movie.ageRestriction;
        document.getElementById('movie-description').value = movie.description;
        document.getElementById('movie-release-date').value = movie.releaseDate;
        document.getElementById('movie-end-date').value = movie.endDate;
        document.getElementById('movie-active').checked = movie.active;

        // Vis modal
        this.showModal('Rediger film');
    },

    // Hjælpemetode til at vise modal
    showModal(title) {
        const modal = document.getElementById('movie-modal');
        document.getElementById('modal-title').innerText = title;
        modal.style.display = 'block';
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

    // Hjælpemetode til at lukke modal
    closeModal() {
        const modal = document.getElementById('movie-modal');
        modal.style.display = 'none';
    }
};

// Initialiser modulet, når siden er loadet
window.addEventListener('DOMContentLoaded', () => AdminMovies.init());