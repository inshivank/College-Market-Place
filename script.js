const STORAGE_KEY = "collegeMarketplaceItems";

const placeholderImages = {
    Books: svgImage("#0f766e", "#ccfbf1", "BOOK"),
    Electronics: svgImage("#2563eb", "#dbeafe", "TECH"),
    Clothes: svgImage("#be123c", "#ffe4e6", "WEAR"),
    Others: svgImage("#92400e", "#fef3c7", "ITEM")
};

const defaultItems = [
    {
        id: 1,
        name: "Math Book",
        category: "Books",
        price: 200,
        tags: "book study education math notes",
        image: placeholderImages.Books
    },
    {
        id: 2,
        name: "Physics Guide",
        category: "Books",
        price: 280,
        tags: "book physics science guide exam",
        image: placeholderImages.Books
    },
    {
        id: 3,
        name: "Programming Book",
        category: "Books",
        price: 450,
        tags: "book coding programming computer study",
        image: placeholderImages.Books
    },
    {
        id: 4,
        name: "Laptop",
        category: "Electronics",
        price: 40000,
        tags: "electronics computer coding laptop project",
        image: placeholderImages.Electronics
    },
    {
        id: 5,
        name: "Headphones",
        category: "Electronics",
        price: 1500,
        tags: "electronics audio music headphones online class",
        image: placeholderImages.Electronics
    },
    {
        id: 6,
        name: "Calculator",
        category: "Electronics",
        price: 600,
        tags: "electronics study calculator exam math",
        image: placeholderImages.Electronics
    },
    {
        id: 7,
        name: "Hoodie",
        category: "Clothes",
        price: 1200,
        tags: "clothes winter hoodie casual fashion",
        image: placeholderImages.Clothes
    },
    {
        id: 8,
        name: "Formal Shirt",
        category: "Clothes",
        price: 900,
        tags: "clothes formal shirt interview presentation",
        image: placeholderImages.Clothes
    },
    {
        id: 9,
        name: "Backpack",
        category: "Others",
        price: 1000,
        tags: "bag college travel books utility",
        image: placeholderImages.Others
    },
    {
        id: 10,
        name: "Desk Lamp",
        category: "Others",
        price: 750,
        tags: "study light desk hostel night",
        image: placeholderImages.Others
    },
    {
        id: 11,
        name: "USB Drive",
        category: "Electronics",
        price: 500,
        tags: "electronics storage data project computer",
        image: placeholderImages.Electronics
    },
    {
        id: 12,
        name: "Lab Coat",
        category: "Clothes",
        price: 650,
        tags: "clothes lab science practical college",
        image: placeholderImages.Clothes
    }
];

let items = loadItems();
let activeCategory = "All";
let selectedItemId = null;

const itemsGrid = document.getElementById("itemsGrid");
const recommendationsGrid = document.getElementById("recommendationsGrid");
const selectedTitle = document.getElementById("selectedTitle");
const selectedTags = document.getElementById("selectedTags");
const resultCount = document.getElementById("resultCount");
const addPanel = document.getElementById("addPanel");
const addItemForm = document.getElementById("addItemForm");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const emptyState = document.getElementById("emptyState");
const browseView = document.getElementById("browseView");
const detailView = document.getElementById("detailView");
const detailShell = document.getElementById("detailShell");
const backToItemsBtn = document.getElementById("backToItemsBtn");
const editPanel = document.getElementById("editPanel");
const editItemForm = document.getElementById("editItemForm");
const editItemName = document.getElementById("editItemName");
const editItemPrice = document.getElementById("editItemPrice");
const editItemCategory = document.getElementById("editItemCategory");
const editItemImage = document.getElementById("editItemImage");
const editItemImageFile = document.getElementById("editItemImageFile");
const editItemTags = document.getElementById("editItemTags");

document.getElementById("showAddFormBtn").addEventListener("click", () => {
    goToBrowseView();
    addPanel.classList.remove("hidden");
    document.getElementById("itemName").focus();
});

