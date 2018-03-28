#!/usr/bin/env node

require("dotenv").config();
const Promise         = require("bluebird");
const { MongoClient } = require("mongodb");
const rfr             = require("rfr");
const Config          = rfr("server/lib/config");

// const connection = require("./server/persistence/db-connection");

let client;

function getAll(collection) {
	return new Promise(
		(resolve, reject) => {
			collection.find({}).toArray(
				(err, results) => {
					if (err) {
						return reject(err);
					}

					return resolve(results);
				}
			);
		}
	);
}

function updateCollection(items, collection) {
	const modifiedItems = items.reduce(
		(modifiedItems, item) => {
			let modified = false;

			for (let key in item) {
				if (!Object.prototype.hasOwnProperty.call(item, key)) {
					continue;
				}

				const camelCasedKey = key.replace(
					/([a-z])_([a-z])/g,
					(fullMatch, lastLetter, firstLetter) => lastLetter + firstLetter.toUpperCase()
				);

				if (key === camelCasedKey) {
					continue;
				}

				item[camelCasedKey] = item[key];
				delete item[key];
				modified = true;
			}

			if (modified) {
				modifiedItems.push(item);
			}

			return modifiedItems;
		},
		[]
	);

	return modifiedItems.length > 0 ?
		Promise.all(
			modifiedItems.map(
				(item) => {
					return new Promise(
						(resolve, reject) => {
							collection.update(
								{ _id: item._id },
								item,
								(err, result) => {
									if (err) {
										return reject(err);
									}

									resolve(result);
								}
							);
						}
					);
				}
			)
		) :
		undefined;
}

new Promise(
	(resolve, reject) => {
		MongoClient.connect(
			Config.storage.db.url,
			(err, client) => {
				if (err) {
					return reject(err);
				}

				return resolve(client);
			}
		);
	}
).then(
	(_client) => {
		client = _client;

		return client.db("quintro");
	}
).then(
	(db) => {
		const collection = db.collection("users");

		return getAll(collection).then(
			(items) => {
				return updateCollection(items, collection);
			}
		);
	}
).finally(
	() => {
		client.close();
	}
);
