var port=process.env.PORT||3000;
module.exports=function (grunt) {
	[
	'grunt-mocha-test',
	'gruntify-eslint',
	'grunt-exec'
	].forEach(function (task){
		grunt.loadNpmTasks(task);
	});
	grunt.initConfig({
		mochaTest:{
			test:{
				optinos:{
					reporter: 'spec',
					ui:'tdd'
				},
				src:['qa/tests-*.js']
			}
		},
		eslint:{
			app:['wyyx.js','public/js/**/* .js','lib/**/*.js'],
			models:['models/*.js'],
			//qa:['Gruntfile.js','public/qa/**/*.js','qa/**/*.js']
		},
		exec:{
			linkcheck:{
				cmd:['linkchecker http://localhost:'+port]
			}
		}
	});
	grunt.registerTask('default',[
			'mochaTest',
			'eslint'
			//,'exec'
		]);
};