const rgb2hex = (rgb) =>
  `#${rgb
    .match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
    .slice(1)
    .map((n) => parseInt(n, 10).toString(16).padStart(2, "0"))
    .join("")}`;

const renderColorBoxes = (colors) => {
  const colorBoxes = document.createElement("div");
  colorBoxes.id = "product-color-boxes";
  for (const color of colors) {
    const productColor = document.createElement("button");
    productColor.style.backgroundColor = color.code;
    productColor.className = "product-color-box";
    colorBoxes.appendChild(productColor);
  }
  return colorBoxes;
};

const renderSizesCircle = (sizes) => {
  const sizeCirclesDiv = document.createElement("div");
  sizeCirclesDiv.id = "product-size-circles";
  for (const size of sizes) {
    const productSizeDiv = document.createElement("button");
    productSizeDiv.innerHTML = size;
    productSizeDiv.className = "product-size-circle";
    sizeCirclesDiv.appendChild(productSizeDiv);
  }
  return sizeCirclesDiv;
};

const renderQuantityButton = () => {
  const quantityDiv = document.createElement("div");
  quantityDiv.id = "quantity-div";
  const minusButton = document.createElement("button");
  const quantitySpan = document.createElement("span");
  const plusButton = document.createElement("button");
  minusButton.innerHTML = "-";
  minusButton.classList = "quantity-button";
  minusButton.id = "quantity-minus-button";
  quantitySpan.innerHTML = 1;
  quantitySpan.id = "quantity-span";
  plusButton.innerHTML = "+";
  plusButton.classList = "quantity-button";
  plusButton.id = "quantity-plus-button";
  quantityDiv.appendChild(minusButton);
  quantityDiv.appendChild(quantitySpan);
  quantityDiv.appendChild(plusButton);
  return quantityDiv;
};

// Change border color of color box
const changeColorBoxBorderColor = (event) => {
  const colorBoxes = document.getElementsByClassName("product-color-box");
  for (const colorBox of colorBoxes) {
    colorBox.className = "product-color-box";
  }
  event.target.classList.add("product-color-box-select");
  const color = rgb2hex(event.target.style.backgroundColor).toUpperCase();
  currentColor = color;
  // Disable the button which does not in the colorCodeSize map
  const sizeCircles = document.getElementsByClassName("product-size-circle");
  for (const sizeCircle of sizeCircles) {
    const size = sizeCircle.innerHTML;
    if (!colorCodeSize[color].includes(size)) {
      // Handle the situation that the current size is diabeled
      if (sizeCircle.innerHTML === size) {
        sizeCircle.className = "product-size-circle";
      }
      sizeCircle.disabled = true;
    } else {
      sizeCircle.disabled = false;
    }
  }
};

// Change background and text color of size circle
const changeCircleColor = (event) => {
  const size = event.target.innerHTML;
  currentSize = size;
  currentStock = variantStock[[currentColor, currentSize]];
  // If current Quantity is greater than currentStock, set the quantity to currentStock
  const quantitySpan = document.getElementById("quantity-span");
  if (parseInt(quantitySpan.innerHTML) > currentStock) {
    quantitySpan.innerHTML = currentStock;
  }
  const sizeCircles = document.getElementsByClassName("product-size-circle");
  for (const sizeCircle of sizeCircles) {
    sizeCircle.className = "product-size-circle";
  }
  event.target.classList.add("product-size-circle-select");
};

// Change the quantity
const modifyQuantity = (event) => {
  const quantitySpan = document.getElementById("quantity-span");
  // const currentStock = document.getElementById("currentStock").textContent;
  if (event.target.getAttribute("id") === "quantity-plus-button") {
    const currentQuantity = parseInt(quantitySpan.innerHTML);
    if (currentQuantity < currentStock) {
      quantitySpan.innerHTML = currentQuantity + 1;
    }
  } else {
    const currentQuantity = parseInt(quantitySpan.innerHTML);
    if (currentQuantity > 1) {
      quantitySpan.innerHTML = parseInt(quantitySpan.innerHTML) - 1;
    }
  }
};

