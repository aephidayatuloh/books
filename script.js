// Global variables
let allBooks = [];
let currentCategory = 'all';

// DOM Elements
const bookGallery = document.getElementById('book-gallery');
const navItems = document.querySelectorAll('.nav-item');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadBooks();
    setupNavigation();
    setupTouchGestures();
    setupServiceWorker();
});

// Load books from JSON file
async function loadBooks() {
    try {
        showLoading();
        
        const response = await fetch('books.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        allBooks = data.books;
        
        // Simulate loading delay for better UX
        setTimeout(() => {
            renderBooks(allBooks);
        }, 800);
        
    } catch (error) {
        console.error('Error loading books:', error);
        showError();
    }
}

// Show loading state
function showLoading() {
    bookGallery.innerHTML = `
        <div class="loading">
            <div style="animation: pulse 2s infinite;">
                📚 Memuat koleksi buku terbaik...
            </div>
        </div>
    `;
    
    // Add pulse animation style
    if (!document.getElementById('pulse-style')) {
        const style = document.createElement('style');
        style.id = 'pulse-style';
        style.textContent = `
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Show error state
function showError() {
    bookGallery.innerHTML = `
        <div class="error-message">
            <h3>😕 Maaf, terjadi kesalahan</h3>
            <p>Tidak dapat memuat koleksi buku. Silakan periksa koneksi internet Anda dan coba lagi.</p>
            <button onclick="loadBooks()" style="
                margin-top: 1rem; 
                padding: 0.75rem 1.5rem; 
                background: #667eea; 
                color: white; 
                border: none; 
                border-radius: 8px; 
                cursor: pointer;
                font-weight: 600;
            ">
                🔄 Coba Lagi
            </button>
        </div>
    `;
}

// Setup navigation functionality
function setupNavigation() {
    navItems.forEach(navItem => {
        navItem.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav items
            navItems.forEach(item => item.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            
            if (category === 'contact') {
                showContact();
            } else {
                filterBooks(category);
            }
        });
    });
}

// Filter books by category
function filterBooks(category) {
    currentCategory = category;
    
    let filteredBooks;
    
    if (category === 'all') {
        filteredBooks = allBooks;
    } else if (category === 'bestseller') {
        filteredBooks = allBooks.filter(book => book.bestseller);
    } else if (category === 'new') {
        filteredBooks = allBooks.filter(book => book.new);
    } else {
        filteredBooks = allBooks.filter(book => book.category === category);
    }
    
    renderBooks(filteredBooks);
}

// Render books to the gallery
function renderBooks(books) {
    if (!books || books.length === 0) {
        bookGallery.innerHTML = `
            <div class="error-message">
                <h3>📚 Tidak ada buku ditemukan</h3>
                <p>Maaf, tidak ada buku yang tersedia untuk kategori ini.</p>
                <button onclick="filterBooks('all')" style="
                    margin-top: 1rem;
                    padding: 0.75rem 1.5rem;
                    background: #667eea;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                ">📖 Lihat Semua Buku</button>
            </div>
        `;
        return;
    }

    bookGallery.innerHTML = '';
    
    books.forEach((book, index) => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.style.animationDelay = `${index * 0.1}s`;
        
        // Create badges
        const badges = [];
        if (book.discount) {
            badges.push(`<div class="discount-badge">-${book.discount}</div>`);
        }
        if (book.bestseller) {
            badges.push(`<div class="bestseller-badge">🔥 BESTSELLER</div>`);
        }
        if (book.new) {
            badges.push(`<div class="new-badge">✨ BARU</div>`);
        }
        
        // Create stock status
        const stockStatus = book.stock > 0 ? 
            `style=""` : 
            `style="opacity: 0.5; pointer-events: none;"`;
        
        bookCard.innerHTML = `
            ${badges.join('')}
            <div class="top-section">
                <div class="image-area">
                    <img src="${book.image}" alt="Sampul buku ${book.title}" loading="lazy" onerror="handleImageError(this)">
                </div>
                <div class="details-area">
                    <h3>${book.title}</h3>
                    <p class="author">oleh ${book.author}</p>
                    <div class="price-container">
                        <span class="price">${book.price}</span>
                        ${book.originalPrice ? `<span class="original-price">${book.originalPrice}</span>` : ''}
                    </div>
                    <div class="button-group-top">
                        <a href="${book.link}" class="btn buy-button-top" target="_blank" ${stockStatus}>
                            🛒 Beli
                        </a>
                        <button class="btn detail-button-top" onclick="showDetail(${book.id})">
                            📋 Detail
                        </button>
                    </div>
                </div>
            </div>
            <div class="bottom-section">
                <h4>Deskripsi Singkat</h4>
                <p>${book.short_description}</p>
            </div>
        `;
        
        bookGallery.appendChild(bookCard);
    });
    
    // Setup lazy loading for images
    setupLazyLoading();
}

// Handle image loading errors
function handleImageError(img) {
    const bookTitle = img.alt.replace('Sampul buku ', '');
    img.src = `https://via.placeholder.com/300x400/667eea/ffffff?text=${encodeURIComponent(bookTitle)}`;
}

// Show book detail modal
function showDetail(bookId) {
    const book = allBooks.find(b => b.id === bookId);
    
    if (!book) {
        alert('Buku tidak ditemukan!');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()">×</button>
            
            <img src="${book.image}" alt="${book.title}" class="modal-image" onerror="handleImageError(this)">
            
            <h2 style="color: #333; margin-bottom: 1rem; font-size: 1.2rem;">${book.title}</h2>
            <p style="color: #666; margin-bottom: 0.5rem;"><strong>Penulis:</strong> ${book.author}</p>
            <p style="color: #666; margin-bottom: 0.5rem;"><strong>Penerbit:</strong> ${book.publisher} (${book.year})</p>
            <p style="color: #666; margin-bottom: 0.5rem;"><strong>Halaman:</strong> ${book.pages}</p>
            <p style="color: #666; margin-bottom: 0.5rem;"><strong>ISBN:</strong> ${book.isbn}</p>
            <p style="color: #666; margin-bottom: 0.5rem;"><strong>Rating:</strong> ⭐ ${book.rating}/5</p>
            <p style="color: #666; margin-bottom: 1rem;"><strong>Stok:</strong> ${book.stock > 0 ? `${book.stock} tersedia` : 'Habis'}</p>
            
            <div style="margin: 1rem 0;">
                <h3 style="color: #333; margin-bottom: 0.5rem; font-size: 1rem;">Deskripsi:</h3>
                <p style="color: #666; line-height: 1.6; font-size: 0.9rem;">${book.description}</p>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <span style="font-size: 1.3rem; font-weight: bold; color: #667eea;">${book.price}</span>
                    ${book.originalPrice ? `<span style="color: #999; text-decoration: line-through; margin-left: 0.5rem; font-size: 0.9rem;">${book.originalPrice}</span>` : ''}
                </div>
                <a href="${book.link}" target="_blank" style="
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 0.9rem;
                    ${book.stock === 0 ? 'opacity: 0.5; pointer-events: none;' : ''}
                ">🛒 Beli Sekarang</a>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on overlay click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

// Close modal function
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    }
}

// Show contact information
function showContact() {
    bookGallery.innerHTML = `
        <div class="contact-section">
            <h2 style="color: #333; margin-bottom: 1.5rem; font-size: 1.8rem;">📞 Hubungi Kami</h2>
            
            <div class="contact-grid">
                <div class="contact-card">
                    <h3 style="color: #667eea; margin-bottom: 0.5rem; font-size: 1.1rem;">📱 WhatsApp</h3>
                    <p style="color: #666; margin-bottom: 0.5rem; font-size: 0.9rem;">Chat langsung untuk pemesanan</p>
                    <a href="https://wa.me/6281210228688" target="_blank" class="contact-btn">
                        💬 Chat Sekarang
                    </a>
                </div>
                
                <div class="contact-card" style="background: rgba(118, 75, 162, 0.1);">
                    <h3 style="color: #764ba2; margin-bottom: 0.5rem; font-size: 1.1rem;">📧 Email</h3>
                    <p style="color: #666; margin-bottom: 0.5rem; font-size: 0.9rem;">aephidayatuloh.mail@gmail.com</p>
                    <a href="mailto:aephidayatuloh.mail@gmail.com" style="
                        background: #764ba2;
                        color: white;
                        padding: 0.75rem 1.5rem;
                        border-radius: 8px;
                        text-decoration: none;
                        font-weight: 600;
                        display: inline-block;
                        font-size: 0.9rem;
                    ">✉️ Kirim Email</a>
                </div>
            </div>
            
            <div style="background: rgba(248, 249, 250, 0.8); padding: 1.5rem; border-radius: 12px; margin-top: 1.5rem;">
                <h3 style="color: #333; margin-bottom: 1rem; font-size: 1.1rem;">🚚 Informasi Pengiriman</h3>
                <div style="color: #666; line-height: 1.6; font-size: 0.9rem; text-align: left;">
                    <p>• Pengiriman ke seluruh Indonesia</p>
                    <p>• Gratis ongkir pembelian di atas Rp 200.000</p>
                    <p>• Estimasi pengiriman 2-5 hari kerja</p>
                    <p>• Kemasan aman dan rapi</p>
                </div>
            </div>
            
            <button onclick="filterBooks('all')" style="
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 1rem 2rem;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                margin-top: 1.5rem;
                width: 100%;
                max-width: 300px;
            ">📚 Kembali ke Katalog</button>
        </div>
    `;
}

// Search functionality
function searchBooks(query) {
    const filteredBooks = allBooks.filter(book => 
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        book.author.toLowerCase().includes(query.toLowerCase()) ||
        book.description.toLowerCase().includes(query.toLowerCase())
    );
    
    renderBooks(filteredBooks);
}

// Touch and gesture setup
function setupTouchGestures() {
    let touchStartY = 0;
    let touchEndY = 0;
    let pullDistance = 0;
    const pullThreshold = 60;

    document.addEventListener('touchstart', function(e) {
        touchStartY = e.changedTouches[0].screenY;
    });

    document.addEventListener('touchmove', function(e) {
        const currentY = e.changedTouches[0].pageY;
        pullDistance = currentY - touchStartY;
        
        if (pullDistance > 0 && window.scrollY === 0) {
            e.preventDefault();
            // Visual feedback for pull to refresh could be added here
        }
    });

    document.addEventListener('touchend', function(e) {
        touchEndY = e.changedTouches[0].screenY;
        
        // Pull to refresh
        if (pullDistance > pullThreshold && window.scrollY === 0) {
            loadBooks();
        }
        
        pullDistance = 0;
    });
}

// Lazy loading setup
function setupLazyLoading() {
    const observerOptions = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
    };

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            }
        });
    }, observerOptions);

    // Observe all images
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Service Worker setup
function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('SW registered: ', registration);
                })
                .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
}

