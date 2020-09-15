const express = require('express');
const { db, pool } = require("../config/db");
const router = express.Router();
const Pro = require('../models/Pro');
const upload = require('../multer.js');
const jwt = require("jsonwebtoken");
const auth = require('../auth');
const axios = require('axios');
const { getCoord, coordFromZip } = require('../geolocation');
const config = require('config');

const Nexmo = require('nexmo');
const nexmo = new Nexmo({
    apiKey: config.get('nexmoAPIKey'),
    apiSecret: config.get('nexmoAPISecret'),
});

// @route   GET api/pros
// @desc    Get all of the pros
// @access  Public
router.get('/', async (req, res) => {
    Pro.findAll()
        .then(pros => res.json(pros))
        .catch(err => res.json(err));
});

// @route   GET api/pros/nearby
// @desc    Get all the pros near you
// @access  Public
router.get('/nearby', async (req, res) => {
    var input_lat, input_lng;

    if (req.query.zipcode !== undefined) {
        var { lat: input_lat, lng: input_lng } = await coordFromZip(req.query.zipcode);
    } else if (req.query.lat !== 0 && req.query.lng !== 0) {
        input_lat = req.query.lat;
        input_lng = req.query.lng;
    } else {
        Pro.findAll()
            .then(pros => res.send(pros))
            .catch(err => res.send(err));
        return;
    }

    await pool.query(
        `CREATE EXTENSION IF NOT EXISTS cube;
    CREATE EXTENSION IF NOT EXISTS earthdistance;`);

    const sql = `SELECT *, (
        point(lng, lat)<@>point(${input_lng}, ${input_lat})
      ) * 1609.344 as distance FROM pros
      ORDER BY distance
      LIMIT 10`;

    try {
        const pros = await pool.query(sql);
        res.send(pros.rows);
    } catch (err) {
        res.send(err.message);
    }
});

// @route   GET api/pros/pro/:pro_id
// @desc    Get specific pro by ID
// @access  Public
router.get('/pro/:pro_id', async (req, res) => {
    Pro.findOne({ where: { id: req.params.pro_id } })
        .then(pro => res.json(pro))
        .catch(err => res.json(err));
});

// @route   POST api/pros
// @desc    Create a new pro
// @access  Public
router.post('/', async (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.send(err)
        } else {
            if (req.file == undefined) {
                res.send('no file selected');
            } else {
                const file = { photo: req.file.location }
                const data = Object.assign({}, req.body, file);

                Pro.create(data)
                    .then(newPro => {
                        getCoord(newPro, req.body);

                        res.json(newPro.toJSON());
                    })
                    .catch(err => {
                        res.json(err);
                    });
            }
        }
    });
})

// @route   POST api/pros/pro/verify
// @desc    Send code to phone 
// @access  Public
router.post('/pro/verify', async (req, res) => {
    const number = req.body.number;

    try {
        const amount = await Pro.count({ where: { contact_number: number } });

        if (amount == 0) {
            return res.status(403).json({ errors: [{ msg: 'No professional records for this number' }] });
        } else if (amount > 1) {
            return res.status(403).json({ errors: [{ msg: 'There are multiple professional records with this number' }] });
        }
    } catch (err) {
        return res.json(err.message);
    }

    nexmo.verify.request({
        number: ''.concat('+1', number),
        brand: 'Black Real Estate'
    }, (error, result) => {
        if (result.status != 0) {
            res.send(result.error_text);
        } else {
            res.send(result.request_id);
        }
    });
})

// @route   POST api/pros/pro/check
// @desc    Check code from phone 
// @access  Public
router.post('/pro/check', (req, res) => {
    nexmo.verify.check({
        request_id: req.body.requestId,
        code: req.body.code
    }, async (error, result) => {
        if (result.status != 0) {
            res.send(result.error_text);
        } else {
            try {
                const pro = await Pro.findOne({ where: { contact_number: req.body.number } })

                const payload = {
                    pro: {
                        id: pro.id
                    }
                }

                jwt.sign(
                    payload,
                    config.get('jwtSecret'),
                    { expiresIn: 360000 },
                    (err, token) => {
                        if (err) throw err;

                        res.json({ token });
                    }
                );
            } catch (err) {
                res.send(err);
            }
        }
    })
})

// @route   PUT api/pros/pro/me
// @desc    Update a pro
// @access  Private
router.put('/pro/me', auth, async (req, res) => {
    var data = req.body;

    if (req.file != undefined) {
        data = Object.assign({}, req.body, req.file.path);
    }

    try {
        const pro = await Pro.update(data, { where: { id: req.pro.id } });
        await pro.save();
    } catch (err) {
        res.send(err);
    }
});

// @route   DELETE api/pros/me
// @desc    Update a pro
// @access  Private
router.delete('/pro/me', auth, async (req, res) => {
    try {
        await Pro.destroy({ where: { id: req.pro.id } });
        res.send('successful');
    } catch (err) {
        res.send(err);
    }
});


module.exports = router;