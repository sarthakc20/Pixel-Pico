function toggleDropdown(el) {
  const dropdown = document.getElementById("mobileDropdown");
  if (dropdown.style.display === "none") {
    dropdown.style.display = "block";
    el.innerHTML = `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 13.9997L13.7279 1.27177" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M1 1.00031L13.7279 13.7282" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  } else {
    dropdown.style.display = "none";
    el.innerHTML = `<svg width="20" height="13" viewBox="0 0 20 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 6.5H19" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M1 1.5H19" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M1 11.5H19" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
}
