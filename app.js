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

        function updateMap(year) {
            const updatedData = [{
                type: 'choropleth',
                geojson: geoData,
                locations: Object.keys(stateData),
                z: data.map(row => +row[year]),
                colorscale: 'Viridis', 
                reversescale: true, 
                colorbar: {
                    title: { text: 'Income ($)', font: { size: 18 } },
                    tickprefix: '$',
                    tickfont: { size: 14 }
                },
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
                    label: `Minimum Income by - in 2023`, 
                    backgroundColor: 'rgba(54, 162, 235, 0.2)', 
                    borderColor: 'rgba(54, 162, 235, 1)', 
                    borderWidth: 3, 
                    pointBackgroundColor: 'rgba(75, 192, 192, 1)', 
                    pointBorderColor: 'rgba(220, 220, 220, 1)', 
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
                            font: {
                                size: 18, 
                                weight: 'bold' 
                            },
                            color: '#000', 
                        }
                    },
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
