const AdminReservations = {
    container: null,
    reservationData: [],

    // Initialize the module
    init() {
        this.container = document.getElementById('reservations-container');
        this.loadReservations();
    },

    // Load reservations from API
    async loadReservations() {
        try {
            const loading = this.container.querySelector('.loading');
            if (loading) loading.textContent = 'Indlæser reservationer...';

            this.reservationData = await API.reservations.getAll();
            this.renderReservations();
        } catch (error) {
            this.showError('Kunne ikke indlæse reservationer. Prøv igen senere.');
            console.error('Error loading reservations:', error);
        }
    },

    // Render reservations in table
    renderReservations() {
        if (!this.reservationData || this.reservationData.length === 0) {
            this.container.innerHTML = '<p class="no-results">Der er ingen reservationer at vise.</p>';
            return;
        }

        const table = document.createElement('table');
        table.className = 'data-table';

        // Table header
        const tableHead = document.createElement('thead');
        tableHead.innerHTML = `
            <tr>
                <th>ID</th>
                <th>Film</th>
                <th>Dato</th>
                <th>Tid</th>
                <th>Kunde</th>
                <th>Telefon</th>
                <th>Antal pladser</th>
                <th>Betalt</th>
                <th>Handlinger</th>
            </tr>
        `;
        table.appendChild(tableHead);

        // Table body
        const tableBody = document.createElement('tbody');

        this.reservationData.forEach(reservation => {
            const row = document.createElement('tr');

            const showing = reservation.showing;
            const startTime = new Date(showing.startTime);

            row.innerHTML = `
                <td>${reservation.reservationId}</td>
                <td>${showing.movie.title}</td>
                <td>${this.formatDate(startTime)}</td>
                <td>${this.formatTime(startTime)}</td>
                <td>${reservation.customerName}</td>
                <td>${reservation.customerPhone}</td>
                <td>${reservation.seats.length}</td>
                <td>${reservation.isPaid ? 'Ja' : 'Nej'}</td>
                <td class="actions">
                    <button class="btn-view" data-id="${reservation.reservationId}">
                        <i class="fas fa-eye"></i> Vis
                    </button>
                    <button class="btn-edit" data-id="${reservation.reservationId}">
                        <i class="fas fa-edit"></i> Rediger
                    </button>
                    <button class="btn-delete" data-id="${reservation.reservationId}">
                        <i class="fas fa-trash"></i> Slet
                    </button>
                </td>
            `;

            tableBody.appendChild(row);
        });

        table.appendChild(tableBody);

        this.container.innerHTML = '';
        this.container.appendChild(table);

        // Add event listeners to buttons
        this.addEventListeners();
    },

    // Add event listeners to action buttons
    addEventListeners() {
        // View reservation details
        const viewButtons = this.container.querySelectorAll('.btn-view');
        viewButtons.forEach(button => {
            button.addEventListener('click', () => {
                const reservationId = button.getAttribute('data-id');
                this.viewReservationDetails(reservationId);
            });
        });

        // Mark as paid
        const editButtons = this.container.querySelectorAll('.btn-edit');
        editButtons.forEach(button => {
            button.addEventListener('click', () => {
                const reservationId = button.getAttribute('data-id');
                this.togglePaidStatus(reservationId);
            });
        });

        // Delete reservation
        const deleteButtons = this.container.querySelectorAll('.btn-delete');
        deleteButtons.forEach(button => {
            button.addEventListener('click', () => {
                const reservationId = button.getAttribute('data-id');
                this.deleteReservation(reservationId);
            });
        });
    },

    // View reservation details
    async viewReservationDetails(reservationId) {
        try {
            const reservation = await API.reservations.getById(reservationId);

            // Create modal for viewing reservation details
            const detailsModal = document.createElement('div');
            detailsModal.className = 'modal';
            detailsModal.style.display = 'block';

            const showing = reservation.showing;
            const startTime = new Date(showing.startTime);
            const reservationTime = new Date(reservation.reservationTime);

            // Format seats
            const seatsHtml = reservation.seats.map(seat =>
                `<div class="seat-item">Række ${seat.rowNumber}, Sæde ${seat.seatNumber}</div>`
            ).join('');

            detailsModal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>Reservation #${reservation.reservationId}</h2>
                    
                    <div class="reservation-details">
                        <div class="detail-section">
                            <h3>Forestilling</h3>
                            <p><strong>Film:</strong> ${showing.movie.title}</p>
                            <p><strong>Biografsal:</strong> ${showing.theater.theaterName}</p>
                            <p><strong>Dato:</strong> ${this.formatDate(startTime)}</p>
                            <p><strong>Tid:</strong> ${this.formatTime(startTime)}</p>
                        </div>
                        
                        <div class="detail-section">
                            <h3>Kunde</h3>
                            <p><strong>Navn:</strong> ${reservation.customerName}</p>
                            <p><strong>Telefon:</strong> ${reservation.customerPhone}</p>
                            <p><strong>Email:</strong> ${reservation.customerEmail || 'Ikke angivet'}</p>
                            <p><strong>Reservationstidspunkt:</strong> ${this.formatDateTime(reservationTime)}</p>
                            <p><strong>Betalingsstatus:</strong> ${reservation.isPaid ? 'Betalt' : 'Ikke betalt'}</p>
                        </div>
                        
                        <div class="detail-section">
                            <h3>Reserverede sæder</h3>
                            <div class="seats-list">
                                ${seatsHtml || 'Ingen sæder valgt'}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(detailsModal);

            // Add close handler
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
            console.error('Error viewing reservation details:', error);
            alert('Der opstod en fejl ved visning af reservationen.');
        }
    },

    // Toggle paid status
    async togglePaidStatus(reservationId) {
        try {
            const reservation = await API.reservations.getById(reservationId);

            // Toggle isPaid status
            reservation.isPaid = !reservation.isPaid;

            // Update reservation
            await API.reservations.update(reservationId, reservation);

            // Show success message and reload
            alert(`Reservation markeret som ${reservation.isPaid ? 'betalt' : 'ikke betalt'}.`);
            this.loadReservations();
        } catch (error) {
            console.error('Error updating reservation:', error);
            alert('Der opstod en fejl ved opdatering af reservationen.');
        }
    },

    // Delete reservation
    async deleteReservation(reservationId) {
        if (confirm('Er du sikker på, at du vil slette denne reservation?')) {
            try {
                await API.reservations.delete(reservationId);
                alert('Reservation slettet!');
                this.loadReservations();
            } catch (error) {
                console.error('Error deleting reservation:', error);
                alert('Der opstod en fejl ved sletning af reservationen.');
            }
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

    formatDateTime(date) {
        return `${this.formatDate(date)} ${this.formatTime(date)}`;
    },

    // Show error message
    showError(message) {
        this.container.innerHTML = `<p class="error">${message}</p>`;
    }
};