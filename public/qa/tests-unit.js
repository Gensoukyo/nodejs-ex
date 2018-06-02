var imgpath=require('../../lib/imgpath.js');
var expect=require('chai').expect;

suite('img path test',function () {
	test('setImgUrl() should rerurn a path',function(){
		expect(typeof imgpath.setImgUrl()==='string');
	});
});