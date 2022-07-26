// Fetch profile data
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
    renderLogin();
  }
};

// Render profile data
const renderProfile = async (profileData) => {
  const profileContainer = document.getElementById("profile-container");
  // Render name, email
  for (const content of ["name", "email"]) {
    const element = document.createElement("div");
    element.innerHTML = `${content.toUpperCase()}: ${profileData[content]}`;
    element.classList.add("h3");
    profileContainer.appendChild(element);
  }
  // Render picture
  const picture = document.createElement("img");
  picture.src = profileData.picture;
  picture.classList.add("profile-picture");
  profileContainer.appendChild(picture);

  // Render logout button
  const logoutButton = document.createElement("button");
  logoutButton.innerText = "Logout";
  logoutButton.id = "logout-button";
  logoutButton.classList.add("btn");
  logoutButton.classList.add("btn-dark");
  profileContainer.appendChild(logoutButton);
  logoutButton.addEventListener("click", () => {
    deleteAccesstoken();
    location.reload();
  });
};

// Render login form
const renderLogin = () => {
  const profileContainer = document.getElementById("profile-container");
  const loginDiv = document.createElement("div");
  const loginTitle = document.createElement("p");
  loginTitle.innerText = "Please sign in or sign up first to proceed.";
  loginTitle.classList.add("h2");
  loginDiv.id = "login-div";
  const loginForm = document.createElement("form");
  loginForm.id = "login-form";
  loginForm.enctype = "multipart/form-data";
  loginForm.innerHTML = `
        <br>
        <label for="name" class="form-label">Name</label>
        <input type="name" id="name" name="name" class="form-control" autofocus />
        <br>
        <label for="email">Email</label>
        <input type="email" id="email" name="email" class="form-control" />
        <br>
        <label for="password">Password</label>
        <input type="password" id="password" name="password" class="form-control"/>
        <br>
        <div>
        <button type="button" id="signup-button" class="btn btn-dark">Sign Up</button>
        <button type="button" id="signin-button" class="btn btn-dark">Sign In</button>
        </div>
        `;
  loginDiv.appendChild(loginTitle);
  loginDiv.appendChild(loginForm);
  profileContainer.appendChild(loginDiv);

  // Once the user clicks the sign up button
  const signupButton = document.getElementById("signup-button");
  signupButton.addEventListener("click", fetchSignUp);

  // Once the user clicks the sign in button
  const signinButton = document.getElementById("signin-button");
  signinButton.addEventListener("click", fetchSignIn);
};

// Get field values from login form
const getLoginFormValues = () => {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  return { name, email, password };
};

// fetch sign up
const fetchSignUp = async () => {
  const headers = { "Content-Type": "application/json" };
  const body = JSON.stringify(getLoginFormValues());
  console.log(body);
  try {
    const response = await fetch("/api/1.0/user/signup", {
      method: "POST",
      headers,
      body,
    });
    const result = await response.json();
    if (result.status) {
      alert(result.status);
    } else {
      const { data } = result;
      saveAccessToken(data.access_token);
    }
    location.reload();
  } catch (error) {
    console.log(error);
  }
};

// fetch sign in
const fetchSignIn = async () => {
  const headers = { "Content-Type": "application/json" };
  const { email, password } = getLoginFormValues();
  const body = {
    provider: "native",
    email,
    password,
  };
  console.log(body);
  try {
    const response = await fetch("/api/1.0/user/signin", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const result = await response.json();
    console.log(result);
    if (result.status) {
      alert(result.status);
    } else {
      const { data } = result;
      console.log(data);
      saveAccessToken(data.access_token);
    }
    location.reload();
  } catch (error) {
    console.log("error", error);
  }
};

// Save access token to local storage
const saveAccessToken = (accessToken) => {
  localStorage.setItem("accessToken", accessToken);
};

// Delete access token from local storage
const deleteAccesstoken = () => {
  localStorage.removeItem("accessToken");
};

// Check if the user is logged in (access_token in localStorage)
const accessToken = localStorage.getItem("accessToken");
if (accessToken) {
  // If the user is logged in, show the profile page
  console.log("Found access token. Checking now");
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };
  fetchProfile(headers)
    .then((result) => {
      if (!result.data) {
        renderLogin();
      } else {
        renderProfile(result.data);
      }
    })
    .catch((error) => {
      console.log(error);
    });
} else {
  // If the user is not logged in, show the login page
  renderLogin();
}
