OLYMPIC VISUALISATION TOOL (June 2025)
======================================

Developed and designed by: Austin Quang Do  
Location: New Zealand  
Portfolio: https://austindo.framer.website  
Behance: https://behance.net/austindo  

--------------------------------------------------------------------------------
ABOUT THIS PROJECT
--------------------------------------------------------------------------------
This interactive Olympic Visualisation tool was created as part of a design and 
development capstone project. It transforms over a century of Olympic data into 
an engaging, data-driven interface to explore patterns in global performance.

Built in p5.js (JavaScript), the project integrates UI design, data parsing, 
and interaction logic to create a fully custom scatter plot environment for web.

--------------------------------------------------------------------------------
CONFIGURATION / INSTALLATION
--------------------------------------------------------------------------------
No installation required. Simply open `index.html` in any modern browser.
All assets and scripts are self-contained within the project directory.

--------------------------------------------------------------------------------
OPERATING INSTRUCTIONS
--------------------------------------------------------------------------------
- **Zoom/Pan**: Explore data deeply by zooming in or out using the mouse wheel. 
  Click and drag to pan the view.
- **Year Selection**: Use the horizontal timeline to navigate between Olympic years.
- **Search**: Type in the top-right search bar to instantly locate a country.
- **Change Axes**: Use the X-axis dropdown below the chart to change the variable 
  used for comparison (e.g. population, athlete count, land area, alphabetical).
- **Hover for insights**: Move your mouse over bubbles to preview country stats.
- **Click to expand**: Click a bubble once to expand. Click again to view full 
  athlete details in the side panel.
- **Sort & Filter**: In the side panel, use column headers to sort data, and the 
  filter button to display athletes by sport.

--------------------------------------------------------------------------------
VISUAL DESIGN SYSTEM
--------------------------------------------------------------------------------
- **Bubble Size** = total medals won  
- **Bubble Colour** = performance tier  
- **X & Y Axis** = selectable by user  
- **Position** = reflects axis values  
- **Time** = chosen via timeline  
- **Labels** = country codes or full names (based on context)

--------------------------------------------------------------------------------
FILE MANIFEST
--------------------------------------------------------------------------------
- `index.html`              → root HTML entry point
- `sketch.js`               → main app logic, setup, and render loop
- `Circle.js`               → chart bubble drawing and positioning
- `ChartEntity.js`          → abstract class and bubble behaviour
- `Panel.js`                → side panel UI for athletes and medal data
- `data/`                   → CSV datasets
- `img/`                    → icons and medal images
- `flags/`                  → flag images (not included here)

--------------------------------------------------------------------------------
DATA SOURCES
--------------------------------------------------------------------------------
- *World Population Dataset* (2024, January 6). Kaggle  
  https://www.kaggle.com/datasets/chandanchoudhury/world-population-dataset

- *120 Years of Olympic History: Athletes and Results* (2018, June 15). Kaggle  
  https://www.kaggle.com/datasets/heesoo37/120-years-of-olympic-history-athletes-andresults

--------------------------------------------------------------------------------
TROUBLESHOOTING
--------------------------------------------------------------------------------
- **Nothing renders** → Check console for 404 errors on missing image/data assets  
- **Text overlaps** → Ensure web font files are correctly linked  
- **Bubbles not clickable** → Verify zoom level or refresh the browser  

--------------------------------------------------------------------------------
KNOWN BUGS / LIMITATIONS
--------------------------------------------------------------------------------
- Visual scaling may vary slightly across devices with unusual DPI ratios
- Performance may drop if too many athletes are loaded simultaneously
- Historical borders not visualised (countries shown by NOC only)

--------------------------------------------------------------------------------
CREDITS & LICENSE
--------------------------------------------------------------------------------
Designed and developed entirely by Austin Quang Do (New Zealand, 2025)  
For educational and portfolio use only. No Olympic trademarks or logos are used.

--------------------------------------------------------------------------------
CONTACT
--------------------------------------------------------------------------------
- Portfolio: https://austindo.framer.website  
- Behance: https://behance.net/austindo  
- Email: [available on request]

--------------------------------------------------------------------------------
CHANGELOG
--------------------------------------------------------------------------------
v1.0 – Initial release  
- Bubble layout and repulsion logic  
- Timeline and year selector  
- Country detail panel with sorting/filtering  
- Axis variable dropdowns  
- Tooltip and hover animations  
- Full data pipeline and athlete aggregation

--------------------------------------------------------------------------------