document.getElementById("cancelAddBtn").addEventListener("click", () => {
    addPanel.classList.add("hidden");
    addItemForm.reset();
});

document.getElementById("resetDataBtn").addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    items = cloneDefaultItems();
    selectedItemId = null;
    goToBrowseView();
    renderItems();
});

searchInput.addEventListener("input", () => {
    selectedItemId = null;
    goToBrowseView();
    renderItems();
});

sortSelect.addEventListener("change", renderItems);

document.querySelectorAll(".filter-btn").forEach((button) => {
    button.addEventListener("click", () => {
        activeCategory = button.dataset.category;
        selectedItemId = null;
        goToBrowseView();
        updateActiveFilter();
        renderItems();
    });
});

addItemForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const category = document.getElementById("itemCategory").value;
    const imageInput = document.getElementById("itemImage").value.trim();
    const imageFile = document.getElementById("itemImageFile").files[0];
    const cleanName = document.getElementById("itemName").value.trim();
    const cleanItemTags = cleanTags(document.getElementById("itemTags").value);

    if (!cleanName || !cleanItemTags) {
        return;
    }

    const newItem = {
        id: Date.now(),
        name: cleanName,
        category,
        price: Number(document.getElementById("itemPrice").value),
        tags: cleanItemTags,
        image: await getImageValue(imageFile, imageInput, category)
    };

    items.push(newItem);
    saveItems();
    addItemForm.reset();
    addPanel.classList.add("hidden");
    activeCategory = "All";
    searchInput.value = "";
    sortSelect.value = "default";
    updateActiveFilter();
    renderItems();
});

renderItems();
handleRoute();

window.addEventListener("hashchange", handleRoute);
backToItemsBtn.addEventListener("click", goToBrowseView);
document.getElementById("cancelEditBtn").addEventListener("click", () => {
    editPanel.classList.add("hidden");
});

editItemForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!selectedItemId) {
        return;
    }

    const item = items.find((currentItem) => currentItem.id === selectedItemId);

    if (!item) {
        return;
    }

    const category = editItemCategory.value;
    const cleanName = editItemName.value.trim();
    const cleanItemTags = cleanTags(editItemTags.value);

    if (!cleanName || !cleanItemTags) {
        return;
    }

    item.name = cleanName;
    item.price = Number(editItemPrice.value);
    item.category = category;
    item.tags = cleanItemTags;
    item.image = await getImageValue(editItemImageFile.files[0], editItemImage.value.trim(), category, item.image);

    saveItems();
    editPanel.classList.add("hidden");
    editItemForm.reset();
    renderItemPage(selectedItemId);
});

function renderItems() {
    const visibleItems = getVisibleItems();

    resultCount.textContent = `${visibleItems.length} item(s) shown`;
    emptyState.classList.toggle("hidden", visibleItems.length > 0);
    itemsGrid.innerHTML = visibleItems.map((item) => createItemCard(item)).join("");
    bindCardClicks(itemsGrid);
    bindImageFallbacks(itemsGrid);
}

function getVisibleItems() {
    const query = cleanTags(searchInput.value);

    let visibleItems = items.filter((item) => {
        const categoryMatch = activeCategory === "All" || item.category === activeCategory;
        const searchableText = cleanTags(`${item.name} ${item.category} ${item.tags}`);
        const searchMatch = !query || searchableText.includes(query);
        return categoryMatch && searchMatch;
    });

    if (sortSelect.value === "price-low") {
        visibleItems = [...visibleItems].sort((a, b) => a.price - b.price);
    } else if (sortSelect.value === "price-high") {
        visibleItems = [...visibleItems].sort((a, b) => b.price - a.price);
    } else if (sortSelect.value === "name") {
        visibleItems = [...visibleItems].sort((a, b) => a.name.localeCompare(b.name));
    }

    return visibleItems;
}

