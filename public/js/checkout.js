const APP_ID = "12348";
const APP_KEY =
    "app_pa1pQcKoY22IlnSXq5m5WP5jFKzoRG58VEXpT7wU62ud7mMbDOGzCYIlzzLF";
const SERVER_TYPE = "sandbox";
TPDirect.setupSDK(APP_ID, APP_KEY, SERVER_TYPE);
TPDirect.card.setup({
    // Display ccv field
    fields: {
        number: {
            // css selector
            element: "#card-number",
            placeholder: "Card number",
        },
        expirationDate: {
            // DOM object
            element: document.getElementById("card-expiration-date"),
            placeholder: "Expiry date (MM / YY)",
        },
        ccv: {
            element: "#card-ccv",
            placeholder: "CVC / CVV",
        },
    },
    styles: {
        // Style all elements
        input: {
            color: "gray",
        },
        // Styling ccv field
        "input.ccv": {
            "font-size": "16px",
        },
        // Styling expiration-date field
        "input.expiration-date": {
            "font-size": "16px",
        },
        // Styling card-number field
        "input.card-number": {
            "font-size": "16px",
        },
        // style focus state
        ":focus": {
            color: "black",
        },
        // style valid state
        ".valid": {
            color: "blue",
        },
        // style invalid state
        ".invalid": {
            color: "red",
        },
        // Media queries
        // Note that these apply to the iframe, not the root window.
        "@media screen and (max-width: 400px)": {
            input: {
                color: "orange",
            },
        },
    },
});

TPDirect.card.onUpdate(function (update) {
    // update.canGetPrime === true
    // --> you can call TPDirect.card.getPrime()
    // console.log(update.canGetPrime, update.status);
    if (update.canGetPrime && access_token) {
        // Enable submit Button to get prime.
        payButton.removeAttribute("disabled");
    } else {
        // Disable submit Button to get prime.
        payButton.setAttribute("disabled", true);
    }
});

async function onLogin(event) {
    // event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const provider = "native";
    const response = await fetch("/api/1.0/user/signin", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            provider,
            email,
            password,
        }),
    });
    if (response.status === 200) {
        const result = await response.json();
        access_token = result.data.access_token;
        const loginForm = document.getElementById("login-form");
        const successMessage = document.createElement("p");
        const loginTitle = document.getElementById("login-title");
        document.body.removeChild(loginForm);
        successMessage.textContent = "Login Successfull!";
        loginTitle.appendChild(successMessage);
    } else {
        alert("Login failed.");
    }
}

async function onPay(event) {
    event.preventDefault();
    console.log(access_token);

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
    // console.log(`Prime: ${prime}`);

    // Send prime along with other information to server
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
    };
    const checkoutBody = {
        prime,
        order: {
            shipping: "delivery",
            payment: "credit_card",
            subtotal: "100",
            freight: "23",
            total: "123",
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
                id: "1",
                name: "Product 1",
                price: "100",
                color: {
                    name: "red",
                    code: "#ff0000",
                },
                size: "M",
                qty: "1",
            },
            {
                id: "2",
                name: "Product 2",
                price: "200",
                color: {
                    name: "white",
                    code: "#ff0000",
                },
                size: "M",
                qty: "1",
            },
        ],
    };
    const orderCheckout = await fetch("/api/1.0/order/checkout", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(checkoutBody),
    });
    const orderCheckoutResult = await orderCheckout.json();
    // console.log(orderCheckoutResult.data);
    const orderId = orderCheckoutResult.data.number;

    if (orderCheckout.ok) {
        alert(`Order ${orderId} checkout successfully.`);
        location.reload();
    } else {
        alert("Order checkout failed");
    }
}

// Once user login successfully, get the token from the user
const loginButton = document.getElementById("login-button");
let access_token = "";
loginButton.addEventListener("click", onLogin);

// Once user click the pay button, call onPay function and send the prime to server
const payButton = document.getElementById("pay-button");
payButton.setAttribute("disabled", true);
payButton.addEventListener("click", onPay);
