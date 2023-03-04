/* eslint-disable @typescript-eslint/no-var-requires */
const { readFileSync, writeFileSync } = require('fs');
const path = require('path');
const { convert } = require('swagger2-to-postmanv2');

const convertSync = (swaggerJson) => {
  return new Promise((resolve, reject) => {
    convert(swaggerJson, {}, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    });
  });
};

const main = async () => {
  try {
    console.log(__dirname);
    const swaggerFilePath = '../../docs/swagger/swagger.json';
    const fullSwaggerFilePath = path.join(__dirname, swaggerFilePath);
    console.log('swagger file path', fullSwaggerFilePath);
    const swaggerString = readFileSync(fullSwaggerFilePath, 'utf-8');
    const swaggerJson = JSON.parse(swaggerString);
    const postmanResult = await convertSync({
      type: 'json',
      data: { ...swaggerJson, swagger: '2.0' },
    });
    const { result, output = [] } = postmanResult;
    if (!result) return;
    // Single File
    if (output.length === 1) {
      const postmanFilePath = path.join(
        __dirname,
        '../../docs/postman/collection.json'
      );
      const collection = output[0];
      const { type, data } = collection;
      if (type === 'collection') {
        writeFileSync(postmanFilePath, JSON.stringify(data, null, 2));
      }
    }
    // Multiple Files
    for (const collection of output) {
      const postmanFilePath = path.join(
        __dirname,
        '../../docs/postman/collection.json'
      );
      console.log('postman file path', postmanFilePath);
      const { type, data } = collection;
      if (type === 'collection') {
        writeFileSync(postmanFilePath, JSON.stringify(data, null, 2));
      }
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

main();
