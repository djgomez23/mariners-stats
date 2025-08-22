# mariners-stats
Project Description: Website to deploy visualizations of Seattle Mariners stats and related information

## Data Sources
Core dataset detailing the Seattle Mariners batting stats during the 2025 regular season from 03/27/2025 to 07/08/2025 retrieved from [Baseball Savant](https://baseballsavant.mlb.com/statcast_search).

To map the MLB IDs in the core dataset to player names, a comprehensive list of player information was found at [SmartFantasyBaseball.com](https://www.smartfantasybaseball.com/tools/).

### Other Sources
Followed [this tutorial](https://www.geeksforgeeks.org/reactjs/how-to-create-a-multi-page-website-using-react-js/) for a refresher on creating multi-page React apps (specifically, for help with creating the navbar and frontend page routes).

Followed the documentation from [React Bootstrap](https://react-bootstrap.netlify.app/docs/components/offcanvas) to create the collapsible menu in the navbar.

Follwed [this starter code](https://d3-graph-gallery.com/graph/parallel_custom.html) to create the parallel coordinates plot.

Additional React plot help: [The React Graph Gallery - Parallel Coordinates](https://www.react-graph-gallery.com/parallel-plot)

Followed these video tutorials to help create backend server:
- [How to Connect a MongoDB Database to React](https://youtu.be/SV0o0qOmKOQ?si=008EiZx8W4emQsBr)
- [MongoDB & Node Setup with Vite](https://youtu.be/CE1H4t8t2yY?si=8X7BBCTpsZ0H58xG)

### TODO
- add hamburger menu to navbar (untested)
- test the pitcher filtering (!!)
- check the line color highlighting (!)
    - I think it only highlights with one color as of now
    - may want to consider getting rid of the highlighting and adding checkbox option for the different outs/pitches where the not selected pitches/outs are colored gray, etc.
- need to clear the paths upon rerendering (!!!)
    - not sure if the axes should be cleared too or if its possible to add animation to transform them when the pitcher changes
    - check if the axes are also being duplicated
- need to map batter IDs to player names (!!)
- add hover labels to the plot lines (!)
- make the plot responsive (!)