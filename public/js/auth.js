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

const accessToken = localStorage.getItem("accessToken");
document.body.style.display = "none";
if (accessToken) {
  // If the user is logged in, show the profile page
  console.log("Found access token. Checking now");
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };
  fetchProfile(headers)
    .then((result) => {
      if (!result.data) {
        // Set body to hidden
        alert("Please login first");
        return (location = "/profile.html");
      }
      if (result.data.role !== "admin") {
        alert("You are not authorized to access this page");
        return (location = "/profile.html");
      }
      document.body.style.display = "block";
    })
    .catch((error) => {
      console.log(error);
    });
} else {
  alert("Please login first");
  location = "/profile.html";
}
