Plotly.d3.csv("puhdistettu_Data.csv", function(data) {
    const years = Array.from({length: 24}, (_, i) => (2000 + i).toString());
    const dataByYear = {};
    years.forEach(year => {
        dataByYear[year] = data.map(row => ({
            state: row["State/Jurisdiction"],
            value: +row[year]
        }));
    });

    const geoJsonUrl = 'https://raw.githubusercontent.com/python-visualization/folium/master/examples/data/us-states.json';
    Plotly.d3.json(geoJsonUrl, function(geoData) {
        const currentYear = "2023";
        const choroplethData = [{
            type: 'choropleth',
            geojson: geoData,
            locations: dataByYear[currentYear].map(d => d.state),
            z: dataByYear[currentYear].map(d => d.value),
            colorscale: 'Viridis',
            colorbar: { title: 'Salary' },
            featureidkey: 'properties.name'
        }];

        const layout = {
            title: 'Minimum Salary per Year by State in the USA',
            geo: {
                scope: 'usa',
                projection: { type: 'albers usa' },
                showland: true,
                landcolor: 'rgb(217, 217, 217)',
                subunitwidth: 1,
                countrywidth: 1,
                subunitcolor: 'rgb(255, 255, 255)',
                countrycolor: 'rgb(255, 255, 255)'
            },
            updatemenus: [{
                buttons: years.map(year => ({
                    method: 'restyle',
                    args: [{ z: [dataByYear[year].map(d => d.value)], locations: [dataByYear[year].map(d => d.state)] }],
                    label: year
                })),
                direction: 'down',
                showactive: true
            }]
        };
        Plotly.react('map', choroplethData, layout);
    });
});
