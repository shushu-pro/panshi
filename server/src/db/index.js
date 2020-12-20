import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

import RC from '../config'
let db = null
let dbpath = RC.dbpath

export function config ({ DB_PATH }) {
  DB_PATH && (dbpath = DB_PATH)
}

async function getDb () {
  return db || (db = await open({
    filename: dbpath,
    driver: sqlite3.Database,
  }))
}

export async function get () {
  return (await getDb()).get(...arguments)
}

export async function all () {
  return (await getDb()).all(...arguments)
}

export async function run () {
  return (await getDb()).run(...arguments)
}

export async function exec () {
  const db = await getDb()
  try {
    return await db.exec(...arguments)
  } catch (err) {
    await db.exec('END TRANSACTION')
    throw err
  }
}

export async function close () {
  return (await getDb()).close()
}

export async function insert (tableName, data) {
  const keys = []
  const values = []
  for (const key in data) {
    const value = data[key]
    if (value == null) {
      continue
    }

    keys.push(uncamelize(key))
    values.push((slqValue(value)))
  }

  const sqlExpression = `
        INSERT INTO ${tableName}(${keys.join(',')})
        VALUES (${values.join(',')})
    `

  // console.info({ title: 'insert', sqlExpression })

  return await run(sqlExpression)
}

export async function list ({ tableName, keys = '*', filters, page = 1, pageSize }) {
  const condition = []
  if (filters) {
    for (const key in filters) {
      if (filters[key] !== undefined) {
        condition.push(`${key}=${filters[key]}`)
      }
    }
  }

  const conditionExpression = condition.length ? ` WHERE ${condition.join(' AND ')};` : ';'
  const sqlExpression = `SELECT ${keys} FROM ${tableName}${conditionExpression}`

  return { list: await all(sqlExpression) }
}

/// UPDATE table_name
/// SET column1 = value1, column2 = value2...., columnN = valueN
/// WHERE [condition];
export async function update (tableName, data, condition = '') {
  const sets = []
  for (const key in data) {
    if (data[key] === undefined) {
      continue
    }
    sets.push(`${uncamelize(key)}=${slqValue(data[key])}`)
  }
  if (sets.length === 0) {
    return
  }
  const sqlExpression = `
        UPDATE ${tableName} SET ${sets.join(',')}
        ${condition}
   `
  // console.info({ sqlExpression })

  return await run(sqlExpression)
}


// 驼峰转下划线
function uncamelize (str) {
  return str
  // return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

// 处理sql值
function slqValue (value) {
  if (value === null) {
    return 'NULL'
  }

  const type = typeof value
  if (type === 'string') {
    return `'${value.replace(/'/g, '\'\'')}'`
  }

  if (type === 'number') {
    return value
  }
}
