$(document).ready(function() {
    var numItems = $('figure').length;
    var perPage = 32;
    var numPages = Math.ceil(numItems / perPage);
    var currentPage = 1;  // Default to page 1

    // Check if a page was specified in the URL
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('page')) {
        currentPage = parseInt(urlParams.get('page'));
        // Validate page number
        if (isNaN(currentPage) || currentPage < 1 || currentPage > numPages) {
            currentPage = 1;
        }
    }

    // Only show the items for the current page initially
    $('figure').hide().slice((currentPage - 1) * perPage, currentPage * perPage).show();

    if (currentPage === 1) {  // Hide the "Prev" button on the first page
        $('.prev-page').hide();
    }

    $('.prev-page').click(function (e) {
        e.preventDefault();
        if (currentPage > 1) {  // Only move back if not on the first page
            currentPage--;  // We moved back a page
            $('figure').hide().slice((currentPage - 1) * perPage, currentPage * perPage).show();
            history.pushState({page: currentPage}, "", "?page=" + currentPage);
        }
        if (currentPage === 1) {  // Hide the "Prev" button on the first page
            $('.prev-page').hide();
        }
    });

    $('.next-page').click(function (e) {
        e.preventDefault();
        currentPage++;  // We advanced a page
        if (currentPage > numPages) {  // If we're at the end, go to the first page
            currentPage = 1;
        }
        $('figure').hide().slice((currentPage - 1) * perPage, currentPage * perPage).show();
        history.pushState({page: currentPage}, "", "?page=" + currentPage);

        // Since we've moved from the first page, show the "Prev" button
        if (currentPage !== 1) {
            $('.prev-page').show();
        } else {
            $('.prev-page').hide();  // Hide the "Prev" button on the first page
        }
    });

    window.onpopstate = function(event) {
        // Load the appropriate page when the Back button is clicked
        if (event.state && event.state.page) {
            var page = event.state.page;
            $('figure').hide().slice((page - 1) * perPage, page * perPage).show();
        }
    }
});
