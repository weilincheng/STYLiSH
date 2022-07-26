const { s3Upload } = require("../model/s3service.js");
const addImage = async (files) => {
  const result = await s3Upload(files);
  return result;
};

module.exports = { addImage };
