/* eslint-env node */
const {
    src,
    dest,
    parallel,
    series,
    watch
} = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require('gulp-sass-glob');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const minifycss = require('gulp-clean-css');
const rename = require('gulp-rename');
const plumber = require('gulp-plumber');

function compileCSS() {
    return src('./sass/' + 'main.scss')
        .pipe(plumber())
        .pipe(sassGlob())
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(minifycss())
        .pipe(rename({
            basename: 'OpeningHours'
        }))
        .pipe(dest('./assets/css'));
}

exports.default = compileCSS;