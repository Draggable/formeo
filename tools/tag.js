/**
 * Formeo.io (https://formeo.io)
 *
 * Copyright © 2016 Draggable, LLC. All rights reserved.
 */

import semver from 'semver';
import pkg from '../package.json';
import fs from 'fs';
import replace from 'replace-in-file';
import { exec } from 'child_process';
import json from 'json-update';

var argv = require('yargs').argv;

function updateMd(version){
  const lastLog = fs.readFileSync('./CHANGELOG.md', 'utf8').split('\n')[2];
  exec('git log -1 HEAD --pretty=format:%s', function(err, gitLog) {
    gitLog = gitLog.replace(/\(#(\d+)\)/g, '[#$1](https://github.com/Draggable/formeo/pull/$1)');
    const changes = [
      {
        files: 'CHANGELOG.md',
        replace: lastLog,
        with: `- v${version.new} - ${gitLog}\n${lastLog}`
      }, {
        files: 'README.md',
        replace: 'Formeo v' + version.current,
        with: 'Formeo v' + version.new
      }
    ];

    for (var i = 0; i < changes.length; i++) {
      replace(changes[i])
        .then(changedFiles => {
          console.log('Modified files:', changedFiles.join(', '));
        })
        .catch(error => {
          console.error('Error occurred:', error);
        });
    }
  });

  return true;
}


/**
 * Tag a release
 */
async function tag() {
  let releaseType = process.argv.slice(3)[0] || 'patch',
  version = {
    current: pkg.version,
    new: semver.inc(pkg.version, releaseType)
  };

  await updateMd(version);

  await json.update('bower.json', { version: version.new });
  json.update('package.json', { version: version.new })
  .then(() => {
    exec(`npm run build && git add --all && git commit -am "v${version.new}" && git tag v${version.new} && git push origin master --tags && npm publish`, function(err, stdout) {
      if (!err) {
        console.log(stdout);
        console.log(`Version ${version.new} successfully released.`);
      }
    });
  });
}

export default tag;
