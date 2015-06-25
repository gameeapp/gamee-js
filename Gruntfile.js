'use strict';

module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		app: {
			src: './src/',
			dist: './dist/',
			docs: './doc/',
			test: './test/',
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
			devel: {
				src: ['<%= app.bower %>/bullet/dist/bullet.js', '<%= app.dist %>/gamee.js'],
				dest: '<%= app.dist %>/gamee.all.devel.js'
			},
			mins: {
				src: ['<%= app.bower %>/bullet/dist/bullet.min.js', '<%= app.dist %>/gamee.min.js'],
				dest: '<%= app.dist %>/gamee.all.min.js'
			}
		},

		docker: {
			app: {
				src: '<%= app.src %>',
				dest: '<%= app.docs %>'
			}
		},

		watch: {
			scripts: {
				files: ['<%= app.src %>/**/*.js'],
				tasks: ['docker'],
				options: {
					spawn: false
				}
			}
		},

		karma: {
			unit: {
				configFile: '<%= app.test %>/karma.conf.js',
				autoWatch: true
			}
		}

	});

	grunt.registerTask('default', [
		'jshint',
		'concat:source',
		'concat:devel',
		'uglify',
		'concat:mins',
		'docker'
	]);
};
