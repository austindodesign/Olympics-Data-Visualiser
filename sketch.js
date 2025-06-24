// sketch.js — Main Olympic Data Visualiser (p5.js version)
// ========== FONT ASSETS ==========
let oswaldBold, oswaldExtraLight, oswaldRegular, oswaldSemiBold;
let urbanistBlack, urbanistBold, urbanistExtraBold, urbanistExtraLight, urbanistLight, urbanistMedium;

// ========== CONSTANTS ==========

// Canvas and chart dimensions
const SKETCH_W = 1280;
const SKETCH_H = 720;
const CHART_LEFT = 80;
const CHART_RIGHT = 1200;
const CHART_TOP = 100;
const CHART_BOTTOM = 600;
const CHART_W = CHART_RIGHT - CHART_LEFT;
const CHART_H = CHART_BOTTOM - CHART_TOP;

// Panel and layout
const PANEL_W = Math.floor(SKETCH_W * 0.30);
const PANEL_H = SKETCH_H;
const PANEL_WIDTH = 0.35; // fraction of screen width

// Dropdowns and filter
const DROPDOWN_W = 160;
const DROPDOWN_H = 30;
const menuItemSpacing = 4;
const visibleCount = 13;
const itemH = DROPDOWN_H + menuItemSpacing;
let menuHeight = visibleCount * itemH;

// Timeline slider
const NUM_VISIBLE_TICKS = 10;
const TICK_SPACING = 80;
const SLIDER_WIDTH = NUM_VISIBLE_TICKS * TICK_SPACING;
const SLIDER_X = (SKETCH_W - SLIDER_WIDTH) / 2;
const SLIDER_Y = CHART_BOTTOM + 80;

// Buttons
const RESET_BTN_W = 100;
const RESET_BTN_H = 30;
const RESET_BTN_Y = CHART_TOP - 36;
const RESET_BTN_X = SKETCH_W - RESET_BTN_W - 80;

const INFO_BTN_SIZE = 20;
const INFO_BTN_X = (CHART_LEFT + CHART_RIGHT) / 2 + 130;
const INFO_BTN_Y = CHART_TOP - 34;

const SEARCH_BTN_SIZE = 30;
const SEARCH_BTN_X = RESET_BTN_X - 42;
const SEARCH_BTN_Y = RESET_BTN_Y;

// General config
const CHART_MARGIN_RATIO = 0.05;
const EASE = 0.1;
const sortableColumns = ["Athlete", "Sex", "Age", "Height", "Weight", "Gold", "Silver", "Bronze"];

// ========== COLOR SCHEME ==========
const HOST_NATION = "#00CB50";
const NO_MEDAL = "#B4B4B4";

const TIER_S1_MEDAL = "#ff555f";
const TIER_S2_MEDAL = "#ff833a";
const TIER_S3_MEDAL = "#ffb114";
const TIER_S4_MEDAL = "#ffce19";

const TIER_W1_MEDAL = "#0078d0";
const TIER_W2_MEDAL = "#00e2de";
const TIER_W3_MEDAL = "#00dd81";
const TIER_W4_MEDAL = "#80d237";

const SCREEN_BG = "#E5E5E5";
const BUTTON_UNSELECTED = "#B4B4B4";
const BUTTON_SELECTED = "#B4B4B4";
const BUTTON_HOVER = "#00e2de";

const LABEL_AND_LINE = "#B4B4B4";
const SLIDER_ANCHOR = "#FF555F";
const TEXT_COLOUR = "#000000";

const GOLD = "#D7B31B";
const SILVER = "#969696";
const BRONZE = "#996B4F";

// ========== GLOBAL STATE ==========

// Chart axis
let selectedX = "Athlete Count";
let selectedY = "Total Medals";
let axisOptions = ["Athlete Count", "Population", "Land Area", "Alphabetical"];
let xDropdownOpen = false;
let yDropdownOpen = false;
let dropdownItemHeight = 20;
let X_DROPDOWN_X, X_DROPDOWN_Y = CHART_BOTTOM + 10;

// Data
let countryMap = {};
let yearSeasonList = [];
let yearXpos = {};
let flagMap = {};
let currentYearSeason;
let medalIcon;

// Circle interactions
let hoveredNOC = "";
let clickedNOC = "";
let hoverStartTime = 0;
let clickStartTime = 0;
let expandedNOC = "";  // currently expanded circle

// Panning and zooming
let isPanning = false;
let panStartMouse, panStartOffset;
let currentZoom = 5.0;
let targetZoom = 0.9;
let currentPan, targetPan;
let currentOffset, targetOffset;

