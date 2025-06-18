// Panel.js — renders the left-side country detail panel

// Load panel-specific images
function setupPanelAssets() {
  filterImg = loadImage("img/filter.png");
  filterHoverImg = loadImage("img/filter_hovered.png");
}

function getShortName(name) {
  if (!name || typeof name !== "string") return "";

  name = name.trim();

  // Remove comma + suffix (e.g., ", II")
  name = name.replace(/,\s*(Jr\.|Sr\.|II|III|IV|V)$/, "");

  let parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "";

  // Rule 1: Quoted nickname
  if (name.includes('"')) {
    let nickname = name.match(/"(.*?)"/)?.[1];
    let last = parts[parts.length - 1];
    if (nickname && last) return `${nickname} ${last}`;
  }

  // Rule 2: Last word is in parentheses
  let last = parts[parts.length - 1];
  let preLast = parts[parts.length - 2] || "";
  if (last.startsWith("(") && last.endsWith(")")) {
    return `${parts[0]} ${preLast}`;
  }

  // Rule 3: Ordinal suffix (non-comma form)
  let suffixes = ["Jr.", "Sr.", "II", "III", "IV", "V"];
  if (suffixes.includes(last)) {
    return `${parts[0]} ${preLast}`;
  }

  // Rule 4: Default first + last
  if (parts.length >= 2) return `${parts[0]} ${last}`;
  return parts[0];
}

// Returns layout information for the athlete table headers in the side panel
// Includes each column's X position, width, header label, and the Y position of the header row
function getTableHeaderLayout(panelX) {
  const margin = 24;            // left margin inside panel
  const fY = 160;               // y-position of filter dropdown
  const headerY = fY + sportDropdownH + 42;  // table header is placed below dropdown

  // X positions of each column center, relative to panelX
  const colX = [
    panelX + margin,           // Athlete
    panelX + margin + 160,     // Sex
    panelX + margin + 190,     // Age
    panelX + margin + 230,     // Height
    panelX + margin + 270,     // Weight
    panelX + margin + 310,     // Gold
    panelX + margin + 350,     // Silver
    panelX + margin + 390      // Bronze
  ];

  // Widths for each column
  const colWidths = [140, 30, 40, 40, 40, 40, 40, 40];

  // Header labels (used for sorting and rendering)
  const headers = ["Athlete", "Sex", "Age", "Height", "Weight", "Gold", "Silver", "Bronze"];

  return { colX, colWidths, headers, headerY };
}

