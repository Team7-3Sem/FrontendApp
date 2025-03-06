document.addEventListener('DOMContentLoaded', () => {

    initTabNavigation();

    // admin moduler
    AdminMovies.init();
    AdminShowings.init();
    AdminTheaters.init();

    // TODO:reservations admin modul initieres

    console.log('KinoXP admin application initialized');
});

/**
 *
 */
function initTabNavigation() {
    const navLinks = document.querySelectorAll('.admin-nav-link');
    const sections = document.querySelectorAll('.admin-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const targetId = link.getAttribute('data-section');

            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            link.classList.add('active');
            document.getElementById(targetId).classList.add('active');
        });
    });
}