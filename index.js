const express = require('express');
const morgan = require('morgan');

const app = express();

const blogPostRouter = require('./blogPostRouter');

// to log the HTTP layer, use morgan
app.use(morgan('common'));

// reroute requests that come into `/blog-posts
app.use('/blog-posts', blogPostRouter);

app.listen(process.env.PORT || 8080, () => {
	console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});