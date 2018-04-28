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
app.post('/posts', (req, res) => {
	const requiredFields = ['title', 'content', 'author'];
	for (let i=0; i<requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`;
			console.error(message);
			return res.status(400).send(message);
		}
	}

	Blog
		.create({
			title: req.body.title,
			content: req.body.content,
			author: req.body.author
		})
		.then(newBlog => res.json(
			newBlog.serialize()
			))
		.catch(err => {
			console.log(err);
			res.status(500).json({message: 'Internal server error'})
		});
})


// PUT REQUESTS
app.put('/posts/:id', (req, res) => {
	if (!(req.body.id && req.params.id && (req.params.id === req.body.id))) {
		console.log('Error: check blog post ID');
		res.status(400).json({message: 'Missing id / id does not match'})
	};

	const toUpdate = {};
	const updateableFields = ['title', 'content', 'author'];

	updateableFields.forEach(field => {
		if (field in req.body) {
			toUpdate[field] = req.body[field];
		}
	});

	Blog
		.findByIdAndUpdate(req.params.id, { $set: toUpdate })
		.then(updatedBlog => res.status(200).json(
			updatedBlog.serialize()
			))
		.catch(err => {
			console.log(err);
			res.status(500).json({message: 'Internal server error'})
		});
})


// DELETE REQUESTS
app.delete('/posts/:id', (req, res) => {
	const idNumber = { 
		"_id" : ObjectId(req.params.id)
	};

	Blog
		.remove(idNumber)
		.then(() => res.status(204).end())
		.catch(err => {
			console.log(err);
			res.status(500).json({message: 'Internal server error'})
		});
})

// runServer and closeServer need to access the same
// server object, so we declare `server` here, and when
// runServer runs, it assigns a value
let server;

// starts our server and returns a Promise.
// this is how we will asynchronously start our server.
function runServer(databaseUrl, port = PORT) {
	return new Promise((resolve, reject) => {
		mongoose.connect(databaseUrl, err => {
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
		});
	}

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