// Timeline slider state
let dragStartIndex = 0;
let sliderOffset = 0;
let targetSliderOffset = 0;
let draggingSlider = false;
let dragStartX = 0;
let dragStartOffset = 0;
let currentSliderIndex = 0;

// Tables and data
let aliasTable;
let statsTable;
let popTable;
let olympicsTablePart1, olympicsTablePart2;
let hostCityMap = {};

// ========== PANEL (Right Side) UI ==========

let panelOpen = false;
let panelX = -400;
let targetPanelX = -400;

let aboutOpen = false;
let aboutPanelAlpha = 0;
let targetAboutAlpha = 0;

let sportDropdownOpen = false;
let sportDropdownX = 0;
let sportDropdownY = 0;
let sportDropdownW = 190;
let sportDropdownH = 30;

let sportScrollOffset = 0;
let sportScrollTarget = 0;
let sportScrollLimit = 0;

let sportOptions = [];
let selectedSport = null;

let sortColumn = "Athlete";
let sortDir = "asc";

let athleteScrollOffset = 0;
let athleteScrollTarget = 0;

// Sport hover effect
let hoveredAthleteIndex = -1;
let sportLabelWipe = 0;
let targetWipe = 0;

// ========== UI ICONS ==========
let infoIcon, infoIconHover;
let searchIcon;
let filterImg, filterHoverImg;
let goldMedalIcon, silverMedalIcon, bronzeMedalIcon;
let upArrow, downArrow;

// ========== SEARCH BAR ==========
let searchBarWidth = 200;
let searchInput = "";
let isTyping = false;


function preload() {
  oswaldExtraLight = loadFont("fonts/Oswald-ExtraLight.ttf");
  oswaldBold = loadFont("fonts/Oswald-Bold.ttf");
  oswaldSemiBold = loadFont("fonts/Oswald-SemiBold.ttf");
  oswaldRegular = loadFont("fonts/Oswald-Regular.ttf");
  urbanistExtraLight = loadFont("fonts/Urbanist-ExtraLight.ttf");
  urbanistLight = loadFont("fonts/Urbanist-Light.ttf");
  urbanistMedium = loadFont("fonts/Urbanist-Medium.ttf");
  urbanistBlack = loadFont("fonts/Urbanist-Black.ttf");
  urbanistBold = loadFont("fonts/Urbanist-Bold.ttf");
  urbanistExtraBold = loadFont("fonts/Urbanist-ExtraBold.ttf");


  aliasTable = loadTable("sources/country_code_alias.csv", "header");
  statsTable = loadTable("sources/country_stats_2023.csv", "header");
  popTable = loadTable("sources/worldpop.csv", "header");
  olympicsTablePart1 = loadTable("sources/olympic_1896-1948.csv", "header");
  olympicsTablePart2 = loadTable("sources/olympic_1952-1984.csv", "header");
  olympicsTablePart3 = loadTable("sources/olympic_1985-2016.csv", "header");

  infoIcon = loadImage("img/info_btn.png");
  infoIconHover = loadImage("img/info_hovered_btn.png");
  medalIcon = loadImage("img/totalMedal.png");
  searchIcon = loadImage("img/search.png");
  goldMedalIcon = loadImage("img/gold_medal.png");
  silverMedalIcon = loadImage("img/silver_medal.png");
  bronzeMedalIcon = loadImage("img/bronze_medal.png");
  upArrow = loadImage("img/upArrow.png")
  downArrow = loadImage("img/downArrow.png")

}

function setup() {
  // Create canvas and attach to body
  let cnv = createCanvas(SKETCH_W, SKETCH_H);
  cnv.parent(document.body);

  // Initial drawing settings
  textAlign(LEFT, CENTER);
  smooth();

  // Set up vectors for chart pan and offset
  currentOffset = createVector(0, 0);
  targetOffset = createVector(0, 0);
  currentPan = createVector(0, 0);
  targetPan = createVector(0, 0);

  // Load all major datasets
  loadCountryAliases();         // NOC alias handling
  loadCountryStats();           // Population, land, etc
  loadWorldPop();               // Per-country population over years
  loadOlympicParticipation();   // Participation metadata
  loadOlympicsData();           // Athlete and medal info

  // Preload icons, fonts, medal images
  setupPanelAssets();

  // Register host city for each Games
  for (let row of [...olympicsTablePart1.rows, ...olympicsTablePart2.rows, ...olympicsTablePart3.rows]) {
    const year = parseInt(row.getString("Year"));
    const season = row.getString("Season").trim().toUpperCase().charAt(0); // "S" or "W"
    const city = row.getString("City");
    const key = `${year}-${season}`;
    if (year && season && city && !hostCityMap[key]) {
      hostCityMap[key] = city;
    }
  }

  // Build timeline slider metadata
  buildYearSeasonList();
  computeSliderPositions();

  // Set default selection to 2016 (index 50)
  if (yearSeasonList.length > 0) {
    currentSliderIndex = 50;
    currentYearSeason = yearSeasonList[currentSliderIndex];
    targetSliderOffset = currentSliderIndex * TICK_SPACING - SLIDER_WIDTH / 2;
    sliderOffset = targetSliderOffset;
  }
}

