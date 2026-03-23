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
    
    if (typeof initVotingBoard === 'function') {
        initVotingBoard();
    }
    
    if (typeof createParticles === 'function') {
        createParticles();
    }
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

// --- Voting Board Logic (Matrix Style) ---
const matrixData = [
    { id: 'v1', category: 'languages', title: 'Japanese Course Expansion', desc: 'Kanji integration, stroke orders' },
    { id: 'v2', category: 'games', title: 'Speed Vocab Matchmaking', desc: '1v1 real-time competitive vocab' },
    { id: 'v3', category: 'voices', title: 'Scottish Highlander Koala', desc: 'Authentic aggressive audio' },
    { id: 'v4', category: 'languages', title: 'Spanish (Latin America)', desc: 'Mexican/Colombian specifics' },
    { id: 'v5', category: 'games', title: 'Co-op Story Puzzles', desc: 'Solve mysteries via translated clues' },
    { id: 'v6', category: 'voices', title: 'Australian Surfer Koala', desc: 'Chilled out dude accent' },
    { id: 'v7', category: 'core', title: 'Offline Mode Sync', desc: 'Download lessons for flights' }
];

const selectedFeatures = new Set();

function renderMatrixItems(filter = 'all') {
    const container = document.getElementById('matrixContainer');
    if (!container) return;

    const filtered = matrixData.filter(item => filter === 'all' || item.category === filter);

    container.innerHTML = filtered.map(item => {
        const isChecked = selectedFeatures.has(item.id) ? 'checked' : '';
        const activeClass = isChecked ? 'active' : '';

        return `
            <div class="matrix-item ${activeClass}" id="matrix-item-${item.id}">
                <div class="matrix-info">
                    <h4>${item.title}</h4>
                    <p>${item.desc}</p>
                </div>
                <label class="switch">
                    <input type="checkbox" onchange="toggleFeature('${item.id}', this.checked)" ${isChecked}>
                    <span class="slider"></span>
                </label>
            </div>
        `;
    }).join('');
}

window.toggleFeature = function(id, isChecked) {
    if (typeof playClickSound === 'function') playClickSound();

    const itemElement = document.getElementById(`matrix-item-${id}`);
    
    if (isChecked) {
        selectedFeatures.add(id);
        if (itemElement) itemElement.classList.add('active');
    } else {
        selectedFeatures.delete(id);
        if (itemElement) itemElement.classList.remove('active');
    }
}

window.initVotingBoard = function() {
    renderMatrixItems('all');

    // Filter Buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (typeof playClickSound === 'function') playClickSound();
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderMatrixItems(btn.dataset.filter);
        });
    });

    // Form submission
    const submitForm = document.getElementById('matrixSubmitForm');
    const emailInput = document.getElementById('matrixEmail');
    
    if (submitForm) {
        submitForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (typeof playClickSound === 'function') playClickSound();
            
            const email = emailInput.value.trim();
            if (!email) return;

            if (selectedFeatures.size === 0) {
                alert('Please toggle at least one feature before submitting!');
                return;
            }

            console.log('User Email:', email);
            console.log('Selected Features:', Array.from(selectedFeatures));
            
            alert(`Thanks! We've locked in your ${selectedFeatures.size} feature selections under ${email}.`);
            
            // Reset
            emailInput.value = '';
            selectedFeatures.clear();
            renderMatrixItems(document.querySelector('.filter-btn.active')?.dataset.filter || 'all');
        });
    }
}

// --- Dynamic Particle Effects ---
window.createParticles = function() {
    const container = document.getElementById('particles-container');
    if (!container) return;

    const particleCount = 25; // Adjusted to avoid overwhelming user, keeps it subtle
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'sparkle-particle';

        // Randomize physics
        const size = Math.random() * 3 + 1; // 1px to 4px
        const left = Math.random() * 100; // 0% to 100%
        const animationDuration = Math.random() * 10 + 6; // 6s to 16s
        const delay = Math.random() * 8; // 0s to 8s
        const maxOpacity = Math.random() * 0.5 + 0.1; // 0.1 to 0.6

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${left}vw`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.setProperty('--duration', `${animationDuration}s`);
        particle.style.setProperty('--max-opacity', maxOpacity);

        container.appendChild(particle);
    }
}

