import { lstatSync, readdirSync } from 'fs'

export const readDirectoryRecursiveWithFilter = (baseDir, prefix, predicate) => {
  const elements = []
  const traverse = folder => {
    const items = readdirSync(`${prefix}/${folder}`)
    items.forEach(file => {
      const path = `${folder}/${file}`
      if (lstatSync(`${prefix}/${path}`).isDirectory()) {
        traverse(path)
        return
      }
      if (!predicate || predicate(path)) elements.push(path)
    })
  }
  traverse(baseDir)
  return elements
}
