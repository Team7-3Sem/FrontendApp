const AdminReservation ={
    container: null,
    reservationData:[],

    init() {
        this.container = doocument.getElementById('reservations-container');
        this.loadReservations();
    },

    async loadReservations(){
        try{
            const loading = this.container.querySelector('.loading');
            if(loading) loading.textContent = 'Indlæser reservationer...';

            this.reservationData = await API.reservations.getAll();
            this.renderReservations();
        } catch (error){
            this.showError('Kunne ikke indlæse reservationer. Prøv igen senere.');
            console.error('Error loading reservation:', error);
        }
    },

    //Render reservations
    renderReservations(){
        if(!this.reservationData || this.reservationData.length === 0){
            this.container.innerHTML = '<p class="no-results">Der er ingen reservationer at vise.</p>';
            return;
        }

        const table = document.createElement('table');
        table.className = 'data-table';

        //Create table header
        const tableHead = document.createElement('thead');
        tableHead.innerHTML = `
            <tr>
                <th>ReservationsID</th>
                <th>Visning</th>
                <th>Navn</th>
                <th>Email</th>
                <th>Telefonnummer</th>
                <th>Reservations tid</th>
                <th>Reservations dato</th>
                <th>Betalt/ikke betalt</th>
            </tr>  
        `;
        table.appendChild(tableHead);

        //Create table body
        const tableBody=document.createElement('tbody');

        this.reservationData.forEach(reservation => {
            const
        })
    }

}
