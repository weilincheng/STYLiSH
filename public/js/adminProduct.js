const apiPrefix = "/admin/api/1.0";
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
  const productData = {
    id: formData.get("id"),
    category: formData.get("category"),
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    texture: formData.get("texture"),
    wash: formData.get("wash"),
    place: formData.get("place"),
    note: formData.get("note"),
    story: formData.get("story"),
  };
  const colorsData = {
    id: formData.get("id"),
    colors: formData.get("colors"),
  };
  const sizesData = {
    id: formData.get("id"),
    sizes: formData.get("sizes"),
  };
  const variantsData = {
    id: formData.get("id"),
    variants: formData.get("variants"),
  };

  // Main images upload
  const mainImageFormData = new FormData();
  mainImageFormData.append(
    "main_image",
    formData.get("main_image"),
    formData.get("main_image").name
  );
  // Images upload
  let imagesPath = [];
  const imagesFormData = new FormData();
  for (let i = 0; i < formData.getAll("images").length; i++) {
    imagesPath.push(formData.getAll("images")[i].name);
    imagesFormData.append(
      "images",
      formData.getAll("images")[i],
      formData.getAll("images")[i].name
    );
  }

  async function fetchProductData() {
    try {
      // Get insert id
      const addProductResponse = await fetch(`${apiPrefix}/addProduct`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify(productData),
      });
      const addProductResponseData = await addProductResponse.json();
      const productId = addProductResponseData.insertId;
      await fetch(`${apiPrefix}/addColors`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify(colorsData),
      });
      await fetch(`${apiPrefix}/addSizes`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify(sizesData),
      });
      await fetch(`${apiPrefix}/addVariants`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify(variantsData),
      });
      const mainImageResponse = await fetch(
        `${apiPrefix}/addProductMainImage`,
        {
          method: "POST",
          headers: authOnlyHeaders,
          body: mainImageFormData,
        }
      );
      const mainImageResponseData = await mainImageResponse.json();
      const mainImagePath = {};
      mainImagePath.fileName = mainImageResponseData.filename;
      mainImagePath.id = productId;
      await fetch(`${apiPrefix}/updateProductMainImagePath`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify(mainImagePath),
      });
      const imagesResult = await fetch(`${apiPrefix}/addProductImages`, {
        method: "POST",
        headers: authOnlyHeaders,
        body: imagesFormData,
      });
      const imagesResultJson = await imagesResult.json();
      const imagesPath = imagesResultJson;
      imagesPath.id = productId;
      await fetch(`${apiPrefix}/updateProductImagesPath`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify(imagesPath),
      });
      alert("Product added successfully!");
      location.href = "/admin/product.html";
    } catch (err) {
      console.log(err);
    }
  }
  fetchProductData();
});
