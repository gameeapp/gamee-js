module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: { // file merging, good for libraries and shims
			options: {
				separator: '\n\n',
				process: function (src, filepath) {
					return '//#### ' + filepath + '\n' + src;
				}
			},
			dist: {
				src: ['bower_components/bullet/dist/bullet.js', 'gamee/libs/shims.js', '<%= file_dependencies.src_target.ordered_files %>'],
				dest: 'gamee/dist/<%= pkg.name %>.<%= pkg.version %>.js'
			}
		},
		uglify: { // minification
			options: {
				banner: '/*! <%= pkg.name %>.<%= pkg.version %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
				mangle: { // maximum level of minification
					toplevel: true,
					except: ["Gamee",
						"OneButtonController",
						"TwoButtonController",
						"FourButtonController",
						"FiveButtonController",
						"SixButtonController",
						"FourArrowController",
						"TouchController",
						"JoystickController",
						"JoystickButtonController",
						"TwoArrowsTwoButtonsController",
						"TwoArrowsOneButtonController",
						"TwoActionButtonsController"] // this will make objects reserved words, so it wont be minified and its constructor is visible in IDE and debugger
				},
				compress: {
					sequences: true,
					properties: true,
					dead_code: true,
					drop_debugger: true,
					drop_console: false,
					conditionals: true,
					comparisons: true
				},
				sourceMap: true,
				wrap: "gamee" // everything is being wrapped into gamee variable. We expose only API of Gamee (actualy we have to expose some other bindings for native apps :( ) 
			},
			dist: {
				src: 'gamee/dist/<%= pkg.name %>.<%= pkg.version %>.js',
				dest: 'gamee/dist/<%= pkg.name %>.<%= pkg.version %>.min.js'
			}
		},
		jshint: { // check your code validity with jshint (you must watch the console if build is passing)
			files: ['Gruntfile.js', 'gamee/src/*.js', 'gamee/libs/shims.js', 'test/**/*.js'],
			options: {
				// options here to override JSHint defaults
				globals: {
					jQuery: true,
					console: true,
					module: true,
					document: true
				},
				jshintrc: true
			}
		},
		watch: { // this does automatic buidling while you work
			files: ['<%= jshint.files %>'],
			tasks: ['default']
		},
		file_dependencies: { // file dependency algorithm, concat files based on jsdoc
			options: {
				extractDefinesRegex: /(?:@class|@interface)\s*([\w.]*)/g,
				extractRequiresRegex: /@requires\s*([\w.]*)/g
			},
			src_target: {
				src: ['gamee/src/*.js']
			}
		},
		jsdoc: {
			docs: {
				src: ['gamee/src/*.js', 'gamee/libs/*.js'],
				options: {
					destination: 'gamee/docs',
					configure: 'jsdoc.conf.json',
					// template: './node_modules/minami',
					template: './docgen',
					outputSourceFiles: false,
				},
			},
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	// will use different testing tool
	// grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-file-dependencies');
	grunt.loadNpmTasks('grunt-jsdoc');

	grunt.registerTask('test', ['jshint']);

	// TODO doesn't know ES6
	// grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
	grunt.registerTask('default', ['jshint', 'file_dependencies', 'concat', 'uglify']);

};