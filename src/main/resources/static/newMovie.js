const NewMovie = {
    init() {
        document.getElementById("create-movie-btn").addEventListener("click", this.showMovieForm.bind(this));
        document.getElementById("cancel-movie-btn").addEventListener("click", this.hideMovieForm.bind(this));

        const form = document.getElementById("movie-form");
        if (form) {
            form.addEventListener("submit", this.handleMovieSubmit.bind(this));
        }

        this.loadMovies();
    },

    showMovieForm() {
        document.getElementById("movie-form-container").style.display = "block"; // Show form
    },

    hideMovieForm() {
        document.getElementById("movie-form-container").style.display = "none"; // Hide form
    },

    async handleMovieSubmit(event) {
        event.preventDefault();

        const movieData = {
            title: document.getElementById('movie-title').value,
            genre: document.getElementById('movie-genre').value,
            duration: parseInt(document.getElementById('movie-duration').value),
            ageRestriction: parseInt(document.getElementById('movie-age').value),
            description: document.getElementById('movie-description').value,
            releaseDate: document.getElementById('movie-release-date').value,
            endDate: document.getElementById('movie-end-date').value,
            isActive: document.getElementById('movie-active').checked
        };

        try {
            const response = await fetch('http://localhost:8080/kinogrisen/movies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(movieData)
            });

            if (!response.ok) throw new Error("Server error");

            alert("✅ Film oprettet!");
            this.hideMovieForm();
            event.target.reset(); // Clear form fields
            this.loadMovies(); // Refresh movie list
        } catch (error) {
            alert("❌ Kunne ikke oprette filmen.");
        }
    },

    async loadMovies() {
        const container = document.getElementById("movies-container");
        container.innerHTML = `<div class="loading">Indlæser film...</div>`;

        try {
            const response = await fetch("http://localhost:8080/kinogrisen/movies");
            if (!response.ok) throw new Error("Server error");

            const movies = await response.json();
            if (movies.length === 0) {
                container.innerHTML = "<p>Ingen film tilgængelig.</p>";
                return;
            }


            const table = document.createElement("table");
            table.className = "data-table";
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Navn</th>
                        <th>Genre</th>
                        <th>Varighed</th>
                        <th>Handlinger</th>
                    </tr>
                </thead>
                <tbody>
                    ${movies.map(movie => `
                        <tr>
                            <td>${movie.movieID}</td>
                            <td>${movie.title}</td>
                            <td>${movie.genre}</td>
                            <td>${movie.duration} min</td>
                            <td>
                                <button class="btn-delete" data-id="${movie.movieID}">Slet</button>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            `;

            container.innerHTML = "";
            container.appendChild(table);


            document.querySelectorAll(".btn-delete").forEach(button => {
                button.addEventListener("click", (event) => {
                    const movieID = event.target.getAttribute("data-id");
                    this.deleteMovie(movieID);
                });
            });

        } catch (error) {
            container.innerHTML = "<p>Fejl ved indlæsning af film.</p>";
        }
    },

    async deleteMovie(movieID) {
        if (!confirm("Er du sikker på, at du vil slette denne film?")) return;

        try {
            await fetch(`http://localhost:8080/kinogrisen/movies/${movieID}`, { method: "DELETE" });
            alert("✅ Film slettet!");
            this.loadMovies();
        } catch (error) {
            alert("❌ Fejl ved sletning af film.");
        }
    }
};

document.addEventListener("DOMContentLoaded", () => NewMovie.init());
