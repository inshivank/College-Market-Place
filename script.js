const STORAGE_KEY = "collegeMarketplaceItems";
const PROFILE_KEY = "collegeMarketplaceProfile";
const WISHLIST_KEY = "collegeMarketplaceWishlist";
const RECENT_KEY = "collegeMarketplaceRecent";
const KNN_NEIGHBORS = 8;

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
let wishlistIds = loadIdList(WISHLIST_KEY);
let recentlyViewedIds = loadIdList(RECENT_KEY);
let userProfile = loadProfile();

const itemsGrid = document.getElementById("itemsGrid");
const recommendationsGrid = document.getElementById("recommendationsGrid");
const selectedTitle = document.getElementById("selectedTitle");
const selectedTags = document.getElementById("selectedTags");
const resultCount = document.getElementById("resultCount");
const addPanel = document.getElementById("addPanel");
const addItemForm = document.getElementById("addItemForm");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const minPriceInput = document.getElementById("minPriceInput");
const maxPriceInput = document.getElementById("maxPriceInput");
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
const editItemSeller = document.getElementById("editItemSeller");
const editItemSellerEmail = document.getElementById("editItemSellerEmail");
const editItemSellerPhone = document.getElementById("editItemSellerPhone");
const profileName = document.getElementById("profileName");
const profileRoll = document.getElementById("profileRoll");
const profileStatus = document.getElementById("profileStatus");
const wishlistList = document.getElementById("wishlistList");
const recentList = document.getElementById("recentList");

profileName.value = userProfile.name || "";
profileRoll.value = userProfile.roll || "";
updateProfileStatus();

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
    localStorage.removeItem(WISHLIST_KEY);
    localStorage.removeItem(RECENT_KEY);
    items = cloneDefaultItems();
    wishlistIds = [];
    recentlyViewedIds = [];
    selectedItemId = null;
    searchInput.value = "";
    minPriceInput.value = "";
    maxPriceInput.value = "";
    sortSelect.value = "default";
    activeCategory = "All";
    updateActiveFilter();
    goToBrowseView();
    renderItems();
    renderSideLists();
});

searchInput.addEventListener("input", () => {
    selectedItemId = null;
    goToBrowseView();
    renderItems();
});

sortSelect.addEventListener("change", renderItems);
minPriceInput.addEventListener("input", renderItems);
maxPriceInput.addEventListener("input", renderItems);

