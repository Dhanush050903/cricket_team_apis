const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()

const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running')
    })
  } catch (e) {
    console.log(`Error :${e}`)
    process.exit(1)
  }
}
initializeDbAndServer()
//API 1
function convertToCamelCase(a) {
  return {
    playerId: a.player_id,
    playerName: a.player_name,
    jerseyNumber: a.jersey_number,
    role: a.role,
  }
}

app.get('/players/', async (request, response) => {
  const query = `
    select * from cricket_team;
  `
  const allPlayers = await db.all(query)
  for (let i = 0; i < allPlayers.length; i++) {
    allPlayers[i] = convertToCamelCase(allPlayers[i])
  }
  response.send(allPlayers)
})

//API2
app.use(express.json())
app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {player_name, jersey_number, role} = playerDetails
  const postQuery = ` insert into 
    cricket_team(
      player_name, jersey_number, role 
    )
    values(
      ?,?,?
    );`
  const toRun = await db.run(postQuery, [player_name, jersey_number, role])
  const playerId = toRun.lastID
  response.send('Player Added to Team')
})
//API3
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const query = `
  select * from cricket_team where player_id=${playerId};
  `
  const player = await db.get(query)
  response.send(convertToCamelCase(player))
})
//API4
//app.use(express.json()) has been declared already at API2
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {player_name, jersey_number, role} = playerDetails
  const query = `
  update cricket_team 
  set player_name=?,
  jersey_number=?,
  role=?
  where player_id=?;
  `
  const toRun = await db.run(query, [
    player_name,
    jersey_number,
    role,
    playerId,
  ])
  response.send('Player Details Updated')
})
//API5
app.delete(`/players/:playerId/`, async (request, response) => {
  const {playerId} = request.params
  const query = 'delete from cricket_team where player_id=?;'
  const toRun = await db.run(query, [playerId])
  response.send('Player Removed')
})
module.exports = app
