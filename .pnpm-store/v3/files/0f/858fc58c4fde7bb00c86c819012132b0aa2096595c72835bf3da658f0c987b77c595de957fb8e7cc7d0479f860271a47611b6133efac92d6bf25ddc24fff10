import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/Game.js',
  output: {
    file: './dist/bundle.js',
    format: 'cjs'
  },
  plugins: [
    commonjs(),
    babel({
      exclude: 'node_modules/**'
    })
  ]
};