document.getElementById("saveProfileBtn").addEventListener("click", () => {
    userProfile = {
        name: profileName.value.trim(),
        roll: profileRoll.value.trim()
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(userProfile));
    updateProfileStatus();
});

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
    const seller = document.getElementById("itemSeller").value.trim() || userProfile.name || "Campus Seller";
    const sellerEmail = document.getElementById("itemSellerEmail").value.trim();
    const sellerPhone = document.getElementById("itemSellerPhone").value.trim();

    if (!cleanName || !cleanItemTags) {
        return;
    }

    const newItem = {
        id: Date.now(),
        name: cleanName,
        category,
        price: Number(document.getElementById("itemPrice").value),
        tags: cleanItemTags,
        image: await getImageValue(imageFile, imageInput, category),
        seller,
        sellerEmail,
        sellerPhone
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
renderSideLists();

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
    item.seller = editItemSeller.value.trim() || "Campus Seller";
    item.sellerEmail = editItemSellerEmail.value.trim();
    item.sellerPhone = editItemSellerPhone.value.trim();

    saveItems();
    editPanel.classList.add("hidden");
    editItemForm.reset();
    renderItemPage(selectedItemId);
    renderSideLists();
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
    const minPrice = Number(minPriceInput.value) || 0;
    const maxPrice = maxPriceInput.value === "" ? Infinity : Number(maxPriceInput.value);

    let visibleItems = items.filter((item) => {
        const categoryMatch = activeCategory === "All" || item.category === activeCategory;
        const searchableText = cleanTags(`${item.name} ${item.category} ${item.tags}`);
        const searchMatch = !query || searchableText.includes(query);
        const priceMatch = Number(item.price) >= minPrice && Number(item.price) <= maxPrice;
        return categoryMatch && searchMatch && priceMatch;
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

    const recommendedItems = getRecommendations(itemId, KNN_NEIGHBORS);

    addRecentlyViewed(itemId);
    browseView.classList.add("hidden");
    detailView.classList.remove("hidden");
    detailShell.innerHTML = createDetailPage(selectedItem);
    detailShell.querySelector("#editItemBtn").addEventListener("click", () => {
        openEditForm(selectedItem);
    });
    detailShell.querySelector("#deleteItemBtn").addEventListener("click", () => {
        deleteItem(selectedItem.id);
    });
    detailShell.querySelector("#detailWishlistBtn").addEventListener("click", () => {
        toggleWishlist(selectedItem.id);
        renderItemPage(selectedItem.id);
    });
    bindImageFallbacks(detailShell);

    selectedTitle.textContent = `More like ${selectedItem.name}`;
    selectedTags.textContent = `Tags: ${selectedItem.tags}`;

    recommendationsGrid.innerHTML = recommendedItems.map(({ item, score, matchingTags }) => {
        return createItemCard(item, score, matchingTags);
    }).join("");
    bindCardClicks(recommendationsGrid);
    bindImageFallbacks(recommendationsGrid);

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function createDetailPage(item) {
    const tagHtml = tokenize(item.tags)
        .map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`)
        .join("");

    const isWishlisted = wishlistIds.includes(item.id);
    const seller = item.seller || "Campus Seller";
    const sellerEmail = item.sellerEmail || "Not provided";
    const sellerPhone = item.sellerPhone || "";
    const whatsappHref = createWhatsAppHref(sellerPhone, item);

    return `
        <article class="item-detail-card">
            <div class="detail-image-wrap">
                <img class="detail-image" src="${escapeAttribute(item.image)}" alt="${escapeAttribute(item.name)}" data-category="${escapeAttribute(item.category)}">
            </div>
            <div class="detail-content">
                <span class="category" data-category="${escapeAttribute(item.category)}">${escapeHtml(item.category)}</span>
                <h2>${escapeHtml(item.name)}</h2>
                <p class="detail-price">Rs. ${Number(item.price).toLocaleString("en-IN")}</p>
                <div class="seller-box">
                    <p><strong>Seller:</strong> ${escapeHtml(seller)}</p>
                    <p><strong>Email:</strong> ${escapeHtml(sellerEmail)}</p>
                    <p><strong>Phone:</strong> ${escapeHtml(sellerPhone || "Not provided")}</p>
                </div>
                <div class="detail-tags">${tagHtml}</div>
                <div class="detail-actions">
                    <button class="primary-button detail-edit-button" id="editItemBtn" type="button">Edit Item</button>
                    <button class="secondary-button" id="detailWishlistBtn" type="button">${isWishlisted ? "Remove Wishlist" : "Add Wishlist"}</button>
                    <button class="danger-button" id="deleteItemBtn" type="button">Delete Item</button>
                    ${whatsappHref ? `<a class="contact-button" href="${escapeAttribute(whatsappHref)}" target="_blank" rel="noopener">Contact Seller</a>` : ""}
                </div>
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
    editItemSeller.value = item.seller || "";
    editItemSellerEmail.value = item.sellerEmail || "";
    editItemSellerPhone.value = item.sellerPhone || "";
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

    container.querySelectorAll(".wishlist-card-btn").forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            toggleWishlist(Number(button.dataset.id));
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

function createItemCard(item, score = null, matchingTags = []) {
    const selectedClass = item.id === selectedItemId ? " selected" : "";
    const tagHtml = tokenize(item.tags)
        .map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`)
        .join("");
    const matchingTagsHtml = matchingTags.length === 0
        ? ""
        : `
            <div class="match-box">
                <strong>Matched Tags</strong>
                <div>${matchingTags.map((tag) => `<span>#${escapeHtml(tag)}</span>`).join("")}</div>
            </div>
        `;
    const scoreHtml = score === null
        ? ""
        : `<div class="score">Similarity: ${Math.round(score * 100)}%</div>`;
    const wishlistText = wishlistIds.includes(item.id) ? "Saved" : "Wishlist";

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
                <button class="wishlist-card-btn" data-id="${item.id}" type="button">${wishlistText}</button>
                ${scoreHtml}
                ${matchingTagsHtml}
            </div>
        </article>
    `;
}

function getRecommendations(selectedId, limit) {
    return getRecommendationsFromModel(items, selectedId, limit);
}

function toggleWishlist(itemId) {
    if (wishlistIds.includes(itemId)) {
        wishlistIds = wishlistIds.filter((id) => id !== itemId);
    } else {
        wishlistIds = [itemId, ...wishlistIds];
    }

    saveIdList(WISHLIST_KEY, wishlistIds);
    renderItems();
    renderSideLists();
}

function addRecentlyViewed(itemId) {
    recentlyViewedIds = [itemId, ...recentlyViewedIds.filter((id) => id !== itemId)].slice(0, 6);
    saveIdList(RECENT_KEY, recentlyViewedIds);
    renderSideLists();
}

function deleteItem(itemId) {
    const item = items.find((currentItem) => currentItem.id === itemId);

    if (!item || !confirm(`Delete ${item.name}?`)) {
        return;
    }

    items = items.filter((currentItem) => currentItem.id !== itemId);
    wishlistIds = wishlistIds.filter((id) => id !== itemId);
    recentlyViewedIds = recentlyViewedIds.filter((id) => id !== itemId);
    saveItems();
    saveIdList(WISHLIST_KEY, wishlistIds);
    saveIdList(RECENT_KEY, recentlyViewedIds);
    goToBrowseView();
    renderSideLists();
}

function renderSideLists() {
    renderSideList(wishlistList, wishlistIds, "No saved items yet.");
    renderSideList(recentList, recentlyViewedIds, "No recent items yet.");
}

function renderSideList(container, ids, emptyText) {
    const listItems = ids
        .map((id) => items.find((item) => item.id === id))
        .filter(Boolean);

    if (listItems.length === 0) {
        container.innerHTML = `<p>${emptyText}</p>`;
        return;
    }

    container.innerHTML = listItems.map((item) => {
        return `<button type="button" data-id="${item.id}">${escapeHtml(item.name)}<span>Rs. ${Number(item.price).toLocaleString("en-IN")}</span></button>`;
    }).join("");

    container.querySelectorAll("button[data-id]").forEach((button) => {
        button.addEventListener("click", () => {
            openItemPage(Number(button.dataset.id));
        });
    });
}

function createWhatsAppHref(phone, item) {
    const cleanPhone = String(phone || "").replace(/\D/g, "");

    if (!cleanPhone) {
        return "";
    }

    const message = `Hi, I am interested in your ${item.name} listed on College Marketplace.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
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
        return savedItems ? JSON.parse(savedItems).map(normalizeItem) : cloneDefaultItems();
    } catch (error) {
        return cloneDefaultItems();
    }
}

function loadProfile() {
    try {
        const savedProfile = localStorage.getItem(PROFILE_KEY);
        return savedProfile ? JSON.parse(savedProfile) : {};
    } catch (error) {
        return {};
    }
}

function updateProfileStatus() {
    if (userProfile.name || userProfile.roll) {
        profileStatus.textContent = `${userProfile.name || "Student"}${userProfile.roll ? ` (${userProfile.roll})` : ""}`;
    } else {
        profileStatus.textContent = "Not saved yet";
    }
}

function loadIdList(key) {
    try {
        const savedIds = localStorage.getItem(key);
        return savedIds ? JSON.parse(savedIds) : [];
    } catch (error) {
        return [];
    }
}

function saveIdList(key, ids) {
    localStorage.setItem(key, JSON.stringify(ids));
}

function saveItems() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function cloneDefaultItems() {
    return defaultItems.map(normalizeItem);
}

function normalizeItem(item) {
    const legacyContact = item.contact || "";
    const legacyEmail = legacyContact.includes("@") ? legacyContact : "";
    const legacyPhone = legacyContact && !legacyContact.includes("@") ? legacyContact : "";

    return {
        seller: "Campus Seller",
        sellerEmail: legacyEmail || "seller@example.com",
        sellerPhone: legacyPhone || "919876543210",
        ...item,
        sellerEmail: item.sellerEmail || legacyEmail || "seller@example.com",
        sellerPhone: item.sellerPhone || legacyPhone || "919876543210"
    };
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
