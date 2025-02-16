
document.addEventListener('DOMContentLoaded', function() {
    // Create sparkle effect
    function createSparkle(e) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        document.body.appendChild(sparkle);
        
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        sparkle.style.left = `${e.clientX}px`;
        sparkle.style.top = `${e.clientY}px`;
        
        sparkle.style.animation = 'none';
        sparkle.offsetHeight; // Trigger reflow
        sparkle.style.animation = 'sparkle 1s ease-in-out forwards';
        
        setTimeout(() => sparkle.remove(), 1000);
    }

    // Add sparkle effect to form inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.closest('.form-group').classList.add('input-focused');
        });
        
        input.addEventListener('blur', function() {
            this.closest('.form-group').classList.remove('input-focused');
        });
        
        input.addEventListener('mousemove', createSparkle);
    });

    // Enhanced Password Strength Indicator
    const passwordInput = document.getElementById('new_password');
    const strengthBar = passwordInput.nextElementSibling.nextElementSibling;
    
    passwordInput.addEventListener('input', function() {
        const strength = calculatePasswordStrength(this.value);
        updatePasswordStrengthUI(strength, strengthBar);
    });

    function calculatePasswordStrength(password) {
        if (!password) return 0;
        let score = 0;
        
        // Length check
        if (password.length >= 8) score += 25;
        if (password.length >= 12) score += 10;
        
        // Character variety checks
        if (password.match(/[A-Z]/)) score += 15;
        if (password.match(/[a-z]/)) score += 15;
        if (password.match(/[0-9]/)) score += 15;
        if (password.match(/[^A-Za-z0-9]/)) score += 20;
        
        return Math.min(100, score);
    }

    function updatePasswordStrengthUI(strength, bar) {
        bar.classList.remove('hidden');
        bar.style.width = `${strength}%`;
        
        // Color based on strength
        const hue = (strength * 1.2); // 0-120 (red to green)
        bar.style.backgroundColor = `hsl(${hue}, 80%, 60%)`;
        
        // Add pulse animation for low strength
        if (strength < 50) {
            bar.classList.add('pulse');
        } else {
            bar.classList.remove('pulse');
        }
    }

    // Form submission animation
    const form = document.getElementById('profileForm');
    form.addEventListener('submit', function(e) {
        const button = this.querySelector('button[type="submit"]');
        button.innerHTML = `
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-black inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Updating...
        `;
        button.disabled = true;
    });

    // Add floating animation to profile picture on hover
    const profilePic = document.querySelector('.floating');
    profilePic.addEventListener('mouseover', function() {
        this.style.animationPlayState = 'paused';
    });
    profilePic.addEventListener('mouseout', function() {
        this.style.animationPlayState = 'running';
    });

    // Add ripple effect to buttons
    document.querySelectorAll('button, a').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('div');
            ripple.className = 'absolute inset-0 bg-white/20 rounded-lg transform scale-0';
            this.appendChild(ripple);
            
            const diameter = Math.max(this.clientWidth, this.clientHeight);
            ripple.style.width = ripple.style.height = `${diameter}px`;
            
            const rect = this.getBoundingClientRect();
            ripple.style.left = `${e.clientX - rect.left - diameter/2}px`;
            ripple.style.top = `${e.clientY - rect.top - diameter/2}px`;
            
            ripple.style.animation = 'ripple 600ms linear';
            ripple.addEventListener('animationend', () => ripple.remove());
        });
    });
});

// Add these keyframe animations to your CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes sparkle {
        0% { transform: scale(0); opacity: 1; }
        50% { transform: scale(1); opacity: 0.5; }
        100% { transform: scale(2); opacity: 0; }
    }
    
    @keyframes ripple {
        to { transform: scale(4); opacity: 0; }
    }
`;
document.head.appendChild(style);