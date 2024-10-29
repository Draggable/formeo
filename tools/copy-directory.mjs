// copyDir.mjs
import { promises as fs } from 'node:fs'
import { join, basename } from 'node:path'
// import { fileURLToPath } from 'node:url'

const [, , src, dest] = process.argv

async function copyDirectory(srcDir, destDir) {
  // Create destination directory if it doesn't exist
  await fs.mkdir(destDir, { recursive: true })

  // Read all items in the source directory
  const items = await fs.readdir(srcDir, { withFileTypes: true })

  for (const item of items) {
    const srcPath = join(srcDir, item.name)
    const destPath = join(destDir, item.name)

    if (item.isDirectory()) {
      // Recursively copy subdirectories
      await copyDirectory(srcPath, destPath)
    } else {
      // Copy files
      await fs.copyFile(srcPath, destPath)
    }
  }
}

// Entry point
async function main() {
  if (!src || !dest) {
    console.error('Usage: node copyDir.mjs <source_directory> <destination_directory>')
    process.exit(1)
  }

  try {
    await copyDirectory(src, dest)
    console.log(`Copied ${basename(src)} to ${dest}`)
  } catch (error) {
    console.error(`Error copying directory: ${error.message}`)
  }
}

main()
