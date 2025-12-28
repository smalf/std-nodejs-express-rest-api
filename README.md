# std-nodejs-express-rest-api

## Dependencies
1. ```npm install --save express```
2. ```npm install --save body-parser```
3. ```npm install --save-dev nodemon```
4. ```npm install --save dotenv``` - library for managing env variables, via .env file.
5. ```npm install --save mongoose``` - library for managing MongoDB with the Schema.
6. ```npm install --save multer``` - library for uploading files.
7. ```npm install --save bcryptjs``` - for hashing user's PWD.
8. ```npm install --save jsonwebtoken``` - for working with JWT tokens.

## Testing
Run Automated Tests
Required:
1. **Running the Tests** => Execute the test code (Mocha) Framework: Mocha
2. **Asserting Results** => Validating the test outcome Framework: Chai
3. **Managing Side Effect/External Dependencies Framework**: Sinon (Mocking)
### Testing Setup
**Step 1**. Install [Mocha](https://mochajs.org/next/getting-started/), [Chai](https://www.chaijs.com/), and [Sinon](https://sinonjs.org/) ```npm install --save-dev mocha chai sinon```
**Step 2**. Modify ```npm test```. Steps:
1. Open [package.json](./package.json).
2. Modify the **scripts/test** section in the following way: ```"test": "mocha"```.

### Run tests
```npm test```