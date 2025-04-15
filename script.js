// Global consistency function - ensures all pages follow same behavior
function initializeGlobalConsistency() {
    console.log('Initializing global consistency framework');
    
    // Set appropriate active navigation link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Ensure header is fixed across all pages
    const header = document.querySelector('header');
    if (header) {
        // Apply critical styling to header
        header.style.position = 'fixed';
        header.style.top = '0';
        header.style.left = '0';
        header.style.right = '0';
        header.style.width = '100%';
        header.style.zIndex = '9999';
        
        // Add appropriate padding to body based on header height
        const headerHeight = header.offsetHeight;
        document.body.style.paddingTop = headerHeight + 'px';
        
        // Initialize scroll variables for header hide/show
        let lastScrollTop = 0;
        let scrollThreshold = 50;
        let isHeaderHidden = false;
        
        // Listen for scroll to add scrolled class and handle header hide/show
        window.addEventListener('scroll', function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            
            // Handle scrolled class for visual styling
            if (scrollTop > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            // Handle header hide/show behavior
            if (scrollTop > scrollThreshold) {
                // Scrolling down
                if (scrollTop > lastScrollTop && !isHeaderHidden && scrollTop > 150) {
                    header.classList.add('header-hidden');
                    isHeaderHidden = true;
                } 
                // Scrolling up
                else if (scrollTop < lastScrollTop && isHeaderHidden) {
                    header.classList.remove('header-hidden');
                    isHeaderHidden = false;
                }
            } else {
                // At the top of the page - always show header
                header.classList.remove('header-hidden');
                isHeaderHidden = false;
            }
            
            lastScrollTop = scrollTop;
        });
        
        // Check initial scroll position
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        }
    }
    
    // Enhanced Mobile menu toggle functionality with animation
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    // Create hamburger icon structure if it doesn't exist
    if (mobileMenuToggle && !mobileMenuToggle.querySelector('.hamburger-icon')) {
        const hamburgerIcon = document.createElement('div');
        hamburgerIcon.className = 'hamburger-icon';
        
        for (let i = 0; i < 3; i++) {
            const span = document.createElement('span');
            hamburgerIcon.appendChild(span);
        }
        
        // Clear any existing content (like font awesome icon)
        mobileMenuToggle.innerHTML = '';
        mobileMenuToggle.appendChild(hamburgerIcon);
    }
    
    if (mobileMenuToggle && navLinks) {
        // Force initial states to ensure proper functionality
        navLinks.classList.remove('show');
        mobileMenuToggle.classList.remove('active');
        document.body.classList.remove('menu-open');
        
        mobileMenuToggle.addEventListener('click', function(e) {
            // Prevent event propagation
            e.stopPropagation();
            
            // Toggle menu visibility with animation
            navLinks.classList.toggle('show');
            
            // Toggle active state for hamburger icon animation
            this.classList.toggle('active');
            
            // Toggle body scroll lock
            document.body.classList.toggle('menu-open');
            
            // Move menu switcher into the mobile nav if it's not already there
            const modeSwitcher = document.querySelector('.mode-switcher');
            if (modeSwitcher && navLinks.classList.contains('show') && 
                !navLinks.querySelector('.mode-switcher')) {
                // Create a clone of the mode switcher to insert into the mobile menu
                const modeSwitcherClone = modeSwitcher.cloneNode(true);
                
                // We need to make sure all event listeners are copied over to the clone
                const originalToggle = modeSwitcher.querySelector('#mode-toggle');
                const clonedToggle = modeSwitcherClone.querySelector('#mode-toggle');
                
                if (originalToggle && clonedToggle) {
                    // Copy checked state
                    clonedToggle.checked = originalToggle.checked;
                    
                    // Add event listener to the cloned toggle
                    clonedToggle.addEventListener('change', function() {
                        if (this.checked) {
                            localStorage.setItem('siteMode', 'restaurant');
                            applyRestaurantMode();
                        } else {
                            localStorage.setItem('siteMode', 'cafe');
                            applyCafeMode();
                        }
                        
                        // Sync with the original toggle
                        originalToggle.checked = this.checked;
                    });
                }
                
                // Create a list item to contain the mode switcher in the nav
                const modeSwitcherItem = document.createElement('li');
                modeSwitcherItem.className = 'mobile-mode-switcher';
                modeSwitcherItem.appendChild(modeSwitcherClone);
                
                // Append to the nav at the end
                navLinks.appendChild(modeSwitcherItem);
            }
            
            console.log('Mobile menu toggle clicked - menu is now ' + (navLinks.classList.contains('show') ? 'shown' : 'hidden'));
        });
        
        // Close menu when clicking outside - with improved event handling
        document.addEventListener('click', function(e) {
            if (navLinks.classList.contains('show') && 
                !navLinks.contains(e.target) && 
                !mobileMenuToggle.contains(e.target)) {
                
                navLinks.classList.remove('show');
                mobileMenuToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
                console.log('Mobile menu closed by clicking outside');
            }
        });
        
        // Close menu on window resize to desktop
        window.addEventListener('resize', function() {
            if (window.innerWidth > 992 && navLinks.classList.contains('show')) {
                navLinks.classList.remove('show');
                mobileMenuToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
        
        // Handle navigation clicks in mobile menu
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                // Close the menu when a link is clicked
                if (window.innerWidth <= 992) {
                    navLinks.classList.remove('show');
                    mobileMenuToggle.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
            });
        });
    }
    
    // Apply saved site mode
    const savedMode = localStorage.getItem('siteMode');
    if (savedMode === 'restaurant') {
        applyRestaurantMode();
    } else {
        applyCafeMode();
    }
    
    // Mode toggle functionality
    const modeToggle = document.getElementById('mode-toggle');
    if (modeToggle) {
        // Set toggle based on saved mode
        modeToggle.checked = savedMode === 'restaurant';
        
        // Add change event listener
        modeToggle.addEventListener('change', function() {
            if (this.checked) {
                localStorage.setItem('siteMode', 'restaurant');
                applyRestaurantMode();
            } else {
                localStorage.setItem('siteMode', 'cafe');
                applyCafeMode();
            }
        });
    }
}

