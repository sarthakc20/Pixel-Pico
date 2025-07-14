document.addEventListener("DOMContentLoaded", () => {
  const popupEl = document.getElementById("product-grid-popup-modal");
  const closeBtn = popupEl.querySelector(".popup-close");

  const priceEl = popupEl.querySelector(".popup-product-price");
  const addToCartBtn = popupEl.querySelector(".add-to-cart-btn");
  const boxContainer = popupEl.querySelector(".option-boxes");
  const dropdown = popupEl.querySelector("#option-select");
  const dropdownLabel = popupEl.querySelector('label[for="option-select"]');

  let currentProduct = null;
  let selectedOptions = [];

  // Get the money format from the data attribute
  const moneyFormatEl = document.getElementById("popup-price-container");
  const shopMoneyFormat = moneyFormatEl
    ? moneyFormatEl.getAttribute("data-money-format")
    : "{{ amount }}";

  function formatMoney(cents, format = shopMoneyFormat) {
    if (typeof cents === "string") cents = cents.replace(".", "");
    let value = "";
    const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    switch (format.match(placeholderRegex)[1]) {
      case "amount":
        value = (cents / 100).toFixed(2);
        break;
      case "amount_no_decimals":
        value = (cents / 100).toFixed(0);
        break;
      case "amount_with_comma_separator":
        value = (cents / 100).toFixed(2).replace(".", ",");
        break;
      default:
        value = (cents / 100).toFixed(2);
    }
    return format.replace(placeholderRegex, value);
  }

  function findVariantByOptions(product, selectedOptions) {
    return product.variants.find((variant) =>
      variant.options.every((opt, i) => opt === selectedOptions[i])
    );
  }

  // Render the product option as boxes
  function renderBoxes(product) {
    boxContainer.innerHTML = "";

    // Add the label for the second variant option
    const optionIndex = 1; // second variant
    const optionName = product.options[optionIndex];
    const label = document.createElement("div");
    label.textContent = optionName.name;
    label.classList.add("lable-name");
    boxContainer.appendChild(label);

    // Outer wrapper to hold the boxes side by side
    const boxesWrapper = document.createElement("div");
    boxesWrapper.classList.add("boxes-wrapper");
    boxContainer.appendChild(boxesWrapper);

    const values = [
      ...new Set(product.variants.map((v) => v.options[optionIndex])),
    ];

    values.forEach((value) => {
      // Box
      const box = document.createElement("div");
      box.classList.add("box");

      // Color strip
      const colorStrip = document.createElement("div");
      colorStrip.classList.add("color-strip");
      colorStrip.style.backgroundColor = value.toLowerCase(); // assumes value is a color name
      box.appendChild(colorStrip);

      // Text content
      const boxText = document.createElement("div");
      boxText.classList.add("box-text");
      boxText.textContent = value;
      box.appendChild(boxText);

      // Add data attribute for tracking
      box.dataset.optionValue = value;

      // Click handler
      box.addEventListener("click", () => {
        // Reset all boxes
        [...boxesWrapper.querySelectorAll("div[data-option-value]")].forEach(
          (el) => {
            el.style.borderColor = "#000000";
            el.style.backgroundColor = "";
            el.style.color = "";
          }
        );

        // Highlight selected
        box.style.backgroundColor = "#000000";
        box.style.color = "#ffffff";

        // Store selected box value in the second position (option1)
        selectedOptions[1] = value;
        updateSelectedVariant();
      });

      boxesWrapper.appendChild(box);
    });
  }

  // Render the product option as dropdown
  function renderDropdown(product) {
    // Clear old dropdown wrappers
    const oldWrappers = document.querySelectorAll(".dropdown-wrapper");
    oldWrappers.forEach((wrapper) => wrapper.remove());

    const optionIndex = 0;
    const optionName = product.options[optionIndex];
    dropdownLabel.textContent = optionName.name;
    dropdownLabel.style.display = "block";

    // Create dropdown wrapper
    const dropdownWrapper = document.createElement("div");
    dropdownWrapper.classList.add("dropdown-wrapper");

    const selectEl = document.createElement("select");

    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = "Choose your size";
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    selectEl.appendChild(placeholderOption);

    const values = [
      ...new Set(product.variants.map((v) => v.options[optionIndex])),
    ];
    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      selectEl.appendChild(option);
    });

    const dropdownIcon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    dropdownIcon.setAttribute("width", "16");
    dropdownIcon.setAttribute("height", "10");
    dropdownIcon.setAttribute("viewBox", "0 0 16 10");
    dropdownIcon.setAttribute("fill", "none");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M2 2L8 8L14 2");
    path.setAttribute("stroke", "black");
    path.setAttribute("stroke-width", "1.5");
    path.setAttribute("stroke-linecap", "square");
    dropdownIcon.appendChild(path);

    const separator = document.createElement("div");
    separator.classList.add("separator-line");

    const selectWrapper = document.createElement("div");
    selectWrapper.classList.add("select-wrapper");

    selectEl.style.appearance = "none";
    selectEl.style.webkitAppearance = "none";
    selectEl.style.mozAppearance = "none";

    selectWrapper.appendChild(selectEl);
    dropdownWrapper.appendChild(selectWrapper);
    dropdownWrapper.appendChild(separator);
    dropdownWrapper.appendChild(dropdownIcon);

    // Insert dropdown wrapper after label
    dropdownLabel.insertAdjacentElement("afterend", dropdownWrapper);

    // Handle dropdown changes
    selectEl.addEventListener("change", () => {
      selectedOptions[0] = selectEl.value;
      updateSelectedVariant();
    });
  }

  function updateSelectedVariant() {
    const variant = findVariantByOptions(currentProduct, selectedOptions);
    if (variant) {
      priceEl.textContent = formatMoney(variant.price);
      addToCartBtn.dataset.variantId = variant.id;
    } else {
      priceEl.textContent = "Unavailable";
      addToCartBtn.dataset.variantId = "";
    }
  }

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
        popupEl.style.display = "none";

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

  addToCartBtn.addEventListener("click", () => {
    addToCart(addToCartBtn.dataset.variantId);
  });

  closeBtn.addEventListener("click", () => (popupEl.style.display = "none"));
  popupEl
    .querySelector(".popup-overlay")
    .addEventListener("click", () => (popupEl.style.display = "none"));

  document.querySelectorAll(".plus-icon").forEach((icon) => {
    icon.addEventListener("click", () => {
      const handle = icon.dataset.productHandle;

      fetch(`/products/${handle}.js`)
        .then((res) => res.json())
        .then((product) => {
          currentProduct = product;

          // Initialize selectedOptions in Shopify’s order
          selectedOptions = [...product.variants[0].options];

          renderBoxes(product);
          renderDropdown(product);

          // Preselect dropdown to first available value
          dropdown.value = selectedOptions[0];

          // Preselect first box visually
          const firstBox = boxContainer.querySelector("div[data-option-value]");
          if (firstBox) firstBox.click();

          popupEl.querySelector(
            ".popup-product-image"
          ).innerHTML = `<img src="${product.featured_image}" alt="${product.title}" style="max-width:120px; object-fit: cover;">`;
          popupEl.querySelector(".popup-product-title").textContent =
            product.title;
          popupEl.querySelector(".popup-product-description").innerHTML =
            product.description;

          updateSelectedVariant();

          popupEl.style.display = "block";
        })
        .catch(() => alert("Failed to load product data."));
    });
  });
});