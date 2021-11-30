moment = require('moment').default;
axios = require('axios').default;
fs = require('fs');

//import moment from "moment";
//import axios from "axios";


//nacitanie sorce code/date
/*
setInterval(() => {

    axios.get('https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases2_v1/FeatureServer/2/query?where=1%3D1&outFields=*&outSR=4326&f=json')
        .then((response) => {
            //console.log(response);

            let data = response.data.features;

            const coutries = sort(data, "Confirmed", "desc");

            render(coutries);
        });

}, 10000);
*/
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
    const string = JSON.stringify(countries);

    /*   fs.writeFileSync('pokus.txt', string, err => {
           console.log(err);
       });*/


    let c = fs.readFileSync('pokus.txt', err => {
        console.log(err);
    });

    console.log(c);

    const json = JSON.parse(c);

    console.log(json)



}







const CYCLE_INTERVAL = 100;
const REFRESH_INTERVAL = 100;
let x = 0;

setInterval(() => {

    if (x === 0) {
        axios.get('https://services1.arcgis.com/0MSEUqKaxRlEPj5g/arcgis/rest/services/ncov_cases2_v1/FeatureServer/2/query?where=1%3D1&outFields=*&outSR=4326&f=json')
            .then((response) => {
                let data = response.data.features;
                fs.writeFile('pokux.txt', JSON.stringify(data), err => {
                    if (err)
                        console.log('nemozem ulozit');
                    else
                        console.log('subor refreshnuty OK');
                });
            });
    } else {
        let c = fs.readFileSync('pokux.txt', err => {
            if (err)
                console.log('nemozem otvorit');
            else
                console.log('subor vycitany OK');
        });

        console.log(JSON.parse(c));
    }

    if (x > REFRESH_INTERVAL)
        x = 0;
    else
        x++;

}, CYCLE_INTERVAL);