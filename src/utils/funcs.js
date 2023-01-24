import { lstatSync, readdirSync, readFile } from 'fs'
import path from "path"

const cache = {};
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

export const capitalise = str => {
  return `${str[0].toUpperCase()}${str.substr(1)}`
}

export const generatePath = (animal, color) => {
  return path.join("src", "assets", capitalise(color), `${capitalise(color)}${capitalise(animal)}.png`)
}

export const readImageFile = (path) => {
  return new Promise((resolve, reject) => {
    if (cache[path]) {
      resolve(cache[path])
      return
    }
    readFile(path, (err, buffer) => {
      if (err) {
        console.log(err)
        reject(err)
        return
      }
      if (Object.keys(cache).length > 15) {
        delete cache[Object.keys(cache)[0]]
      }
      cache[path] = buffer
      resolve(buffer)
    })
  })
}

export const getRandom = (list) => {
  const number = Math.random();
  let subList = list[0];
  for(const l of list) {
    if(l[0] > number)
      break;
    subList = l;
  }
  const items = subList[1]
  return items[Math.floor(Math.random()*items.length)];
}

export const handleClaim = async (instance, user, result, message) => {
  await instance.db.simpleInsert("CLAIMS", {
    guild_name: message.guild.name,
    guild_id: message.guild.id,
    username: user.username,
    user_id: user.id,
    animal: result.animal,
    color: result.color,
    time: new Date(),
  });
};
