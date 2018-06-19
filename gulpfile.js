/* global require */
const gulp = require('gulp');
const browsersync = require('browser-sync');
const reload = browsersync.reload;
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const csscomb = require('gulp-csscomb');
const minifycss = require('gulp-clean-css');
const rename = require('gulp-rename');
const plumber = require('gulp-plumber');

gulp.task('styles', () => {
    gulp.src(['sass/main.scss'])
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(rename({
            basename: 'OpeningHours'
        }))
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(minifycss())
        .pipe(gulp.dest('assets/css/'))
        .pipe(reload({stream: true}));
});

gulp.task('serve', ['styles'], () => {
    browsersync.init({
        server: '',
        port: 3000
    });

    gulp.watch('sass/**/*.scss', ['styles']);
    gulp.watch('*.html').on('change', reload);
    gulp.watch('assets/**/*.js').on('change', reload);
});

gulp.task('tidy', () => {
    gulp.src(['sass/*.scss'])
        .pipe(csscomb());
    
});
          
gulp.task('default', ['serve']);