function openItemPage(itemId) {
    window.location.hash = `item-${itemId}`;
}

function handleRoute() {
    const itemId = getItemIdFromHash();

    if (itemId) {
        renderItemPage(itemId);
        return;
    }

    selectedItemId = null;
    browseView.classList.remove("hidden");
    detailView.classList.add("hidden");
    renderItems();
}

function getItemIdFromHash() {
    const match = window.location.hash.match(/^#item-(\d+)$/);
    return match ? Number(match[1]) : null;
}

function goToBrowseView() {
    if (window.location.hash) {
        window.location.hash = "";
    } else {
        handleRoute();
    }
}

function renderItemPage(itemId) {
    selectedItemId = itemId;
    const selectedItem = items.find((item) => item.id === itemId);

    if (!selectedItem) {
        goToBrowseView();
        return;
    }

    const recommendedItems = getRecommendations(itemId, 3);

    browseView.classList.add("hidden");
    detailView.classList.remove("hidden");
    detailShell.innerHTML = createDetailPage(selectedItem);
    detailShell.querySelector("#editItemBtn").addEventListener("click", () => {
        openEditForm(selectedItem);
    });
    bindImageFallbacks(detailShell);

    selectedTitle.textContent = `More like ${selectedItem.name}`;
    selectedTags.textContent = `Tags: ${selectedItem.tags}`;

    recommendationsGrid.innerHTML = recommendedItems.map(({ item, score }) => {
        return createItemCard(item, score);
    }).join("");
    bindCardClicks(recommendationsGrid);
    bindImageFallbacks(recommendationsGrid);

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function createDetailPage(item) {
    const tagHtml = tokenize(item.tags)
        .map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`)
        .join("");

    return `
        <article class="item-detail-card">
            <div class="detail-image-wrap">
                <img class="detail-image" src="${escapeAttribute(item.image)}" alt="${escapeAttribute(item.name)}" data-category="${escapeAttribute(item.category)}">
            </div>
            <div class="detail-content">
                <span class="category" data-category="${escapeAttribute(item.category)}">${escapeHtml(item.category)}</span>
                <h2>${escapeHtml(item.name)}</h2>
                <p class="detail-price">Rs. ${Number(item.price).toLocaleString("en-IN")}</p>
                <div class="detail-tags">${tagHtml}</div>
                <button class="primary-button detail-edit-button" id="editItemBtn" type="button">Edit Item</button>
            </div>
        </article>
    `;
}

function openEditForm(item) {
    editItemName.value = item.name;
    editItemPrice.value = item.price;
    editItemCategory.value = item.category;
    editItemImage.value = item.image.startsWith("data:image/svg+xml") ? "" : item.image;
    editItemImageFile.value = "";
    editItemTags.value = item.tags;
    editPanel.classList.remove("hidden");
    editItemName.focus();
}

async function getImageValue(file, textValue, category, existingImage = "") {
    if (file) {
        return readImageAsDataUrl(file);
    }

    if (textValue) {
        return textValue;
    }

    return existingImage || placeholderImages[category];
}

function readImageAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Could not read the selected image."));
        reader.readAsDataURL(file);
    });
}

function bindCardClicks(container) {
    container.querySelectorAll(".card[data-id]").forEach((card) => {
        card.addEventListener("click", () => {
            const itemId = Number(card.dataset.id);
            openItemPage(itemId);
        });

        card.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                const itemId = Number(card.dataset.id);
                openItemPage(itemId);
            }
        });
    });
}

function bindImageFallbacks(container) {
    container.querySelectorAll("img[data-category]").forEach((image) => {
        image.addEventListener("error", () => {
            image.src = placeholderImages[image.dataset.category] || placeholderImages.Others;
        });
    });
}

function createItemCard(item, score = null) {
    const selectedClass = item.id === selectedItemId ? " selected" : "";
    const tagHtml = tokenize(item.tags)
        .map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`)
        .join("");
    const scoreHtml = score === null
        ? ""
        : `<div class="score">Similarity Score: ${score.toFixed(3)}</div>`;

    return `
        <article class="card${selectedClass}" data-id="${item.id}" tabindex="0" role="button" aria-label="Show recommendations for ${escapeHtml(item.name)}">
            <img class="item-img" src="${escapeAttribute(item.image)}" alt="${escapeAttribute(item.name)}" data-category="${escapeAttribute(item.category)}">
            <div class="card-body">
                <h3>${escapeHtml(item.name)}</h3>
                <div class="meta-row">
                    <span class="category" data-category="${escapeAttribute(item.category)}">${escapeHtml(item.category)}</span>
                    <span class="price">Rs. ${Number(item.price).toLocaleString("en-IN")}</span>
                </div>
                <div class="tag-box">${tagHtml}</div>
                ${scoreHtml}
            </div>
        </article>
    `;
}

function getRecommendations(selectedId, limit) {
    const selectedIndex = items.findIndex((item) => item.id === selectedId);
    const vectors = buildTfidfVectors(items);
    const selectedVector = vectors[selectedIndex];

    return items
        .map((item, index) => ({
            item,
            score: cosineSimilarity(selectedVector, vectors[index])
        }))
        .filter((result) => result.item.id !== selectedId)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}

function buildTfidfVectors(dataset) {
    const documents = dataset.map((item) => tokenize(item.tags));
    const vocabulary = [...new Set(documents.flat())];
    const totalDocuments = documents.length;

    return documents.map((document) => {
        return vocabulary.map((term) => {
            const tf = termFrequency(term, document);
            const idf = inverseDocumentFrequency(term, documents, totalDocuments);
            return tf * idf;
        });
    });
}

function termFrequency(term, document) {
    if (document.length === 0) {
        return 0;
    }

    const count = document.filter((word) => word === term).length;
    return count / document.length;
}

function inverseDocumentFrequency(term, documents, totalDocuments) {
    const documentsWithTerm = documents.filter((document) => {
        return document.includes(term);
    }).length;

    if (documentsWithTerm === 0) {
        return 0;
    }

    return Math.log(totalDocuments / documentsWithTerm);
}

function cosineSimilarity(vectorA, vectorB) {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vectorA.length; i++) {
        dotProduct += vectorA[i] * vectorB[i];
        magnitudeA += vectorA[i] * vectorA[i];
        magnitudeB += vectorB[i] * vectorB[i];
    }

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

function tokenize(text) {
    return cleanTags(text).split(" ").filter(Boolean);
}

function cleanTags(text) {
    return String(text)
        .toLowerCase()
        .replace(/#/g, "")
        .replace(/[^a-z0-9 ]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function loadItems() {
    try {
        const savedItems = localStorage.getItem(STORAGE_KEY);
        return savedItems ? JSON.parse(savedItems) : cloneDefaultItems();
    } catch (error) {
        return cloneDefaultItems();
    }
}

function saveItems() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function cloneDefaultItems() {
    return defaultItems.map((item) => ({ ...item }));
}

function updateActiveFilter() {
    document.querySelectorAll(".filter-btn").forEach((button) => {
        button.classList.toggle("active", button.dataset.category === activeCategory);
    });
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
}

function svgImage(color, background, label) {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240">
            <rect width="400" height="240" fill="${background}"/>
            <rect x="64" y="44" width="272" height="152" rx="18" fill="${color}" opacity="0.92"/>
            <circle cx="108" cy="88" r="18" fill="white" opacity="0.9"/>
            <path d="M90 152 H310" stroke="white" stroke-width="14" stroke-linecap="round" opacity="0.9"/>
            <path d="M90 122 H250" stroke="white" stroke-width="12" stroke-linecap="round" opacity="0.7"/>
            <text x="200" y="101" text-anchor="middle" fill="white" font-family="Arial" font-size="38" font-weight="700">${label}</text>
        </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
