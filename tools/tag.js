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
 * Capitalizes a string
 * @param  {String} str uncapitalized string
 * @return {String} str capitalized string
 */
const capitalize = str => {
  return str.replace(/\b\w/g, function(m) {
      return m.toUpperCase();
    });
};

/**
 * Updates README AND CHANGELOG
 * @param  {Object} version current and new version
 * @param  {String} gitLog
 * @return {void}
 */
function updateMd(version, gitLog) {
  const lastLog = fs.readFileSync('./CHANGELOG.md', 'utf8').split('\n')[2];
  const changes = [
    {
      files: 'CHANGELOG.md',
      from: lastLog,
      to: `- v${version} - ${gitLog}\n${lastLog}`
    }, {
      files: 'README.md',
      from: new RegExp(`^(?:${pkg.name}|${capitalize(pkg.name)}) v(?:0|[1-9]\\d*).(?:0|[1-9]\\d*).(?:0|[1-9]\\d*)`),
      to: `${capitalize(pkg.name)} v${version}`
    }
  ];

  changes.forEach(change =>
    replace(change)
      .then(changedFiles => {
        console.log('Modified files:', changedFiles.join(', '));
      })
      .catch(error => {
        console.error('Error occurred:', error);
      })
  );
}

/**
 * Build, push, tag and npm publish
 * @param  {String} version
 * @param  {String} description
 * @return {Promise} exec
 */
function release(version, description) {
  const commands = [
    'npm run build',
    'git add --all',
    `git commit -am "v${version}" -m "${description}"`,
    `git tag v${version}`,
    'git push upstream master --tags',
    'npm publish'
  ];

  return exec(commands.join(' && '), (err, stdout) => {
    if (!err) {
      console.log(stdout);
      console.log(`Version ${version} successfully released.`);
    }
  });
}

/**
 * Modifies files, builds and tags the project
 * @return {Promise} release
 */
async function tag() {
  const args = process.argv.slice(2);
  const releaseArg = args[1] || 'patch';
  const releaseType = releaseArg.replace('--', '');
  let version = {
    current: pkg.version,
    new: semver.inc(pkg.version, releaseType)
  };

  return exec('git log -1 HEAD --pretty=format:%s%n%b', async function(err, gitLog) {
    gitLog = gitLog.replace(/\(#(\d+)\)/g, `[#$1](${pkg.repository.url}/pulls/$1)`).trim();
    updateMd(version.new, gitLog);
    await json.update('bower.json', {version: version.new});
    await json.update('package.json', {version: version.new});
    return release(version.new, gitLog);
  });
}

export default tag;
