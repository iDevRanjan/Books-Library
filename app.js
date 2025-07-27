// Improved and standardized by Google Gemini

(function bookLibraryApp() {
    const applicationState = {
        maxResultsPerPage: 12,
        currentPageStartIndex: 0,
        searchQuery: "programming",
        currentPageNumber: 1,
    };

    let currentBookList = [];

    const searchInputElement = document.getElementById("search-input");
    const bookListContainer = document.getElementById("show-books");
    const layoutSwitchElement = document.getElementById("viewing-layout");
    const sortSelectElement = document.getElementById("sort-select");
    const previousPageButton = document.getElementById("prev-pagination");
    const pageNumbersContainer = document.getElementById(
        "pagination-numbers-wrapper"
    );
    const nextPageButton = document.getElementById("next-pagination");

    async function fetchBooksFromAPI() {
        const { maxResultsPerPage, currentPageStartIndex, searchQuery } =
            applicationState;
        const url = `https://www.googleapis.com/books/v1/volumes?maxResults=${maxResultsPerPage}&startIndex=${currentPageStartIndex}&q=${searchQuery}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.items || [];
        } catch (error) {
            console.error("Error fetching books:", error);
            bookListContainer.innerHTML = `<p>Error fetching books. Please try again later.</p>`;
            return [];
        }
    }

    function renderBookCards() {
        if (currentBookList.length === 0) {
            bookListContainer.innerHTML = `<p>No books found for your query: "${applicationState.searchQuery}"</p>`;
            return;
        }

        const bookCardsHTML = currentBookList
            .map((bookItem) => {
                const volumeInfo = bookItem.volumeInfo || {};
                const thumbnail =
                    volumeInfo.imageLinks?.thumbnail ||
                    "https://bookstoreromanceday.org/wp-content/uploads/2020/08/book-cover-placeholder.png";
                const title = volumeInfo.title || "No title available";
                const authors =
                    volumeInfo.authors?.join(", ") || "Unknown Author";
                const publisher = volumeInfo.publisher || "Unknown Publisher";
                const publishedDate = volumeInfo.publishedDate || "N/A";

                return `
                <a href="${volumeInfo.infoLink || "#"}" target="_blank">
                    <div class="book__card">
                        <div class="thumbnail__wapper">
                            <img src="${thumbnail}" alt="Cover of ${title}">
                        </div>
                        <div class="content__wapper">
                            <h3 title="${title}">${title}</h3>
                            <div>
                                <h4 title="Author: ${authors}">Author: ${authors}</h4>
                                <p>Publisher: ${publisher}</p>
                                <time>Published date: ${publishedDate}</time>
                            </div>
                        </div>
                    </div>
                </a>`;
            })
            .join("");

        bookListContainer.innerHTML = bookCardsHTML;
    }

    function sortAndRenderBooks() {
        const sortBy = sortSelectElement.value;

        if (sortBy === "Title") {
            currentBookList.sort((bookA, bookB) =>
                (bookA.volumeInfo.title || "").localeCompare(
                    bookB.volumeInfo.title || ""
                )
            );
        } else if (sortBy === "Date") {
            currentBookList.sort((bookA, bookB) => {
                const dateA = new Date(bookA.volumeInfo.publishedDate || 0);
                const dateB = new Date(bookB.volumeInfo.publishedDate || 0);
                return dateA - dateB;
            });
        }
        renderBookCards();
    }

    async function fetchAndDisplayBooks() {
        const fetchedData = await fetchBooksFromAPI();
        currentBookList = fetchedData;
        sortAndRenderBooks();
    }

    function updatePaginationControls() {
        [...pageNumbersContainer.children].forEach((pageSpan) => {
            pageSpan.classList.toggle(
                "page__active",
                parseInt(pageSpan.dataset.pageId, 10) ===
                    applicationState.currentPageNumber
            );
        });

        previousPageButton.style.visibility =
            applicationState.currentPageNumber === 1 ? "hidden" : "visible";

        const totalPages = pageNumbersContainer.children.length;
        nextPageButton.style.visibility =
            applicationState.currentPageNumber === totalPages
                ? "hidden"
                : "visible";
    }

    function navigateToPage(newPageNumber) {
        const totalPages = pageNumbersContainer.children.length;
        if (newPageNumber < 1 || newPageNumber > totalPages) {
            return;
        }

        applicationState.currentPageNumber = newPageNumber;
        applicationState.currentPageStartIndex =
            (applicationState.currentPageNumber - 1) *
            applicationState.maxResultsPerPage;

        updatePaginationControls();
        fetchAndDisplayBooks();
    }

    function setupEventListeners() {
        searchInputElement.addEventListener("input", () => {
            applicationState.searchQuery =
                searchInputElement.value.trim() || "programming";
            navigateToPage(1);
        });

        sortSelectElement.addEventListener("change", sortAndRenderBooks);

        layoutSwitchElement.addEventListener("click", (event) => {
            const clickedButton = event.target.closest("button");
            if (!clickedButton) return;

            [...layoutSwitchElement.children].forEach((layoutButton) =>
                layoutButton.classList.remove("active")
            );
            clickedButton.classList.add("active");

            const isGridView = clickedButton.id === "view-grid";
            bookListContainer.classList.toggle("view__grid", isGridView);
            bookListContainer.classList.toggle("view__list", !isGridView);
        });

        previousPageButton.addEventListener("click", () => {
            navigateToPage(applicationState.currentPageNumber - 1);
        });

        nextPageButton.addEventListener("click", () => {
            navigateToPage(applicationState.currentPageNumber + 1);
        });

        pageNumbersContainer.addEventListener("click", (event) => {
            if (event.target.matches("span[data-page-id]")) {
                const newPage = parseInt(event.target.dataset.pageId, 10);
                navigateToPage(newPage);
            }
        });
    }

    function init() {
        layoutSwitchElement.firstElementChild.classList.add("active");
        bookListContainer.classList.add("view__grid");

        setupEventListeners();
        navigateToPage(1);
    }
    init();
})();
