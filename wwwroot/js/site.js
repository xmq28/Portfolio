const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navbar = document.querySelector('.navbar');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

// Keep interactions lightweight and predictable on mobile.
document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    setupSmoothScroll();
    setupActiveSection();
    setupProjectDetails();
    setupProjectMasonry();
    setupResumeLinks();
    setupIncomingProjectHash();

    // Disable heavy hero motion effects.
    const particlesCanvas = document.getElementById('particles-canvas');
    if (particlesCanvas) {
        particlesCanvas.style.display = 'none';
    }
});

function setupMobileMenu() {
    if (!navToggle || !navMenu) return;

    const bars = navToggle.querySelectorAll('span');

    const closeMenu = () => {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        bars.forEach((bar) => {
            bar.style.transform = 'none';
            bar.style.opacity = '1';
        });
    };

    const openMenu = () => {
        navMenu.classList.add('open');
        navToggle.setAttribute('aria-expanded', 'true');
        bars.forEach((bar, index) => {
            if (index === 0) bar.style.transform = 'translateY(7px) rotate(45deg)';
            if (index === 1) bar.style.opacity = '0';
            if (index === 2) bar.style.transform = 'translateY(-7px) rotate(-45deg)';
        });
    };

    navToggle.addEventListener('click', () => {
        if (navMenu.classList.contains('open')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    navMenu.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
}

function setupIncomingProjectHash() {
    const scrollToHashTarget = () => {
        const project = new URLSearchParams(window.location.search).get('project');
        const hash = window.location.hash || (project ? `#${project}` : '');
        if (!hash || hash === '#') return;

        const target = document.getElementById(decodeURIComponent(hash.slice(1)));
        if (!target) return;

        window.requestAnimationFrame(() => {
            const navbarHeight = navbar ? navbar.getBoundingClientRect().height : 0;
            const targetTop = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 16;
            window.scrollTo({ top: Math.max(0, targetTop), behavior: 'auto' });
        });
    };

    const settleIncomingHash = () => {
        scrollToHashTarget();
        window.setTimeout(scrollToHashTarget, 120);
        window.setTimeout(scrollToHashTarget, 1000);
    };

    window.addEventListener('hashchange', settleIncomingHash);
    window.addEventListener('popstate', settleIncomingHash);
    window.addEventListener('load', settleIncomingHash, { once: true });
    window.setTimeout(settleIncomingHash, 0);
}

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const targetSelector = anchor.getAttribute('href');
            if (!targetSelector || targetSelector === '#') return;

            const target = document.querySelector(targetSelector);
            if (!target) return;

            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

function setupActiveSection() {
    const updateActiveLink = () => {
        let current = '';

        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 180) {
                current = section.getAttribute('id') || '';
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });

        if (navbar) {
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(10, 25, 47, 0.98)';
                navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
            } else {
                navbar.style.background = 'rgba(10, 25, 47, 0.95)';
                navbar.style.boxShadow = 'none';
            }
        }
    };

    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink();
}

function setupProjectDetails() {
    window.toggleProjectDetails = (button) => {
        const details = button.nextElementSibling;
        if (!details) return;

        const isActive = details.classList.contains('active');

        document.querySelectorAll('.project-details.active').forEach((detail) => {
            detail.classList.remove('active');
            const trigger = detail.previousElementSibling;
            if (trigger) trigger.classList.remove('active');
        });

        if (!isActive) {
            details.classList.add('active');
            button.classList.add('active');
        }
    };
}

function setupProjectMasonry() {
    const grid = document.querySelector('.projects-grid');
    if (!grid) return;

    const cards = [...grid.querySelectorAll('.project-card')];
    let layoutFrame = 0;

    const layout = () => {
        cancelAnimationFrame(layoutFrame);
        layoutFrame = requestAnimationFrame(() => {
            const styles = getComputedStyle(grid);
            const columns = styles.gridTemplateColumns.split(' ').length;
            const columnGap = parseFloat(styles.columnGap) || 0;
            const rowGap = parseFloat(styles.rowGap) || 0;
            const columnWidth = (grid.clientWidth - columnGap * (columns - 1)) / columns;
            const columnHeights = Array(columns).fill(0);

            grid.classList.add('is-masonry');

            cards.forEach((card, index) => {
                const column = index < columns
                    ? index
                    : columnHeights.indexOf(Math.min(...columnHeights));

                card.style.width = `${columnWidth}px`;
                card.style.left = `${column * (columnWidth + columnGap)}px`;
                card.style.top = `${columnHeights[column]}px`;
                columnHeights[column] += card.offsetHeight + rowGap;
            });

            grid.style.height = `${Math.max(...columnHeights) - rowGap}px`;
        });
    };

    window.addEventListener('resize', layout, { passive: true });
    if (typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver(layout);
        cards.forEach((card) => observer.observe(card));
    }

    layout();
}

function setupResumeLinks() {
    const links = document.querySelectorAll('[data-resume-link]');
    if (!links.length) return;

    let cachedBlobUrl = null;

    const base64ToBlobUrl = (base64) => {
        const clean = base64.replace(/\s+/g, '');
        const binary = atob(clean);
        const bytes = new Uint8Array(binary.length);

        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        const blob = new Blob([bytes], { type: 'application/pdf' });
        return URL.createObjectURL(blob);
    };

    const openResume = async () => {
        if (!cachedBlobUrl) {
            const response = await fetch('/resume/malak-alsaeed-resume.base64.txt?v=2', { cache: 'no-store' });
            if (!response.ok) {
                throw new Error('Resume file is temporarily unavailable.');
            }

            const base64 = await response.text();
            cachedBlobUrl = base64ToBlobUrl(base64);
        }

        const opened = window.open(cachedBlobUrl, '_blank');
        if (!opened) {
            window.location.href = cachedBlobUrl;
        }
    };

    links.forEach((link) => {
        link.addEventListener('click', async (event) => {
            event.preventDefault();

            try {
                await openResume();
            } catch (error) {
                window.alert('Could not open resume. Please try again in a few seconds.');
            }
        });
    });
}
