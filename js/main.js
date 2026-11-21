/* Application entry point and user interactions. */
document.addEventListener("DOMContentLoaded", async () => {
    const loadingScreen = document.getElementById("loadingScreen");
    const toast = document.getElementById("toast");

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add("show");
        window.setTimeout(() => toast.classList.remove("show"), 3200);
    }

    try {
        const data = await window.Orbitwatch.loadDashboardData();
        window.Orbitwatch.renderOverview(data);
        window.Orbitwatch.makeCharts(data);
        document.getElementById("trendRange").addEventListener("change", (event) => {
            window.Orbitwatch.applyTrendFilter(event.target.value);
        });
    } catch (error) {
        console.error(error);
        showToast("Data could not load. Run the local preview server and check data/data.json.");
        document.getElementById("generatedDate").textContent = "DATA LOAD ERROR";
    } finally {
        window.setTimeout(() => loadingScreen.classList.add("loaded"), 500);
    }

    window.Orbitwatch.initStarfield();
    window.Orbitwatch.initReveal();

    const menuToggle = document.getElementById("menuToggle");
    const mainNav = document.getElementById("mainNav");
    menuToggle.addEventListener("click", () => {
        const isOpen = mainNav.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
    mainNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            mainNav.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
        });
    });

    const navLinks = [...mainNav.querySelectorAll("a")];
    const sections = navLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
    if ("IntersectionObserver" in window) {
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    navLinks.forEach((link) => {
                        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
                    });
                }
            });
        }, { rootMargin: "-35% 0px -55% 0px" });
        sections.forEach((section) => navObserver.observe(section));
    }

    // Refresh the JSON when the user explicitly requests a page refresh.
    // A normal browser refresh also fetches data.json with cache disabled.
});