// Run global consistency on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Add no-transition class to prevent unwanted transitions during page load
    document.body.classList.add('no-transition');
    
    // Initialize global consistency
    initializeGlobalConsistency();
    
    // Remove the class after a short delay to allow the page to render
    setTimeout(function() {
        document.body.classList.remove('no-transition');
        document.body.classList.add('page-loaded');
    }, 100);
});

// Also run on load to catch any late-loading elements
window.addEventListener('load', initializeGlobalConsistency);

// Immediate self-executing function to fix header issues
(function() {
    console.log("Immediate header fix running");
    
    function fixHeader() {
        var header = document.querySelector('header');
        if (!header) return;
        
        // Apply critical inline styles with !important flags
        header.style.cssText = 
            "position: fixed !important;" + 
            "top: 0 !important;" + 
            "left: 0 !important;" + 
            "right: 0 !important;" + 
            "width: 100% !important;" + 
            "max-width: 100vw !important;" +
            "z-index: 9999 !important;" +
            "box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important";
        
        // Calculate header height
        var headerHeight = header.offsetHeight || 80;
        console.log("Header height detected:", headerHeight);
        
        // Add body padding
        document.body.style.paddingTop = headerHeight + "px";
        console.log("Body padding set to:", headerHeight + "px");
        
        // Apply scrolled class if needed
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Initialize scroll variables for header hide/show if not already defined
        if (typeof window.lastScrollTop === 'undefined') {
            window.lastScrollTop = 0;
            window.scrollThreshold = 50;
            window.isHeaderHidden = false;
        }
        
        // Identify hero sections that need adjustment
        const heroSections = [
            document.querySelector('#menu-hero'),
            document.querySelector('#hero'),
            document.querySelector('.hero-content'),
            document.querySelector('section:first-of-type')
        ];
        
        // Apply correct spacing to hero sections if they exist
        heroSections.forEach(section => {
            if (section) {
                // Remove any direct margin-top that would push content down too much
                section.style.marginTop = '0';
                
                // Check if the section already has adequate spacing
                const sectionStyles = getComputedStyle(section);
                const currentPadding = parseInt(sectionStyles.paddingTop);
                if (currentPadding < 80) { // Ensure a minimum padding
                    section.style.paddingTop = '80px';
                }
            }
        });
    }
    
    // Run immediately
    if (document.readyState === 'loading') {
        // If document still loading, set up event listeners
        document.addEventListener('DOMContentLoaded', fixHeader);
        window.addEventListener('load', fixHeader);
    } else {
        // Document already loaded, run now
        fixHeader();
    }
    
    // Run after short delay to catch any races
    setTimeout(fixHeader, 50);
    setTimeout(fixHeader, 200);
    setTimeout(fixHeader, 500);
    
    // Also fix header on resize
    window.addEventListener('resize', fixHeader);
    
    // Add scroll handler to apply scrolled class for visual changes
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            // Periodically reapply the header fix on scroll
            if (window.scrollY % 100 === 0) {
                fixHeader();
            }
        }
    });
    
    // Apply header fix on any DOM mutation (for dynamic content)
    if ('MutationObserver' in window) {
        const observer = new MutationObserver(function(mutations) {
            fixHeader();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
})();

// Mode Switching functionality
document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const modeToggle = document.getElementById('mode-toggle');
    const brandLogo = document.getElementById('brand-logo');
    
    // Initialize mode based on localStorage
    function initializeMode() {
        const savedMode = localStorage.getItem('siteMode') || 'cafe';
        if (savedMode === 'restaurant') {
            applyRestaurantMode(false);
            if (modeToggle) modeToggle.checked = true;
        } else {
            applyCafeMode(false);
            if (modeToggle) modeToggle.checked = false;
        }
    }

    function applyRestaurantMode(animate = true) {
        if (animate) animateModeSwitching();
        
        body.classList.remove('cafe-mode');
        body.classList.add('restaurant-mode');
        if (brandLogo) brandLogo.textContent = 'Restaurant Elegance';

        // Update content visibility
        toggleContent('cafe', false);
        toggleContent('restaurant', true);
        
        // Update theme colors
        updateThemeColors('restaurant');
        
        // Save preference
        localStorage.setItem('siteMode', 'restaurant');
    }

    function applyCafeMode(animate = true) {
        if (animate) animateModeSwitching();
        
        body.classList.remove('restaurant-mode');
        body.classList.add('cafe-mode');
        if (brandLogo) brandLogo.textContent = 'Café Delight';

        // Update content visibility
        toggleContent('restaurant', false);
        toggleContent('cafe', true);
        
        // Update theme colors
        updateThemeColors('cafe');
        
        // Save preference
        localStorage.setItem('siteMode', 'cafe');
    }

    function toggleContent(mode, show) {
        const elements = {
            video: document.querySelector(`.${mode}-video`),
            heroContent: document.getElementById(`${mode}-hero-content`),
            features: document.querySelector(`.${mode}-features`),
            gallery: document.querySelector(`.${mode}-gallery`),
            menu: document.getElementById(`${mode}-menu`),
            hours: document.getElementById(`${mode}-hours`),
            headings: document.querySelectorAll(`.${mode}-heading`),
            descriptions: document.querySelectorAll(`.${mode}-description`)
        };

        const display = show ? 'block' : 'none';
        
        for (let key in elements) {
            const element = elements[key];
            if (!element) continue;
            
            if (NodeList.prototype.isPrototypeOf(element)) {
                element.forEach(el => el.style.display = display);
            } else {
                if (key === 'features' || key === 'gallery') {
                    element.style.display = show ? 'flex' : 'none';
                } else {
                    element.style.display = display;
                }
            }
        }
    }

    function updateThemeColors(mode) {
        const colors = {
            cafe: {
                primary: 'var(--cafe-primary)',
                dark: 'var(--cafe-dark)',
                accent: 'var(--cafe-accent)',
                bg: 'var(--cafe-bg)'
            },
            restaurant: {
                primary: 'var(--restaurant-primary)',
                dark: 'var(--restaurant-dark)',
                accent: 'var(--restaurant-accent)',
                bg: 'var(--restaurant-bg)'
            }
        };

        const selected = colors[mode];
        document.documentElement.style.setProperty('--primary-color', selected.primary);
        document.documentElement.style.setProperty('--primary-dark', selected.dark);
        document.documentElement.style.setProperty('--accent-color', selected.accent);
        document.documentElement.style.setProperty('--dark-bg', selected.bg);
    }

    function animateModeSwitching() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.3);
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(overlay);
        
        // Trigger fade in
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            
            // Fade out and remove
            setTimeout(() => {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 300);
            }, 300);
        });
    }

    // Initialize mode
    initializeMode();

    // Add event listener for mode toggle
    if (modeToggle) {
        modeToggle.addEventListener('change', function() {
            if (this.checked) {
                applyRestaurantMode();
            } else {
                applyCafeMode();
            }
        });
    }
});

