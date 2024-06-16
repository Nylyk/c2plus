const { build } = require('esbuild');
const { solidPlugin } = require('esbuild-plugin-solid');

build({
    entryPoints: [
        {
            in: 'src/index.ts',
            out: 'index'
        },
        {
            in: 'src/injection/injection.ts',
            out: 'injection'
        }
    ],
    outdir: 'dist',
    bundle: true,
    plugins: [solidPlugin()]
}).catch(console.error);
