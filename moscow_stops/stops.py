# -*- coding: utf-8 -*-
from moscow_stops.models import DBSession
from pyramid.view import view_config
from pyramid.response import Response
from models import Stop

import json

class Stops(object):
	def __init__(self, request):
		self.request = request

	@view_config(route_name='stops', request_method='GET')
	def get(self):
		session = DBSession()
		bbox_param = self.request.params.getall('bbox')[0]
		bbox = json.loads(bbox_param)
		box_geom = 'POLYGON((%s %s, %s %s, %s %s, %s %s, %s %s))' % \
		           (bbox['_southWest']['lng'], bbox['_southWest']['lat'], \
		           bbox['_southWest']['lng'], bbox['_northEast']['lat'],\
		           bbox['_northEast']['lng'], bbox['_northEast']['lat'], \
		           bbox['_northEast']['lng'], bbox['_southWest']['lat'], \
		           bbox['_southWest']['lng'], bbox['_southWest']['lat'])
		stops_from_db = session.query(Stop.id, Stop.geom.x, Stop.geom.y, Stop.is_check, Stop.is_block).filter(Stop.geom.within(box_geom))

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
		id = self.request.matchdict.get('id', None)
		session = DBSession()
		stop_from_db = session.query(Stop, Stop.geom.x, Stop.geom.y).filter(Stop.id == id).one()

		stops_result = {'stop': {}}
		fields = ['id', 'name','is_shelter','is_bench','stop_type_id','is_check', 'panorama_link', 'comment']
		for f in fields:
			if hasattr(stop_from_db[0], f):
				stops_result['stop'][f] = unicode(getattr(stop_from_db[0], f))
		stops_result['stop']['geom'] = { 'lon' : stop_from_db[1], 'lat' : stop_from_db[2] }

		sql = 'SELECT routes.id, routes.name, routes.route_type_id FROM stops_routes ' \
		      'JOIN routes ' \
		      'ON (stops_routes.route_id = routes.id) ' \
		      'WHERE stops_routes.stop_id = :stop_id ' \
		      'ORDER BY routes.route_type_id, routes.name'
		routes_from_db = session.execute(sql, {'stop_id' : id})
		routes = []
		for route in routes_from_db:
			routes.append({'id' : route[0], 'nm' : route[1], 't' : route[2]})
		stops_result['stop']['routes'] = routes

		sql = 'SELECT stop_types.id, stop_types.name FROM stops_stop_types ' \
		      'JOIN stop_types ' \
		      'ON (stops_stop_types.stop_type_id = stop_types.id) ' \
		      'WHERE stops_stop_types.stop_id = :stop_id ' \
		      'ORDER BY stop_types.name;'
		stop_types_from_db = session.execute(sql, {'stop_id' : id})
		stop_types = []
		for stop_type in stop_types_from_db:
			stop_types.append({'id' : stop_type[0], 'nm' : stop_type[1]})
		stops_result['stop']['types'] = stop_types

		return Response(json.dumps(stops_result))

	@view_config(route_name='stop', request_method='POST')
	def post(self):
		stop = self.request.params.getall('stop')[0]
		return Response('post')