function draw() {
  background(SCREEN_BG);

  // ========== GAME EDITION HEADER ==========
  if (currentYearSeason) {
    let year = currentYearSeason.year;
    let seasonKey = currentYearSeason.season.toUpperCase().charAt(0); // "S" or "W"
    let city = hostCityMap?.[`${year}-${seasonKey}`] || "";

    let headerX = CHART_LEFT + 18;
    let headerY = CHART_TOP - 48;

    textAlign(LEFT, TOP);
    noStroke();
    fill(TEXT_COLOUR);

    // Year label
    textFont(oswaldBold, 64);
    text(year, headerX, headerY);

    // City label
    if (city !== "") {
      textFont(oswaldSemiBold, 20);
      text(city, headerX, headerY + 80);
    }
  }

  // ========== CHART INTERACTIONS ==========
  currentZoom = lerp(currentZoom, targetZoom, EASE);
  currentPan.x = lerp(currentPan.x, targetPan.x, EASE);
  currentPan.y = lerp(currentPan.y, targetPan.y, EASE);

  drawSlider();
  drawDropdowns();

  // Country circles (clipped to chart bounds)
  push();
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(CHART_LEFT + 1, CHART_TOP + 1, CHART_W, CHART_H);
  drawingContext.clip();
  drawAllCountryCircles();
  drawingContext.restore();
  pop();

  drawAxes();

  // ========== RESET VIEW BUTTON ==========
  let resetHover = isMouseOver(RESET_BTN_X, RESET_BTN_Y, RESET_BTN_W, RESET_BTN_H);
  noStroke();
  fill(resetHover ? BUTTON_HOVER : BUTTON_SELECTED);
  rect(RESET_BTN_X, RESET_BTN_Y, RESET_BTN_W, RESET_BTN_H);
  fill(TEXT_COLOUR);
  textAlign(CENTER, CENTER);
  textFont(urbanistMedium, 12);
  text("RESET VIEW", RESET_BTN_X + RESET_BTN_W / 2, RESET_BTN_Y + RESET_BTN_H / 2);

  // ========== VISUALISER TITLE ==========
  textFont(oswaldBold, 16);
  noStroke();
  fill(TEXT_COLOUR);
  textAlign(CENTER, TOP);
  text("OLYMPIC GAMES STATS VISUALISER", (CHART_LEFT + CHART_RIGHT) / 2, CHART_TOP - 36);

  // ========== SEARCH BAR ==========
  let showPlaceholder = !searchInput && !isTyping;
  let barText = showPlaceholder ? "Search country" : searchInput;

  // Background
  fill(BUTTON_UNSELECTED);
  noStroke();
  rect(SEARCH_BTN_X - searchBarWidth + 23, SEARCH_BTN_Y, searchBarWidth, SEARCH_BTN_SIZE, SEARCH_BTN_SIZE);

  // Text or placeholder
  fill(TEXT_COLOUR);
  textFont(urbanistLight, 14);
  textAlign(LEFT, CENTER);
  text(barText, SEARCH_BTN_X - searchBarWidth + 39, SEARCH_BTN_Y + SEARCH_BTN_SIZE / 2);

  // Blinking cursor
  if (isTyping && millis() % 1000 < 500) {
    let tw = textWidth(barText);
    let cursorX = SEARCH_BTN_X - searchBarWidth + 39 + tw + 5;
    let cursorY1 = SEARCH_BTN_Y + 8;
    let cursorY2 = SEARCH_BTN_Y + SEARCH_BTN_SIZE - 8;
    stroke(TEXT_COLOUR);
    strokeWeight(1);
    line(cursorX, cursorY1, cursorX, cursorY2);
  }

  // Search icon
  imageMode(CORNER);
  image(searchIcon, SEARCH_BTN_X, SEARCH_BTN_Y, SEARCH_BTN_SIZE, SEARCH_BTN_SIZE);

  // ========== INFO (ABOUT) ICON ==========
  let isInfoHover = isMouseOver(INFO_BTN_X, INFO_BTN_Y, INFO_BTN_SIZE, INFO_BTN_SIZE);
  image(isInfoHover ? infoIconHover : infoIcon, INFO_BTN_X, INFO_BTN_Y, INFO_BTN_SIZE, INFO_BTN_SIZE);

  // ========== SIDE PANEL ==========
  targetPanelX = panelOpen ? 0 : -PANEL_WIDTH * width;
  panelX = lerp(panelX, targetPanelX, 0.15);
  drawCountryPanel();

  // ========== ABOUT PANEL ==========
  targetAboutAlpha = aboutOpen ? 1 : 0;
  aboutPanelAlpha = lerp(aboutPanelAlpha, targetAboutAlpha, 0.3);

  if (aboutPanelAlpha > 0.01) {
    // Dim background
    fill(255, 255, 255, 150 * aboutPanelAlpha);
    noStroke();
    rect(0, 0, width, height);

    // Panel box
    let modalX = CHART_LEFT;
    let modalY = CHART_TOP;
    let modalW = CHART_W;
    let modalH = CHART_H;

    fill(255);
    noStroke();
    rect(modalX, modalY, modalW, modalH);

    // Title
    fill(TEXT_COLOUR);
    textAlign(CENTER, TOP);
    textFont(oswaldBold, 32);
    text("ABOUT THIS VISUALISER", modalX + modalW / 2, modalY + 40);
    

    // -- Draw link text
let linkText = "For information about how to use, file structure, credit and license, visit my github page:";
let linkURL = "https://github.com/austindodesign/Olympics-Data-Visualiser/blob/main/README.txt";
let linkX = modalX + 40;
let linkY = modalY + modalH - 40;

textFont(urbanistMedium, 12);
fill(0);
textAlign(LEFT, CENTER);
text(linkText, linkX, linkY);

fill(BUTTON_HOVER); // distinguish the link visually
text(linkURL, linkX, linkY + 18);


    // Close button (X)
    let closeX = modalX + modalW - 30;
    let closeY = modalY + 20;
    textAlign(CENTER, CENTER);
    textFont(urbanistBold, 20);
    text("X", closeX, closeY);
  }
}

