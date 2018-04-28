const express = require('express');
const morgan = require('morgan');

const app = express();

const blogPostsRouter = require('./blogPostsRouter');

// to log the HTTP layer, use morgan
app.use(morgan('common'));
app.use(express.static('public'));

// reroute requests that come into `/blog-posts
app.use('/blog-posts', blogPostsRouter);


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