// Draws the detailed country panel showing selected country's athletes and medals
function drawCountryPanel() {
  if (clickedNOC === "" || !countryMap[clickedNOC]) return;
  let cd = countryMap[clickedNOC];

  let panelW = PANEL_WIDTH * width;
  let x = panelX;
  let margin = 24;

  // Get filtered and sorted athlete list
  let rawAthletes = cd.getAthletes(currentYearSeason);
  let { athleteList, sportSet } = filterAndSortAthletes(rawAthletes);

  // Build sport lookup for hover display
  let allRaw = cd.athleteListMap[currentYearSeason.toString()] || [];
  let sportLookup = {};
  for (let a of allRaw) {
    if (!sportLookup[a.name]) sportLookup[a.name] = a.sport;
  }

  // Get full list of available sports for dropdown options
  let fullSportSet = new Set();
  for (let a of allRaw) fullSportSet.add(a.sport);
  sportOptions = Array.from(fullSportSet).sort();

  // --- Panel Background ---
  noStroke();
  fill(255);
  rect(x, 0, panelW, height);

  // --- Panel Header ---
  textAlign(LEFT, TOP);
  textFont(oswaldBold, 100);
  fill(0);
  text(cd.NOC + " " + currentYearSeason.year, x + margin, -16);

  textFont(oswaldRegular, 18);
  text(cd.countryName.toUpperCase(), x + margin, 115);

  // --- Medal Tally ---
  let g = 0, s = 0, b = 0;
  let key = currentYearSeason.year + currentYearSeason.season.toUpperCase().charAt(0);
  let seen = new Set();
  let athletes = cd.athleteListMap[key] || [];

  for (let a of athletes) {
    for (let ev of a.eventList) {
      if (a.gold > 0 && !seen.has(ev + "|Gold")) { seen.add(ev + "|Gold"); g++; }
      if (a.silver > 0 && !seen.has(ev + "|Silver")) { seen.add(ev + "|Silver"); s++; }
      if (a.bronze > 0 && !seen.has(ev + "|Bronze")) { seen.add(ev + "|Bronze"); b++; }
    }
  }

  // Draw medal counts and icons
  let iconY = 115;
  let iconX = x + panelW - 160;
  let gap = 50;

  textAlign(LEFT, CENTER);
  textFont(urbanistBold, 16);
  fill(TEXT_COLOUR);
  text(g, iconX, iconY + 8); image(goldMedalIcon, iconX + 20, iconY, 16, 16);
  text(s, iconX + gap, iconY + 8); image(silverMedalIcon, iconX + gap + 20, iconY, 16, 16);
  text(b, iconX + 2 * gap, iconY + 8); image(bronzeMedalIcon, iconX + 2 * gap + 20, iconY, 16, 16);

  // --- Sport Filter Dropdown ---
  let fX = x + margin;
  let fY = 150;
  let hover = isMouseOver(fX, fY, sportDropdownW, sportDropdownH);
  fill(hover ? BUTTON_HOVER : TIER_S4_MEDAL);
  rect(fX, fY, sportDropdownW, sportDropdownH);
  image(hover ? filterHoverImg : filterImg, fX + sportDropdownW - 24, fY + 7, 16, 16);

  fill(0);
  textAlign(LEFT, CENTER);
  textFont(oswaldSemiBold, 14);
  text(selectedSport || "All sports", fX + 8, fY + sportDropdownH / 2);

  // --- Athlete Count Label ---
  textAlign(RIGHT, CENTER);
  textFont(urbanistMedium, 14);
  text(`${athleteList.length} athletes`, x + panelW - 30, fY + sportDropdownH / 2);

  // --- Table Headers ---
  textFont(oswaldRegular, 12);
  let { colX, headers, headerY } = getTableHeaderLayout(panelX);
  let arrowSize = 8;

  for (let i = 0; i < headers.length; i++) {
    let label = headers[i];
    textAlign(i === 0 ? LEFT : CENTER, BOTTOM);
    if (label === sortColumn) {
      image(sortDir === "asc" ? upArrow : downArrow, colX[i] - arrowSize / 2, headerY - 28, arrowSize, arrowSize);
    }
    text(label, colX[i], headerY);
  }

  // --- Scrollable Athlete Table ---
  let listYStart = headerY + 18;
  let listH = height - listYStart - 30;
  let rowH = 28;

  athleteScrollOffset = lerp(athleteScrollOffset, athleteScrollTarget, 0.2);
  athleteScrollOffset = constrain(athleteScrollOffset, 0, max(0, athleteList.length * rowH - listH));

  push();
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(x, listYStart - 12, panelW, listH + 4);
  drawingContext.clip();

  for (let i = 0; i < athleteList.length; i++) {
    let a = athleteList[i];
    let y = listYStart + i * rowH - athleteScrollOffset;
    if (y > listYStart + listH || y < listYStart - rowH) continue;

    let isHovered = selectedSport === null &&
      mouseX >= x && mouseX <= x + panelW &&
      mouseY >= y - rowH / 2 && mouseY <= y + rowH / 2;

    if (isHovered) {
      hoveredAthleteIndex = i;
      targetWipe = 140;
    }

    // --- Row Text ---
    textAlign(LEFT, CENTER);
    textFont(oswaldSemiBold, 14);
    text(getShortName(a.name), colX[0], y);

    textAlign(CENTER, CENTER);
    textFont(urbanistMedium, 12);
    text(a.sex || "-", colX[1], y);
    text(a.age || "-", colX[2], y);
    text(a.height || "-", colX[3], y);
    text(a.weight || "-", colX[4], y);

    textFont(urbanistExtraBold, 14);
    fill(GOLD); text(a.gold, colX[5], y);
    fill(SILVER); text(a.silver, colX[6], y);
    fill(BRONZE); text(a.bronze, colX[7], y);
    fill(0);

    // --- Wipe Reveal: Sport label on hover ---
    if (selectedSport === null && i === hoveredAthleteIndex) {
      sportLabelWipe = lerp(sportLabelWipe, targetWipe, 0.2);
      fill(BUTTON_HOVER);
      noStroke();
      rect(colX[1] - 8, y - rowH / 2 + 2, sportLabelWipe, rowH);
      fill(0);
      textAlign(LEFT, CENTER);
      textFont(oswaldRegular, 12);
      text(sportLookup[a.name] || "?", colX[1] + 4, y - 2);
    }

    // --- Row Divider ---
    stroke(BUTTON_SELECTED);
    strokeWeight(0.5);
    line(x + 24, y + rowH / 2 + 2, x + panelW - 12, y + rowH / 2 + 2);
    noStroke();
  }

  drawingContext.restore();

  // --- Vertical Scrollbar ---
  if (athleteList.length * rowH > listH) {
    let trackX = x + panelW - 6;
    let trackY = listYStart - 4;
    let trackW = 2;
    let trackH = listH + 4;

    let totalHeight = athleteList.length * rowH;
    let thumbH = map(listH, 0, totalHeight, 20, listH);
    let thumbY = map(athleteScrollOffset, 0, totalHeight - listH, trackY, trackY + trackH - thumbH);

    noStroke();
    fill(255); rect(trackX, trackY, trackW, trackH);         // track
    fill(BUTTON_SELECTED); rect(trackX, thumbY, trackW, thumbH); // thumb
  }

  pop();

  // --- Sport Dropdown List ---
  if (sportDropdownOpen) {
    push();
    fill(255);
    noStroke();
    rect(sportDropdownX, sportDropdownY - 4, sportDropdownW, menuHeight);
    drawSportDropdown();
    pop();
  }
}

