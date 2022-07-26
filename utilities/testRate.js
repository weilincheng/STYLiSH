const axios = require("axios");

// Send a GET request to the specified URL every 0.1 seconds
const getData = async (startTime) => {
  setTimeout(async () => {
    try {
      // const response = await axios.get(
      //   "http://localhost:8080/api/1.0/products/men"
      // );
      const response = await axios.get(
        "http://52.11.18.184/api/1.0/products/men"
      );
      const date_ob = new Date();
      console.log(startTime, date_ob.getTime(), response.status);
    } catch (error) {
      const date_ob = new Date();
      console.log(startTime, date_ob.getTime(), error.response.status);
    }
  }, startTime);
};

for (let i = 0; i < 20; i++) {
  const startTime = i * 99;
  getData(startTime);
}
