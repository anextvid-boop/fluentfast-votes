// style.css is already loaded via standard HTML <link> natively.

// Scroll fade effect removed to protect pitch area readability

// Subtle hover animation for cards using mouse position
let cards = null;

function initCardHover() {
    if (!cards) cards = document.querySelectorAll('.tier-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}


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
function initializeObservers() {
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
    
    // Animate Title natively upon sight!
    const titleWordsStatic = document.querySelectorAll('.word-group');
    const wordObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('word-on');
            }
        });
    }, { threshold: 0.2 });
    titleWordsStatic.forEach(w => wordObserver.observe(w));
    
    initCardHover();
    
    // Initialize scroll scale manually upon final load
    updateScrollScale();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeObservers);
} else {
    initializeObservers();
}

// Premium Scroll Parallax for Tier Cards

function updateScrollScale() {
    
    const windowCenter = window.innerHeight / 2;
    if (cards) {
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const cardCenter = rect.top + rect.height / 2;
            
        const maxDistance = window.innerHeight / 1.2;
            const distance = Math.abs(windowCenter - cardCenter);
            
            let scale = 1 - (distance / maxDistance) * 0.15; 
            scale = Math.max(0.85, Math.min(1, scale)); 
            
            card.style.setProperty('--scroll-scale', scale);
        });
    }
}
            
let mainTicking = false;
const scrollHandler = () => {
  if (!mainTicking) {
    window.requestAnimationFrame(() => {
      updateScrollScale();
      mainTicking = false;
    });
    mainTicking = true;
  }
};
window.addEventListener('scroll', scrollHandler, { passive: true });
window.addEventListener('resize', scrollHandler, { passive: true });
