function toggleDrawer() {
  const backdrop = document.getElementById("drawer-backdrop");
  const drawer = document.getElementById("productDrawer");

  const isOpen = drawer.classList.contains("open");

  if (isOpen) {
    drawer.classList.remove("open");
    setTimeout(() => {
      backdrop.style.display = "none";
    }, 300); // Wait for slide-out animation
  } else {
    backdrop.style.display = "block";
    drawer.classList.add("open");
  }
}

function handleDrawerOutsideClick(event) {
  const drawer = document.getElementById("productDrawer");
  if (!drawer.contains(event.target)) {
    toggleDrawer();
  }
}

document.getElementById("productDrawer")?.addEventListener("click", (e) => {
  e.stopPropagation();
});

function addToCart(variantId) {
  if (!variantId) {
    alert("Please select valid options.");
    return;
  }

  fetch("/cart/add.js", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: variantId, quantity: 1 }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Add to cart failed");
      return res.json();
    })
    .then(() => {
      const cartDrawer = document.querySelector("cart-drawer");
      if (cartDrawer && typeof cartDrawer.open === "function") {
        cartDrawer.open();
        fetch("/?section_id=cart-drawer")
          .then((res) => res.text())
          .then((html) => {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = html;
            const newDrawer = tempDiv.querySelector("cart-drawer");
            if (newDrawer) {
              cartDrawer.innerHTML = newDrawer.innerHTML;
              cartDrawer.classList.remove("is-empty");
              const emptyMessage = cartDrawer.querySelector(
                ".drawer__inner-empty"
              );
              if (emptyMessage) emptyMessage.style.display = "none";
            }

            // Update cart icon bubble
            fetch(window.location.href)
              .then((res) => res.text())
              .then((html) => {
                const tempBubbleDiv = document.createElement("div");
                tempBubbleDiv.innerHTML = html;
                const newBubbleContent =
                  tempBubbleDiv.querySelector("#cart-icon-bubble");
                const currentBubble =
                  document.querySelector("#cart-icon-bubble");
                if (newBubbleContent && currentBubble) {
                  currentBubble.innerHTML = newBubbleContent.innerHTML;
                }
              });
          });
        return;
      }

      const cartNotification = document.getElementById("cart-notification");
      if (cartNotification) {
        cartNotification.style.display = "block";
        fetch("/?section_id=cart-notification")
          .then((res) => res.text())
          .then((html) => {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = html;
            const newNotif = tempDiv.querySelector("#cart-notification");
            if (newNotif) {
              cartNotification.innerHTML = newNotif.innerHTML;
            }
          });
        return;
      }

      window.location.href = "/cart";
    })
    .catch(() => alert("Failed to add to cart."));
}

// Attach event to all quick-buy buttons inside the drawer
document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll(".drawer-product-qucik-buy-button")
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        const variantId = btn.dataset.variantId;
        addToCart(variantId);
      });
    });
});
