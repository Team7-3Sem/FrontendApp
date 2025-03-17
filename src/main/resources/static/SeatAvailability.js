const API_BASE_URL = "http://localhost:8080/kinogrisen";

let selectedSeats = [];
let selectedShowing = null; // Default showing

// Fetch all showings and populate the dropdown
async function fetchShowings() {
    try {
        const response = await fetch(`${API_BASE_URL}/showings`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const showings = await response.json();
        console.log("Fetched showings:", showings); // ✅ Debugging Output

        const showingSelect = document.getElementById("showingSelect");
        showingSelect.innerHTML = ""; // Clear existing options

        if (showings.length === 0) {
            console.warn("No showings found in the database.");
            showingSelect.innerHTML = "<option disabled>No showings available</option>";
            return;
        }

        showings.forEach(showing => {
            const option = document.createElement("option");
            option.value = showing.showingID; // ✅ Ensure correct property
            option.textContent = `Showing ${showing.showingID} - ${showing.startTime}`;
            showingSelect.appendChild(option);
        });


        selectedShowing = showings[0].showingID;
        fetchSeatAvailability(selectedShowing);
    } catch (error) {
        console.error("Error fetching showings:", error);
    }
}

// Fetch seat availability for a given showing
async function fetchSeatAvailability(showingId) {
    try {
        const response = await fetch(`${API_BASE_URL}/availability/${showingId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const seats = await response.json();
        console.log(`Seats for Showing ${showingId}:`, seats);
        renderSeats(seats);
    } catch (error) {
        console.error("Error fetching seats:", error);
    }
}

function renderSeats(seats) {
    const seatContainer = document.getElementById("seat-container");
    seatContainer.innerHTML = ""; // Clear existing seats

    const rows = {};

    // ✅ Group seats by rowNumber
    seats.forEach(seat => {
        if (!seat.rowNumber || !seat.seatNumber) {
            console.error("Invalid seat data:", seat);
            return;
        }

        if (!rows[seat.rowNumber]) {
            rows[seat.rowNumber] = [];
        }
        rows[seat.rowNumber].push(seat);
    });

    console.log("Organized seat rows:", rows);


    Object.keys(rows).forEach(rowNumber => {
        const rowDiv = document.createElement("div");
        rowDiv.classList.add("seat-row");

        rows[rowNumber].forEach(seat => {
            const seatDiv = document.createElement("div");
            seatDiv.classList.add("seat");
            seatDiv.textContent = `${seat.rowNumber}-${seat.seatNumber}`;

            if (seat.reserved) {
                seatDiv.classList.add("reserved");
            } else {
                seatDiv.addEventListener("click", () => toggleSeatSelection(seatDiv, seat.seatId));
            }

            rowDiv.appendChild(seatDiv);
        });

        seatContainer.appendChild(rowDiv);
    });

    console.log("Rendered seat layout:", seatContainer.innerHTML);
}


// Toggle seat selection
function toggleSeatSelection(seatDiv, seatId) {
    if (!seatDiv.classList.contains("reserved")) {
        seatDiv.classList.toggle("selected");

        if (selectedSeats.includes(seatId)) {
            selectedSeats = selectedSeats.filter(id => id !== seatId); // Remove from list
        } else {
            selectedSeats.push(seatId); // Add to list
        }
    }
}

// Send reservation request
async function reserveSeats() {
    if (selectedSeats.length === 0) {
        alert("Vælg mindst ét sæde!");
        return;
    }


    const customerName = document.getElementById("customerName").value;
    const customerPhone = document.getElementById("customerPhone").value;
    const customerEmail = document.getElementById("customerEmail").value;

    if (!customerName || !customerPhone || !customerEmail) {
        alert("Udfyld venligst alle informationer.");
        return;
    }

    const reservationData = {
        showingId: selectedShowing,
        customerName: customerName,
        customerPhone: customerPhone,
        customerEmail: customerEmail,
        seatIds: selectedSeats
    };

    try {
        const response = await fetch(`${API_BASE_URL}/reservations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reservationData)
        });

        if (response.ok) {
            alert("Sæder reserveret!");
            window.location.reload();
        } else {
            alert("Kunne ikke reservere sæder.");
        }
    } catch (error) {
        console.error("Error reserving seats:", error);
    }
}

// Event Listener: Update seats when the showing is changed
document.getElementById("showingSelect").addEventListener("change", (event) => {
    selectedShowing = event.target.value;
    fetchSeatAvailability(selectedShowing);
});

// Event Listener: Reserve seats
document.getElementById("reserve-button").addEventListener("click", reserveSeats);

// Load showings on page load
document.addEventListener("DOMContentLoaded", fetchShowings);
