// ===== App Configuration =====
const config = window.APP_CONFIG || {
    lang: 'en',
    isRTL: false,
    messages: {
        contactSuccess: 'Thank you for contacting us!',
        newsletterSuccess: 'Subscribed successfully!',
        loading: 'Loading...',
        error: 'An error occurred'
    }
};

// ===== Age Verification =====
const ageOverlay = document.getElementById('age-verification');
const ageYes = document.getElementById('age-yes');
const ageNo = document.getElementById('age-no');
const appWrapper = document.getElementById('app-wrapper');

function showMainContent() {
    document.body.classList.remove('age-restricted');
    document.body.style.overflow = 'auto';
    if (appWrapper) {
        appWrapper.style.setProperty('display', 'block', 'important');
        appWrapper.classList.add('content-visible');
    }
    if (ageOverlay) {
        ageOverlay.style.setProperty('display', 'none', 'important');
    }
    
    // 如果是二次进入（已验证），立即隐藏预加载动画
    const preloader = document.getElementById('preloader');
    if (preloader && sessionStorage.getItem('age-verified') === 'true') {
        preloader.style.display = 'none';
    }
}

if (ageOverlay) {
    // Check if age is already verified in this session
    if (sessionStorage.getItem('age-verified') === 'true') {
        showMainContent();
    } else {
        // Force hide app wrapper just in case
        if (appWrapper) {
            appWrapper.style.display = 'none';
        }
    }

    if (ageYes) {
        ageYes.addEventListener('click', () => {
            alert('Sorry, you must be 18 or older to access this site.');
            window.location.href = 'https://www.google.com';
        });
    }

    if (ageNo) {
        ageNo.addEventListener('click', () => {
            sessionStorage.setItem('age-verified', 'true');
            showMainContent();
        });
    }
}

// ===== Preloader =====
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // 如果已经验证过年龄，预加载动画缩短到 500ms 甚至更短，或者直接消失
        const delay = sessionStorage.getItem('age-verified') === 'true' ? 300 : 1500;
        setTimeout(() => {
            preloader.classList.add('hidden');
            // 动画结束后彻底移除，防止遮挡交互
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }, delay);
    }
});

// ===== Navbar Scroll Effect =====
const navbar = document.getElementById('navbar');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    lastScrollY = window.scrollY;
});

// ===== Audio Toggle =====
function toggleAudio(videoId, hintId) {
    console.log('toggleAudio called', videoId, hintId);
    const video = document.getElementById(videoId);
    const hint = document.getElementById(hintId);
    if (video && hint) {
        video.muted = !video.muted;
        console.log('video.muted set to', video.muted);
        if (video.muted) {
            hint.innerHTML = '<i class="fas fa-volume-mute"></i> Click to unmute';
        } else {
            hint.innerHTML = '<i class="fas fa-volume-up"></i> Click to mute';
            // 某些浏览器需要显式 play() 才能在取消静音后播放声音
            video.play().catch(e => {
                console.error('Play error:', e);
                // 如果播放失败（可能是因为交互限制），尝试重新静音以保持一致性
                // video.muted = true;
                // hint.innerHTML = '<i class="fas fa-volume-mute"></i> Click to unmute';
            });
        }
    } else {
        console.error('Video or Hint element not found:', videoId, hintId);
    }
}

// Global expose for inline onclick
window.toggleAudio = toggleAudio;

// ===== Mobile Menu Toggle =====
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const langSwitch = document.getElementById('langSwitch');
const langMenu = document.querySelector('.lang-menu');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });

    // Mobile Dropdown Toggle
    document.querySelectorAll('.nav-link-wrapper').forEach(wrapper => {
        const link = wrapper.querySelector('.nav-link');
        if (link) {
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 992) {
                    const dropdown = wrapper.querySelector('.nav-dropdown');
                    if (dropdown) {
                        e.preventDefault();
                        wrapper.classList.toggle('active');
                    }
                }
            });
        }
    });

    // Close menu when clicking a link (excluding links that have dropdowns on mobile)
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const wrapper = link.closest('.nav-link-wrapper');
            const hasDropdown = wrapper && wrapper.querySelector('.nav-dropdown');
            
            if (window.innerWidth <= 992 && hasDropdown) {
                // Do nothing here, handled by wrapper toggle
            } else {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    });
}

// ===== Language Switcher =====
if (langSwitch && langMenu) {
    langSwitch.addEventListener('click', (e) => {
        e.stopPropagation();
        langMenu.classList.toggle('show');
    });

    document.addEventListener('click', () => {
        langMenu.classList.remove('show');
    });

    document.querySelectorAll('.lang-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = option.getAttribute('data-lang');
            const url = new URL(window.location.href);
            url.searchParams.set('lang', lang);
            window.location.href = url.toString();
        });
    });
}

// ===== Active Navigation Link =====
const sections = document.querySelectorAll('section[id]');
const navLinksAll = document.querySelectorAll('.nav-link');

const observerOptions = {
    root: null,
    rootMargin: '-50% 0px -50% 0px',
    threshold: 0
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinksAll.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}, observerOptions);

sections.forEach(section => {
    observer.observe(section);
});

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
if (particlesContainer) {
    for (let i = 0; i < 30; i++) {
        createParticle();
    }
}

// ===== Testimonials Slider =====
const testimonialCards = document.querySelectorAll('.testimonial-card');
const dots = document.querySelectorAll('.dot');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
let currentSlide = 0;

function showSlide(index) {
    if (testimonialCards.length === 0) return;
    
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
    if (dots[currentSlide]) {
        dots[currentSlide].classList.add('active');
    }
}

if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        showSlide(config.isRTL ? currentSlide + 1 : currentSlide - 1);
    });
}

if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        showSlide(config.isRTL ? currentSlide - 1 : currentSlide + 1);
    });
}

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        showSlide(index);
    });
});

// Auto slide
if (testimonialCards.length > 0) {
    setInterval(() => {
        showSlide(currentSlide + 1);
    }, 5000);
}

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        const target = document.querySelector(href);
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===== Back to Top Button =====
const backToTopBtn = document.getElementById('backToTop');

if (backToTopBtn) {
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    window.scrollToTop = function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
}

// ===== Newsletter Form =====
const newsletterForm = document.getElementById('newsletterForm');

if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(newsletterForm);
        const email = formData.get('email');
        
        try {
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert(config.messages.newsletterSuccess);
                newsletterForm.reset();
            } else {
                alert(config.messages.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert(config.messages.error);
        }
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
        console.log('Video play requested');
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
console.log('%c عود الذهب | OUD GOLD | 金沉香 ', 
    'background: linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%); color: #000; font-size: 20px; padding: 10px 20px; font-weight: bold;'
);
console.log('%c Premium Agarwood Vape Experience ', 
    'color: #d4af37; font-size: 14px; padding: 5px;'
);