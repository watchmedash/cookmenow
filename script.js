




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
"Laing",
"Puto Bumbong",
"Puto",
"Tapsilog",
"Sinarsahang Manok",
"Pancit Palabok",
"Ginataang Manok",
"Lumpiang Shanghai",
"Pancit Malabon",
"Kakanin",
"Palitaw",
"Nilagang Baka",
"Ginataang Tilapia",
"Sinangag",
"Ginataang Gulay",
"Chicken Sopas",
"Tuyo with Garlic Rice and Fried Egg",
"Buko Pandan",
"Spaghetti alla Puttanesca",
"Tarte Tatin",
"Risotto ai Funghi",
"Chicken Enchiladas",
"Penne Alla Vodka",
"Enchiladas Verdes",
"Irish Stew",
"Clam Chowder",
"Goulash",
"Tempura",
"Cannoli",
"Butter Chicken",
"Bruschetta",
"Banitsa",
"Chiles en Nogada",
"Doro Wat",
"Swedish Meatballs",
"Moules-Frites",
"Phở Gà",
"Gazpacho",
"Spanakopita",
"Pad See Ew",
"Chocoflan",
"Sauerbraten",
"Bulgogi",
"Chicken Fajitas",
"Vegan Lentil Curry",
"Stuffed Bell Peppers",
"Eggplant Parmesan",
"Lobster Bisque",
"Miso Soup",
"Matzo Ball Soup",
"Caprese Salad",
"Chicken Tikka Masala",
"Dal Makhani",
"Vegan Black Bean Tacos",
"Vegan Minestrone Soup",
"Chicken and Dumplings",
"Chicken Piccata",
"Beef Stroganoff",
"Coq au Riesling",
"Chicken Katsu Curry",
"Beef Wellington",
"Fried Chicken",
"Chicken Teriyaki",
"Chicken Binakol",
"Chicken Pochero",
"Chicken Pastel",
"Chicken Caldereta",
"Filipino Chicken Barbecue",
"Chicken Yakitori",
"Kung Pao Chicken",
"Japchae",
"Tom Yum Soup",
"Korean Bibim Naengmyeon",
"Vietnamese Bánh Mì",
"Cranachan",
"Chiffon Cake",
"Panna Cotta",
"Beef Bourguignon",
"German Potato Salad",
"Sweet Potato and Black Bean Tacos",
"Pumpkin Risotto",
"Stuffed Acorn Squash",
"Seared Scallops with Lemon Garlic Sauce",
"Grilled Portobello Mushrooms with Pesto",
"Orange Glazed Salmon",
"Roasted Asparagus and Feta Tart",
"Red Velvet Cake",
"Carrot Cake with Cream Cheese Frosting",
"Carrot Cake",
"Lemon Cake",
"Chocolate Mousse Cake",
"Strawberry Shortcake",
"Cheesecake",
"Coconut Cake",
"Opera Cake",
"Pineapple Upside-Down Cake",
"Black Forest Cake",
"Hummingbird Cake",
"Vanilla Bean Cheesecake",
"Coconut Cream Cake",
"Banana Cream Cake",
"Blueberry Lemon Pound Cake",
"Creamy Garlic Parmesan Chicken",
"Mango Salsa",
"Grilled Lemon Herb Salmon",
"Roasted Garlic Rosemary Potatoes",
"Honey Sriracha Glazed Salmon",
"Mediterranean Quinoa Salad",
"Crispy Baked Zucchini Fries",
"Mushroom and Spinach Stuffed Chicken Breast",
"Honey Mustard Glazed Chicken",
"Caprese Stuffed Portobello Mushrooms",
"Garlic Herb Butter Roasted Chicken",
"Baked Salmon with Lemon-Dill Sauce",
"Baked Zucchini Parmesan Chips",
"Beef Chili",
"Beef and Broccoli Noodles",
"Beef Sinigang",
"Bangus Sisig",
"Ginataang Alimasag",
"Paksiw na Bangus",
"Chicken Menudo",
"Pastil",
"Chicken Pot Pie",
"Pasta Carbonara",
"Potato and Cheese Pierogi",
"Sashimi",
"Masala Dosa",
"Guacamole",
"Croissants",
"Tapas",
"Souvlaki",
"Apple Pie",
"Coxinha",



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
