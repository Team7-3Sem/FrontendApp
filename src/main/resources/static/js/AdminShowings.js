/**
 * Admin Showings Module
 * Handles showings management in the admin panel
 */
const AdminShowings = {
    container: null,
    modal: null,
    showingData: [],
    movieData: [],
    theaterData: [],
    isEditing: false,
    currentShowingId: null,

    // Initialize
    init() {
        this.container = document.getElementById('showings-container');
        this.modal = document.getElementById('showing-modal');

        // Setup showing form
        this.setupShowingForm();

        // Setup event listeners
        document.getElementById('create-showing-btn').addEventListener('click', this.openCreateModal.bind(this));

        // Close
        const closeButtons = this.modal.querySelectorAll('.close-modal');
        closeButtons.forEach(button => {
            button.addEventListener('click', this.closeModal.bind(this));
        });

        // Load showings
        this.loadShowings();
    },

    // Load showings
    async loadShowings() {
        try {
            const loading = this.container.querySelector('.loading');
            if (loading) loading.textContent = 'Indlæser forestillinger...';
            this.movieData = await API.movies.getAll();
            this.theaterData = await API.theaters.getAll();


            this.showingData = await API.showings.getAll();
            this.renderShowings();
        } catch (error) {
            this.showError('Kunne ikke indlæse forestillinger. Prøv igen senere.');
        }
    },

    // Render showings in table
    renderShowings() {
        if (!this.showingData || this.showingData.length === 0) {
            this.container.innerHTML = '<p class="no-results">Der er ingen forestillinger at vise.</p>';
            return;
        }

        const table = document.createElement('table');
        table.className = 'data-table';

        // Table header
        const tableHead = document.createElement('thead');
        tableHead.innerHTML = `
            <tr>
                <th>Film</th>
                <th>Biografsal</th>
                <th>Dato</th>
                <th>Starttid</th>
                <th>Sluttid</th>
                <th>Status</th>
                <th>Handlinger</th>
            </tr>
        `;
        table.appendChild(tableHead);

        // Table body
        const tableBody = document.createElement('tbody');

        this.showingData.forEach(showing => {
            const row = document.createElement('tr');

            const startTime = new Date(showing.startTime);
            const endTime = new Date(showing.endTime);

            row.innerHTML = `
                <td>${showing.movie.title}</td>
                <td>${showing.theater.theaterName}</td>
                <td>${this.formatDate(startTime)}</td>
                <td>${this.formatTime(startTime)}</td>
                <td>${this.formatTime(endTime)}</td>
                <td>${showing.active ? 'Aktiv' : 'Inaktiv'}</td>
                <td class="actions">
                    <button class="btn-view" data-id="${showing.showingID}">
                        <i class="fas fa-eye"></i> Vis
                    </button>
                    <button class="btn-edit" data-id="${showing.showingID}">
                        <i class="fas fa-edit"></i> Rediger
                    </button>
                    <button class="btn-delete" data-id="${showing.showingID}">
                        <i class="fas fa-trash"></i> Slet
                    </button>
                </td>
            `;

            tableBody.appendChild(row);
        });

        table.appendChild(tableBody);

        this.container.innerHTML = '';
        this.container.appendChild(table);


        this.addEventListeners();
    },


    addEventListeners() {
        // View showing details
        const viewButtons = this.container.querySelectorAll('.btn-view');
        viewButtons.forEach(button => {
            button.addEventListener('click', () => {
                const showingId = button.getAttribute('data-id');
                this.viewShowingDetails(showingId);
            });
        });

        // Edit showing
        const editButtons = this.container.querySelectorAll('.btn-edit');
        editButtons.forEach(button => {
            button.addEventListener('click', () => {
                const showingId = button.getAttribute('data-id');
                this.openEditModal(showingId);
            });
        });

        // Delete showing
        const deleteButtons = this.container.querySelectorAll('.btn-delete');
        deleteButtons.forEach(button => {
            button.addEventListener('click', () => {
                const showingId = button.getAttribute('data-id');
                this.deleteShowing(showingId);
            });
        });
    },

    // Setup showing form in the modal
    setupShowingForm() {
        const formContainer = document.getElementById('showing-form-container');
        formContainer.innerHTML = `
            <form id="showing-form">
                <input type="hidden" id="showing-id">
                
                <div class="form-group">
                    <label for="showing-movie">Film *</label>
                    <select id="showing-movie" required>
                        <option value="">Vælg film</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="showing-theater">Biografsal *</label>
                    <select id="showing-theater" required>
                        <option value="">Vælg biografsal</option>
                    </select>
                </div>
                
                <div class="form-row">
                    <div class="form-column">
                        <div class="form-group">
                            <label for="showing-date">Dato *</label>
                            <input type="date" id="showing-date" required>
                        </div>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-column">
                        <div class="form-group">
                            <label for="showing-start-time">Starttid *</label>
                            <input type="time" id="showing-start-time" required>
                        </div>
                    </div>
                    
                    <div class="form-column">
                        <div class="form-group">
                            <label for="showing-end-time">Sluttid *</label>
                            <input type="time" id="showing-end-time" required>
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="showing-active" checked>
                        Aktiv
                    </label>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="secondary-btn" id="cancel-showing">Annuller</button>
                    <button type="submit" class="primary-btn">Gem</button>
                </div>
            </form>
        `;

        // Add event listeners to form
        const form = document.getElementById('showing-form');
        form.addEventListener('submit', this.handleShowingSubmit.bind(this));

        document.getElementById('cancel-showing').addEventListener('click', this.closeModal.bind(this));

        // Setup duration calculation
        const movieSelect = document.getElementById('showing-movie');
        const startTimeInput = document.getElementById('showing-start-time');

        // Calculate end time based on movie duration and start time
        const calculateEndTime = () => {
            const movieId = parseInt(movieSelect.value);
            const startTime = startTimeInput.value;

            if (!movieId || !startTime) return;

            const movie = this.movieData.find(m => m.movieID === movieId);
            if (!movie) return;

            // Add movie duration to start time
            const [hours, minutes] = startTime.split(':').map(Number);
            const startDate = new Date();
            startDate.setHours(hours, minutes, 0);

            const endDate = new Date(startDate.getTime() + movie.duration * 60000);
            const endTimeStr = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

            document.getElementById('showing-end-time').value = endTimeStr;
        };

        movieSelect.addEventListener('change', calculateEndTime);
        startTimeInput.addEventListener('change', calculateEndTime);
    },

    // Open modal for creating a new showing
    async openCreateModal() {
        this.isEditing = false;
        this.currentShowingId = null;

        document.getElementById('showing-modal-title').textContent = 'Opret ny forestilling';

        const form = document.getElementById('showing-form');
        form.reset();

        // Set default date (today)
        const today = new Date();
        document.getElementById('showing-date').value = this.formatDateForInput(today);


        await this.populateMovieDropdown();

        await this.populateTheaterDropdown();

        // Show modal
        this.modal.style.display = 'block';
    },

    // Open modal for editing a showing
    async openEditModal(showingId) {
        try {
            this.isEditing = true;
            this.currentShowingId = showingId;

            document.getElementById('showing-modal-title').textContent = 'Redigér forestilling';

            // Get showing details
            const showing = await API.showings.getById(showingId);

            // Populate dropdowns
            await this.populateMovieDropdown();
            await this.populateTheaterDropdown();

            // Parse dates
            const startTime = new Date(showing.startTime);
            const endTime = new Date(showing.endTime);

            // Fill form with showing data
            document.getElementById('showing-id').value = showing.showingID;
            document.getElementById('showing-movie').value = showing.movie.movieID;
            document.getElementById('showing-theater').value = showing.theater.theaterId;
            document.getElementById('showing-date').value = this.formatDateForInput(startTime);
            document.getElementById('showing-start-time').value = this.formatTimeForInput(startTime);
            document.getElementById('showing-end-time').value = this.formatTimeForInput(endTime);
            document.getElementById('showing-active').checked = showing.active;

            // Show modal
            this.modal.style.display = 'block';
        } catch (error) {
            alert('Der opstod en fejl ved hentning af forestillingen.');
        }
    },

    // Populate movie dropdown
    async populateMovieDropdown() {
        const dropdown = document.getElementById('showing-movie');
        dropdown.innerHTML = '<option value="">Vælg film</option>';

        // movie date?
        if (!this.movieData.length) {
            this.movieData = await API.movies.getAll();
        }

        // Add active movies to dropdown
        this.movieData
            .filter(movie => movie.active)
            .forEach(movie => {
                const option = document.createElement('option');
                option.value = movie.movieID;
                option.textContent = movie.title;
                dropdown.appendChild(option);
            });
    },

    // Populate theater dropdown
    async populateTheaterDropdown() {
        const dropdown = document.getElementById('showing-theater');
        dropdown.innerHTML = '<option value="">Vælg biografsal</option>';

        if (!this.theaterData.length) {
            this.theaterData = await API.theaters.getAll();
        }

        this.theaterData.forEach(theater => {
            const option = document.createElement('option');
            option.value = theater.theaterId;
            option.textContent = theater.theaterName;
            dropdown.appendChild(option);
        });
    },

    // Handle form submission
    async handleShowingSubmit(event) {
        event.preventDefault();

        const movieId = parseInt(document.getElementById('showing-movie').value);
        const theaterId = parseInt(document.getElementById('showing-theater').value);
        const dateStr = document.getElementById('showing-date').value;
        const startTimeStr = document.getElementById('showing-start-time').value;
        const endTimeStr = document.getElementById('showing-end-time').value;

        const startDateTime = new Date(`${dateStr}T${startTimeStr}`);
        const endDateTime = new Date(`${dateStr}T${endTimeStr}`);

        // if end time earlier then start time
        if (endDateTime < startDateTime) {
            endDateTime.setDate(endDateTime.getDate() + 1);
        }

        const showingData = {
            movie: { movieID: movieId },
            theater: { theaterId: theaterId },
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            active: document.getElementById('showing-active').checked
        };

        try {
            if (this.isEditing) {
                // Update existing showing
                showingData.showingID = parseInt(document.getElementById('showing-id').value);
                await API.showings.update(showingData.showingID, showingData);
                alert('Forestilling opdateret!');
            } else {
                // Create new showing
                await API.showings.create(showingData);
                alert('Forestilling oprettet!');
            }

            this.closeModal();
            this.loadShowings();
        } catch (error) {
            alert('Der opstod en fejl ved gem af forestillingen.');
        }
    },

    // View showing details
    async viewShowingDetails(showingId) {
        try {
            const showing = await API.showings.getById(showingId);

            const detailsModal = document.createElement('div');
            detailsModal.className = 'modal';
            detailsModal.style.display = 'block';

            const startTime = new Date(showing.startTime);
            const endTime = new Date(showing.endTime);

            detailsModal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>Forestilling: ${showing.movie.title}</h2>
                    
                    <div class="showing-details">
                        <p><strong>Film:</strong> ${showing.movie.title}</p>
                        <p><strong>Biografsal:</strong> ${showing.theater.theaterName}</p>
                        <p><strong>Dato:</strong> ${this.formatDate(startTime)}</p>
                        <p><strong>Starttid:</strong> ${this.formatTime(startTime)}</p>
                        <p><strong>Sluttid:</strong> ${this.formatTime(endTime)}</p>
                        <p><strong>Varighed:</strong> ${showing.movie.duration} minutter</p>
                        <p><strong>Status:</strong> ${showing.active ? 'Aktiv' : 'Inaktiv'}</p>
                    </div>
                </div>
            `;

            document.body.appendChild(detailsModal);

            const closeBtn = detailsModal.querySelector('.close-modal');
            closeBtn.addEventListener('click', () => {
                document.body.removeChild(detailsModal);
            });

            // Close when clicking outside
            window.addEventListener('click', (event) => {
                if (event.target === detailsModal) {
                    document.body.removeChild(detailsModal);
                }
            });

        } catch (error) {
            alert('Der opstod en fejl ved visning af forestillingen.');
        }
    },

    // Delete showing
    async deleteShowing(showingId) {
        if (confirm('Er du sikker på, at du vil slette denne forestilling?')) {
            try {
                await API.showings.delete(showingId);
                alert('Forestilling slettet!');
                this.loadShowings();
            } catch (error) {
                alert('Der opstod en fejl ved sletning af forestillingen.');
            }
        }
    },

    // Close
    closeModal() {
        this.modal.style.display = 'none';
    },

    // hjælper metoder
    formatDate(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('da-DK', options);
    },

    formatTime(date) {
        return date.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
    },

    formatDateForInput(date) {
        return date.toISOString().split('T')[0];
    },

    formatTimeForInput(date) {
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    },

    showError(message) {
        this.container.innerHTML = `<p class="error">${message}</p>`;
    }
};