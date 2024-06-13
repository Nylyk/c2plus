const esbuild = require('esbuild');

esbuild.build({
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
    bundle: true
}).catch(console.error);
