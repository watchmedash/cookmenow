




document.addEventListener('DOMContentLoaded', (event) => {
  // Sample list of items for search
  const itemList = [
"Spaghetti Aglio e Olio",
"Chocolate Chip Cookies",
"Mac and Cheese",
"Greek Salad",
"Apple Crumble",
"Vegetable Stir Fry",
"Avocado Toast",
"Margherita Pizza",
"Classic Caesar Salad",
"Vegan Tofu Stir-fry",
"Chicken Alfredo Pasta",
"Garlic Butter Shrimp Pasta",
"Spaghetti Carbonara",
"Creamy Garlic Parmesan Mushroom Chicken & Bacon",
"Chicken Biryani",
"Vegetable Lasagna",
"Shrimp Scampi",
"Lemon Pepper Chicken",
"Tomato Soup",
"Blueberry Pancakes",
"Tiramisu",
"Chicken Shawarma",
"Roasted Vegetable Quinoa Salad",
"Fish Tacos",
"Chicken Parmesan",
"Beef Stir Fry",
"Pan-Seared Salmon",
"Roasted Beetroot and Goat Cheese Salad",
"Eggs Benedict",
"Kimchi Fried Rice",
"Chicken Adobo",
"Ramen",
"Jollof Rice",
"Laksa",
"Bibimbap",
"Lamb Tagine",
"Sushi Roll",
"Hummus",
"Okonomiyaki",
"Pav Bhaji",
"Cajun Jambalaya",
"Peking Duck",
"Falafel",
"Beef Pho",
"Paella",
"Tom Kha Gai",
"Pad Thai",
"Chiles Rellenos",
"Ratatouille",
"Chicken Marsala",
"Dum Aloo",
"Thai Green Curry",
"Feijoada",
"Osso Buco",
"Moroccan Couscous",
"Argentinian Empanadas",
"Shakshuka",
"Churros",
"Vegetable Biryani",
"Moussaka",
"Baklava",
"Coq au Vin",
"Tres Leches Cake",
"Tabbouleh",
"Nasi Goreng",
"Leche Flan",
"Adobo sa Gata",
"Kare-Kare",
"Lechon Kawali",
"Bicol Express",
"Chicken Tinola",
"Pancit Bihon",
"Pinakbet",
"Chicken Inasal",
"Fish Sinigang",
"Chicken Afritada",
"Sinigang na Bangus",
"Halo-Halo",
"Arroz Caldo",
"Bibingka",
"Fresh Lumpia",
"Ukoy",
"Turon",
"Sinampalukang Manok",
"Beef Caldereta",
"Pancit Canton",
"Ensaladang Talong",
"Feijoada",
"Feijoada",
"Feijoada",
"Feijoada",
"Feijoada",
"Feijoada",
"Feijoada",
"Feijoada",
"Feijoada",
"Feijoada",
"Feijoada",
"Feijoada",


  ];

  // Function to perform search
  function performSearch() {
    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");
    const searchTerm = searchInput.value.toLowerCase();

    // Clear previous search results
    searchResults.innerHTML = "";

    if (searchTerm.trim() === "") {
      // If the search input is empty, hide the search results
      searchResults.style.display = "none";
    } else {
      // Filter items based on search term
      const filteredItems = itemList.filter((item) =>
        item.toLowerCase().includes(searchTerm)
      );

      // Display search results
      if (filteredItems.length === 0) {
        searchResults.innerHTML = "<p>No results found.</p>";
      } else {
        displayItemList(filteredItems, searchResults);
      }

      // Show the search results
      searchResults.style.display = "block";
    }
  }

  // Function to display a list of items in the search results container
  function displayItemList(items, container) {
    const ul = document.createElement("ul");
    items.forEach((item) => {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.textContent = item;
      // Replace 'YOUR_LINK_BASE_URL' with your own link base URL
      link.href = `../${encodeURIComponent(item)}.html`;
      li.appendChild(link);
      ul.appendChild(li);
    });
    container.appendChild(ul);
  }

  // Attach event listener to search input
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", performSearch);

  // Initially hide the search results
  const searchResults = document.getElementById("searchResults");
  searchResults.style.display = "none";
});
