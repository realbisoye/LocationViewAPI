const express = require('express')
const markerRoutes = require('./marker.route')

const router = express.Router()

router.get('/status', (req, res) => res.send('OK'))
router.use('/docs', express.static('docs'))

router.use('/markers', markerRoutes)

module.exports = router
