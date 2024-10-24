Plotly.d3.csv("Data.csv", function(data) {
    const years = Array.from({ length: 24 }, (_, i) => (2000 + i).toString());
    const dataByYear = {};
    const stateData = {}; 

    data.forEach(row => {
        stateData[row["State/Jurisdiction"]] = years.map(year => ({
            year: year,
            value: +row[year]
        }));
    });
   
    const geoJsonUrl = 'https://raw.githubusercontent.com/python-visualization/folium/master/examples/data/us-states.json';
    Plotly.d3.json(geoJsonUrl, function(geoData) {
        let currentYear = "2023";
        const layout = {
            title: { text: `Minimum Salary per Year by State in the USA - ${currentYear}`, font: { size: 24 } },
            geo: {
                scope: 'usa',
                projection: { type: 'albers usa' },
                showland: true,
                landcolor: 'rgb(217, 217, 217)',
                subunitwidth: 1,
                countrywidth: 1,
                subunitcolor: 'rgb(255, 255, 255)',
                countrycolor: 'rgb(255, 255, 255)',
            },
            dragmode: false, 
            scrollzoom: false, 
        };
// Define a fixed color scale and color bar
const colorscale = [
    [0, 'rgb(165,0,38)'],
    [0.25, 'rgb(215,48,39)'],
    [0.5, 'rgb(244,109,67)'],
    [0.75, 'rgb(253,174,97)'],
    [1, 'rgb(255,255,191)']
];
document.getElementById('demo-button').addEventListener('click', function() {
    let yearIndex = 0;  // Start at year 2000

    function playDemo() {
        if (yearIndex < years.length) {
            const year = years[yearIndex];  // Get the current year
            updateMap(year);  // Update the map for the current year
            yearSlider.value = year;  // Sync the slider
            yearSelector.value = year;  // Sync the dropdown
            yearIndex++;  // Move to the next year

            // Automatically call the function for the next year with a delay of 1 second (1000ms)
            setTimeout(playDemo, 1000);
        }
    }

    playDemo();  // Start the demo
});

const colorbar = {
    title: 'Income ', 
    tickprefix: '$',
    thickness: 15
};
        function updateMap(year) {
            const updatedData = [{
                type: 'choropleth',
                geojson: geoData,
                locations: Object.keys(stateData),
                z: data.map(row => +row[year]),  // Update data based on the year
                colorscale: colorscale,  // Use the fixed color scale
                reversescale: true, 
                zmin: 4000,  // Set the minimum value for the color scale (e.g., $15k)
                zmax: 40000,  // Set the maximum value for the color scale (e.g., $30k)
                colorbar: colorbar,  // Use the fixed color bar
                featureidkey: 'properties.name',
                hovertemplate: '<b>%{location}</b><br>Income: $%{z:,.0f}<extra></extra>'
            }];
            
            layout.title.text = `Minimum Salary per Year by State in the USA - ${year}`;
            Plotly.react('map', updatedData, layout, {
                transition: {
                    duration: 500,
                    easing: 'cubic-in-out'
                }
            });
        }
        
        
       
        updateMap(currentYear);

        const ctx = document.getElementById('income-chart').getContext('2d');
        let incomeChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [{
                    label: `Minimum Income by Kansas in 2023`,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',  // Fixed color
                    borderColor: 'rgba(54, 162, 235, 1)',  // Fixed color
                    borderWidth: 3,
                    pointBackgroundColor: 'rgba(75, 192, 192, 1)',  // Fixed color
                    pointBorderColor: 'rgba(220, 220, 220, 1)',  // Fixed color
                    pointRadius: 5,
                    lineTension: 0.3,
                    fill: true,
                    data: [],
                }]
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                            boxWidth: 20,  // Smaller box size
                            boxHeight: 15,  // Custom height for better proportion
                            padding: 15,  // Adds spacing between text and box
                            font: {
                                size: 14,  // Make text size more proportionate
                                weight: 'bold',  // Make text stand out
                                family: 'Arial, sans-serif',  // Custom font family
                            },
                            color: '#333',  // Text color for better visibility
                        }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Year' }
                    },
                    y: {
                        title: { display: true, text: 'Income ($)' },
                        beginAtZero: false
                    }
                }
            }
        });
        

        const yearSelector = document.getElementById('year-dropdown');
        const yearSlider = document.getElementById('year-slider');
        
        years.forEach(year => {
            const option = document.createElement('option');
            option.text = year;
            option.value = year;
            yearSelector.add(option);
        });
        yearSelector.value = "2023"; 
        yearSelector.addEventListener('change', function() {
            currentYear = this.value;
            updateMap(currentYear);
            yearSlider.value = currentYear;
        });

        yearSlider.addEventListener('input', function() {
            currentYear = this.value;
            updateMap(currentYear);
            yearSelector.value = currentYear;
        });

        function updateChart(state, year) {
            const incomeData = stateData[state].map(entry => entry.value);
            incomeChart.data.datasets[0].data = incomeData;
            incomeChart.data.datasets[0].label = `Minimum Income by ${state} in ${year}`; 
            incomeChart.update();
        }

document.getElementById('map').on('plotly_click', function(data) {
    const state = data.points[0].location;
    updateChart(state, currentYear); 

    document.getElementById('chart-container').scrollIntoView({ behavior: 'smooth' });
        document.dispatchEvent(new CustomEvent('stateSelected', { detail: { state, stateData } }));
});
    });
});
