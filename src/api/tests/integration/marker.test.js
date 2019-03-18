/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-expressions */
const request = require('supertest')
const httpStatus = require('http-status')
const {expect} = require('chai')
const {some, omitBy, isNil} = require('lodash')
const app = require('../../../index')
const Marker = require('../../models/marker.model')

/**
 * root level hooks
 */

async function format(marker) {
  // get markers from database
  const dbMarker = (await Marker.findOne({title: marker.title})).transform()

  // remove null and undefined properties
  return omitBy(dbMarker, isNil)
}

describe('Markers API', async() => {
  let dbMarkers
  let marker1
  let marker2

  beforeEach(async() => {
    dbMarkers = {
      marker1: {
        title: 'Simple Marker One',
        description: 'First Simeple marker',
        latitude: 37.78825,
        longitude: -122.4324,
      },
      marker2: {
        title: 'Simple Marker Two',
        latitude: 37.54302,
        longitude: -122.123092,
      },
    }

    marker1 = {
      title: 'Simple Marker One',
      description: 'First Simeple marker',
      latitude: 37.78825,
      longitude: -122.4324,
    }

    marker2 = {
      title: 'Simple Marker Two',
      latitude: 37.54302,
      longitude: -122.123092,
    }

    await Marker.deleteMany({})
    await Marker.insertMany([dbMarkers.marker1, dbMarkers.marker2])
  })

  describe('POST /markers', () => {
    it('should create a new marker when request is ok', () => {
      return request(app)
        .post('/markers')
        .send(marker1)
        .expect(httpStatus.CREATED)
        .then((res) => {
          expect(res.body).to.include(marker1)
        })
    })

    it('should report error when title is not provided', () => {
      delete marker2.title

      return request(app)
        .post('/markers')
        .send(marker2)
        .expect(httpStatus.BAD_REQUEST)
        .catch((res) => {
          const {field} = res.body.errors[0]
          const {location} = res.body.errors[0]
          const {messages} = res.body.errors[0]
          expect(field).to.be.equal('title')
          expect(location).to.be.equal('body')
          expect(messages).to.include('"title" is required')
        })
    })

    it('should report error when coordinate is not provided', () => {
      delete marker1.longitude

      return request(app)
        .post('/markers')
        .send(marker1)
        .expect(httpStatus.BAD_REQUEST)
        .catch((res) => {
          const {field} = res.body.errors[0]
          const {location} = res.body.errors[0]
          const {messages} = res.body.errors[0]
          expect(field).to.be.equal('longitude')
          expect(location).to.be.equal('body')
          expect(messages).to.include('"longitude" is required')
        })
    })
  })

  describe('GET /markers', () => {
    it('should get all markers', () => {
      return request(app)
        .get('/markers')
        .expect(httpStatus.OK)
        .then((res) => {
          const first = format(dbMarkers.marker1)
          const second = format(dbMarkers.marker2)

          const includesFirst = some(res.body, first)
          const includesSecond = some(res.body, second)

          // before comparing it is necessary to convert String to Date
          res.body[0].createdAt = new Date(res.body[0].createdAt)
          res.body[1].createdAt = new Date(res.body[1].createdAt)

          expect(res.body).to.be.an('array')
          expect(res.body).to.have.lengthOf(2)
          expect(includesFirst).to.be.true
          expect(includesSecond).to.be.true
        })
    })

    it('should get all markers with pagination', () => {
      return request(app)
        .get('/markers')
        .query({page: 2, perPage: 1})
        .expect(httpStatus.OK)
        .then((res) => {
          const first = format(dbMarkers.marker1)
          const includesFirst = some(res.body, first)

          // before comparing it is necessary to convert String to Date
          res.body[0].createdAt = new Date(res.body[0].createdAt)

          expect(res.body).to.be.an('array')
          expect(res.body).to.have.lengthOf(1)
          expect(includesFirst).to.be.true
        })
    })

    it('should report error when pagination\'s parameters are not a number', () => {
      return request(app)
        .get('/markers')
        .query({page: '?', perPage: 'whaat'})
        .expect(httpStatus.BAD_REQUEST)
        .catch((res) => {
          const {field, location, messages} = res.body.errors[0]
          expect(field).to.be.equal('page')
          expect(location).to.be.equal('query')
          expect(messages).to.include('"page" must be a number')
        })
    })
  })

  describe('GET /markers/:markerId', () => {
    it('should get marker', async() => {
      const {id} = await Marker.findOne({})

      return request(app)
        .get(`/markers/${id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.include(dbMarkers.marker1)
        })
    })

    it('should report error "Marker does not exist" when marker does not exists', () => {
      return request(app)
        .get('/markers/507f191e810c19729de860ea')
        .expect(httpStatus.NOT_FOUND)
        .catch((res) => {
          expect(res.body.code).to.be.equal(404)
          expect(res.body.message).to.be.equal('Marker does not exist')
        })
    })
  })

  describe('PATCH /markers/:markerId', () => {
    it('should update marker', async() => {
      const marker = (await Marker.findOne(dbMarkers.marker1))
      const {id, title} = marker

      return request(app)
        .patch(`/markers/${id}`)
        .send({title})
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.title).to.be.equal(title)
          expect(res.body.title).to.be.equal(dbMarkers.marker1.title)
        })
    })

    it('should not update marker when no parameters were given', async() => {
      const marker = (await Marker.findOne(dbMarkers.marker1))
      const {id} = marker

      return request(app)
        .patch(`/markers/${id}`)
        .send()
        .expect(httpStatus.OK)
        .then((res) => {
          const markerData = marker.toObject()
          expect(res.body.title).to.be.equal(markerData.title)
          expect(res.body.description).to.be.equal(markerData.description)
          expect(res.body.longitude).to.be.equal(markerData.longitude)
          expect(res.body.description).to.be.equal(markerData.description)
        })
    })

    it('should report error "Marker does not exist" when marker does not exists', () => {
      return request(app)
        .patch('/markers/507f191e810c19729de860ea')
        .expect(httpStatus.NOT_FOUND)
        .catch((res) => {
          expect(res.body.code).to.be.equal(404)
          expect(res.body.message).to.be.equal('Marker does not exist')
        })
    })
  })

  describe('DELETE /markers', () => {
    it('should delete marker', async() => {
      const {id} = (await Marker.findOne({}))

      return request(app)
        .delete(`/markers/${id}`)
        .expect(httpStatus.NO_CONTENT)
        .then(() => request(app).get('/markers'))
        .then(async() => {
          const markers = await Marker.find({})
          expect(markers).to.have.lengthOf(1)
        })
    })

    it('should report error "Marker does not exist" when marker does not exists', () => {
      return request(app)
        .delete('/markers/507f191e810c19729de860ea')
        .expect(httpStatus.NOT_FOUND)
        .catch((res) => {
          expect(res.body.code).to.be.equal(404)
          expect(res.body.message).to.be.equal('Marker does not exist')
        })
    })
  })
})
