import fs from 'fs-extra'
import { execSync } from 'child_process'

async function deployDemo() {
  fs.removeSync('.gitignore')
  const { GH_TOKEN, GH_REPO } = process.env
  const gitCommands = [
    'git add demo/',
    'git commit -am "add demo"',
    `git push https://${GH_TOKEN}@${GH_REPO} $(git subtree split --prefix demo $(git rev-parse --abbrev-ref HEAD)):gh-pages --force`,
    'git reset --hard HEAD~1',
  ]

  execSync(gitCommands.join(' && '), { stdio: 'inherit' })
}

deployDemo()