// Reset view to default zoom, pan, and bubble state
function resetView() {
  // Clear selected country
  clickedNOC = "";

  // Reset zoom and pan to default
  targetZoom = 0.9;
  targetPan = createVector(0, 0);

  // Restart circle pop animation for all countries
  for (let key in countryMap) {
    let cd = countryMap[key];
    cd.hasPopped = false;
    cd.popStartTime = millis() + int(random(0, 500)); // staggered delay for animation
  }
}


function isMouseOver(x, y, w, h) {
  return mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
}

// Draw the timeline year-season slider and tick labels
function drawSlider() {
  // Smoothly animate the slider position
  sliderOffset = lerp(sliderOffset, targetSliderOffset, 0.1);

  // Determine the aligned tick under the anchor
  let anchorX = SLIDER_X + SLIDER_WIDTH / 2;
  let alignedIndex = round((sliderOffset + anchorX - SLIDER_X) / TICK_SPACING);
  alignedIndex = constrain(alignedIndex, 0, yearSeasonList.length - 1);

  // Draw the fixed triangle anchor
  fill(SLIDER_ANCHOR);
  noStroke();
  let triangleY = SLIDER_Y + 8;
  triangle(anchorX - 6, triangleY + 6, anchorX + 6, triangleY + 6, anchorX, triangleY);

  // Draw timeline ticks and labels
  for (let i = 0; i < yearSeasonList.length; i++) {
    let ys = yearSeasonList[i];
    let x = SLIDER_X + i * TICK_SPACING - sliderOffset;

    // Skip off-screen ticks for performance
    if (x < SLIDER_X - TICK_SPACING || x > SLIDER_X + SLIDER_WIDTH + TICK_SPACING) continue;

    // Draw tick mark
    stroke(LABEL_AND_LINE);
    line(x, SLIDER_Y - 5, x, SLIDER_Y + 5);

    // Draw year-season label
    noStroke();
    fill(TEXT_COLOUR);
    textAlign(CENTER, BOTTOM);
    textFont(i === alignedIndex ? urbanistBold : urbanistMedium, 14);
    text(ys.label(), x, SLIDER_Y - 8);
  }
}

