// Country.js — CountryData and YearSeason classes

class CountryData {
  constructor(noc, team, cname, region) {
    // Identity
    this.NOC = noc;
    this.olympicTeam = team;
    this.countryName = cname;
    this.region = region;
    this.otherAlias = "";
    this.historicAlias = "";

    // Stats
    this.landArea = 0;
    this.populationByYear = {};     // { year: population }
    this.validYears = new Set();    // e.g., for population availability

    // Olympics Data
    this.medalCount = {};           // { "2020-S": int }
    this.athleteCount = {};         // { "2020-S": int }
    this.athleteListMap = {};       // { "2020-S": [athlete1, athlete2, ...] }

    // Chart coordinates
    this.worldX = 0;
    this.worldY = 0;
    this.screenX = 0;
    this.screenY = 0;
    this.screenR = 0;
    this.adjustedPos = createVector(); // adjusted for pan/zoom

    // Animation state
    this.popStartTime = 0;
    this.hasPopped = false;
  }

  // ---------- MATCH CHECK ----------

  matchesName(s) {
    if (!s) return false;
    s = s.toLowerCase();
    return (
      s === this.countryName.toLowerCase() ||
      s === this.olympicTeam.toLowerCase() ||
      s === this.otherAlias.toLowerCase() ||
      s === this.historicAlias.toLowerCase()
    );
  }

  // ---------- DATA ADDITION ----------

  addMedal(ys, medal) {
    let key = ys.toString();
    if (!this.medalCount[key]) this.medalCount[key] = 0;
    if (["gold", "silver", "bronze"].includes(medal?.toLowerCase())) {
      this.medalCount[key]++;
    }
  }

  addAthlete(ys, athlete) {
    let key = ys.toString();
    if (!this.athleteListMap[key]) this.athleteListMap[key] = [];
    this.athleteListMap[key].push(athlete);
  }

  // ---------- YEAR-SEASON AGGREGATE CALC ----------

  computeYearSeasonAggregates() {
    for (let key in this.athleteListMap) {
      let athletes = this.athleteListMap[key];

      // Count unique athlete names
      let uniqueNames = new Set();
      for (let a of athletes) {
        if (a.name) uniqueNames.add(a.name.trim().toLowerCase());
      }
      this.athleteCount[key] = uniqueNames.size;

      // Count unique event-medal combinations
      let uniqueMedals = new Set();
      for (let a of athletes) {
        for (let ev of a.eventList) {
          if (a.gold > 0) uniqueMedals.add(`${ev}|Gold`);
          if (a.silver > 0) uniqueMedals.add(`${ev}|Silver`);
          if (a.bronze > 0) uniqueMedals.add(`${ev}|Bronze`);
        }
      }
      this.medalCount[key] = uniqueMedals.size;
    }
  }

  // ---------- PARTICIPATION ----------

  participatedIn(ys) {
    if (!ys || typeof ys.toString !== "function") return false;
    let key = ys.toString();
    return this.medalCount[key] !== undefined || this.athleteListMap[key] !== undefined;
  }

  // ---------- VALUE GETTER FOR AXIS VARIABLES ----------

  getValue(varName, ys) {
    let key = ys.toString();

    if (varName === "Alphabetical") {
      let sortedKeys = Object.keys(countryMap).sort((a, b) =>
        countryMap[a].countryName.localeCompare(countryMap[b].countryName)
      );
      return sortedKeys.indexOf(this.NOC);
    }

    if (varName === "Total Medals")   return this.medalCount[key] || 0;
    if (varName === "Athlete Count")  return this.athleteCount[key] || 0;
    if (varName === "Population")     return this.populationByYear[ys.year] || 0;
    if (varName === "Land Area")      return this.landArea;

    return 0;
  }

  // ---------- GETTERS ----------

  getAthletes(ys) {
    return this.athleteListMap[ys.toString()] || [];
  }

  getAllYearSeasons() {
    let keys = new Set();
    for (let k in this.medalCount)     keys.add(k);
    for (let k in this.athleteListMap) keys.add(k);
    return Array.from(keys).map(YearSeason.fromString);
  }
}

class YearSeason {
  constructor(year, season) {
    // standardize to year + "S"/"W"
    this.year = parseInt(year);
    this.season = season.toLowerCase().startsWith("w") ? "W" : "S"; // ensures valid format
  }

  // --- convert to string key like "2020S"
  toString() {
    return `${this.year}${this.season}`;
  }

  // --- user-friendly label like "2020 S"
  label() {
    return `${this.year} ${this.season}`;
  }

  // --- comparison logic for sorting
  compareTo(other) {
    if (this.year !== other.year) return this.year - other.year;
    return this.season.localeCompare(other.season); // W < S for alphabetical sorting
  }

  // --- check equality with another YearSeason
  equals(other) {
    return this.year === other.year && this.season === other.season;
  }

  // --- parse from string like "2020S" or "1992W"
  static fromString(s) {
    let year = parseInt(s.slice(0, -1));
    let season = s.slice(-1);
    return new YearSeason(year, season);
  }
}
