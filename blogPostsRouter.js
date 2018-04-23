const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {BlogPosts} = require('./models');

// some sample blog post data
BlogPosts.create('Why Handwriting Is Still Important', 'Reprint of a NYT Opinion letter on the importance of teaching handwriting in schools', 'Various', '08/30/2016');
BlogPosts.create('\`The Calligraphy Revival\`: Fine Handwriting, With a Flourish', 'Reprint of a NYT article on Grolier Club, a small nonprofit', 'Roberta Smith', '05/10/2017');
BlogPosts.create('Why Signatures Mature', 'Reprint of a NYT Opinion article, on memories and benefits tied to handwritten signatures', 'Steven Petrow', '04/11/2018');

// GET request
router.get('/', (req, res) => {
	res.json(BlogPosts.get());
});

// POST request
router.post('/', jsonParser, (req, res) => {
	const requiredFields = ['title', 'content', 'author'];
	for (let i=0; i<requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`;
			console.error(message);
			return res.status(400).send(message);
		}
	}
	const item = BlogPosts.create(req.body.title, req.body.content, req.body.author);
	res.status(201).json(item);
});


// PUT request
router.put('/:id', jsonParser, (req, res) => {
	const requiredFields = ['title', 'content', 'author', 'id'];
	for (let i=0; i<requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`;
			console.error(message);
			return res.status(400).send(message);
		}
	}
	if (req.params.id !== req.body.id) {
		const message = (
			`Request path id (${req.params.id}) and request body id (${req.body.id} must match`);
		console.error(message);
		return res.status(400).send(message);
	}
	console.log(`Updating blog post item \`${req.params.id}\``);
	const updatedItem = BlogPosts.update({
		id: req.params.id,
		title: req.body.title,
		content: req.body.content,
		author: req.body.author,
		publishDate: req.body.publishDate
	});
	res.status(204).end();
});

// DELETE request
router.put('/:id', (req, res) => {
	BlogPosts.delete(req.params.id);
	console.log(`Deleted blog post item \`${req.params.ID}\``);
	res.status(204).end();
});

module.exports = router;