// Filters, deduplicates, tallies medals, and sorts athlete data
function filterAndSortAthletes(athletes) {
  // --- Filter by selected sport (if any) ---
  let filtered = selectedSport
    ? athletes.filter(a => a.sport === selectedSport)
    : athletes;

  let map = new Map();    // For deduplicating by athlete name
  let sports = new Set(); // For collecting sport types present in this data

  // --- Tally medals per unique athlete ---
  for (let a of filtered) {
    sports.add(a.sport);

    if (!map.has(a.name)) {
      // First occurrence of this athlete
      map.set(a.name, {
        name: a.name,
        sex: a.sex,
        age: a.age,
        height: a.height,
        weight: a.weight,
        gold: a.gold,
        silver: a.silver,
        bronze: a.bronze
      });
    } else {
      // Aggregate medals for duplicate name
      let m = map.get(a.name);
      m.gold += a.gold;
      m.silver += a.silver;
      m.bronze += a.bronze;
    }
  }

  // Convert map to sorted list
  let list = Array.from(map.values());

  // --- Sorting logic ---
  if (sortColumn === "Athlete") {
    list.sort((a, b) =>
      sortDir === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );
  } else if (["Age", "Height", "Weight", "Gold", "Silver", "Bronze"].includes(sortColumn)) {
    list.sort((a, b) => {
      let va = a[sortColumn.toLowerCase()] || 0;
      let vb = b[sortColumn.toLowerCase()] || 0;
      return sortDir === "asc" ? va - vb : vb - va;
    });
  } else if (sortColumn === "Sex") {
    list.sort((a, b) =>
      sortDir === "asc"
        ? (a.sex || "").localeCompare(b.sex || "")
        : (b.sex || "").localeCompare(a.sex || "")
    );
  }

  return { athleteList: list, sportSet: sports };
}


function drawSportDropdown() {

  sportScrollLimit = max(0, (sportOptions.length + 1) * itemH - menuHeight);
  sportScrollOffset = lerp(sportScrollOffset, sportScrollTarget, 0.15);
  sportScrollOffset = constrain(sportScrollOffset, 0, sportScrollLimit);

  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(sportDropdownX, sportDropdownY, sportDropdownW, menuHeight);
  drawingContext.clip();

  for (let i = 0; i < sportOptions.length + 1; i++) {
    let label = i < sportOptions.length ? sportOptions[i] : "All sports";
    let y = sportDropdownY + i * itemH - sportScrollOffset;
    if (y < sportDropdownY - itemH || y > sportDropdownY + menuHeight) continue;

    let hover = isMouseOver(sportDropdownX, y, sportDropdownW, sportDropdownH);
    fill(hover ? TIER_S4_MEDAL : SCREEN_BG);
    rect(sportDropdownX, y, sportDropdownW, sportDropdownH);

    fill(0);
    textAlign(LEFT, CENTER);
    textFont(oswaldSemiBold, 14);
    text(label, sportDropdownX + 8, y + sportDropdownH / 2);
  }

  // Draw scrollbar if content overflows
  if (sportScrollLimit > 0) {
    let scrollbarX = sportDropdownX + sportDropdownW - 4;
    let trackTop = sportDropdownY;
    let trackHeight = menuHeight;

    let thumbHeight = map(menuHeight, 0, sportScrollLimit + menuHeight, 20, menuHeight);
    let thumbY = map(sportScrollOffset, 0, sportScrollLimit, trackTop, trackTop + trackHeight - thumbHeight);

    noStroke();
    fill(200); // scrollbar track (optional)
    rect(scrollbarX, trackTop, 4, trackHeight);

    fill(100); // scrollbar thumb
    rect(scrollbarX, thumbY, 4, thumbHeight);
  }

  drawingContext.restore();
}

