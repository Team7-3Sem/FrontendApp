const API_BASE_URL = "http://localhost:8080/kinogrisen";

let selectedSeats = [];


async function fetchSeatAvailability(showingId) {
    try {
        const response = await fetch(`${API_BASE_URL}/availability/${showingId}`);
        const seats = await response.json();
        console.log("Seats fetched:", seats);
        renderSeats(seats);
    } catch (error) {
        console.error("Error fetching seats:", error);
    }
}


function renderSeats(seats) {
    const seatContainer = document.getElementById("seat-container");
    seatContainer.innerHTML = "";

    seats.forEach(seat => {
        const seatDiv = document.createElement("div");
        seatDiv.classList.add("seat");
        seatDiv.textContent = `${seat.row}-${seat.number}`;

        if (seat.reserved) {
            seatDiv.classList.add("reserved");
        } else {
            seatDiv.addEventListener("click", () => toggleSeatSelection(seatDiv, seat.seatId));
        }

        seatContainer.appendChild(seatDiv);
    });
}


function toggleSeatSelection(seatDiv, seatId) {
    if (!seatDiv.classList.contains("reserved")) {
        seatDiv.classList.toggle("selected");

        if (selectedSeats.includes(seatId)) {
            selectedSeats = selectedSeats.filter(id => id !== seatId);
        } else {
            selectedSeats.push(seatId);
        }
    }
}


async function reserveSeats(showingId) {
    if (selectedSeats.length === 0) {
        alert("Please select at least one seat!");
        return;
    }


    const customerName = document.getElementById("customerName").value;
    const customerPhone = document.getElementById("customerPhone").value;
    const customerEmail = document.getElementById("customerEmail").value;

    if (!customerName || !customerPhone || !customerEmail) {
        alert("Please fill in all customer details.");
        return;
    }

    const reservationData = {
        showingId: showingId,
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
            alert("Seats reserved successfully!");
            window.location.reload(); // Opdaterer seat availability
        } else {
            alert("Failed to reserve seats. Please try again.");
        }
    } catch (error) {
        console.error("Error reserving seats:", error);
    }
}


document.getElementById("reserve-button").addEventListener("click", () => {
    const showingId = 1;
    reserveSeats(showingId);
});


document.addEventListener("DOMContentLoaded", () => {
    const showingId = 1;
    fetchSeatAvailability(showingId);
});
