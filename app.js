const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "covid19India.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();
//1
const con = (each) => {
  return {
    stateId: each.state_id,
    stateName: each.state_name,
    population: each.population,
  };
};
app.get("/states/", async (request, response) => {
  const se = `SELECT * FROM state;`;
  const de = await database.all(se);
  response.send(de.map((each) => con(each)));
});
//2
const cons = (eachs) => {
  return {
    stateId: eachs.state_id,
    stateName: eachs.state_name,
    population: eachs.population,
  };
};
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const the = `SELECT * FROM state WHERE state_id=${stateId};`;
  const aw = await database.get(the);
  response.send(cons(aw));
});
//3
app.post("/districts/", async (request, response) => {
  const techuko = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = techuko;
  const cr = `INSERT INTO district(district_name,state_id,cases,cured,active,deaths)
    VALUES('${districtName}',${stateId},${cases},${cured},${active},${deaths});`;
  const awe = await database.run(cr);
  response.send("District Successfully Added");
});
//4
const constan = (as) => {
  return {
    districtId: as.district_id,
    districtName: as.district_name,
    stateId: as.state_id,
    cases: as.cases,
    cured: as.cured,
    active: as.active,
    deaths: as.deaths,
  };
};
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const sel = `SELECT * FROM district WHERE district_id=${districtId};`;
  const as = await database.get(sel);
  response.send(constan(as));
});
//5
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const dele = `DELETE FROM district WHERE district_id=${districtId};`;
  const w = await database.run(dele);
  response.send("District Removed");
});
//6
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const techuko = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = techuko;
  const upd = `UPDATE district SET 
    district_name='${districtName}',
    state_id=${stateId},
    cases=${cases},
   cured=${cured},
    active=${active},
    deaths=${deaths} WHERE district_id=${districtId};`;
  const it = await database.run(upd);
  response.send("District Details Updated");
});
//7    wait
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStateStatsQuery = `
    SELECT
      SUM(cases),
      SUM(cured),
      SUM(active),
      SUM(deaths)
    FROM
      district
    WHERE
      state_id=${stateId};`;
  const stats = await database.get(getStateStatsQuery);
  response.send({
    totalCases: stats["SUM(cases)"],
    totalCured: stats["SUM(cured)"],
    totalActive: stats["SUM(active)"],
    totalDeaths: stats["SUM(deaths)"],
  });
});
//8
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getStateNameQuery = `
    SELECT
      state_name
    FROM
      district
    NATURAL JOIN
      state
    WHERE 
      district_id=${districtId};`;
  const state = await database.get(getStateNameQuery);
  response.send({ stateName: state.state_name });
});
module.exports = app;
