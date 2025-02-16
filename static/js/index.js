// Initialize animations when the page loads
window.onload = function() {
    // Animate content
    gsap.to("h1", {opacity: 1, y: 0, duration: 1, ease: "power3.out"});
    gsap.to(".tagline", {opacity: 1, y: 0, duration: 1, delay: 0.3, ease: "power3.out"});
    gsap.to(".cta-button", {opacity: 1, y: 0, duration: 1, delay: 0.6, ease: "power3.out"});
    gsap.to(".hero-image", {opacity: 1, duration: 1, delay: 0.9, ease: "power3.out"});

    // Create particles
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 20; i++) {
        createParticle();
    }
};

// Create floating particles
function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random starting position
    particle.style.left = Math.random() * window.innerWidth + 'px';
    particle.style.top = Math.random() * window.innerHeight + 'px';
    
    // Random size
    const size = Math.random() * 4 + 2;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    
    // Random animation duration
    particle.style.animationDuration = (Math.random() * 8 + 4) + 's';
    
    document.getElementById('particles').appendChild(particle);
    
    // Remove particle after animation
    particle.addEventListener('animationend', () => {
        particle.remove();
        createParticle();
    });
}

// Redirect to login page
function redirectToLogin() {
    window.location.href = '/login_signup';
}