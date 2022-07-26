// Get campaigin from server
async function getCampaign() {
    const fetchCampaign = await fetch("/api/1.0/marketing/campaigns", {
        method: "GET",
    });
    const campaign = await fetchCampaign.json();
    const campaignData = campaign.data[0];

    // Create img tag
    const campaignPicture = document.createElement("img");
    campaignPicture.src = campaignData.picture;
    campaignPicture.id = "campaign-img";
    const campaignStory = document.createElement("div");
    campaignStory.id = "campaign-story";

    // Append story segement to story
    for (const sentence of campaignData.story.split(" ")) {
        if (sentence.length === 0) {
            continue;
        }
        const sentenceElement = document.createElement("div");
        sentenceElement.innerHTML = sentence;
        campaignStory.appendChild(sentenceElement);
    }

    // append img tag to campaigin div
    const campaignDiv = document.getElementById("campaign-container");
    campaignDiv.appendChild(campaignPicture);
    campaignDiv.appendChild(campaignStory);
}

async function getProducts(category) {
    const fetchProducts = await fetch(`/api/1.0/products/${category}`, {
        method: "GET",
    });
    const products = await fetchProducts.json();
    const productsData = products.data;
    const productContainer = document.getElementById("product-container");
    for (const product of productsData) {
        // console.log(product);
        const productDiv = document.createElement("div");
        const productColors = document.createElement("div");
        const productLink = document.createElement("a");
        const productImage = document.createElement("img");
        const productTitle = document.createElement("div");
        const productPrice = document.createElement("div");
        productLink.href = `product.html?id=${product.id}`;
        productColors.id = "product-colors";
        productImage.src = product.main_image;
        productImage.id = "product-img";
        // Generate product colors
        for (const color of product.colors) {
            const productColor = document.createElement("div");
            productColor.style.backgroundColor = color.code;
            productColor.id = "product-color";
            // productColor.innerHTML = color;
            // console.log(color.code);
            productColors.appendChild(productColor);
        }
        productTitle.innerHTML = product.title;
        productPrice.innerHTML = `TWD. ${product.price}`;

        productLink.appendChild(productImage);
        productDiv.appendChild(productLink);
        productDiv.appendChild(productColors);
        productDiv.appendChild(productTitle);
        productDiv.appendChild(productPrice);
        productContainer.appendChild(productDiv);
    }
}

// Render campaign
getCampaign();

// Add event listener to search input
// const searchInput = document.getElementById("search-input");
// searchInput.addEventListener("keypress", function (event) {
//     // If the user presses the "Enter" key on the keyboard
//     if (event.key === "Enter") {
//         const val = searchInput.value;
//         // console.log(val);
//         window.location.href = `index.html?tag=${val}`;
//     }
// });

// Render products
const urlParams = new URLSearchParams(window.location.search);
const categoryTag = urlParams.get("tag");
const searchTag = urlParams.get("search");
let productType;
if (searchTag) {
    productType = `search?keyword=${searchTag}`;
} else if (!categoryTag) {
    productType = "all";
} else {
    productType = categoryTag;
}
getProducts(productType);