// Install prompt for PWA
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install banner
    showInstallBanner();
});

function showInstallBanner() {
    const installBanner = document.createElement('div');
    installBanner.innerHTML = `
        <div style="
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 1rem;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            text-align: center;
        " id="install-banner">
            <p style="margin-bottom: 0.5rem; color: #333; font-weight: 500;">
                📱 Tambahkan ke layar utama untuk akses cepat!
            </p>
            <button onclick="installApp()" style="
                background: #667eea;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                font-weight: 600;
                margin-right: 0.5rem;
                cursor: pointer;
            ">Install</button>
            <button onclick="dismissInstall()" style="
                background: transparent;
                color: #666;
                border: 1px solid #ddd;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                cursor: pointer;
            ">Nanti</button>
        </div>
    `;
    document.body.appendChild(installBanner);
}

function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((result) => {
            if (result.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
            dismissInstall();
        });
    }
}

function dismissInstall() {
    const banner = document.getElementById('install-banner');
    if (banner) {
        banner.remove();
    }
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    // Close modal with Escape key
    if (e.key === 'Escape') {
        closeModal();
    }
    
    // Search with Ctrl/Cmd + F
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        // Focus on search input if exists
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.focus();
        }
    }
});

// Performance optimization - debounced functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Handle online/offline status
window.addEventListener('online', function() {
    console.log('Back online');
    // Reload books if we were offline
    if (allBooks.length === 0) {
        loadBooks();
    }
});

