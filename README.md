# mariners-stats
Project Description: Website to deploy visualizations of Seattle Mariners stats and related information

## Data Sources
Core dataset detailing the Seattle Mariners batting stats during the 2025 regular season from 03/27/2025 to 07/08/2025 retrieved from [Baseball Savant](https://baseballsavant.mlb.com/statcast_search).

To map the MLB IDs in the core dataset to player names, a comprehensive list of player information was found at [SmartFantasyBaseball.com](https://www.smartfantasybaseball.com/tools/).

### Other Sources
Followed [this tutorial](https://www.geeksforgeeks.org/reactjs/how-to-create-a-multi-page-website-using-react-js/) for a refresher on creating multi-page React apps.

Follwed [this starter code](https://d3-graph-gallery.com/graph/parallel_custom.html) to create the parallel coordinates plot.

Additional React plot help: [The React Graph Gallery - Parallel Coordinates](https://www.react-graph-gallery.com/parallel-plot)

Followed these video tutorials to help create backend server:
- [How to Connect a MongoDB Database to React](https://youtu.be/SV0o0qOmKOQ?si=008EiZx8W4emQsBr)
- [MongoDB & Node Setup with Vite](https://youtu.be/CE1H4t8t2yY?si=8X7BBCTpsZ0H58xG)

### TODO
- add hamburger menu to navbar
- test the pitcher filtering
- check the line color highlighting
- want to adjust the units for the axes
    - it's confusing with them being percentages and counts
    - just stick to percentages
- need to clear the paths upon rerendering
    - not sure if the axes should be cleared too or if its possible to add animation to transform them when the pitcher changes
- need to map batter IDs to player names
- add hover labels to the plot lines