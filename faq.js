document.querySelectorAll(".faq-question").forEach(button => {
    button.addEventListener("click", () => {
        const item = button.closest(".faq-item");
        const isActive = item.classList.contains("active");

        document.querySelectorAll(".faq-item").forEach(faqItem => {
            faqItem.classList.remove("active");
            faqItem.querySelector(".faq-question span").textContent = "+";
        });

        if (!isActive) {
            item.classList.add("active");
            button.querySelector("span").textContent = "−";
        }
    });
});