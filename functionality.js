document.addEventListener('DOMContentLoaded', () => {
    const numbers = document.querySelectorAll('.stat-number');

    function animateCounter(element, target) {
        let current = 0;
        const increment = Math.ceil(target / 100);
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = current.toLocaleString();
        }, 10);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateCounter(entry.target, target);
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, {
        threshold: 0.5
    });

    numbers.forEach(number => {
        observer.observe(number);
    });
});

// end section
document.addEventListener('DOMContentLoaded', () => {
    const newsGridEnd = document.getElementById('newsGridEnd');

    if (!newsGridEnd) {
        console.error('News grid end not found');
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    console.log('News grid end is visible'); // Debug log
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.1,
            rootMargin: '50px'
        }
    );

    observer.observe(newsGridEnd);
});


