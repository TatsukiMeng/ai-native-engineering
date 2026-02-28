const { execSync } = require('child_process');
const output = execSync('git log --format="%an|%aE" docs/content/docs/index.mdx').toString();
console.log(output);
