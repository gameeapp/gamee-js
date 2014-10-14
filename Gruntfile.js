'use strict';

module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		app: {
			src: './src/',
			dist: './dist/',
			bower: './bower_components/'
		},

		jshint: {
			options: {
				reporter: require('jshint-stylish')
			},

			target: '<%= app.src %>/*.js'
		},
		
		uglify: {
			dist: {
				src: '<%= app.dist %>/gamee.js',
				dest: '<%= app.dist %>/gamee.min.js'
			}
		},

		concat: {
			source: {
				src: [
					'<%= app.src %>/gamee_native.js', 
					'<%= app.src %>/gamee.js', 
					'<%= app.src %>/controller.js'
				],
				dest: '<%= app.dist %>/gamee.js'
			},

			mins: {
				src: ['<%= app.bower %>/bullet/dist/bullet.min.js', '<%= app.dist %>/gamee.min.js'],
				dest: '<%= app.dist %>/gamee.all.min.js'
			}
		}

	});

	grunt.registerTask('default', [
		'jshint',
		'concat:source',
		'uglify',
		'concat:mins',
	]);
};
