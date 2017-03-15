/**
 * Formeo.io (https://formeo.io)
 *
 * Copyright © 2016 Draggable, LLC. All rights reserved.
 */

import semver from 'semver';
import pkg from '../package.json';
import fs from 'fs';
import replace from 'replace-in-file';
import {exec} from 'child_process';
import json from 'json-update';

/**
 * UpdateS README AND CHANGELOG
 * @param  {Object} version current and new version
 * @return {void}
 */
function updateMd(version) {
  const lastLog = fs.readFileSync('./CHANGELOG.md', 'utf8').split('\n')[2];
  return exec('git log -1 HEAD --pretty=format:%s', function(err, gitLog) {
    gitLog = gitLog.replace(/\(#(\d+)\)/g, `[#$1](${pkg.repository.url}/pulls/$1)`);
    const changes = [
      {
        files: 'CHANGELOG.md',
        from: lastLog,
        to: `- v${version.new} - ${gitLog}\n${lastLog}`
      }, {
        files: 'README.md',
        from: 'Formeo v' + version.current,
        to: 'Formeo v' + version.new
      }
    ];

    for (let i = 0; i < changes.length; i++) {
      replace(changes[i])
        .then(changedFiles => {
          console.log('Modified files:', changedFiles.join(', '));
        })
        .catch(error => {
          console.error('Error occurred:', error);
        });
    }
  });
}

/**
 * Modifies files, builds and tags the project
 * @return {Promise} json.update
 */
async function tag() {
  let releaseType = process.argv[3] || 'patch';
  let version = {
    current: pkg.version,
    new: semver.inc(pkg.version, releaseType)
  };

  await updateMd(version);

  await json.update('bower.json', {version: version.new});
  return json.update('package.json', {version: version.new})
  .then(() => {
    const commands = [
      'npm run build',
      'git add --all',
      `git commit -am "v${version.new}"`,
      `git tag v${version.new}`,
      'git push upstream master --tags',
      'npm publish'
    ];
    exec(commands.join(' && '), (err, stdout) => {
      if (!err) {
        console.log(stdout);
        console.log(`Version ${version.new} successfully released.`);
      }
    });
  });
}

export default tag;