const renderCheckout = () => {
  const checkoutDiv = document.createElement("div");
  checkoutDiv.innerHTML = `
        <div class="h4">Credit Card Information</div>
        <div class="tpfield form-control" id="card-number"></div>
        <div class="tpfield form-control" id="card-expiration-date"></div>
        <div class="tpfield form-control" id="card-ccv"></div>
        <input class="btn btn-dark" id="pay-button" type="submit" value="Pay" />
    `;

  return checkoutDiv;
};

const renderNotFoundPage = () => {
  const title = document.createElement("h1");
  title.innerText = "No product found";
  document.getElementById("top-container").appendChild(title);
};

async function getProduct(productId) {
  const fetchProduct = await fetch(
    `/api/1.0/products/details?id=${productId}`,
    {
      method: "GET",
    }
  );
  const product = await fetchProduct.json();
  if (!product.data) {
    return renderNotFoundPage();
  }
  const productData = product.data;

  // Create variant hash map
  // Create color code size hash map
  for (const variant of productData.variants) {
    const codeSizePair = [variant.color_code, variant.size];
    const stock = variant.stock;
    variantStock[codeSizePair] = stock;
    if (!colorCodeSize[variant.color_code]) {
      colorCodeSize[variant.color_code] = [variant.size];
    } else {
      colorCodeSize[variant.color_code].push(variant.size);
    }
  }
  currentColor = productData.variants[0].color_code;
  currentSize = productData.variants[0].size;
  currentStock = variantStock[[currentColor, currentSize]];

  // Create color code name hash map
  for (const color of productData.colors) {
    colorCodeNameMap[color.code] = color.name;
  }

  // Render product main image
  const topContainer = document.getElementById("top-container");
  const productMainImageDiv = document.createElement("div");
  const productMainImage = document.createElement("img");
  productMainImage.src = productData.main_image;
  productMainImageDiv.appendChild(productMainImage);
  topContainer.appendChild(productMainImageDiv);

  // Render product detail
  const productDetailDiv = document.createElement("div");
  const productTitleDiv = document.createElement("div");
  const productIdDiv = document.createElement("div");
  const productPriceDiv = document.createElement("div");
  const hrSeperator = document.createElement("hr");
  const productColorDiv = document.createElement("div");
  const productSizeDiv = document.createElement("div");
  const productQuantityDiv = document.createElement("div");
  const productDescriptionDiv = document.createElement("div");
  const productTextureDiv = document.createElement("div");
  const productNoteDiv = document.createElement("div");
  const productPlaceDiv = document.createElement("div");
  const productWash = document.createElement("div");
  productTitleDiv.innerHTML = productData.title;
  productTitleDiv.id = "product-title";
  productTitleDiv.classList.add("h2");
  productIdDiv.innerHTML = productId;
  productIdDiv.id = "product-id";
  productPriceDiv.innerHTML = `TWD.${productData.price}`;
  productPriceDiv.id = "product-price";
  productPriceDiv.classList.add("h3");
  productColorDiv.innerHTML = "顏色 | ";
  productColorDiv.id = "product-color";
  productSizeDiv.innerHTML = "尺寸 | ";
  productSizeDiv.id = "product-size";
  productQuantityDiv.innerHTML = "數量 | ";
  productQuantityDiv.id = "product-quantity";
  productDescriptionDiv.innerHTML = productData.description;
  productTextureDiv.innerHTML = productData.texture;
  productNoteDiv.innerHTML = productData.note;
  productPlaceDiv.innerHTML = productData.place;
  productWash.innerHTML = productData.wash;

  // Render and append product color boxes to product-color div
  const productColorBoxes = renderColorBoxes(productData.colors);
  productColorDiv.appendChild(productColorBoxes);

  // Render and append product sizes to product-sizes div
  const productSizes = renderSizesCircle(productData.sizes);
  productSizeDiv.appendChild(productSizes);

  // Render and append quantity button to product-quantity div
  productQuantityDiv.appendChild(renderQuantityButton());

  const productDivs = [
    productTitleDiv,
    productIdDiv,
    productPriceDiv,
    hrSeperator,
    productColorDiv,
    productSizeDiv,
    productQuantityDiv,
    productDescriptionDiv,
    productTextureDiv,
    productNoteDiv,
    productWash,
    productPlaceDiv,
    renderCheckout(),
  ];

  productDivs.map((div) => {
    productDetailDiv.appendChild(div);
  });
  productDetailDiv.id = "product-detail";

  topContainer.appendChild(productDetailDiv);

  // Render seperator
  const bottomContainer = document.getElementById("bottom-container");
  const seperatorDiv = document.createElement("div");
  seperatorDiv.innerHTML = "更多產品資訊";
  bottomContainer.appendChild(seperatorDiv);

  // Render story and images
  const storyDiv = document.createElement("div");
  storyDiv.innerHTML = productData.story;
  bottomContainer.appendChild(storyDiv);
  for (let i = 0; i < productData.images.length; i++) {
    const image = document.createElement("img");
    image.src = productData.images[i];
    image.className = "bottom-container-image";
    bottomContainer.appendChild(image);
  }

  // Initialize border color of the current color box to black
  const colorBoxes = document.getElementsByClassName("product-color-box");
  for (let i = 0; i < colorBoxes.length; i++) {
    const curBox = colorBoxes[i];
    curBox.addEventListener("click", changeColorBoxBorderColor);
    const colorCode = rgb2hex(curBox.style.backgroundColor).toUpperCase();
    if (colorCode === currentColor) {
      curBox.classList.add("product-color-box-select");
    }
  }

  // Disable size circle if it is not available
  const sizeCircles = document.getElementsByClassName("product-size-circle");
  for (const sizeCircle of sizeCircles) {
    const size = sizeCircle.innerHTML;
    if (!colorCodeSize[currentColor].includes(size)) {
      sizeCircle.disabled = true;
    }
  }

  // Initialize background color of current size circle to black
  for (let i = 0; i < sizeCircles.length; i++) {
    const curSizeCircle = sizeCircles[i];
    curSizeCircle.addEventListener("click", changeCircleColor);
    if (curSizeCircle.innerHTML === currentSize) {
      curSizeCircle.classList.add("product-size-circle-select");
    }
  }

  // Initialize border color of size circle
  const plusButton = document.getElementById("quantity-plus-button");
  const minusButton = document.getElementById("quantity-minus-button");
  plusButton.addEventListener("click", modifyQuantity);
  minusButton.addEventListener("click", modifyQuantity);

  setupCardField();
  addCardUpdateMonitor();
  addPayButtonListener();
}