// Draws the X-axis dropdown menu and static Y-axis label
function drawDropdowns() {
  // Calculate dropdown X position centered between chart edges
  X_DROPDOWN_X = (CHART_LEFT + CHART_RIGHT) / 2 - DROPDOWN_W / 2;

  // ===== Draw Main Dropdown Button (X-axis selector) =====
  let xHover = isMouseOver(X_DROPDOWN_X, X_DROPDOWN_Y, DROPDOWN_W, DROPDOWN_H);
  fill(xHover || xDropdownOpen ? BUTTON_HOVER : BUTTON_SELECTED);
  noStroke();
  rect(X_DROPDOWN_X, X_DROPDOWN_Y, DROPDOWN_W, DROPDOWN_H);

  // Button label (currently selected axis)
  fill(TEXT_COLOUR);
  textFont(urbanistMedium, 12);
  textAlign(CENTER, CENTER);
  text(selectedX.toUpperCase(), X_DROPDOWN_X + DROPDOWN_W / 2, X_DROPDOWN_Y + DROPDOWN_H / 2);

  // ===== Dropdown Options (if open) =====
  if (xDropdownOpen) {
    for (let i = 0; i < axisOptions.length; i++) {
      let val = axisOptions[i];
      let itemY = X_DROPDOWN_Y + DROPDOWN_H + i * dropdownItemHeight;
      let isHover = isMouseOver(X_DROPDOWN_X, itemY, DROPDOWN_W, dropdownItemHeight);

      // Option background
      fill(isHover ? BUTTON_HOVER : BUTTON_UNSELECTED);
      noStroke();
      rect(X_DROPDOWN_X, itemY, DROPDOWN_W, dropdownItemHeight);

      // Option text
      fill(TEXT_COLOUR);
      text(val.toUpperCase(), X_DROPDOWN_X + DROPDOWN_W / 2, itemY + dropdownItemHeight / 2);
    }
  }

  // ===== Y-Axis Label (rotated, static) =====
  push();
  translate(CHART_LEFT - 15, (CHART_TOP + CHART_BOTTOM) / 2);
  rotate(-HALF_PI);
  fill(TEXT_COLOUR);
  noStroke();
  textAlign(CENTER, CENTER);
  textFont(urbanistMedium, 12);
  text("TOTAL MEDALS", 0, 0);
  pop();
}

// Handles all interactions related to the X-axis dropdown menu
function handleDropdownClicks() {
  // ===== Toggle dropdown menu if main button is clicked =====
  if (isMouseOver(X_DROPDOWN_X, X_DROPDOWN_Y, DROPDOWN_W, DROPDOWN_H)) {
    xDropdownOpen = !xDropdownOpen;
    yDropdownOpen = false; // ensure only one menu is open at a time
    return;
  }

  // ===== Handle option selection =====
  if (xDropdownOpen) {
    for (let i = 0; i < axisOptions.length; i++) {
      let itemY = X_DROPDOWN_Y + DROPDOWN_H + i * dropdownItemHeight;
      if (isMouseOver(X_DROPDOWN_X, itemY, DROPDOWN_W, dropdownItemHeight)) {
        let val = axisOptions[i];

        // Prevent user from re-selecting "Total Medals" as x-axis (it's reserved for y-axis)
        if (val !== "Total Medals") {
          selectedX = val;
          resetView();  // Reset zoom/pan when new axis selected
        }

        xDropdownOpen = false;
        return;
      }
    }
  }

  // ===== Close menu if click is outside dropdown area =====
  xDropdownOpen = false;
}

