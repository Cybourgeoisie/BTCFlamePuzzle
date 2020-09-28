const FLAMES = require('../parsers/getFlameValuesFromExcel.js');

pks = [
	"JT5msk6QPXgrGe3hnmkwUKVgaPHgkjNDApLcCzX8QsXG6SGoMEE4",
	"5msk6QPXgrGe3hnmkwUKVgaPHgkjNDApLcCzX8QsXG6SGoMEE44",
	"5QyfdV1yVvuy5qYgQQ4qyNiEodyJs7C3ghvi48iqvrw9qQHLSvw",
	"5VyNL7rDiBmR5QyfdV1yVvuy5qYgQQ4qyNiEodyJs7C3ghvi48i",
	"KYV4wvSLHQq9wrvqi84ivhg3C7sJydoEiNyq4QQgYq5yuvVy1Vdf",
	"KjtTzkiWUDa9zGka6xT6kH7cqe5XyNbp61yaTDD7jafy4ktydtNs",
	"L1GfwWz7M9DxC9hT5QhRXhQwWuDW3ZSS7eL9fqxumC8V1mtkV3rB" // a real one
];

pks.forEach(function(pk) {
	try {
		FLAMES.testPrivateKey(pk);
	} catch (ex) {
		console.log("nope");
	}
});
