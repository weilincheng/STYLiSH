const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const uuid = require("uuid").v4;

exports.s3Upload = async (files) => {
  const s3client = new S3Client();

  const params = files.map((file) => {
    return {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `uploads/${uuid()}-${file.originalname}`,
      Body: file.buffer,
    };
  });
  let filesName = [];
  await Promise.all(
    params.map((param) => {
      s3client.send(new PutObjectCommand(param));
      filesName.push(param.Key);
    })
  );
  return filesName;
};
