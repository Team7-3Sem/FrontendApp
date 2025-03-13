
document.addEventListener('DOMContentLoaded', () => {
    initTabNavigation();

    // Initialize admin modules
    AdminMovies.init();
    AdminShowings.init();
    AdminTheaters.init();
    AdminReservations.init();

});

/**
 * Initialize tab navigation in admin panel
 */
function initTabNavigation() {
    const navLinks = document.querySelectorAll('.admin-nav-link');
    const sections = document.querySelectorAll('.admin-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const targetId = link.getAttribute('data-section');

            // Update active class on navigation
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Update active class on sections
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
        });
    });
}