window.addEventListener("touchstart", (e) => {
    passive: true;
});

document.addEventListener("DOMContentLoaded", function () {
    initializeCollapsibles();
});

let lastClickTime = 0;
const cooldownDuration = 400;

function initializeCollapsibles() {
    const coll = document.getElementsByClassName("collapsible");

    for (let i = 0; i < coll.length; i++) {
        coll[i].removeEventListener("click", toggleCollapse);
        coll[i].addEventListener("click", toggleCollapse);

        const content = getElementsAfter(coll[i]);

        if (coll[i].classList.contains("default")) {
            content.forEach((item) => {
                item.classList.remove("active");
                item.style.maxHeight = 0;
                item.style.opacity = 0;
                item.style.display = "none";
            });
        } else {
            content.forEach((item) => {
                item.classList.add("active");
                item.style.display = "block";
                item.style.maxHeight = item.scrollHeight + "px";
                item.style.opacity = 1;
            });
        }

        const resizeObserver = new ResizeObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.target.classList.contains("active")) {
                    entry.target.style.maxHeight =
                        entry.target.scrollHeight + "px";
                }
            });
        });

        content.forEach((item) => resizeObserver.observe(item));
    }
}

function toggleCollapse() {
    const now = Date.now();

    if (now - lastClickTime < cooldownDuration) {
        return;
    }

    lastClickTime = now;

    this.classList.toggle("active");

    const content = getElementsAfter(this);

    content.forEach((item) => {
        if (item.classList.contains("active")) {
            item.classList.remove("active");
            item.style.maxHeight = 0;
            item.style.opacity = 0;

            item.addEventListener(
                "transitionend",
                function () {
                    if (!item.classList.contains("active")) {
                        item.style.display = "none";
                    }
                },
                { once: true }
            );
        } else {
            item.classList.add("active");
            item.style.display = "block";

            const scrollHeight = item.scrollHeight;
            item.style.maxHeight = item.scrollHeight + "px";
            item.style.opacity = 1;
        }
    });
}

function getElementsAfter(element) {
    const elements = [];
    let sibling = element.nextElementSibling;

    while (sibling) {
        elements.push(sibling);
        sibling = sibling.nextElementSibling;
    }

    return elements;
}

function setFooter() {
    const footer = document.createElement("footer");
    footer.style.width = "100%";
    footer.style.marginTop = "40px";

    const footerText = document.createElement("p");
    footerText.style.textAlign = "right";
    footerText.style.marginBottom = "0";
    footerText.style.color = "#999";
    footerText.style.fontSize = "0.7rem";
    footerText.innerHTML = 'Made with ❤︎ by <a href="https://github.com/v81d" style="color: inherit; text-decoration: underline dotted;">v81d</a>. Thank you for visiting Russian Cases!';

    const container = document.querySelector(".container");
    container.appendChild(footer);
    footer.appendChild(footerText);
}

window.addEventListener("load", function () {
    document.body.style.display = "block";
    setFooter();
});