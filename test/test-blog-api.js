const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../index');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Blog Posts API', function() {
	before(function() {
		return runServer();
	});

	after(function() {
		return closeServer();
	});

	it('should list blog posts on GET', function() {
		return chai.request(app)
			.get('/blog-posts')
			.then(function(res) {
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.body).to.be.a('array');

				res.body.forEach(function(blog) {
					expect(blog).to.be.a('object');
					expect(blog).to.include.keys('id', 'title', 'content', 'author');
				});
			});
	});

	it('should publish new blog post on POST', function() {
		const newBlog = {title: 'Hello World', content: 'First blog post!', author: 'Mary Han'}
		return chai.request(app)
			.post('/blog-posts')
			.send(newBlog)
			.then(function(res) {
				expect(res).to.have.status(201);
				expect(res).to.be.json;
				expect(res.body).to.be.a('object');
				expect(res.body).to.include.keys('id', 'title', 'content', 'author');
				expect(res.body.id).to.not.equal(null);
				expect(res.body).to.deep.equal(Object.assign(newBlog, {id: res.body.id}));
			});
	});

	it('should update blog posts on PUT', function() {
		const updateData = {
			name: 'Goodbye World',
			content: 'Last blog post :(',
			author: 'Mary Han'
		};

		return chai.request(app)
			.get('/blog-posts')
			.then(function(res) {
				updateData.id = res.body[0].id;
				return chai.request(app)
					.put(`/blog-posts/${updateData.id}`)
					.send(updateData);
			})
			.then(function(res) {
				expect(res).to.have.status(200);
				expect(res).to.be.json;
				expect(res.body).to.be.a('object');
				expect(res.body).to.deep.equal(updateData);
			});
	});

	it('should delete blog post on DELETE', function() {
		return chai.request(app)
			.get('/blog-posts')
			.then(function(res) {
				return chai.request(app)
					.delete(`/blog-posts/${res.body[0].id}`);
			})
			.then(function(res) {
				expect(res).to.have.status(204);
			});
	});
});