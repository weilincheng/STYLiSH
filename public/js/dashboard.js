function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `
        rgb(${parseInt(result[1], 16)}, 
          ${parseInt(result[2], 16)}, 
          ${parseInt(result[3], 16)})
      `
    : null;
}

const fetchDashBoard = async () => {
  try {
    const authHeaders = {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    };
    const response = await fetch("/admin/api/1.0/dashboard", {
      method: "GET",
      headers: authHeaders,
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.log(error);
  }
};

const renderTotalRevenue = (totalRevenue) => {
  const totalRevenueTitle = document.getElementById("total-revenue");
  totalRevenueTitle.innerHTML = `Total Revenue: ${totalRevenue}`;
};

const renderColorPercentage = (colorCount) => {
  let values = [],
    labels = [],
    marker = { colors: [] };
  for (let color of colorCount) {
    values.push(color.percentage);
    labels.push(color.color_name);
    marker.colors.push(hexToRgb(color.color_code));
  }
  const data = [
    {
      values,
      labels,
      marker,
      type: "pie",
    },
  ];

  const layout = {
    height: 350,
    width: 952,
    title: "Product sold percentage in different colors",
  };

  Plotly.newPlot("color-percentage", data, layout);
};

const renderPriceRange = (priceQuantity) => {
  let prices = [];
  for (let item of priceQuantity) {
    for (let i = 0; i < item.qty; i++) {
      prices.push(item.price);
    }
  }
  const trace = {
    x: prices,
    type: "histogram",
  };
  const layout = {
    height: 312,
    width: 952,
    title: "Product sold quantity in different price range",
    yaxis: {
      title: "Quantity",
    },
    xaxis: {
      title: "Price Range",
    },
  };
  const data = [trace];
  Plotly.newPlot("price-range", data, layout);
};

const renderTop5Products = (top5Products) => {
  const data = [];
  for (let size of ["L", "M", "S"]) {
    const productId = [];
    const productSize = [];
    for (let product of top5Products) {
      productId.push(`product ${product.product_id}`);
      productSize.push(product.sizeInfo[size]);
    }
    data.push({
      y: productSize,
      x: productId,
      name: size,
      type: "bar",
    });
  }

  var layout = {
    barmode: "stack",
    height: 312,
    width: 952,
    title: "Quantity of top 5 sold products in different sizes",
    yaxis: {
      title: "Quantity",
    },
  };

  Plotly.newPlot("top-5-products", data, layout);
};

const renderDashBoard = async () => {
  const result = await fetchDashBoard();
  const totalRevenue = result.total_revenue;
  const colorCount = result.color_count;
  const priceQuantity = result.price_quantity;
  const top5Products = result.top5Products;
  let totalCount = 0;
  for (let color of colorCount) {
    totalCount += color.count;
  }
  for (let color of colorCount) {
    color.percentage = (color.count / totalCount) * 100;
  }
  renderTotalRevenue(totalRevenue);
  renderColorPercentage(colorCount);
  renderPriceRange(priceQuantity);
  renderTop5Products(top5Products);
};

renderDashBoard();

// Socket.io
const socket = io("https://stylishbe.xyz/");
// const socket = io("http://localhost:8080/");
socket.on("new order", () => {
  console.log("new order received");
  renderDashBoard();
});
