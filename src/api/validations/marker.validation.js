const Joi = require('joi')

module.exports = {

  // GET /markers
  listMarkers: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
    },
  },

  // POST /markers
  createMarker: {
    body: {
      title: Joi.string().max(128).required(),
      description: Joi.string().allow(''),
      longitude: Joi.number().required(),
      latitude: Joi.number().required(),
    },
  },

  // PATCH /markers/:markerId
  updateMarker: {
    body: {
      title: Joi.string().max(128),
      description: Joi.string().allow(''),
      longitude: Joi.number(),
      latitude: Joi.number(),
    },
    params: {
      markerId: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i).required(),
    },
  },

  // DELETE /markers/:markerId
  getOrDeleteMarker: {
    params: {
      markerId: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i).required(),
    },
  },
}
