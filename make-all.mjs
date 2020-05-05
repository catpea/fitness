#!/usr/bin/env -S node --experimental-modules
import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import pretty from 'pretty';
import marked from 'marked';
import moment from 'moment';
import tz from 'moment-timezone';
import kebabCase from 'lodash/kebabCase.js';
import startCase from 'lodash/startCase.js';
import padStart from 'lodash/padStart.js';

const options = {
  title: 'Bodybuilding Advice',
  db: {
    path: './db',
  },
  docs: {
    path: './docs',
    file: 'index.html',
  },
  html: {
    path: './dist',
    file: 'index.html',
  },
  md: {
    path: './dist',
    file: 'README.md',
  },
  js: {
    path: './dist',
    file: 'index.js',
  },
  mjs: {
    path: './dist',
    file: 'index.mjs',
  },
  sh: {
    path: './dist',
    file: 'advice.sh',
  },
}

// Create Changelog
  const data = fs.readdirSync(path.resolve(options.db.path), {
    withFileTypes: true
  })
  .filter(o => o.isFile())
  .map(o => o.name)
  .filter(s => s.endsWith('.md'))
  .sort()
  .map(name => ({ name, path: path.join(options.db.path, name) }))
  .map(o => ({ ...o, raw: fs.readFileSync(o.path).toString() }))
  .map(o => ({ ...o, ...matter(o.raw) }))
  .map(o => ({ ...o, html: marked(o.content, {}) }))
  .reverse()



const htmlVersion = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${options.title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <main>
    <article>
      ${data.map(o => `
      <section class="log-entry" itemscope itemtype="http://schema.org/CreativeWork">
        <meta itemprop="dateCreated" datetime="${(new Date(o.data.date)).toISOString()}">
        ${o.html}
      </section>
      `).join('\n')}
    </article>
  </main>
</body>
</html>
`;
fs.ensureDirSync(options.html.path);
fs.writeFileSync(path.join(options.html.path,options.html.file), pretty(htmlVersion));

fs.ensureDirSync(options.docs.path);
fs.writeFileSync(path.join(options.docs.path,options.docs.file), pretty(htmlVersion));


const mdVersion = `# ${options.title}
${data.map(o=>o.content.trim()).map(s=>`- ${s}`).join('\n')}
`;
fs.ensureDirSync(options.md.path);
fs.writeFileSync(path.join(options.md.path,options.md.file), mdVersion);



const jsVersion = `const advice = ${JSON.stringify( data .map(o => o.content.trim()) .map(s=>s.replace(/\n/g, ' ')) .map(s=>s.replace(/ +/g, ' ')) , null, '  ')};

function main(){
  return advice;
}

module.exports = main;
`;
fs.ensureDirSync(options.js.path);
fs.writeFileSync(path.join(options.js.path,options.js.file), jsVersion);



const mjsVersion = `const advice = ${JSON.stringify( data .map(o => o.content.trim()) .map(s=>s.replace(/\n/g, ' ')) .map(s=>s.replace(/ +/g, ' ')) , null, '  ')};

export default function main(){
  return advice;
}
`;
fs.ensureDirSync(options.mjs.path);
fs.writeFileSync(path.join(options.mjs.path,options.mjs.file), mjsVersion);


const shVersion = `#!/usr/bin/env -S node --experimental-modules --no-warnings
const advice = ${JSON.stringify( data .map(o => o.content.trim()) .map(s=>s.replace(/\n/g, ' ')) .map(s=>s.replace(/ +/g, ' ')) , null, '  ')};

function main(){
  console.log(advice[Math.floor(Math.random() * advice.length)]);
}
main();
`;
fs.ensureDirSync(options.sh.path);
fs.writeFileSync(path.join(options.sh.path,options.sh.file), shVersion);
fs.chmodSync(path.join(options.sh.path,options.sh.file), 0o755);
