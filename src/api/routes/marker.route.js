const express = require('express')
const validate = require('express-validation')
const controller = require('../controllers/marker.controller')
const {
  listMarkers,
  createMarker,
  updateMarker,
  getOrDeleteMarker,
} = require('../validations/marker.validation')

const router = express.Router()

/**
 * Load marker when API with markerId route parameter is hit
 */
router.param('markerId', controller.load)

router
  .route('/')
  .get(validate(listMarkers), controller.list)
  .post(validate(createMarker), controller.create)

router
  .route('/:markerId')
  .get(validate(getOrDeleteMarker), controller.get)
  .patch(validate(updateMarker), controller.update)
  .delete(validate(getOrDeleteMarker), controller.remove)

module.exports = router
