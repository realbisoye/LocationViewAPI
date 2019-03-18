const httpStatus = require('http-status')
const {omit} = require('lodash')
const Marker = require('../models/marker.model')

/**
 * Load marker and append to req.
 * @public
 */
exports.load = async(req, res, next, id) => {
  try {
    const marker = await Marker.get(id)
    req.locals = {marker}
    return next()
  } catch (error) {
    return next(error)
  }
}

/**
 * Get marker
 * @public
 */
exports.get = (req, res) => res.json(req.locals.marker.transform())

/**
 * Create new marker
 * @public
 */
exports.create = async(req, res, next) => {
  try {
    const marker = new Marker(req.body)
    const savedMarker = await marker.save()
    res.status(httpStatus.CREATED)
    res.json(savedMarker.transform())
  } catch (error) {
    next(error)
  }
}

/**
 * Update existing marker
 * @public
 */
exports.update = (req, res, next) => {
  const updatedMarker = omit(req.body, req.locals.marker)
  const markerID = req.locals.marker._doc._id // eslint-disable-line no-underscore-dangle
  Marker.findByIdAndUpdate(markerID, updatedMarker, {'new': true})
    .then(savedMarker => res.json(savedMarker.transform()))
    .catch(e => next(e))
}

/**
 * Get marker list
 * @public
 */
exports.list = async(req, res, next) => {
  try {
    const markers = await Marker.list(req.query)
    const transformedMarkers = markers.map(marker => marker.transform())
    res.json(transformedMarkers)
  } catch (error) {
    next(error)
  }
}

/**
 * Delete marker
 * @public
 */
exports.remove = (req, res, next) => {
  const {marker} = req.locals
  marker.remove()
    .then(() => res.status(httpStatus.NO_CONTENT).end())
    .catch(e => next(e))
}
