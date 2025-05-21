/* eslint-env node */
import plumber from 'gulp-plumber';
import { dest, parallel, series, src, watch } from 'gulp';
import * as sassModule from 'sass';
import gulp_sass from 'gulp-sass';
import sassGlob from 'gulp-sass-glob';
import sourcemaps from 'gulp-sourcemaps';
import autoprefixer from 'gulp-autoprefixer';
import minifycss from 'gulp-clean-css';
import rename from 'gulp-rename';

const sass = gulp_sass(sassModule);

function compileCSS() {
	return src('./sass/' + 'main.scss')
		.pipe(plumber())
		.pipe(sassGlob())
		.pipe(sass())
		.pipe(autoprefixer())
		.pipe(minifycss())
		.pipe(
			rename({
				basename: 'OpeningHours',
			}),
		)
		.pipe(dest('./assets/css'));
}

export default compileCSS;
