import moment from "moment";
import axios from "axios";
import Highcharts from "highcharts";
import "bootstrap/dist/css/bootstrap.css";


//nacitanie sorce code/date

axios.get('https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases2_v1/FeatureServer/2/query?where=1%3D1&outFields=*&outSR=4326&f=json')
    .then((response) => {
        //console.log(response);

        let data = response.data.features;
        //console.log(data);

        //maxMortalityRate(data);
        // maxMortalityRateCountry(data);

        //const coutries = sort(data, "Confirmed", "desc");

        /*graph(data, ['Confirmed', 'Deaths'], 'desc', 10, {
            chart: {
                type: 'line',
            },
            title: {
                text: "Covid19 stats"
            }
        });*/

        for (let field in data[0].attributes) {
            if (!isNaN(data[0].attributes[field]) && data[0].attributes[field] != null) {
                let div = document.createElement("div");
                div.id = field;
                document.querySelector("body").appendChild(div);

                graph(field, data, field, 'desc', 5000, {
                    chart: {
                        type: 'column',
                    },
                    title: {
                        text: "Covid19 stats - " + field
                    }
                });
            }
        }



        //console.log(data);

        // render(coutries);


    })

//Max.mortality rate
function maxMortalityRate(data) {
    //console.log(data);
    let mortalityRate = data[0].attributes.Mortality_Rate;
    data.forEach((item) => {
        if (item.attributes.Mortality_Rate > mortalityRate) {
            mortalityRate = item.attributes.Mortality_Rate;
        }

    })
    //console.log(mortalityRate);
}


function maxMortalityRateCountry(countries) {
    //console.log(data);
    let country = countries[0];
    countries.forEach((item) => {
        if (item.attributes.Mortality_Rate > country.attributes.Mortality_Rate) {
            country = item;
        }

    })
    //console.log(country);
}


/**
* Vyhladanie krajiny
 * @param {*} data pole kde hladam 
 * @param {*} field property, kt.hladam
 * @param {*} order asc alebo desc
 * @returns vysleok zoradene pole krajin
 */
function sort(countries, field, order = 'asc') {
    if (!countries || !field || !order)
        throw new Error('missing properties!!!');

    //vsetky prvky z pola sa skopiruju do countries
    //pracujem s kopiou!!!!
    let data = [...countries];

    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data.length - 1; j++) {

            if (order === 'asc') {

                if (data[j].attributes[field] > data[j + 1].attributes[field]) {
                    let temp = data[j];
                    data[j] = data[j + 1];
                    data[j + 1] = temp;
                }
            }


            if (order === 'desc') {

                if (data[j].attributes[field] < data[j + 1].attributes[field]) {
                    let temp = data[j];
                    data[j] = data[j + 1];
                    data[j + 1] = temp;
                }
            }



        }

    }
    return data;
}

function render(countries) {
    let table = document.createElement('table');
    countries.forEach((country) => {
        let tr = document.createElement('tr');
        for (let attr in country.attributes) {
            let td = document.createElement('td');
            td.innerText = country.attributes[attr];
            tr.appendChild(td);

        }
        table.appendChild(tr);
    });
    document.getElementById('app').appendChild(table);
}




















/**
 * Vygeneruje graf
 * @param {*} data moje data
 * @param {*} field pole fieldov
 * @param {*} sortDirection smer zoradenia
 * @param {*} limit pocet poloziek
 * @param {*} options options z highcharts
 */
function graph(el, data, field, sortDirection = "desc", limit = 10, options = null) {
    let names = [];
    let fields = [];
    let values = {};

    // Po tomto kroku mam 100 istotu, ze fields je pole fieldov
    if (Array.isArray(field)) {
        fields = field;
    } else {
        fields.push(field);
    }

    fields.forEach(f => {
        values[f] = [];
    });

    const countries = sort(data, fields[0], sortDirection);

    let i = 0;
    countries.forEach(function (country) {
        if (i <= limit - 1) {
            fields.forEach(f => {
                values[f].push(country.attributes[f]);
            })

            names.push(country.attributes.Country_Region);
        }
        i++;
    });

    const helper = (fields, values) => {
        //console.log(fields, values)
        const result = [];
        fields.forEach(f => {
            result.push({
                name: f,
                data: values[f]
            })
        });

        //  console.log(result)

        return result;
    }

    const defaultOptions = {
        chart: {
            type: 'column'
        },
        title: {
            text: "No title"
        },
        subtitle: {
            text: 'Source: WorldClimate.com'
        },
        xAxis: {
            categories: names,
            crosshair: true
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Rainfall (mm)'
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        }
    };

    const newOptions = { ...defaultOptions, ...options, series: helper(fields, values) };





    Highcharts.chart(el, newOptions);
}

