const axios = require('axios');
const config = require('config');

const getCoord = async (pro, data) => {
    const { address1, city, state, zipcode } = data;

    var location = address1 + city + state + zipcode;

    try {
        const res = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: location,
                key: config.get('googleAPIKey')
            }
        })

        const { lat, lng } = res.data.results[0].geometry.location;

        const json = `{"lat":${lat}, "lng":${lng}}`;
        const obj = JSON.parse(json);

        pro.lat = lat;
        pro.lng = lng;

        await pro.save();
    } catch (err) {
        console.log(err);
    }
}

const coordFromZip = async (zipcode) => {
    const res = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
            address: zipcode,
            key: config.get('googleAPIKey')
        }
    })

    const { lat, lng } = res.data.results[0].geometry.location;

    const json = `{"lat":${lat}, "lng":${lng}}`;
    const obj = JSON.parse(json);

    return obj;
}

module.exports = {
    getCoord,
    coordFromZip
};