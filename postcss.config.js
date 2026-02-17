import postcssImportExtGlob from 'postcss-import-ext-glob';
import postcssImport from 'postcss-import';
import postcssCustomMedia from 'postcss-custom-media';
import autoprefixer from 'autoprefixer';
import postcssNesting from 'postcss-nesting';
import cssnano from 'cssnano';

/** @type {import('postcss-load-config').Config} */ const config = {
	plugins: [postcssImportExtGlob, postcssImport, postcssCustomMedia, autoprefixer, postcssNesting, cssnano],
};

export default config;
