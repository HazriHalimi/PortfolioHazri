document.addEventListener('DOMContentLoaded', () => {
    const loader = document.querySelector('.loader');
    const body = document.body;
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const header = document.querySelector('.site-header');
    const cursorGlow = document.getElementById('cursor-glow');

    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('hidden');
            body.classList.add('loaded');
        }, 900);
    });

    if (window.innerWidth > 760) {
        document.querySelectorAll('.tilt-card').forEach((card) => {
            VanillaTilt.init(card, {
                max: 8,
                speed: 500,
                glare: true,
                'max-glare': 0.16
            });
        });
    }

    if (typeof Typed !== 'undefined') {
        new Typed('#typed', {
            strings: [
                'Computer Science Student',
                'Web Developer',
                'IT Support Specialist',
                'Network Enthusiast',
                'System Administrator'
            ],
            typeSpeed: 70,
            backSpeed: 35,
            backDelay: 1200,
            loop: true
        });
    }

    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 700,
            once: true,
            offset: 90
        });
    }

    if (typeof gsap !== 'undefined') {
        gsap.from('.hero-content > *', {
            y: 24,
            opacity: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out'
        });
        gsap.from('.hero-visual > *', {
            y: 30,
            opacity: 0,
            duration: 0.85,
            stagger: 0.14,
            ease: 'power3.out'
        });
    }

    window.addEventListener('mousemove', (event) => {
        cursorGlow.animate({
            left: `${event.clientX}px`,
            top: `${event.clientY}px`
        }, {
            duration: 650,
            fill: 'forwards'
        });
    });

    const handleNavToggle = () => {
        navLinks.classList.toggle('open');
        navToggle.classList.toggle('active');
    };

    navToggle?.addEventListener('click', handleNavToggle);
    document.querySelectorAll('.nav-links a').forEach((link) => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            navToggle?.classList.remove('active');
        });
    });

    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 24);
    });

    document.querySelectorAll('a, button, .skill-card, .project-card, .timeline-card, .stat-card').forEach((element) => {
        element.addEventListener('click', (event) => {
            const rect = element.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height);
            ripple.className = 'ripple';
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${event.clientX - rect.left}px`;
            ripple.style.top = `${event.clientY - rect.top}px`;
            element.appendChild(ripple);
            setTimeout(() => ripple.remove(), 650);
        });
    });

    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-links a');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                navItems.forEach((item) => {
                    const href = item.getAttribute('href');
                    item.classList.toggle('active', href === `#${entry.target.id}`);
                });
            }
        });
    }, { rootMargin: '-40% 0px -45% 0px', threshold: 0.1 });

    sections.forEach((section) => observer.observe(section));

    // GitHub readme-stats fallback: if the external service is down, fetch via GitHub API
    const ghStatsImg = document.getElementById('gh-stats-img');
    const ghLangsImg = document.getElementById('gh-langs-img');
    const ghFallback = document.getElementById('github-fallback');
    const ghRemote = document.getElementById('github-remote');

    if (ghStatsImg && ghLangsImg) {
        // Proactively check remote image availability using fresh Image() objects.
        let decided = false;
        const tryFallback = () => {
            if (decided) return;
            decided = true;
            renderGithubFallback();
        };

        const checkImage = (url, cb) => {
            const tester = new Image();
            tester.onload = () => cb(true);
            tester.onerror = () => cb(false);
            tester.src = url + (url.includes('?') ? '&' : '?') + 'cache_bust=' + Date.now();
        };

        // Check both images; if either fails, show fallback.
        Promise.all([
            new Promise(res => checkImage(ghStatsImg.src, res)),
            new Promise(res => checkImage(ghLangsImg.src, res))
        ]).then(([sOk, lOk]) => {
            if (!sOk || !lOk) tryFallback();
        }).catch(() => tryFallback());

        // Also attach listeners to existing elements as a safety net.
        ghStatsImg.addEventListener('error', tryFallback);
        ghLangsImg.addEventListener('error', tryFallback);
    }

    function renderGithubFallback() {
        if (!ghFallback || !ghRemote) return;
        ghRemote.style.display = 'none';
        ghFallback.style.display = 'block';

        const username = 'HazriHalimi';
        fetch(`https://api.github.com/users/${username}`)
            .then(res => res.json())
            .then(user => {
                return fetch(`https://api.github.com/users/${username}/repos?per_page=100`)
                    .then(r => r.json())
                    .then(repos => ({ user, repos }));
            })
            .then(({ user, repos }) => {
                let stars = 0;
                const langCount = {};
                repos.forEach(r => {
                    stars += r.stargazers_count || 0;
                    if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1;
                });
                const topLangs = Object.entries(langCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(e => e[0]);

                ghFallback.innerHTML = `
                    <div class="github-stats-fallback">
                        <div class="stat"><h3>${user.followers || 0}</h3><p>Followers</p></div>
                        <div class="stat"><h3>${user.public_repos || repos.length}</h3><p>Repositories</p></div>
                        <div class="stat"><h3>${stars}</h3><p>Total Stars</p></div>
                        <div class="stat langs"><h3>${topLangs.join(', ') || '—'}</h3><p>Top Languages</p></div>
                        <div class="mt-3"><a class="btn btn-primary" href="https://github.com/${username}" target="_blank" rel="noreferrer"><i class="fab fa-github"></i> View on GitHub</a></div>
                    </div>
                `;
            })
            .catch(() => {
                ghFallback.innerHTML = `<div class="github-error"><p>Unable to load GitHub data. <a href="https://github.com/HazriHalimi" target="_blank" rel="noreferrer">Open GitHub profile</a></p></div>`;
            });
    }
});

