suite('“about” page Tests',function () {
	test('page should contain link to contact page',function () {
		assert(document.querySelectorAll('a[href="contact"]').length);
	});
});