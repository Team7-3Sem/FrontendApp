async function fetchSeatAvailability(showingId) {
    try {
        const response = await fetch(`http://localhost:8080/kinogrisen/availability/${showingId}`);
        const seats = await response.json();
        console.log("Seats fetched:", seats); // ✅ Debugging
        renderSeats(seats);
    } catch (error) {
        console.error("Error fetching seats:", error);
    }
}

function renderSeats(seats) {
    const seatContainer = document.getElementById("seat-container");
    seatContainer.innerHTML = ""; // Clear existing seats before rendering

    seats.forEach(seat => {
        const seatDiv = document.createElement("div");
        seatDiv.classList.add("seat");
        seatDiv.textContent = `${seat.row}-${seat.number}`;

        if (seat.reserved) {
            seatDiv.classList.add("reserved"); // Mark as reserved
        } else {
            seatDiv.addEventListener("click", () => toggleSeatSelection(seatDiv));
        }

        seatContainer.appendChild(seatDiv);
    });
}

let selectedSeats = [];

function toggleSeatSelection(seatDiv, seatId) {
    if (!seatDiv.classList.contains("reserved")) {
        seatDiv.classList.toggle("selected");

        if (selectedSeats.includes(seatId)) {
            selectedSeats = selectedSeats.filter(id => id !== seatId); // Remove seat if unselected
        } else {
            selectedSeats.push(seatId); // Add seat if selected
        }
    }
}

// Call the function on page load
document.addEventListener("DOMContentLoaded", () => {
    const showingId = 1; // Replace with actual showing ID
    fetchSeatAvailability(showingId);
});

async function reserveSeats(showingId) {
    if (selectedSeats.length === 0) {
        alert("Please select at least one seat!");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/kinogrisen/reserve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ showingId, seatIds: selectedSeats })
        });

        if (response.ok) {
            alert("Seats reserved successfully!");
            window.location.reload(); // Refresh to update seat availability
        } else {
            alert("Failed to reserve seats. Please try again.");
        }
    } catch (error) {
        console.error("Error reserving seats:", error);
    }
}

// Attach the function to the button
document.getElementById("reserve-button").addEventListener("click", () => {
    const showingId = 1; // Replace with dynamic ID
    reserveSeats(showingId);
});

