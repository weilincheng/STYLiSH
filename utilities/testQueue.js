const axios = require("axios");

// Send a GET request to the specified URL every 0.1 seconds
const getData = async (startTime) => {
  setTimeout(async () => {
    try {
      const response = await axios({
        url: "http://52.11.18.184/api/2.0/report/payments",
        method: "GET",
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwicHJvdmlkZXIiOiJuYXRpdmUiLCJuYW1lIjoidGVzdCIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsInBpY3R1cmUiOiJodHRwczovL2ZldHRibG9nLmV1L3dwLWNvbnRlbnQvdXBsb2Fkcy8yMDIwL25vZGUtbW9kdWxlcy1tZW1lLnBuZyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjUyMzQ2ODI5LCJleHAiOjE2NTIzNTA0Mjl9.TC9T_WgXNRmqOtBMX6l_YU-l2kyVMhcVkszUww4qgRc",
        },
      });
      const date_ob = new Date();
      console.log(startTime, date_ob.getTime(), response.status);
    } catch (error) {
      const date_ob = new Date();
      console.log(startTime, date_ob.getTime(), error.response.status);
    }
  }, startTime);
};

for (let i = 0; i < 10; i++) {
  const startTime = 1000 * i;
  for (let j = 0; j < 10; j++) {
    getData(startTime);
  }
}
