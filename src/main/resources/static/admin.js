document.addEventListener('DOMContentLoaded', () => {
    initTabNavigation();
    initModals();

    // ✅ Ensure modules exist before initializing
    if (typeof AdminMovies !== 'undefined') AdminMovies.init();
    if (typeof AdminShowings !== 'undefined') AdminShowings.init();
    if (typeof AdminTheaters !== 'undefined') AdminTheaters.init();
    //if (typeof AdminReservations !== 'undefined') AdminReservations.init();
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

            // ✅ Update active class on navigation
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // ✅ Update active class on sections
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');

            // ✅ Store active tab in sessionStorage for persistence
            sessionStorage.setItem('activeTab', targetId);
        });
    });

    // ✅ Restore last active tab after page reload
    const lastActiveTab = sessionStorage.getItem('activeTab');
    if (lastActiveTab) {
        document.querySelector(`.admin-nav-link[data-section="${lastActiveTab}"]`)?.click();
    }
}

/**
 * Initialize modal closing functionality
 */
function initModals() {
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function () {
            this.closest('.modal').style.display = 'none';
        });
    });

    // ✅ Close modals when clicking outside them
    window.addEventListener('click', (event) => {
        document.querySelectorAll('.modal').forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}