// Seasonal Menu Carousel
document.addEventListener('DOMContentLoaded', function() {
    // Seasonal Menu Functionality
    const seasonBtns = document.querySelectorAll('.season-btn');
    const seasonalCards = document.querySelectorAll('.seasonal-card');
    const seasonalSlider = document.querySelector('.seasonal-slider');
    const prevBtn = document.querySelector('.seasonal-nav .prev');
    const nextBtn = document.querySelector('.seasonal-nav .next');

    seasonBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const season = btn.dataset.season;
            // Update active button
            seasonBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show relevant cards with animation
            seasonalCards.forEach(card => {
                if (card.dataset.season === season) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.5s ease';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Slider Navigation
    let scrollAmount = 0;
    const cardWidth = 320; // card width + gap

    prevBtn.addEventListener('click', () => {
        scrollAmount = Math.max(scrollAmount - cardWidth, 0);
        seasonalSlider.scrollTo({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });

    nextBtn.addEventListener('click', () => {
        scrollAmount = Math.min(scrollAmount + cardWidth, seasonalSlider.scrollWidth - seasonalSlider.clientWidth);
        seasonalSlider.scrollTo({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });

    // Promotional Banner Slider
    const bannerSlider = document.querySelector('.banner-slider');
    const slides = document.querySelectorAll('.banner-slide');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    const slideCount = slides.length;

    function updateSlides() {
        slides.forEach((slide, index) => {
            slide.style.transform = `translateX(${100 * (index - currentSlide)}%)`;
        });
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

    // Auto-advance slides
    setInterval(() => {
        currentSlide = (currentSlide + 1) % slideCount;
        updateSlides();
    }, 5000);

    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            updateSlides();
        });
    });

    // Arrow navigation for banner slider
    document.querySelector('.banner-slider-container .prev-arrow').addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + slideCount) % slideCount;
        updateSlides();
    });

    document.querySelector('.banner-slider-container .next-arrow').addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % slideCount;
        updateSlides();
    });

    // Add smooth hover effects
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-10px)';
            item.style.boxShadow = '0 15px 40px rgba(0,0,0,0.3)';
        });

        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateY(0)';
            item.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
        });
    });

    // Initialize Animations
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.menu-category-section, .featured-slider-section, .seasonal-carousel');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            
            if (elementTop < window.innerHeight && elementBottom > 0) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };

    // Add initial styles for animation
    document.querySelectorAll('.menu-category-section, .featured-slider-section, .seasonal-carousel').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'all 0.6s ease';
    });

    // Listen for scroll events
    window.addEventListener('scroll', animateOnScroll);
    // Initial check for elements in view
    animateOnScroll();
});

