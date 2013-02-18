# -*- coding: utf-8 -*-

from sqlalchemy.sql import null
from sqlalchemy.orm import aliased
from sqlalchemy.orm.exc import NoResultFound

from geoalchemy import *
from sqlalchemy.orm import *

from pyramid.view import view_config
from pyramid.response import Response

from models import Stop

import json

DBSession = Session()

class Stops(object):
	def __init__(self, request):
		self.request = request

	@view_config(route_name='stops', request_method='GET')
	def get(self):
		bbox_param = self.request.params.getall('bbox')[0]
		bbox = json.loads(bbox_param)
		box_geom = 'POLYGON((%s %s, %s %s, %s %s, %s %s, %s %s))' % \
		           (bbox['_southWest']['lng'], bbox['_southWest']['lat'], \
		           bbox['_southWest']['lng'], bbox['_northEast']['lat'],\
		           bbox['_northEast']['lng'], bbox['_northEast']['lat'], \
		           bbox['_northEast']['lng'], bbox['_southWest']['lat'], \
		           bbox['_southWest']['lng'], bbox['_southWest']['lat'])
		stops_from_db = DBSession.query(Stop.id, Stop.geom.x, Stop.geom.y, Stop.is_check, Stop.is_block).filter(Stop.geom.within(box_geom))

		stops_result = {'stops' : {
			'block' : {},
			'non_block' : {'check' : {}, 'non_check' : {} }
		}}
		for stop in stops_from_db:
			stop_geom = { 'lon' : stop[1], 'lat' : stop[2] }
			if stop.is_block:
				stops_result['stops']['block'][stop.id] = stop_geom
			else:
				if stop.is_check:
					stops_result['stops']['non_block']['check'][stop.id] = stop_geom
				else:
					stops_result['stops']['non_block']['non_check'][stop.id] = stop_geom

		return Response(json.dumps(stops_result))

	@view_config(route_name='stop', request_method='GET')
	def get_stop(self):
		matchdict = self.request.matchdict
		id = matchdict.get('id', None)
		stop_from_db = DBSession.query(Stop, Stop.geom.x, Stop.geom.y).filter(Stop.id == id).one()

		stops_result = {'stop': {}}
		fields = ['id', 'name','is_shelter','is_bench','stop_type_id','is_check']
		for f in fields:
			stops_result['stop'][f] = unicode(getattr(stop_from_db[0], f))
		stops_result['stop']['geom'] = { 'lon' : stop_from_db[1], 'lat' : stop_from_db[2] }

		return Response(json.dumps(stops_result))

	@view_config(route_name='stop', request_method='POST')
	def post(self):
		stop = self.request.params.getall('stop')[0]
		return Response('post')
	#
	# @view_config(request_method='DELETE')
	# def delete(self):
	# 	return Response('delete')