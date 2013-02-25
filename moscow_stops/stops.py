# -*- coding: utf-8 -*-
from moscow_stops.models import DBSession
from pyramid.view import view_config
from pyramid.response import Response
from models import Stop
from geoalchemy import WKTSpatialElement
import transaction

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
		stops_from_db = session.query(Stop, Stop.geom.x, Stop.geom.y).filter(Stop.geom.within(box_geom))

		stops_result = {'stops' : {
			'block' : {},
			'non_block' : {'check' : {}, 'non_check' : {} }
		}}
		for stop in stops_from_db:
			stop_geom = { 'lon' : stop[1], 'lat' : stop[2] }
			if stop[0].is_block:
				stops_result['stops']['block'][stop.id] = stop_geom
			else:
				if stop[0].is_bench is None \
					and stop[0].is_shelter is None \
					and len(stop[0].stop_types) == 0 \
					and stop[0].panorama_link is None:
					stops_result['stops']['non_block']['non_check'][stop[0].id] = stop_geom
				else:
					stops_result['stops']['non_block']['check'][stop[0].id] = stop_geom

		return Response(json.dumps(stops_result))

	@view_config(route_name='stop', request_method='GET')
	def get_stop(self):
		id = self.request.matchdict.get('id', None)
		session = DBSession()
		stop_from_db = session.query(Stop, Stop.geom.x, Stop.geom.y).filter(Stop.id == id).one()

		stops_result = {'stop': {}}
		for col in stop_from_db[0].__table__.columns.keys():
			if col != 'geom':
				stops_result['stop'][col] = getattr(stop_from_db[0], col)

		stops_result['stop']['geom'] = { 'lon' : stop_from_db[1], 'lat' : stop_from_db[2] }

		routes = stop_from_db[0].routes
		routes_result = []
		for route in routes:
			routes_result.append(dict((col, getattr(route, col)) for col in route.__table__.columns.keys()))
		stops_result['stop']['routes'] = routes_result

		stop_types = stop_from_db[0].stop_types
		stop_types_res = []
		for type in stop_types:
			stop_types_res.append(dict((col, getattr(stop_type, col)) for stop_type in type.__table__.columns.keys()))
		stops_result['stop']['types'] = stop_types

		return Response(json.dumps(stops_result))

	@view_config(route_name='stop', request_method='POST')
	def update_stop(self):
		stop = json.loads(self.request.POST['stop'])
		session = DBSession()
		session.query(Stop).filter(Stop.id == stop['id']).update({
			Stop.name : stop['name'].encode('UTF-8'),
			Stop.is_bench : None if stop['is_bench'] == 'None' else stop['is_bench'],
			Stop.is_shelter : None if  stop['is_shelter'] == 'None' else stop['is_shelter'],
			Stop.comment : stop['comment'].encode('UTF-8'),
			Stop.panorama_link : stop['panorama_link'],
			Stop.check_status : stop['is_check']
		}, synchronize_session=False);
		# raw sql about https://groups.google.com/forum/?fromgroups=#!topic/geoalchemy/vSAlsuhwWfo
		sql = 'UPDATE stops SET geom=GeomFromText(:wkt, 4326) WHERE id = :stop_id'
		session.execute(sql, {
			'wkt' : 'POINT(%s %s)' % (stop['lon'], stop['lat']),
			'stop_id' : stop['id']
		})
		transaction.commit()
		return Response(json.dumps(stop))