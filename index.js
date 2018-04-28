'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('./config');
const { Blog } = require('./models');

const app = express();
app.use(bodyParser.json());


// GET REQUESTS to /posts endpoint
app.get('/posts', (req, res) => {
	Blog
		.find()
		.then(blogDocuments => res.json(
				blogDocuments.map(blogDocument => blogDocument.serialize())
				))
		.catch(err => {
			console.log(err);
			res.status(500).json({message: 'Internal server error'})
		});
})

// GET REQUESTS to /posts:id endpoint
app.get('/posts/:id', (req, res) => {
	const idNumber = { 
		"_id" : ObjectId(req.params.id)
	};

	Blog
		.find(idNumber)
		.then(blogDocument => res.json(
				blogDocument.serialize()
				))
		.catch(err => {
			console.log(err);
			res.status(500).json({message: 'Internal server error'})
		});
})


// POST REQUESTS


// PUT REQUESTS


// DELETE REQUESTS


// runServer and closeServer need to access the same
// server object, so we declare `server` here, and when
// runServer runs, it assigns a value
let server;

// starts our server and returns a Promise.
// this is how we will asynchronously start our server.
function runServer(databaseUrl, port = PORT) {
	return new Promise((resolve, reject) => {
		if (err) {
			return reject(err);
		}
		server = app.listen(port, () => {
			console.log(`Your app is listening on port ${port}`);
			resolve();
		})
			.on('error', err => {
				mongoose.disconnect();
				reject(err)
			});
		});
	};

// function also needs to return a promise.
// `server.close` does not return a promise on its own,
// so we manually create one.
function closeServer() {
	return mongoose.disconnect().then(() => {
		return new Promise((resolve, reject) => {
			console.log('Closing server');
			server.close(err => {
				if (err) {
					return reject(err);
				}
				resolve();
			});
		});
	});
}

// if index.js is called directly (aka with `node server.js`), this block
// runs. but we also export the runServer command so other code
// (for instance, test code) can start the server as needed
if (require.main === module) {
	runServer(DATABASE_URL).catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};