window.addEventListener("touchstart", (e) => {
    passive: true;
});

document.addEventListener("DOMContentLoaded", function () {
    initializeCollapsibles();
});

// Track the last click time to prevent rapid toggling
let lastClickTime = 0;
const cooldownDuration = 400; // 400ms cooldown

// Function to initialize collapsible elements
function initializeCollapsibles() {
    const coll = document.getElementsByClassName("collapsible");

    for (let i = 0; i < coll.length; i++) {
        coll[i].removeEventListener("click", toggleCollapse); // Clean up previous event listeners
        coll[i].addEventListener("click", toggleCollapse);

        const content = getElementsAfter(coll[i]);

        // Handle default state if "default" class is present
        if (coll[i].classList.contains("default")) {
            content.forEach((item) => {
                item.classList.remove("active");
                item.style.maxHeight = 0; // Collapse
                item.style.opacity = 0;
                item.style.display = "none"; // Ensure hidden
            });
        } else {
            content.forEach((item) => {
                item.classList.add("active");
                item.style.display = "block"; // Ensure visible
                item.style.maxHeight = item.scrollHeight + "px"; // Expand
                item.style.opacity = 1;
            });
        }

        // Add ResizeObserver to adjust height dynamically
        const resizeObserver = new ResizeObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.target.classList.contains("active")) {
                    entry.target.style.maxHeight =
                        entry.target.scrollHeight + "px";
                }
            });
        });

        // Observe each content element
        content.forEach((item) => resizeObserver.observe(item));
    }
}

// Function to handle the toggle of collapsible content
function toggleCollapse() {
    const now = Date.now();

    // Check if enough time has passed since the last click
    if (now - lastClickTime < cooldownDuration) {
        return; // Exit if within cooldown period
    }

    lastClickTime = now; // Update the last click time

    this.classList.toggle("active");

    const content = getElementsAfter(this);

    content.forEach((item) => {
        if (item.classList.contains("active")) {
            item.classList.remove("active");
            item.style.maxHeight = 0; // Collapse
            item.style.opacity = 0;

            // Wait until the transition ends before hiding the element
            item.addEventListener(
                "transitionend",
                function () {
                    if (!item.classList.contains("active")) {
                        item.style.display = "none"; // Ensure hidden after transition
                    }
                },
                { once: true }
            );
        } else {
            item.classList.add("active");
            item.style.display = "block"; // Make visible before expanding

            // Force recalculation of max-height
            const scrollHeight = item.scrollHeight;
            item.style.maxHeight = item.scrollHeight + "px"; // Expand
            item.style.opacity = 1;
        }
    });
}

// Utility function to get all sibling elements after a given element
function getElementsAfter(element) {
    const elements = [];
    let sibling = element.nextElementSibling;

    while (sibling) {
        elements.push(sibling);
        sibling = sibling.nextElementSibling;
    }

    return elements;
}

function isIos() {
    return (
        [
            "iPad Simulator",
            "iPhone Simulator",
            "iPod Simulator",
            "iPad",
            "iPhone",
            "iPod",
        ].includes(navigator.platform) ||
        // iPad on iOS 13 detection
        (navigator.userAgent.includes("Mac") && "ontouchend" in document)
    );
}

function isIosWebClip() {
    // Check if the app is running in standalone mode (added to home screen)
    const isStandalone = window.navigator.standalone === true; // True if opened from a web clip

    return isStandalone;
}

window.addEventListener("DOMContentLoaded", function () {
    if (isIosWebClip() || !isIos()) {
        const elementToHide = document.querySelector("#ios-shortcut");
        if (elementToHide) {
            elementToHide.style.display = "none"; // Hide the element
        }
    }
});

window.addEventListener("load", function () {
    document.body.style.display = "block";
});