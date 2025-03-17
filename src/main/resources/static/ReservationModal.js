/**
 * Reservation Modal Module
 * Handles the reservation functionality including seat selection
 */
const ReservationModal = {
    modal: null,
    closeBtn: null,
    detailsContainer: null,
    currentShowing: null,
    selectedSeats: [],

    // Initialize the module
    init() {
        this.modal = document.getElementById('reservation-modal');
        this.closeBtn = this.modal.querySelector('.close-modal');
        this.detailsContainer = document.getElementById('reservation-details');

        // Add event listeners
        this.closeBtn.addEventListener('click', this.close.bind(this));

        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.close();
            }
        });
    },

    // Open the modal for a specific showing
    async openForShowing(showingId) {
        try {
            this.currentShowing = await API.showings.getById(showingId);

            if (!this.currentShowing) {
                alert('Forestillingen blev ikke fundet.');
                return;
            }

            // Reset selected seats
            this.selectedSeats = [];

            // Render reservation form
            this.renderReservationForm();

            // Show the modal
            this.modal.style.display = 'block';
        } catch (error) {
            alert('Der opstod en fejl. Prøv igen senere.');
        }
    },

    // Close the modal
    close() {
        this.modal.style.display = 'none';
    },

    // Render the reservation form
    renderReservationForm() {
        const movie = this.currentShowing.movie;
        const theater = this.currentShowing.theater;
        const startTime = new Date(this.currentShowing.startTime);

        this.detailsContainer.innerHTML = `
            <div class="reservation-info">
                <h3>${movie.title}</h3>
                <p>
                    <strong>Dato og tid:</strong> ${this.formatDate(startTime)} kl. ${this.formatTime(startTime)}
                </p>
                <p><strong>Sal:</strong> ${theater.theaterName}</p>
            </div>
            
            <div class="seating-chart">
                <div class="screen">Lærred</div>
                <div id="seats-container">
                    <p class="loading">Indlæser pladser...</p>
                </div>
            </div>
            
            <div class="legend">
                <div class="legend-item">
                    <div class="seat"></div>
                    <span>Ledig</span>
                </div>
                <div class="legend-item">
                    <div class="seat selected"></div>
                    <span>Valgt</span>
                </div>
                <div class="legend-item">
                    <div class="seat taken"></div>
                    <span>Optaget</span>
                </div>
            </div>
            
            <div class="selected-seats-info">
                <p>Valgte pladser: <span id="selected-seats-count">0</span></p>
            </div>
            
            <form id="reservation-form">
                <div class="form-group">
                    <label for="customer-name">Navn</label>
                    <input type="text" id="customer-name" required>
                </div>
                
                <div class="form-group">
                    <label for="customer-phone">Telefon</label>
                    <input type="tel" id="customer-phone" required>
                </div>
                
                <div class="form-group">
                    <label for="customer-email">Email</label>
                    <input type="email" id="customer-email">
                </div>
                
                <div class="form-actions">
                    <button type="button" class="secondary-btn" id="cancel-reservation">Annuller</button>
                    <button type="submit" class="primary-btn" id="confirm-reservation">Bekræft reservation</button>
                </div>
            </form>
        `;

        // Seat chart
        this.loadSeatingChart(theater.theaterId);

        // Add event listeners
        document.getElementById('cancel-reservation').addEventListener('click', this.close.bind(this));
        document.getElementById('reservation-form').addEventListener('submit', this.handleReservationSubmit.bind(this));
    },

    // Load seat chart
    async loadSeatingChart(theaterId) {
        try {
            const seatsContainer = document.getElementById('seats-container');

            // Get theater layout
            const layout = await API.theaters.getLayout(theaterId);
            const rowCount = layout[0];
            const seatsPerRow = layout[1];

            // ATTENTION: SIMULATED SEATS
            const takenSeats = this.simulateTakenSeats(rowCount, seatsPerRow);

            seatsContainer.innerHTML = '';

            // Create rows and seats
            for (let row = 1; row <= rowCount; row++) {
                const rowDiv = document.createElement('div');
                rowDiv.className = 'row';

                // Add row label
                const rowLabel = document.createElement('div');
                rowLabel.className = 'row-label';
                rowLabel.textContent = row;
                rowDiv.appendChild(rowLabel);

                for (let seat = 1; seat <= seatsPerRow; seat++) {
                    const seatDiv = document.createElement('div');
                    seatDiv.className = 'seat';
                    seatDiv.dataset.row = row;
                    seatDiv.dataset.seat = seat;

                    // Check if seat is taken
                    if (takenSeats.some(s => s.row === row && s.seat === seat)) {
                        seatDiv.classList.add('taken');
                    } else {
                        // Add click event for available seats
                        seatDiv.addEventListener('click', () => this.toggleSeatSelection(seatDiv, row, seat));
                    }

                    rowDiv.appendChild(seatDiv);
                }

                seatsContainer.appendChild(rowDiv);
            }
        } catch (error) {
            const seatsContainer = document.getElementById('seats-container');
            seatsContainer.innerHTML = '<p class="error">Kunne ikke indlæse pladsoversigt.</p>';
        }
    },

    // Toggle seat selection
    toggleSeatSelection(seatElement, row, seat) {
        if (seatElement.classList.contains('taken')) return;

        // Toggle selected state
        seatElement.classList.toggle('selected');

        // Update selectedSeats array
        const seatIndex = this.selectedSeats.findIndex(s => s.row === row && s.seat === seat);

        if (seatIndex === -1) {
            // Add to selected seats
            this.selectedSeats.push({ row, seat });
        } else {
            // Remove from selected seats
            this.selectedSeats.splice(seatIndex, 1);
        }

        // Update counter
        document.getElementById('selected-seats-count').textContent = this.selectedSeats.length;
    },

    // Handle reservation form submit
    async handleReservationSubmit(event) {
        event.preventDefault();

        if (this.selectedSeats.length === 0) {
            alert('Vælg mindst én plads.');
            return;
        }

        const customerName = document.getElementById('customer-name').value;
        const customerPhone = document.getElementById('customer-phone').value;
        const customerEmail = document.getElementById('customer-email').value;

        try {
            // Prepare reservation data
            const reservationData = {
                showing: { showingID: this.currentShowing.showingID },
                customerName,
                customerPhone,
                customerEmail,
                reservationTime: new Date().toISOString(),
                reservationDate: new Date().toISOString(),
                isPaid: false,
                seats: this.selectedSeats.map(seat => ({
                    seatNumber: seat.seat,
                    rowNumber: seat.row,
                    theater: { theaterId: this.currentShowing.theater.theaterId }
                }))
            };

            // Create reservation
            await API.reservations.create(reservationData);

            alert('Reservation gennemført! Du kan betale ved ankomst til biografen.');
            this.close();
        } catch (error) {
            alert('Der opstod en fejl ved oprettelse af reservationen. Prøv igen senere.');
        }
    },

    // Simulate taken seats for demo purposes
    simulateTakenSeats(rowCount, seatsPerRow) {
        const takenSeats = [];
        const takenCount = Math.floor(rowCount * seatsPerRow * 0.3); // 30% of seats are taken

        for (let i = 0; i < takenCount; i++) {
            const row = Math.floor(Math.random() * rowCount) + 1;
            const seat = Math.floor(Math.random() * seatsPerRow) + 1;

            // Check if seat is already taken
            if (!takenSeats.some(s => s.row === row && s.seat === seat)) {
                takenSeats.push({ row, seat });
            }
        }

        return takenSeats;
    },

    // Helper methods
    formatDate(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('da-DK', options);
    },

    formatTime(date) {
        return date.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' });
    }
};