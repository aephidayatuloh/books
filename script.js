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
                📚 Memuat koleksi buku terbaru...
            </div>
        </div>
    `;
}

// Show error state
function showError() {
    bookGallery.innerHTML = `
        <div class="error-message">
            <h3>😕 Maaf, terjadi kesalahan</h3>
            <p>Tidak dapat memuat koleksi buku. Silakan periksa koneksi internet Anda dan coba lagi.</p>
            <button onclick="loadBooks()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">
                🔄 Coba Lagi
            </button>
        </div>
    `;
}

// Render books to the gallery
function renderBooks(books) {
    if (!books || books.length === 0) {
        bookGallery.innerHTML = `
            <div class="error-message">
                <h3>📚 Tidak ada buku ditemukan</h3>
                <p>Maaf, tidak ada buku yang tersedia saat ini.</p>
            </div>
        `;
        return;
    }

    bookGallery.innerHTML = '';
    
    books.forEach((book, index) => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.style.animationDelay = `${index * 0.1}s`;
        
        // Create discount badge if there's a discount
        const discountBadge = book.discount ? 
            `<div style="position: absolute; top: 1rem; right: 1rem; background: #ff4757; color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.8rem; font-weight: bold;">-${book.discount}</div>` : '';
        
        // Create bestseller badge
        const bestsellerBadge = book.bestseller ? 
            `<div style="position: absolute; top: 1rem; left: 1rem; background: #ffa502; color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.8rem; font-weight: bold;">🔥 BESTSELLER</div>` : '';
        
        // Create stock status
        const stockStatus = book.stock > 0 ? 
            `<span style="color: #2ed573; font-size: 0.9rem;">✅ Stok: ${book.stock}</span>` : 
            `<span style="color: #ff4757; font-size: 0.9rem;">❌ Stok Habis</span>`;

        // Create new book badge
        const newBadge = book.new ?
        `<div style="position: absolute; top: 1rem; left: 1rem; background: #ffa502; color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.8rem; font-weight: bold;">🔥 NEW</div>` : '';
        
        bookCard.innerHTML = `
            // ${discountBadge}
            ${bestsellerBadge}
            ${newBadge}
            <div class="top-section">
                <div class="image-area">
                    <img src="${book.image}" alt="Sampul buku ${book.title}" loading="lazy" onerror="handleImageError(this)">
                </div>
                <div class="details-area">
                    <h3>${book.title}</h3>
                    <div class="book-meta">
                        <p class="author">oleh ${book.author}</p>
                        <div class="price-container">
                            <span class="price">${book.price}</span>
                            ${book.originalPrice ? `<span class="original-price">${book.originalPrice}</span>` : ''}
                            
                        </div>
                    </div>
                    <div class="button-group-top">
                        <a href="${book.link}" class="btn buy-button-top" target="_blank" ${book.stock === 0 ? 'style="opacity: 0.5; pointer-events: none;"' : ''}>
                            🛒 Beli Sekarang
                        </a>
                        <button class="btn detail-button-top" onclick="showDetail(${book.id})">
                            📋 Detail
                        </button>
                    </div>
                </div>
            </div>
            <div class="bottom-section">
                <h4>Deskripsi Singkat Buku</h4>
                <p>${book.short_description}</p>
            </div>
        `;
        
        bookGallery.appendChild(bookCard);
    });
}

// Handle image loading errors
function handleImageError(img) {
    img.src = `https://via.placeholder.com/300x400/667eea/ffffff?text=${encodeURIComponent(img.alt)}`;
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
            
            // Get category from data attribute or text content
            const category = this.textContent.toLowerCase().includes('semua') ? 'all' :
                           this.textContent.toLowerCase().includes('best seller') ? 'bestseller' :
                           this.textContent.toLowerCase().includes('self development') ? 'self-development' :
                           this.textContent.toLowerCase().includes('kontak') ? 'contact' : 'all';
            
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
    } else {
        filteredBooks = allBooks.filter(book => book.category === category);
    }
    
    renderBooks(filteredBooks);
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
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(5px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 20px;
            padding: 2rem;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            margin: 1rem;
            position: relative;
        ">
            <button onclick="closeModal()" style="
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: #ff4757;
                color: white;
                border: none;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                cursor: pointer;
                font-size: 1.2rem;
            ">×</button>
            
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <img src="${book.image}" alt="${book.title}" style="width: 200px; height: auto; border-radius: 12px;" onerror="handleImageError(this)">
            </div>
            
            <h2 style="color: #333; margin-bottom: 1rem;">${book.title}</h2>
            <p style="color: #666; margin-bottom: 1rem;"><strong>Penulis:</strong> ${book.author}</p>
            <p style="color: #666; margin-bottom: 1rem;"><strong>Penerbit:</strong> ${book.publisher} (${book.year})</p>
            <p style="color: #666; margin-bottom: 1rem;"><strong>Halaman:</strong> ${book.pages}</p>
            <p style="color: #666; margin-bottom: 1rem;"><strong>ISBN:</strong> ${book.isbn}</p>
            <p style="color: #666; margin-bottom: 1rem;"><strong>Rating:</strong> ⭐ ${book.rating}/5</p>
            <p style="color: #666; margin-bottom: 1rem;"><strong>Stok:</strong> ${book.stock > 0 ? `✅ ${book.stock} tersedia` : '❌ Stok habis'}</p>
            
            <div style="margin: 1.5rem 0;">
                <h3 style="color: #333; margin-bottom: 0.5rem;">Deskripsi:</h3>
                <p style="color: #666; line-height: 1.6;">${book.description}</p>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2rem;">
                <div>
                    <span style="font-size: 1.5rem; font-weight: bold; color: #667eea;">${book.price}</span>
                    ${book.originalPrice ? `<span style="color: #999; text-decoration: line-through; margin-left: 0.5rem;">${book.originalPrice}</span>` : ''}
                </div>
                <a href="${book.link}" target="_blank" style="
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 12px;
                    text-decoration: none;
                    font-weight: 600;
                    ${book.stock === 0 ? 'opacity: 0.5; pointer-events: none;' : ''}
                ">🛒 Beli Sekarang</a>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Close modal function
function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Show contact information
function showContact() {
    bookGallery.innerHTML = `
        <div style="
            grid-column: 1 / -1;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 3rem;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        ">
            <h2 style="color: #333; margin-bottom: 2rem; font-size: 2.5rem;">📞 Hubungi Kami</h2>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
                <div style="background: rgba(102, 126, 234, 0.1); padding: 2rem; border-radius: 16px;">
                    <h3 style="color: #667eea; margin-bottom: 1rem;">📱 WhatsApp</h3>
                    <p style="color: #666; margin-bottom: 1rem;">Chat langsung untuk pemesanan</p>
                    <a href="https://wa.me/628123456789" target="_blank" style="
                        background: #25D366;
                        color: white;
                        padding: 0.75rem 1.5rem;
                        border-radius: 12px;
                        text-decoration: none;
                        font-weight: 600;
                        display: inline-block;
                    ">💬 Chat Sekarang</a>
                </div>
                
                <div style="background: rgba(118, 75, 162, 0.1); padding: 2rem; border-radius: 16px;">
                    <h3 style="color: #764ba2; margin-bottom: 1rem;">📧 Email</h3>
                    <p style="color: #666; margin-bottom: 1rem;">info@galeribuku.com</p>
                    <a href="mailto:info@galeribuku.com" style="
                        background: #667eea;
                        color: white;
                        padding: 0.75rem 1.5rem;
                        border-radius: 12px;
                        text-decoration: none;
                        font-weight: 600;
                        display: inline-block;
                    ">✉️ Kirim Email</a>
                </div>
            </div>
            
            <div style="background: rgba(248, 249, 250, 0.8); padding: 2rem; border-radius: 16px;">
                <h3 style="color: #333; margin-bottom: 1rem;">🚚 Informasi Pengiriman</h3>
                <p style="color: #666; line-height: 1.6;">
                    • Pengiriman ke seluruh Indonesia<br>
                    • Gratis ongkir untuk pembelian di atas Rp 200.000<br>
                    • Estimasi pengiriman 2-5 hari kerja<br>
                    • Kemasan aman dan rapi
                </p>
            </div>
            
            <button onclick="filterBooks('all')" style="
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 1rem 2rem;
                border: none;
                border-radius: 12px;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                margin-top: 2rem;
            ">🔙 Kembali ke Katalog</button>
        </div>
    `;
}

// Search functionality (can be added later)
function searchBooks(query) {
    const filteredBooks = allBooks.filter(book => 
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        book.author.toLowerCase().includes(query.toLowerCase()) ||
        book.description.toLowerCase().includes(query.toLowerCase())
    );
    
    renderBooks(filteredBooks);
}

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Handle keyboard events
document.addEventListener('keydown', function(e) {
    // Close modal with Escape key
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Add loading animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: scale(1);
        }
        to {
            opacity: 0;
            transform: scale(0.95);
        }
    }
    
    .nav-item.active {
        background: #667eea !important;
        color: white !important;
        transform: translateY(-2px);
    }
`;
document.head.appendChild(style);