// Slider functionality
document.addEventListener('DOMContentLoaded', function() {
    const sliders = document.querySelectorAll('.food-slider');
    
    sliders.forEach(slider => {
        const container = slider.closest('.slider-container');
        const prevBtn = container.querySelector('.prev-arrow');
        const nextBtn = container.querySelector('.next-arrow');
        
        let scrollAmount = 0;
        const slideWidth = 320; // Width of slide + gap
        
        prevBtn.addEventListener('click', () => {
            scrollAmount = Math.max(scrollAmount - slideWidth, 0);
            slider.scrollTo({
                left: scrollAmount,
                behavior: 'smooth'
            });
        });
        
        nextBtn.addEventListener('click', () => {
            scrollAmount = Math.min(scrollAmount + slideWidth, slider.scrollWidth - slider.clientWidth);
            slider.scrollTo({
                left: scrollAmount,
                behavior: 'smooth'
            });
        });
    });

    // Mode switcher functionality
    const modeToggle = document.getElementById('mode-toggle');
    const body = document.body;
    const brandLogo = document.getElementById('brand-logo');
    
    modeToggle.addEventListener('change', function() {
        if (this.checked) {
            body.classList.remove('cafe-mode');
            body.classList.add('restaurant-mode');
            brandLogo.textContent = 'Restaurant Delight';
            document.querySelector('.cafe-heading').style.display = 'none';
            document.querySelector('.restaurant-heading').style.display = 'block';
            document.querySelector('.cafe-description').style.display = 'none';
            document.querySelector('.restaurant-description').style.display = 'block';
        } else {
            body.classList.remove('restaurant-mode');
            body.classList.add('cafe-mode');
            brandLogo.textContent = 'Café Delight';
            document.querySelector('.cafe-heading').style.display = 'block';
            document.querySelector('.restaurant-heading').style.display = 'none';
            document.querySelector('.cafe-description').style.display = 'block';
            document.querySelector('.restaurant-description').style.display = 'none';
        }
    });

    // Promotional banner slider
    const bannerSlider = document.querySelector('.banner-slider');
    const bannerSlides = document.querySelectorAll('.banner-slide');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    const slideInterval = 5000; // Change slide every 5 seconds

    function updateSlide(index) {
        bannerSlides.forEach((slide, i) => {
            slide.style.transform = `translateX(${100 * (i - index)}%)`;
        });
        
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    // Initialize first slide
    updateSlide(0);

    // Auto advance slides
    setInterval(() => {
        currentSlide = (currentSlide + 1) % bannerSlides.length;
        updateSlide(currentSlide);
    }, slideInterval);

    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            updateSlide(currentSlide);
        });
    });
});

