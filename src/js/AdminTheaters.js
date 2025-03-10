/**
 * Admin Theaters Module
 * Handles the theater management in the admin panel
 */
const AdminTheaters = {
    container: null,
    theaterData: [],

    // Initialize
    init() {
        this.container = document.getElementById('theaters-container');
        this.loadTheaters();

        // todo evt: Event listeners for admin funktionalitet?
    },

    // theaters from api
    async loadTheaters() {
        try {
            const loading = this.container.querySelector('.loading');
            if (loading) loading.textContent = 'Indlæser biografsale...';

            this.theaterData = await API.theaters.getAll();
            this.renderTheaters();
        } catch (error) {
            this.showError('Kunne ikke indlæse biografsale. Prøv igen senere.');
            console.error('Error loading theaters:', error);
        }
    },

    // Render theaters
    renderTheaters() {
        if (!this.theaterData || this.theaterData.length === 0) {
            this.container.innerHTML = '<p class="no-results">Der er ingen biografsale at vise.</p>';
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
                <th>Antal rækker</th>
                <th>Sæder pr. række</th>
                <th>Total kapacitet</th>
                <th>Handlinger</th>
            </tr>
        `;
        table.appendChild(tableHead);

        // Create table body
        const tableBody = document.createElement('tbody');

        this.theaterData.forEach(theater => {
            const totalCapacity = theater.rowCount * theater.seatsPerRow;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${theater.theaterId}</td>
                <td>${theater.theaterName}</td>
                <td>${theater.rowCount}</td>
                <td>${theater.seatsPerRow}</td>
                <td>${totalCapacity}</td>
                <td class="actions">
                    <button class="btn-view" data-id="${theater.theaterId}">
                        <i class="fas fa-eye"></i> Vis
                    </button>
                    <button class="btn-edit" data-id="${theater.theaterId}">
                        <i class="fas fa-edit"></i> Rediger
                    </button>
                </td>
            `;

            tableBody.appendChild(row);
        });

        table.appendChild(tableBody);

        // add the table to the container
        this.container.innerHTML = '';
        this.container.appendChild(table);

        // Add event listeners to buttons
        this.addEventListeners();
    },

    // Add event listeners to action buttons
    addEventListeners() {
        // View theater details
        const viewButtons = this.container.querySelectorAll('.btn-view');
        viewButtons.forEach(button => {
            button.addEventListener('click', () => {
                const theaterId = button.getAttribute('data-id');
                this.viewTheaterDetails(theaterId);
            });
        });

        // Edit theater
        const editButtons = this.container.querySelectorAll('.btn-edit');
        editButtons.forEach(button => {
            button.addEventListener('click', () => {
                const theaterId = button.getAttribute('data-id');
                this.openEditTheaterModal(theaterId);
            });
        });
    },

    // View theater details
    async viewTheaterDetails(theaterId) {
        try {
            const theater = this.theaterData.find(t => t.theaterId == theaterId);

            if (!theater) {
                alert('Biografsal blev ikke fundet.');
                return;
            }

            // Create modal content for viewing theater details
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.display = 'block';

            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>Biografsal: ${theater.theaterName}</h2>
                    
                    <div class="theater-details">
                        <p><strong>ID:</strong> ${theater.theaterId}</p>
                        <p><strong>Antal rækker:</strong> ${theater.rowCount}</p>
                        <p><strong>Sæder pr. række:</strong> ${theater.seatsPerRow}</p>
                        <p><strong>Total kapacitet:</strong> ${theater.rowCount * theater.seatsPerRow}</p>
                    </div>
                    
                    <h3>Sædeplan</h3>
                    <div class="seating-chart">
                        <div class="screen">Lærred</div>
                        <div class="seats-container">
                            ${this.generateSeatingLayout(theater)}
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            const closeBtn = modal.querySelector('.close-modal');
            closeBtn.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            //close when clicking outside of modal
            window.addEventListener('click', (event) => {
                if (event.target === modal) {
                    document.body.removeChild(modal);
                }
            });

        } catch (error) {
            console.error('Error viewing theater details:', error);
            alert('Der opstod en fejl ved visning af biografsal-detaljer.');
        }
    },

    // HTML for seating layout
    generateSeatingLayout(theater) {
        let html = '';

        for (let row = 1; row <= theater.rowCount; row++) {
            html += `<div class="row">`;
            html += `<div class="row-label">${row}</div>`;

            for (let seat = 1; seat <= theater.seatsPerRow; seat++) {
                html += `<div class="seat" title="Række ${row}, Sæde ${seat}"></div>`;
            }

            html += `</div>`;
        }

        return html;
    },

    // for editing theater details
    async openEditTheaterModal(theaterId) {
        try {
            const theater = this.theaterData.find(t => t.theaterId == theaterId);

            if (!theater) {
                alert('Biografsal blev ikke fundet.');
                return;
            }

            // Create modal for editing theater
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.display = 'block';

            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>Rediger Biografsal</h2>
                    
                    <form id="edit-theater-form">
                        <input type="hidden" id="theater-id" value="${theater.theaterId}">
                        
                        <div class="form-group">
                            <label for="theater-name">Navn</label>
                            <input type="text" id="theater-name" value="${theater.theaterName}" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-column">
                                <div class="form-group">
                                    <label for="row-count">Antal rækker</label>
                                    <input type="number" id="row-count" value="${theater.rowCount}" min="1" required>
                                </div>
                            </div>
                            
                            <div class="form-column">
                                <div class="form-group">
                                    <label for="seats-per-row">Sæder pr. række</label>
                                    <input type="number" id="seats-per-row" value="${theater.seatsPerRow}" min="1" required>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <p class="warning-text">
                                <strong>Bemærk:</strong> Ændring af antal rækker eller sæder kan påvirke eksisterende reservationer.
                            </p>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="secondary-btn" id="cancel-edit">Annuller</button>
                            <button type="submit" class="primary-btn">Gem ændringer</button>
                        </div>
                    </form>
                </div>
            `;

            document.body.appendChild(modal);

            // Add event listeners
            const closeBtn = modal.querySelector('.close-modal');
            const cancelBtn = modal.querySelector('#cancel-edit');
            const form = modal.querySelector('#edit-theater-form');

            closeBtn.addEventListener('click', () => {
                document.body.removeChild(modal);
            });

            cancelBtn.addEventListener('click', () => {
                document.body.removeChild(modal);
            });

            // form submission
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const theaterData = {
                    theaterId: parseInt(document.getElementById('theater-id').value),
                    theaterName: document.getElementById('theater-name').value,
                    rowCount: parseInt(document.getElementById('row-count').value),
                    seatsPerRow: parseInt(document.getElementById('seats-per-row').value)
                };

                try {
                    // Api kald Update
                    await API.theaters.update(theaterData.theaterId, theaterData);

                    alert('Biografsal opdateret!');
                    document.body.removeChild(modal);

                    // Reload theaters
                    this.loadTheaters();
                } catch (error) {
                    console.error('Error updating theater:', error);
                    alert('Der opstod en fejl ved opdatering af biografsalen.');
                }
            });

            // Close modal when clicking outside
            window.addEventListener('click', (event) => {
                if (event.target === modal) {
                    document.body.removeChild(modal);
                }
            });

        } catch (error) {
            console.error('Error opening edit theater modal:', error);
            alert('Der opstod en fejl :(');
        }
    },

    // todo Show error message ? andet? w
    showError(message) {
        this.container.innerHTML = `<p class="error">${message}</p>`;
    }
};