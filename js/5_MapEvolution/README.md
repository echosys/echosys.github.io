# Homework #5: Geospatial Visualization

The main purpose of this homework is to use all of the knowledge and skills you have gained so far to create your own map with D3.js. With this map, you will then learn how to use D3 transitions(). In this assignment, you will:

* Define your own color schema
* Preprocess data
* Use D3 transitions
* Create a chloropleth map
* Add a tooltip to the map
* Use keyboard and mouse events
* Create a legend

## Data Description

This assignment uses data from Sacramento’s [Urban Tree Canopy Assessment](https://www.cityofsacramento.org/-/media/Corporate/Files/Public-Works/Maintenance-Services/Urban-Forest-Master-Plan/Copy-of-Sacramento-UTC-Assessment-20180515.pdf?la=en) in 2018. We will use this data to assess the tree canopy coverage in Sacramento.

* The data for this assignment is found in the Appendix of the report (table 15). You will need to copy it into your own `tree_canopy.csv` file.
* `sacramento.geojson` is the geojson that will be used to create the map. It can be found online, for example, [here](https://github.com/codeforamerica/click_that_hood/blob/master/public/data/sacramento.geojson).

## To start the assignment

This homework contains no template or starter code, so you'll have to create your own `index.html` file. The completed assignment should look like this:

![Completed Mapping & Binding](imgs/overview.png)

See video **homework_05.mov** in **Canvas > Files > Homework Files** to see an overview of the completed homework. You are expected to have all of the interactions as shown in the video.

## Assignment Steps

### Step 1

Create an outline of the city of Sacramento using the `sacramento.geojson` file. The svg should be centered in the html window.

![Completed Mapping & Binding](imgs/1.png)

### Step 2

Using `tree_canopy.csv`, fill the different paths of the geojson based on the **Canopy %** attribute.

The domain of the color scale should be `(0, 10, 15, 20, 25, 30, 35, 40)`. Define your color scheme with the following colors: `#D7301F, #EF6548, #FBB676, #FEF4B9, #A8C87D, #359A4B, #1B532D, #12351F`. Make the borders of the geojson shapes white.

Think about how svg can receive the data from the csv file. Depending on the method you choose, you may have to do some data preprocessing.

![Completed Mapping & Binding](imgs/2.png)

> ❗️ Note that even though the Canopy % values go beyond 40, the color scale only goes to that range. For neighborhoods (cells) that have Canopy % over 40, you may color them either using the `#12351F` value (as shown in the demo video), or they may be `black`.

### Step 3

Create a threshold key legend. The range of the legend should match the domain of the color scheme we have defined earlier. Make sure each component’s size is proportional to the range. Make each component of the threshold key match to the color scheme we have defined earlier.

Add a title **Tree Canopy Percentage**.

![Completed Mapping & Binding](imgs/3.png)

> ❗️ Note: if you use `black` color for cells with Canopy % over 40, add a tab on the key that includes this, like so:

![Completed Mapping & Binding](imgs/3_key.png)

### Step 4

Create a tooltip that shows the name and tree canopy percentage for the hovered neighborhood. Format your tooltip similar to the screenshot below (exact styling is not required, but make it similar).

![Completed Mapping & Binding](imgs/4.png)

### Step 5

Now we'll use D3 `transition()` to create animations with the map that you've created.

* Create a function `animation()` that will incrementally fill in the paths of your map based on the **Canopy%** attribute (lowest to highest percentage). When `animation()` is called for the first time, all of the paths should be colored white (#fffff). Then, the corresponding colors should be added through subsequent iterations until the full canopy is visualized. The "animation states" should be the following bins:
  * 0-10 and 10-15
  * 15-20
  * 20-25
  * 25-30
  * 30-35
  * 35-40
  * 40+
* Whenever the state of the map is changed, use a D3 `transition()` with a duration of 1000 ms.
* Then, using D3 `interval()`, every 1500 ms animate the next canopy stage on the map.

The `animation()` function should be triggered whenever the user presses the `c` key on the keyboard. There are several ways you can implement this functionality, including Javascript's `onkeypress` event, jQuery's `keypress` function, with the Mousetrap library, or via D3's `keywdown`.

## Grading Criteria

This assignment is worth 10 points.
* Steps 1-4 are worth 1 point each
* Step 5 is worth 4 points.