function mousePressed() {
  handleDropdownClicks();

  // ===== Slider drag start =====
  if (mouseY >= SLIDER_Y - 20 && mouseY <= SLIDER_Y + 20) {
    draggingSlider = true;
    dragStartX = mouseX;
    dragStartOffset = targetSliderOffset;
  }

  // ===== Reset View button =====
  if (isMouseOver(RESET_BTN_X, RESET_BTN_Y, RESET_BTN_W, RESET_BTN_H)) {
    resetView();
    return;
  }

  // ===== Country circle click =====
  for (let key in countryMap) {
    let cd = countryMap[key];
    if (!cd.participatedIn(currentYearSeason)) continue;

    let dx = mouseX - cd.adjustedPos.x;
    let dy = mouseY - cd.adjustedPos.y;
    let dist = sqrt(dx * dx + dy * dy);

    if (dist < cd.screenR) {
      if (clickedNOC !== cd.NOC) {
        // First click on a new country
        clickedNOC = cd.NOC;
        expandedNOC = cd.NOC;
        clickStartTime = millis();
        targetPanelX = -PANEL_WIDTH * width;
      } else if (!panelOpen) {
        // Second click opens panel
        panelOpen = true;
      } else {
        // Third click closes panel
        panelOpen = false;
        targetPanelX = -PANEL_WIDTH * width;
        athleteScrollOffset = 0;
        athleteScrollTarget = 0;
      }
      return;
    }
  }

  // ===== Panning chart canvas =====
  if (
    mouseX >= CHART_LEFT &&
    mouseX <= CHART_RIGHT &&
    mouseY >= CHART_TOP &&
    mouseY <= CHART_BOTTOM
  ) {
    isPanning = true;
    panStartMouse = createVector(mouseX, mouseY);
    panStartOffset = targetPan.copy();
  }

  // ===== Deselect panel when clicked outside =====
  if (clickedNOC !== "") {
    let insidePanel = mouseX < panelX + PANEL_WIDTH * width;
    if (!insidePanel) {
      let cd = countryMap[clickedNOC];
      let dx = mouseX - cd.adjustedPos.x;
      let dy = mouseY - cd.adjustedPos.y;
      if (sqrt(dx * dx + dy * dy) >= cd.screenR) {
        clickedNOC = "";
        panelOpen = false;
        targetPanelX = -PANEL_WIDTH * width;
        athleteScrollOffset = 0;
        athleteScrollTarget = 0;
      }
    }
  }

  // ===== About button click =====
  if (isMouseOver(INFO_BTN_X, INFO_BTN_Y, INFO_BTN_SIZE, INFO_BTN_SIZE)) {
    aboutOpen = !aboutOpen;
    return;
  }

  // ===== About panel dismissals =====
  if (aboutPanelAlpha > 0.9) {
    let modalX = CHART_LEFT;
    let modalY = CHART_TOP;
    let modalW = CHART_W;
    let modalH = CHART_H;

    let closeBtnX = modalX + modalW - 40;
    let closeBtnY = modalY + 10;

    if (
      mouseX < modalX || mouseX > modalX + modalW ||
      mouseY < modalY || mouseY > modalY + modalH
    ) {
      aboutOpen = false;
      return;
    }

    if (
      mouseX >= closeBtnX && mouseX <= closeBtnX + 30 &&
      mouseY >= closeBtnY && mouseY <= closeBtnY + 20
    ) {
      aboutOpen = false;
      return;
    }
  }

  // ===== Search bar focus toggle =====
  let barX = SEARCH_BTN_X - searchBarWidth + 23;
  let barY = SEARCH_BTN_Y;
  let barH = SEARCH_BTN_SIZE;
  if (
    mouseX >= barX && mouseX <= barX + searchBarWidth &&
    mouseY >= barY && mouseY <= barY + barH
  ) {
    isTyping = true;
    return;
  } else {
    isTyping = false;
  }

  // ===== Sport filter dropdown interaction =====
  if (panelOpen) {
    let fX = panelX + 24;
    let fY = 160;

    // Toggle dropdown open/close
    if (isMouseOver(fX, fY, sportDropdownW, sportDropdownH)) {
      sportDropdownOpen = !sportDropdownOpen;
      sportDropdownX = fX;
      sportDropdownY = fY + sportDropdownH + 4;
      sportScrollTarget = 0;
      return;
    }

    // Select item in dropdown
    if (sportDropdownOpen) {
      let relY = mouseY - sportDropdownY + sportScrollOffset;
      let index = floor(relY / itemH);
      if (index >= 0 && index < sportOptions.length) {
        selectedSport = sportOptions[index];
      } else {
        selectedSport = null;
      }
      sportDropdownOpen = false;
      athleteScrollOffset = 0;
      athleteScrollTarget = 0;
      return;
    }
  }

  // ===== Click outside dropdown to close it =====
  if (
    sportDropdownOpen &&
    !isMouseOver(sportDropdownX, sportDropdownY, sportDropdownW, sportOptions.length * itemH)
  ) {
    sportDropdownOpen = false;
    athleteScrollOffset = 0;
    athleteScrollTarget = 0;
  }

  // ===== Column sorting =====
  const { colX, colWidths, headers, headerY } = getTableHeaderLayout(panelX);
  for (let i = 0; i < headers.length; i++) {
    let x = colX[i] - colWidths[i] / 2;
    let y = headerY - 16;
    let w = colWidths[i];
    let h = 20;

    if (
      mouseX >= x && mouseX <= x + w &&
      mouseY >= y && mouseY <= y + h &&
      sortableColumns.includes(headers[i])
    ) {
      let col = headers[i];
      if (sortColumn === col) {
        sortDir = sortDir === "asc" ? "desc" : "asc";
      } else {
        sortColumn = col;
        sortDir = "asc";
      }
      return;
    }
  }
  // -- About panel link click
if (aboutPanelAlpha > 0.9) {
  let linkX = CHART_LEFT + 40;
  let linkY = CHART_TOP + CHART_H - 22;
  let tw = textWidth("https://github.com/austindodesign/Olympics-Data-Visualiser/blob/main/README.txt");
  if (mouseX >= linkX && mouseX <= linkX + tw && mouseY >= linkY - 8 && mouseY <= linkY + 8) {
    window.open("https://github.com/austindodesign/Olympics-Data-Visualiser/blob/main/README.txt", "_blank");
  }
}

}

