const submitButton = document.getElementById("submitButton");
submitButton.addEventListener("click", () => {
  const formData = new FormData(document.getElementById("form"));
  const jsonHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  };
  const authOnlyHeaders = {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  };
  const campaignData = {
    id: formData.get("id"),
    story: formData.get("story"),
  };
  const campaignImageFormData = new FormData();
  campaignImageFormData.append(
    "image",
    formData.get("image"),
    formData.get("image").name
  );
  console.log(formData.get("image").name);
  async function fetchCampaignData() {
    const response = await fetch("/admin/api/1.0/addCampaignImage", {
      method: "POST",
      headers: authOnlyHeaders,
      body: campaignImageFormData,
    });
    const resjson = await response.json();
    campaignData.picture = resjson.filename;
    const addCampaignRes = await fetch("/admin/api/1.0/addCampaign", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(campaignData),
    });
    console.log(addCampaignRes.ok);
    if (!addCampaignRes.ok) {
      alert("Product id is not correct!");
    } else {
      alert("Campaign added!");
    }
    location.href = "/admin/campaign.html";
  }
  try {
    fetchCampaignData();
  } catch (err) {
    console.log(err);
  }
});
