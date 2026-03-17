import './style.css'

// Scroll fade effect removed to protect pitch area readability

// Subtle hover animation for cards using mouse position
const cards = document.querySelectorAll('.tier-card');
cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
        
        // Removed Tilt effect for a more solid, premium feel
        // Keeping mouse x/y tracking for potential hover glow effects
    });
    
    card.addEventListener('mouseleave', () => {
        // transform logic now handled cleanly by CSS hover state with calc()
    });
});

// UI Sound Effects
// Mathematical Synthesizer using Web Audio API for a perfect premium click
let audioCtx;

function initAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playClickSound() {
    try {
        initAudioContext();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'sine';
        
        // Premium sweep down creates a physical "knock" pop feel
        oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.08); 
        
        gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08); 
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.08);
    } catch (e) {
        // Fail silently if browser entirely bans AudioContext without touch explicit interaction tracking
    }
}

// Attach sound to interactive elements
document.addEventListener('DOMContentLoaded', () => {
    const interactables = document.querySelectorAll('button, a.invest-button');
    interactables.forEach(el => {
        el.addEventListener('mousedown', playClickSound);
    });
    
    // REMOVED Intersection Observer for glowing word groups
    // The animated title words are now completely driven by continuous scroll interpolation.
    
    // Setup Intersection Observer for Invest buttons (to expand nicely)
    const btnObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                entry.target.classList.remove('active');
            }
        });
    }, { threshold: 0.1 });
    
    const investBtns = document.querySelectorAll('.invest-button');
    investBtns.forEach(btn => btnObserver.observe(btn));
    
    // Setup Intersection Observer for Form loader buttons (Expand Details / Register Interest)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const formBtnObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
            } else {
                entry.target.classList.remove('appear');
            }
        });
    }, observerOptions);

    const formBtns = document.querySelectorAll('.form-loader-btn');
    formBtns.forEach(btn => formBtnObserver.observe(btn));
    
    // Setup generic scroll pops for cards and inner text
    const animTargets = document.querySelectorAll('.tier-card, .tier-name, .tier-price, .tier-expand-btn, .theme-box, .execution-list li');
    animTargets.forEach(el => formBtnObserver.observe(el));
    
    // Initialize scroll scale early
    updateScrollScale();
});

// Premium Scroll Parallax for Tier Cards
function updateScrollScale() {
    const windowCenter = window.innerHeight / 2;
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.top + rect.height / 2;
        
    const maxDistance = window.innerHeight / 1.2;
        const distance = Math.abs(windowCenter - cardCenter);
        
        let scale = 1 - (distance / maxDistance) * 0.15; 
        scale = Math.max(0.85, Math.min(1, scale)); 
        
        card.style.setProperty('--scroll-scale', scale);
    });
    
    // Continuous Left-to-Right sweep and glow for Animated Title (PLAY. LEARN. SPEAK. TOGETHER.)
    const titleContainer = document.querySelector('.title-animated');
    if (titleContainer) {
        const titleRect = titleContainer.getBoundingClientRect();
        const winHeight = window.innerHeight;
        
        // We want progress to be exactly 1.0 (fully assembled/static) while it resides comfortably on screen.
        // It drops to 0.0 sequentially as it exits either the top or bottom half of the viewport.
        let progress = 1;
        
        if (titleRect.top > winHeight * 0.55) {
            // Animating IN from the bottom
            progress = 1 - (titleRect.top - winHeight * 0.55) / (winHeight * 0.45);
        } else if (titleRect.top < winHeight * 0.35) {
            // Animating OUT as it scrolls past the upper-middle threshold
            const exitTravelDistance = winHeight * 0.5; // How many pixels of scroll it takes to break apart
            progress = (titleRect.top + exitTravelDistance) / ((winHeight * 0.35) + exitTravelDistance); 
        }
        
        progress = Math.max(0, Math.min(1, progress));
        
        const words = document.querySelectorAll('.word-group');
        words.forEach((word, index) => {
            // Sequence each word's animation start and end points based on index! 
            // Left to Right sweep effect!
            const startPoint = index * 0.15; 
            const endPoint = startPoint + 0.45;
            
            let localProgress = (progress - startPoint) / (endPoint - startPoint);
            localProgress = Math.max(0, Math.min(1, localProgress));
            
            // Ease out cubic for snap feeling
            const easeOut = 1 - Math.pow(1 - localProgress, 3);
            
            const xOffset = -(window.innerWidth) * (1 - easeOut);
            const wordScale = 0.85 + (0.15 * easeOut);
            
            word.style.transform = `translateX(${xOffset}px) scale(${wordScale})`;
            
            if (easeOut >= 0.98) {
                if (!word.classList.contains('word-on')) {
                    word.classList.add('word-on');
                    word.style.color = '';
                    word.style.textShadow = '';
                    word.style.opacity = '';
                }
                word.style.filter = 'blur(0px)';
            } else {
                if (word.classList.contains('word-on')) {
                    word.classList.remove('word-on');
                }
                word.style.opacity = 0.05 + (0.95 * easeOut);
                word.style.color = '#555'; /* Dimmer to begin with */
                word.style.filter = `blur(${8 * (1 - easeOut)}px)`;
                word.style.textShadow = 'none';
            }
        });
    }
}

window.addEventListener('scroll', updateScrollScale, { passive: true });
window.addEventListener('resize', updateScrollScale, { passive: true });