function mouseDragged() {
  // ===== Timeline slider drag =====
  if (draggingSlider) {
    targetSliderOffset = dragStartOffset - (mouseX - dragStartX);
  }

  // ===== Chart panning =====
  if (isPanning) {
    let dx = (mouseX - pmouseX) * getMaxValueForYearSeason(selectedX, currentYearSeason) / CHART_W / currentZoom;
    let dy = (mouseY - pmouseY) * getMaxValueForYearSeason(selectedY, currentYearSeason) / CHART_H / currentZoom;

    targetPan.x -= dx; // move view right if dragging left
    targetPan.y += dy; // move view down if dragging up
  }
}

function mouseReleased() {
  // ===== Finalize Slider Drag =====
  if (draggingSlider) {
    draggingSlider = false;

    // Snap to nearest tick
    let anchorX = SLIDER_X + SLIDER_WIDTH / 2;
    let exactIndex = (targetSliderOffset + anchorX - SLIDER_X) / TICK_SPACING;
    currentSliderIndex = constrain(round(exactIndex), 0, yearSeasonList.length - 1);

    // Update current year and slider position
    currentYearSeason = yearSeasonList[currentSliderIndex];
    targetSliderOffset = currentSliderIndex * TICK_SPACING - SLIDER_WIDTH / 2;

    // Reset view to re-center zoom/pan and recalculate circle states
    resetView();
  }

  // ===== End Chart Panning =====
  isPanning = false;

  // ===== Re-center View to Selected Country (if clicked) =====
  if (clickedNOC !== "") {
    let cd = countryMap[clickedNOC];

    if (cd && cd.participatedIn(currentYearSeason)) {
      // Compute margin padding
      let maxDataX = getMaxValueForYearSeason(selectedX, currentYearSeason);
      let maxDataY = getMaxValueForYearSeason(selectedY, currentYearSeason);
      let marginX = maxDataX * CHART_MARGIN_RATIO;
      let marginY = maxDataY * CHART_MARGIN_RATIO;

      // Target data position of selected country
      let dataX = cd.getValue(selectedX, currentYearSeason);
      let dataY = cd.getValue(selectedY, currentYearSeason);

      // Center of screen in data-space
      let screenCX = (CHART_LEFT + CHART_RIGHT) / 2;
      let screenCY = (CHART_TOP + CHART_BOTTOM) / 2;

      let targetDataX = map(screenCX, CHART_LEFT, CHART_RIGHT, -marginX, maxDataX + marginX) / currentZoom + currentPan.x;
      let targetDataY = map(screenCY, CHART_BOTTOM, CHART_TOP, -marginY, maxDataY + marginY) / currentZoom + currentPan.y;

      // Adjust pan so country aligns with screen center
      targetPan.x = dataX - (targetDataX - currentPan.x);
      targetPan.y = dataY - (targetDataY - currentPan.y);
    }
  }
}

function mouseMoved() {
  // ===== Hover Detection on Circles =====
  if (!panelOpen && clickedNOC === "") {
    hoveredNOC = "";

    for (let key in countryMap) {
      let cd = countryMap[key];
      if (!cd.participatedIn(currentYearSeason)) continue;

      let dx = mouseX - cd.adjustedPos.x;
      let dy = mouseY - cd.adjustedPos.y;
      if (sqrt(dx * dx + dy * dy) < cd.screenR) {
        hoveredNOC = cd.NOC;
        hoverStartTime = millis();
        return;
      }
    }
  }

  // ===== Early Exit if No Country is Selected =====
  if (!clickedNOC || !countryMap[clickedNOC]) return;
  let cd = countryMap[clickedNOC];

  // ===== Hover Detection on Athlete Rows (only if All Sports is selected) =====
  if (panelOpen && selectedSport === null) {
    hoveredAthleteIndex = -1;

    const rowH = 28;
    const y0 = 160 + sportDropdownH + 50 + 10; // starting Y position for table
    const visibleCount = Math.floor((height - y0 - 30) / rowH);
    const { athleteList } = filterAndSortAthletes(cd.getAthletes(currentYearSeason));

    for (let i = 0; i < Math.min(athleteList.length, visibleCount); i++) {
      let y = y0 + i * rowH - athleteScrollOffset;
      if (mouseY >= y - rowH / 2 && mouseY <= y + rowH / 2) {
        hoveredAthleteIndex = i;
        break;
      }
    }
  }
}

