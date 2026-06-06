// ===== Gold Particles Animation =====
const particlesContainer = document.getElementById('goldParticles');

function createParticle() {
    if (!particlesContainer) return;
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    const size = Math.random() * 4 + 2;
    const posX = Math.random() * 100;
    const duration = Math.random() * 10 + 10;
    const delay = Math.random() * 5;
    
    particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, rgba(227, 204, 174, 0.8) 0%, transparent 70%);
        border-radius: 50%;
        left: ${posX}%;
        bottom: -20px;
        animation: floatUp ${duration}s ease-in-out ${delay}s infinite;
        pointer-events: none;
    `;
    
    particlesContainer.appendChild(particle);
}

// Create CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes floatUp {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Create multiple particles
for (let i = 0; i < 30; i++) {
    createParticle();
}

// ===== Testimonials Slider =====
const testimonialCards = document.querySelectorAll('.testimonial-card');
const dots = document.querySelectorAll('.dot');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
let currentSlide = 0;

function showSlide(index) {
    testimonialCards.forEach(card => card.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    if (index >= testimonialCards.length) {
        currentSlide = 0;
    } else if (index < 0) {
        currentSlide = testimonialCards.length - 1;
    } else {
        currentSlide = index;
    }
    
    testimonialCards[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

prevBtn.addEventListener('click', () => {
    showSlide(currentSlide + 1);
});

nextBtn.addEventListener('click', () => {
    showSlide(currentSlide - 1);
});

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        showSlide(index);
    });
});

// Auto slide
setInterval(() => {
    showSlide(currentSlide + 1);
}, 5000);

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===== Form Submission =====
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const message = document.getElementById('message').value;
        
        // Here you would typically send the data to a server
        console.log('Form submitted:', { name, email, phone, message });
        
        // Show success message (simple alert for demo)
        alert('Thank you for contacting us! We will get back to you soon.');

        // Reset form
        contactForm.reset();
    });
}

// ===== Newsletter Form =====
const newsletterForm = document.querySelector('.newsletter-form');

if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input').value;
        console.log('Newsletter subscription:', email);
        alert('Subscribed successfully!');
        newsletterForm.reset();
    });
}

// ===== Scroll Reveal Animation =====
const revealElements = document.querySelectorAll('.section-header, .product-card, .feature-item, .heritage-content, .heritage-visual');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    revealObserver.observe(el);
});

// Language switch logic handled in i18n.js

// ===== Product Card Hover Effect =====
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        const device = this.querySelector('.product-device');
        if (device) {
            device.style.transform = 'translateY(-10px) scale(1.05)';
            device.style.transition = 'transform 0.4s ease';
        }
    });
    
    card.addEventListener('mouseleave', function() {
        const device = this.querySelector('.product-device');
        if (device) {
            device.style.transform = 'translateY(0) scale(1)';
        }
    });
});

// ===== Video Play Button =====
const playButton = document.querySelector('.video-placeholder');

if (playButton) {
    playButton.addEventListener('click', () => {
        // Here you would typically open a video modal or start video playback
        alert('Video player coming soon!');
    });
}

// ===== Parallax Effect on Hero =====
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    const heroProduct = document.querySelector('.hero-product');
    
    if (heroContent && scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.2}px)`;
        heroContent.style.opacity = 1 - (scrolled * 0.001);
    }
    
    if (heroProduct && scrolled < window.innerHeight) {
        heroProduct.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});

// ===== Console Welcome Message =====
console.log('%c عود الذهب | OUD GOLD ', 
    'background: linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%); color: #000; font-size: 20px; padding: 10px 20px; font-weight: bold;'
);
console.log('%c Premium Agarwood Vape Experience ', 
    'color: #d4af37; font-size: 14px; padding: 5px;'
);

function toggleAudio(){
    window.open('https://www.youtube.com/watch?v=eAM0xr5j6vw','_blank')
}