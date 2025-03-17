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

        // Setup event listeners
        document.getElementById('create-showing-btn').addEventListener('click', () => {
            this.openCreateModal();
        });

        // Close modal on click
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', () => {
                this.closeModal();
            });
        });

        // Load showings
        this.loadShowings();
    },

    // Load showings from API
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

    // Render showings table
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
                    <button class="btn-edit" data-id="${showing.showingID}">Rediger</button>
                    <button class="btn-delete" data-id="${showing.showingID}">Slet</button>
                </td>
            `;

            tableBody.appendChild(row);
        });

        table.appendChild(tableBody);
        this.container.innerHTML = '';
        this.container.appendChild(table);

        this.addEventListeners();
    },

    // Add event listeners for buttons
    addEventListeners() {
        this.container.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', () => {
                this.openEditModal(button.getAttribute('data-id'));
            });
        });

        this.container.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', () => {
                this.deleteShowing(button.getAttribute('data-id'));
            });
        });
    },

    // Setup showing form inside modal
    setupShowingForm() {
        const formContainer = document.getElementById('showing-form-container');
        formContainer.innerHTML = `
            <form id="showing-form">
                <input type="hidden" id="showing-id">

                <label for="showing-movie">Film *</label>
                <select id="showing-movie" required></select>

                <label for="showing-theater">Biografsal *</label>
                <select id="showing-theater" required></select>

                <label for="showing-date">Dato *</label>
                <input type="date" id="showing-date" required>

                <label for="showing-start-time">Starttid *</label>
                <input type="time" id="showing-start-time" required>

                <label for="showing-end-time">Sluttid *</label>
                <input type="time" id="showing-end-time" required>

                <label>
                    <input type="checkbox" id="showing-active" checked>
                    Aktiv
                </label>

                <button type="submit">Gem</button>
            </form>
        `;

        document.getElementById('showing-form').addEventListener('submit', (event) => {
            event.preventDefault();
            this.handleShowingSubmit();
        });
    },

    // Open modal for creating a showing
    async openCreateModal() {
        this.isEditing = false;
        this.currentShowingId = null;

        document.getElementById('showing-modal-title').textContent = 'Opret ny forestilling';

        await this.populateDropdowns();
        this.showModal();
    },

    // Open modal for editing a showing
    async openEditModal(showingId) {
        this.isEditing = true;
        this.currentShowingId = showingId;

        document.getElementById('showing-modal-title').textContent = 'Redigér forestilling';

        const showing = await API.showings.getById(showingId);
        await this.populateDropdowns();

        document.getElementById('showing-id').value = showing.showingID;
        document.getElementById('showing-movie').value = showing.movie.movieID;
        document.getElementById('showing-theater').value = showing.theater.theaterId;
        document.getElementById('showing-date').value = this.formatDateForInput(new Date(showing.startTime));
        document.getElementById('showing-start-time').value = this.formatTimeForInput(new Date(showing.startTime));
        document.getElementById('showing-end-time').value = this.formatTimeForInput(new Date(showing.endTime));
        document.getElementById('showing-active').checked = showing.active;

        this.showModal();
    },

    // Handle form submission
    async handleShowingSubmit() {
        const showingData = {
            movie: { movieID: parseInt(document.getElementById('showing-movie').value) },
            theater: { theaterId: parseInt(document.getElementById('showing-theater').value) },
            startTime: new Date(`${document.getElementById('showing-date').value}T${document.getElementById('showing-start-time').value}`).toISOString(),
            endTime: new Date(`${document.getElementById('showing-date').value}T${document.getElementById('showing-end-time').value}`).toISOString(),
            active: document.getElementById('showing-active').checked
        };

        try {
            if (this.isEditing) {
                await API.showings.update(this.currentShowingId, showingData);
                alert('Forestilling opdateret!');
            } else {
                await API.showings.create(showingData);
                alert('Forestilling oprettet!');
            }

            this.closeModal();
            this.loadShowings();
        } catch (error) {
            alert('Der opstod en fejl.');
        }
    },

    async deleteShowing(showingId) {
        if (confirm('Er du sikker på, at du vil slette denne forestilling?')) {
            await API.showings.delete(showingId);
            this.loadShowings();
        }
    },

    showModal() {
        this.modal.style.display = 'block';
    },

    closeModal() {
        this.modal.style.display = 'none';
    },

    formatDate(date) {
        return date.toISOString().split('T')[0];
    },

    formatTime(date) {
        return date.toTimeString().split(' ')[0].substring(0, 5);
    }
};

// Initialize module on page load
window.addEventListener('DOMContentLoaded', () => AdminShowings.init());