// Specific reservation page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the reservation page
    const floorPlanContainer = document.querySelector('.floor-plan-container');
    if (floorPlanContainer) {
        console.log('Initializing reservation page functionality');
        
        // Floor plan interactivity
        const tables = document.querySelectorAll('.table-item-3d');
        const selectionFeedback = document.getElementById('selection-feedback');
        const selectionText = document.getElementById('selection-text');
        let selectedTable = null;
        
        // Add event listeners to tables
        tables.forEach(table => {
            table.addEventListener('click', function() {
                // Deselect previously selected table
                if (selectedTable) {
                    selectedTable.classList.remove('selected');
                }
                
                // Select this table
                this.classList.add('selected');
                selectedTable = this;
                
                // Update selection feedback
                const tableNumber = this.querySelector('.table-number').textContent;
                const tableArea = this.getAttribute('data-area');
                const tableStatus = this.getAttribute('data-status');
                
                // Only show selection feedback if table is available
                if (tableStatus !== 'unavailable') {
                    selectionText.textContent = `You've selected Table #${tableNumber} in the ${tableArea} area.`;
                    selectionFeedback.classList.add('active');
                    selectionFeedback.style.display = 'block';
                }
            });
        });
        
        // Floor plan controls
        const rotateLeft = document.getElementById('rotate-left');
        const rotateRight = document.getElementById('rotate-right');
        const zoomIn = document.getElementById('zoom-in');
        const zoomOut = document.getElementById('zoom-out');
        const resetView = document.getElementById('reset-view');
        const floorPlanScene = document.querySelector('.scene');
        
        let rotation = 0;
        let scale = 1;
        
        // Rotate left button
        if (rotateLeft) {
            rotateLeft.addEventListener('click', function() {
                rotation -= 15;
                updateFloorPlanTransform();
            });
        }
        
        // Rotate right button
        if (rotateRight) {
            rotateRight.addEventListener('click', function() {
                rotation += 15;
                updateFloorPlanTransform();
            });
        }
        
        // Zoom in button
        if (zoomIn) {
            zoomIn.addEventListener('click', function() {
                scale += 0.1;
                if (scale > 1.5) scale = 1.5;
                updateFloorPlanTransform();
            });
        }
        
        // Zoom out button
        if (zoomOut) {
            zoomOut.addEventListener('click', function() {
                scale -= 0.1;
                if (scale < 0.5) scale = 0.5;
                updateFloorPlanTransform();
            });
        }
        
        // Reset view button
        if (resetView) {
            resetView.addEventListener('click', function() {
                rotation = 0;
                scale = 1;
                updateFloorPlanTransform();
            });
        }
        
        // Function to update the floor plan transform
        function updateFloorPlanTransform() {
            if (floorPlanScene) {
                floorPlanScene.style.transform = `rotateX(60deg) rotateZ(${rotation}deg) scale(${scale})`;
            }
        }
        
        // Area filtering functionality
        const areaFilterBtns = document.querySelectorAll('.area-filter-btn');
        
        if (areaFilterBtns.length > 0) {
            areaFilterBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    // Update active button
                    areaFilterBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    
                    const selectedArea = this.getAttribute('data-area');
                    
                    // Filter tables based on area
                    tables.forEach(table => {
                        const tableArea = table.getAttribute('data-area');
                        
                        if (selectedArea === 'all' || tableArea === selectedArea) {
                            table.style.opacity = '1';
                            table.style.pointerEvents = 'auto';
                        } else {
                            table.style.opacity = '0.3';
                            table.style.pointerEvents = 'none';
                        }
                    });
                });
            });
        }
        
        // Time slot selection
        const timeSlots = document.querySelectorAll('.time-slot');
        
        if (timeSlots.length > 0) {
            timeSlots.forEach(slot => {
                slot.addEventListener('click', function() {
                    // Skip if unavailable
                    if (this.querySelector('.status-indicator').classList.contains('unavailable')) {
                        return;
                    }
                    
                    // Toggle selected class on this slot
                    timeSlots.forEach(s => s.classList.remove('selected'));
                    this.classList.add('selected');
                    
                    // Set hidden input with selected time
                    const selectedTime = this.getAttribute('data-time');
                    const timeInput = document.createElement('input');
                    timeInput.type = 'hidden';
                    timeInput.name = 'selected_time';
                    timeInput.value = selectedTime;
                    
                    // Replace existing hidden input if it exists
                    const existingInput = document.querySelector('input[name="selected_time"]');
                    if (existingInput) {
                        existingInput.remove();
                    }
                    
                    // Add to form
                    const form = document.getElementById('reservation-form');
                    if (form) {
                        form.appendChild(timeInput);
                    }
                });
            });
        }
        
        // Form submission
        const reservationForm = document.getElementById('reservation-form');
        
        if (reservationForm) {
            reservationForm.addEventListener('submit', function(event) {
                event.preventDefault();
                
                // Show a success message (in a real app, this would submit to a server)
                alert('Your reservation has been received! A confirmation will be sent to your email shortly.');
                
                // Reset the form
                this.reset();
                
                // Clear table selection
                if (selectedTable) {
                    selectedTable.classList.remove('selected');
                    selectedTable = null;
                }
                
                // Hide selection feedback
                if (selectionFeedback) {
                    selectionFeedback.classList.remove('active');
                    selectionFeedback.style.display = 'none';
                }
                
                // Reset time slot selection
                timeSlots.forEach(slot => slot.classList.remove('selected'));
            });
        }
    }
});