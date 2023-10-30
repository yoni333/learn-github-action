console.log("run test here!!!!!!****")
// const axios = require("axios");
const axios = require('axios/dist/node/axios.cjs');
axios.get("https://5f1455762710570016b37ea7.mockapi.io/users").then(function (response) {
    // handle success
    console.log('success');
    console.log(response);
})
    .catch(function (error) {
        // handle error
        console.log("error");
        console.log(error);
    })
    .finally(function () {
        // always executed
    });
