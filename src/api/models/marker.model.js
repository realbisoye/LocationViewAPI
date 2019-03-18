const mongoose = require('mongoose')
const httpStatus = require('http-status')
const APIError = require('../utils/APIError')

const markerSchema = new mongoose.Schema({
  title: {
    type: String,
    maxlength: 128,
    index: true,
    required: true,
    trim: true,
  },
  description: {
    type: String,
  },
  longitude: {
    type: Number,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
})

/**
 * Methods
 */
markerSchema.method({
  transform() {
    const transformed = {}
    const fields = ['_id', 'title', 'description', 'longitude', 'latitude', 'createdAt']

    fields.forEach((field) => {
      transformed[field] = this[field]
    })
    return transformed
  },
})

/**
 * Statics
 */
markerSchema.statics = {
  async get(id) {
    try {
      let marker

      if (id) {
        marker = await this.findOne({_id: id}).exec()
      }

      if (marker) {
        return marker
      }

      throw new APIError({
        message: 'Marker does not exist',
        status: httpStatus.NOT_FOUND,
      })
    } catch (error) {
      throw error
    }
  },

  list({page = 1, perPage = 30}) {
    return this.find()
      .sort({title: -1})
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec()
  },
}

module.exports = mongoose.model('Marker', markerSchema)