const fetchProfile = async (headers) => {
  try {
    const response = await fetch("/api/1.0/user/profile", {
      method: "GET",
      headers,
    });
    const result = await response.json();
    console.log(result);
    return result;
  } catch (error) {
    console.log(error);
  }
};

async function onPay(event) {
  event.preventDefault();
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    alert("Please login first");
    return (location = "profile.html");
  } else {
    console.log("Found access token. Checking now");
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };
    fetchProfile(headers)
      .then((result) => {
        if (!result.data) {
          alert("Please login first");
          return (location = "/profile.html");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // Get status of fields
  const tappayStatus = TPDirect.card.getTappayFieldsStatus();
  console.log(tappayStatus);

  // Check if current status can get prime from Tap Pay
  if (tappayStatus.canGetPrime === false) {
    alert("Cannot get prime from Tap Pay.");
    return;
  }

  // Get prime
  const getPrime = () => {
    return new Promise((resolve, reject) => {
      TPDirect.card.getPrime((result) => {
        if (result.status !== 0) {
          alert("get prime error " + result.msg);
          return;
        }
        return resolve(result.card.prime);
      });
    });
  };
  const prime = await getPrime();

  // Send prime along with other information to server
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };

  const { id, name, price, colorCode, size, qty } = getCurrentProductInfo();
  const orderTotal = parseInt(price) * parseInt(qty);

  const checkoutBody = {
    prime,
    order: {
      shipping: "delivery",
      payment: "credit_card",
      subtotal: "100",
      freight: "23",
      total: orderTotal,
      recipient: {
        name: "ABC",
        phone: "0912345678",
        email: "test@test.com",
        address: "Post Address",
        time: "morning",
      },
    },
    list: [
      {
        id,
        name,
        price,
        color: {
          name: colorCodeNameMap[colorCode],
          code: colorCode,
        },
        size,
        qty,
      },
    ],
  };
  // console.log(checkoutBody);
  const orderCheckout = await fetch("/api/1.0/order/checkout", {
    method: "POST",
    headers: headers,
    body: JSON.stringify(checkoutBody),
  });
  const orderCheckoutResult = await orderCheckout.json();
  const orderId = orderCheckoutResult.data.number;

  if (orderCheckout.ok) {
    alert(`Order ${orderId} checkout successfully.`);
    location = "thankyou.html";
  } else {
    alert("Order checkout failed");
  }
}

const setupCardField = () => {
  const APP_ID = "12348";
  const APP_KEY =
    "app_pa1pQcKoY22IlnSXq5m5WP5jFKzoRG58VEXpT7wU62ud7mMbDOGzCYIlzzLF";
  const SERVER_TYPE = "sandbox";
  TPDirect.setupSDK(APP_ID, APP_KEY, SERVER_TYPE);
  TPDirect.card.setup({
    fields: {
      number: {
        element: "#card-number",
        placeholder: "Card number",
      },
      expirationDate: {
        element: document.getElementById("card-expiration-date"),
        placeholder: "Expiry date (MM / YY)",
      },
      ccv: {
        element: "#card-ccv",
        placeholder: "CVC / CVV",
      },
    },
    styles: {
      input: { color: "gray" },
      "input.ccv": { "font-size": "16px" },
      "input.expiration-date": { "font-size": "16px" },
      "input.card-number": { "font-size": "16px" },
      ":focus": { color: "black" },
      ".valid": { color: "blue" },
      ".invalid": { color: "red" },
      "@media screen and (max-width: 400px)": {
        input: {
          color: "orange",
        },
      },
    },
  });
};

const addCardUpdateMonitor = () => {
  TPDirect.card.onUpdate(function (update) {
    const payButton = document.getElementById("pay-button");
    if (update.canGetPrime) {
      // Enable submit Button to get prime.
      payButton.removeAttribute("disabled");
    } else {
      // Disable submit Button to get prime.
      payButton.setAttribute("disabled", true);
    }
  });
};

const addPayButtonListener = () => {
  const payButton = document.getElementById("pay-button");
  payButton.setAttribute("disabled", true);
  payButton.addEventListener("click", onPay);
};

const getCurrentProductInfo = () => {
  const id = document.getElementById("product-id").innerText;
  const name = document.getElementById("product-title").innerText;
  const price = document
    .getElementById("product-price")
    .innerText.split(".")[1];
  const size = document.getElementsByClassName("product-size-circle-select")[0]
    .innerText;
  const qty = document.getElementById("quantity-span").innerText;
  const result = {
    id,
    name,
    price,
    colorCode: currentColor,
    size,
    qty,
  };
  return result;
};

// Render product detail
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");
let variantStock = {};
let colorCodeSize = {};
let colorCodeNameMap = {};
let currentColor, currentSize, currentStock;
getProduct(productId);
