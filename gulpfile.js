var gulp = require('gulp');

var clean = require('gulp-clean');
var minify = require('gulp-minify');
var zip = require('gulp-zip');

var bases = {
	dist: 'dist/',
	vendor: 'vendor/',
	node_modules: 'node_modules/',
};

var paths = {
	scripts: [
		'tac-stat-ob.js'
	],
};

// Delete the dist and vendor directory
gulp.task('clean', function() {
	return gulp.src([bases.vendor, bases.dist])
		.pipe(clean());
});

// Copy node files to dist directly
gulp.task('copy', ['clean'], function() {
	/* Copy bootstrap */
	gulp.src(bases.node_modules + 'bootstrap/**/*')
		.pipe(gulp.dest(bases.vendor + 'bootstrap'));

	/* Copy datatables.net */
	gulp.src(bases.node_modules + 'datatables.net/**/*')
		.pipe(gulp.dest(bases.vendor + 'datatables.net'));

	/* Copy datatables.net-bs4 */
	gulp.src(bases.node_modules + 'datatables.net-bs4/**/*')
		.pipe(gulp.dest(bases.vendor + 'datatables.net-bs4'));
});

gulp.task('minify', ['clean'], function() {
	gulp.src(paths.scripts)
		.pipe(minify())
		.pipe(gulp.dest(bases.dist))
});

// Define the default task as a sequence of the above tasks
gulp.task('default', ['copy', 'minify'], function() {
	gulp.src('./')
		.pipe(zip('tac-quick-stat-view.zip'))
		.pipe(gulp.dest(bases.dist));
});