/**
 * API Service for KinoXP
 * HTTP requests to the backend
 */
const API = {
    BASE_URL: '',  // tom, relative stier

    // fetch
    async fetchData(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.BASE_URL}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            if (response.status === 204) {
                return true;
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Movies API
    movies: {
        getAll: () => API.fetchData('/kinogrisen/movies'),
        getById: (id) => API.fetchData(`/kinogrisen/movies/${id}`),
        create: (movieData) => API.fetchData('/kinogrisen/movies', {
            method: 'POST',
            body: JSON.stringify(movieData)
        }),
        update: (id, movieData) => API.fetchData(`/kinogrisen/movies/${id}`, {
            method: 'PUT',
            body: JSON.stringify(movieData)
        }),
        delete: (id) => API.fetchData(`/kinogrisen/movies/${id}`, {
            method: 'DELETE'
        })
    },

    // Showings API
    showings: {
        getAll: () => API.fetchData('/kinogrisen/showings'),
        getById: (id) => API.fetchData(`/kinogrisen/showings/${id}`),
        create: (showingData) => API.fetchData('/kinogrisen/showings', {
            method: 'POST',
            body: JSON.stringify(showingData)
        }),
        update: (id, showingData) => API.fetchData(`/kinogrisen/showings/${id}`, {
            method: 'PUT',
            body: JSON.stringify(showingData)
        }),
        delete: (id) => API.fetchData(`/kinogrisen/showings/${id}`, {
            method: 'DELETE'
        })
    },

    // Theaters API
    theaters: {
        getAll: () => API.fetchData('/kinogrisen/theatres'),
        getById: (id) => API.fetchData(`/kinogrisen/theatres/${id}`),
        getLayout: (id) => API.fetchData(`/kinogrisen/theaters/${id}/layout`),
        update: (id, theaterData) => API.fetchData(`/kinogrisen/theatres/${id}`, {
            method: 'PUT',
            body: JSON.stringify(theaterData)
        })
    },

    // Reservations API todo
    reservations: {
        getAll: () => API.fetchData('/kinogrisen/reservations'),
        getById: (id) => API.fetchData(`/kinogrisen/reservations/${id}`),
        create: (reservationData) => API.fetchData('/kinogrisen/reservations', {
            method: 'POST',
            body: JSON.stringify(reservationData)
        }),
        update: (id, reservationData) => API.fetchData(`/kinogrisen/reservations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(reservationData)
        }),
        delete: (id) => API.fetchData(`/kinogrisen/reservations/${id}`, {
            method: 'DELETE'
        })
    }
};