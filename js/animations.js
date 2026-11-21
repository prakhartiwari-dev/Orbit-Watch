/* Lightweight decorative starfield and scroll reveal effects. */
window.Orbitwatch = window.Orbitwatch || {};

window.Orbitwatch.initStarfield = function () {
    const canvas = document.getElementById("starfield");
    const context = canvas.getContext("2d");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stars = [];
    let width = 0;
    let height = 0;
    let frame = 0;

    function resize() {
        const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        const count = Math.min(130, Math.floor(width * height / 9000));
        stars = Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.15 + .2,
            alpha: Math.random() * .55 + .15,
            speed: Math.random() * .12 + .025
        }));
    }

    function draw() {
        context.clearRect(0, 0, width, height);
        stars.forEach((star) => {
            context.beginPath();
            context.fillStyle = `rgba(190,216,239,${star.alpha})`;
            context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            context.fill();
            if (!reducedMotion) {
                star.y += star.speed;
                if (star.y > height) {
                    star.y = 0;
                    star.x = Math.random() * width;
                }
            }
        });
        if (!reducedMotion) frame = requestAnimationFrame(draw);
    }
    resize();
    draw();
    window.addEventListener("resize", () => {
        cancelAnimationFrame(frame);
        resize();
        draw();
    });
};

window.Orbitwatch.initReveal = function () {
    const elements = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
        elements.forEach((element) => element.classList.add("is-visible"));
        return;
    }
    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                currentObserver.unobserve(entry.target);
            }
        });
    }, { threshold: .12 });
    elements.forEach((element) => observer.observe(element));
};
