# This is written by me

```javascript
const state = {
    limit: 12,
    startIndex: 0,
    query: "programming",
};

async function getBookListData() {
    const url = `https://www.googleapis.com/books/v1/volumes?&maxResults=${state.limit}&startIndex=${state.startIndex}&q=${state.query}`;
    const options = { method: "GET", headers: { accept: "application/json" } };

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        return data.items || [];
    } catch (error) {
        console.error(error);
        showBooks.innerHTML = `<p>Error fetching books. Please try again later.</p>`;
    }
}

const searchInput = document.getElementById("search-input");
const showBooks = document.getElementById("show-books");
const viewingLayout = document.getElementById("viewing-layout");
const sortSelect = document.getElementById("sort-select");
const prevPaginationBtn = document.getElementById("prev-pagination");
const paginationNumbersWrapper = document.getElementById(
    "pagination-numbers-wrapper"
);
const nextPaginationBtn = document.getElementById("next-pagination");

let bookData = [];
let currentPosition = 1;

async function bookListDataRender() {
    const collectData = await getBookListData();
    bookData = structuredClone(collectData);

    sortingFunctionality();
}

searchInput.addEventListener("input", () => {
    state.query = searchInput.value;

    if (!searchInput.value) {
        state.query = "programming";
    }

    function firstPageHnadle() {
        currentPosition = 1;
        state.startIndex = 0;

        for (const element of paginationNumbersWrapper.children) {
            if (element.classList.contains("page__active")) {
                element.classList.remove("page__active");
            }
        }

        if (
            !paginationNumbersWrapper.firstElementChild.classList.contains(
                "page__active"
            )
        ) {
            paginationNumbersWrapper.firstElementChild.classList.add(
                "page__active"
            );
            prevPaginationBtn.style.visibility = "hidden";
        }
    }
    firstPageHnadle();

    bookListDataRender();
});

function renderBookCard() {
    const cloneData = structuredClone(bookData);

    if (bookData.length === 0) {
        showBooks.innerHTML = `<p>No books found for your query: "${state.query}"</p>`;
        return;
    }

    showBooks.innerHTML = cloneData
        .map((element) => {
            const volumeInfo = element.volumeInfo || {};

            const thumbnail =
                volumeInfo.imageLinks?.thumbnail ||
                "https://bookstoreromanceday.org/wp-content/uploads/2020/08/book-cover-placeholder.png";
            const title = volumeInfo.title || "No title found";
            const authors = volumeInfo.authors?.join(", ") || "Unknown Author";
            const publisher = volumeInfo.publisher || "Unknown Publisher";
            const publishedDate = volumeInfo.publishedDate || "N/A";

            return `
            <a href="${volumeInfo.infoLink || "#"}" target="_blank">
                <div class="book__card">
                    <div class="thumbnail__wapper">
                        <img src=${thumbnail} alt="${title}">
                    </div>
                    <div class="content__wapper">
                        <h3 title="${title}">${title}</h3>
                        <div>
                            <h4 title="${authors}">Author: ${authors}</h4>
                            <p>Publisher: ${publisher}</p>
                            <time>Published date: ${publishedDate}</time>
                        </div>
                    </div>
                </div>
            </a>
        `;
        })
        .join("");
}

function sortingFunctionality() {
    if (sortSelect.value === "Title") {
        bookData.sort((a, b) => {
            return a.volumeInfo.title
                .toLowerCase()
                .localeCompare(b.volumeInfo.title.toLowerCase());
        });

        renderBookCard();
    } else if (sortSelect.value === "Date") {
        bookData.sort((a, b) => {
            const dateA = new Date(a.volumeInfo.publishedDate || "1970-01-01");
            const dateB = new Date(b.volumeInfo.publishedDate || "1970-01-01");

            return dateA - dateB;
        });

        renderBookCard();
    }
}

sortSelect.addEventListener("input", sortingFunctionality);

function initialLayoutSet() {
    viewingLayout.firstElementChild.classList.add("active");
    showBooks.classList.add("view__grid");
}
initialLayoutSet();

viewingLayout.addEventListener("click", (event) => {
    if (event.target.matches("BUTTON")) {
        for (const element of viewingLayout.children) {
            if (element.classList.contains("active")) {
                element.classList.remove("active");
            }
        }

        if (!event.target.classList.contains("active")) {
            event.target.classList.add("active");
        }

        if (event.target.matches("#view-grid")) {
            if (showBooks.matches(".view__list")) {
                showBooks.classList.remove("view__list");
                showBooks.classList.add("view__grid");
            }
        }

        if (event.target.matches("#view-list")) {
            if (showBooks.matches(".view__grid")) {
                showBooks.classList.remove("view__grid");
                showBooks.classList.add("view__list");
            }
        }
    }
});

function paginationHandle() {
    function pageFunction(elementTarget) {
        for (const element of paginationNumbersWrapper.children) {
            if (element.classList.contains("page__active")) {
                element.classList.remove("page__active");
            }
        }

        if (!elementTarget.classList.contains("page__active")) {
            elementTarget.classList.add("page__active");

            currentPosition = Number(elementTarget.dataset.pageId);
            state.startIndex = currentPosition * 12 - 12;

            bookListDataRender();

            if (currentPosition === 1) {
                prevPaginationBtn.style.visibility = "hidden";
            } else {
                prevPaginationBtn.style.visibility = "visible";
            }

            if (currentPosition === 10) {
                nextPaginationBtn.style.visibility = "hidden";
            } else {
                nextPaginationBtn.style.visibility = "visible";
            }
        }
    }
    pageFunction(paginationNumbersWrapper.firstElementChild);

    function findActivePageFunction() {
        const findActiveElement = [...paginationNumbersWrapper.children].find(
            (element) => element.classList.contains("page__active")
        );

        return findActiveElement;
    }

    prevPaginationBtn.addEventListener("click", () => {
        const getActiveElement = findActivePageFunction();

        pageFunction(getActiveElement.previousElementSibling);
    });

    paginationNumbersWrapper.addEventListener("click", (event) => {
        if (event.target.matches("SPAN")) {
            pageFunction(event.target);
        }
    });

    nextPaginationBtn.addEventListener("click", () => {
        const getActiveElement = findActivePageFunction();

        pageFunction(getActiveElement.nextElementSibling);
    });
}
paginationHandle();
```