function mouseWheel(event) {

  // ---- check if mouse is inside visible panel (only when open)
  let panelW = PANEL_WIDTH * width;
  let insidePanel = panelOpen && mouseX < panelX + panelW;

  // ---- check if mouse is over the dropdown menu
  let menuHeight = (sportDropdownH + menuItemSpacing) * (sportOptions.length + 1);
  let overDropdown = sportDropdownOpen &&
    mouseX >= sportDropdownX &&
    mouseX <= sportDropdownX + sportDropdownW &&
    mouseY >= sportDropdownY &&
    mouseY <= sportDropdownY + menuHeight;

  // ===== PRIORITY 1: Dropdown Menu Scroll =====
  if (overDropdown) {
    sportScrollTarget += event.delta;
    event.preventDefault();
    return; // skip other scroll behaviors
  }

  // ===== PRIORITY 2: Athlete List Scroll =====
  if (panelOpen && insidePanel) {
    athleteScrollTarget += event.delta;
    event.preventDefault();
    return;
  }

  // ===== PRIORITY 3: Chart Zoom (only if not over panel/dropdown) =====
  if (!insidePanel && !sportDropdownOpen) {
    let zoomFactor = 1 - event.delta * 0.001;

    let maxX = getMaxValueForYearSeason(selectedX, currentYearSeason);
    let maxY = getMaxValueForYearSeason(selectedY, currentYearSeason);

    let dataX = (mouseX - CHART_LEFT) / CHART_W * maxX / currentZoom + currentPan.x;
    let dataY = (CHART_BOTTOM - mouseY) / CHART_H * maxY / currentZoom + currentPan.y;

    targetZoom *= zoomFactor;
    targetZoom = constrain(targetZoom, 0.8, 50.0);

    let newDataX = (mouseX - CHART_LEFT) / CHART_W * maxX / targetZoom + targetPan.x;
    let newDataY = (CHART_BOTTOM - mouseY) / CHART_H * maxY / targetZoom + targetPan.y;

    targetPan.x += dataX - newDataX;
    targetPan.y += dataY - newDataY;
  }
}

function keyPressed() {
  // Only respond if user is actively typing
  if (!isTyping) return;

  if (keyCode === BACKSPACE || key === "Backspace") {
    // Remove last character
    searchInput = searchInput.slice(0, -1);
  } else if (keyCode === ENTER || key === "Enter") {
    // Trigger country search on Enter
    searchForMatch();
  } else if (key.length === 1) {
    // Append typed character
    searchInput += key;
  }
}

function searchForMatch() {
  let input = searchInput.trim().toLowerCase();
  if (input === "") return; // skip if empty

  for (let key in countryMap) {
    let cd = countryMap[key];
    if (!cd.participatedIn(currentYearSeason)) continue;

    // Match against multiple known aliases
    let aliases = [
      cd.countryName,
      cd.NOC,
      cd.olympicTeam,
      cd.otherAlias,
      cd.historicAlias
    ];

    for (let name of aliases) {
      if (name && name.toLowerCase().includes(input)) {
        // MATCH FOUND: open the panel and reset view
        clickedNOC = cd.NOC;
        expandedNOC = cd.NOC;
        clickStartTime = millis();
        panelOpen = true;
        isTyping = false;
        searchInput = "";

        // Center view on this country bubble
        let maxX = getMaxValueForYearSeason(selectedX, currentYearSeason);
        let maxY = getMaxValueForYearSeason(selectedY, currentYearSeason);
        let marginX = maxX * CHART_MARGIN_RATIO;
        let marginY = maxY * CHART_MARGIN_RATIO + 10;

        let dataX = cd.getValue(selectedX, currentYearSeason);
        let dataY = cd.getValue(selectedY, currentYearSeason);

        let centerX = (CHART_LEFT + CHART_RIGHT) / 2;
        let centerY = (CHART_TOP + CHART_BOTTOM) / 2;

        // Adjust pan to bring target bubble into chart center
        let targetDataX = map(centerX, CHART_LEFT, CHART_RIGHT, -marginX, maxX + marginX) / currentZoom + currentPan.x;
        let targetDataY = map(centerY, CHART_BOTTOM, CHART_TOP, -marginY, maxY + marginY) / currentZoom + currentPan.y;

        targetPan.x = dataX - (targetDataX - currentPan.x);
        targetPan.y = dataY - (targetDataY - currentPan.y);
        return;
      }
    }
  }
}

