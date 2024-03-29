import typescript from '@rollup/plugin-typescript';
import image from '@rollup/plugin-image';
import serve from 'rollup-plugin-serve';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import fs from 'fs';

const showAddress = () => ({
  load: () =>
    console.log(
      '\x1b[35m%s\x1b[0m',
      `Current registry address: https://localhost:3006/dapplet.json`,
    ),
});

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'lib/index.js',
        format: 'cjs',
        exports: 'named',
      },
    ],
    plugins: [
      typescript(),
      json(),
      resolve({ browser: true }),
      commonjs(),
      image(),
      serve({
        port: 3006,
        https: {
          key: fs.readFileSync('src/secret/localhost/localhost.decrypted.key'),
          cert: fs.readFileSync('src/secret/localhost/localhost.crt')
        },
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }),
      showAddress(),
    ],
  },
];