window.addEventListener('offline', function() {
    console.log('Gone offline');
    // Show offline message
    const offlineMessage = document.createElement('div');
    offlineMessage.id = 'offline-message';
    offlineMessage.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            left: 20px;
            right: 20px;
            background: #ff6b6b;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            text-align: center;
            z-index: 1001;
        ">
            📡 Koneksi internet terputus. Beberapa fitur mungkin tidak tersedia.
        </div>
    `;
    document.body.appendChild(offlineMessage);
    
    // Remove after 5 seconds
    setTimeout(() => {
        const msg = document.getElementById('offline-message');
        if (msg) msg.remove();
    }, 5000);
});

// Analytics and tracking (optional)
function trackEvent(eventName, eventData) {
    // Google Analytics or other tracking service
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
    }
    
    console.log('Event tracked:', eventName, eventData);
}

// Track book views
function trackBookView(bookId) {
    const book = allBooks.find(b => b.id === bookId);
    if (book) {
        trackEvent('book_view', {
            book_id: bookId,
            book_title: book.title,
            book_category: book.category
        });
    }
}

// Track purchases (when user clicks buy button)
function trackPurchaseClick(bookId) {
    const book = allBooks.find(b => b.id === bookId);
    if (book) {
        trackEvent('purchase_click', {
            book_id: bookId,
            book_title: book.title,
            book_price: book.price,
            book_category: book.category
        });
    }
}

// Initialize performance monitoring
function initPerformanceMonitoring() {
    // Monitor loading times
    window.addEventListener('load', () => {
        const loadTime = performance.now();
        console.log(`Page loaded in ${loadTime}ms`);
        
        trackEvent('page_load_time', {
            load_time: Math.round(loadTime),
            user_agent: navigator.userAgent
        });
    });
    
    // Monitor errors
    window.addEventListener('error', (e) => {
        console.error('JavaScript error:', e.error);
        trackEvent('javascript_error', {
            error_message: e.message,
            error_filename: e.filename,
            error_line: e.lineno
        });
    });
}

// Initialize everything
initPerformanceMonitoring();