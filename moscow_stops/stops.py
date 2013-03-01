# -*- coding: utf-8 -*-
from moscow_stops.models import DBSession
from pyramid.view import view_config
from pyramid.response import Response
from models import Stop
from sqlalchemy.orm import joinedload
from sqlalchemy.sql.expression import asc
import transaction
from decorators import authorized
from helpers import sql_generate_for_many_to_many, str_to_boolean
import json

@view_config(route_name='stops', request_method='GET')
def get(context, request):
	session = DBSession()
	bbox_param = request.params.getall('bbox')[0]
	bbox = json.loads(bbox_param)
	box_geom = 'POLYGON((%s %s, %s %s, %s %s, %s %s, %s %s))' % \
	           (bbox['_southWest']['lng'], bbox['_southWest']['lat'], \
	           bbox['_southWest']['lng'], bbox['_northEast']['lat'],\
	           bbox['_northEast']['lng'], bbox['_northEast']['lat'], \
	           bbox['_northEast']['lng'], bbox['_southWest']['lat'], \
	           bbox['_southWest']['lng'], bbox['_southWest']['lat'])

	clauses = []
	if 'filter' in request.GET:
		filter = json.loads(request.GET['filter'])
		name = filter['name'].encode('UTF-8')
		if filter['id'].isdigit() or name.strip():
			if name.__len__() > 3:
				name = '%' + name + '%'
				clauses.append(Stop.name.ilike(name))
			if filter['id'].isdigit():
				id = int(filter['id'])
				clauses.append(Stop.id == id)
		else:
			clauses.append(Stop.geom.within(box_geom))

	stops_from_db = session.query(Stop, Stop.geom.x, Stop.geom.y).options(joinedload(Stop.stop_types)).filter(*clauses) \
		.order_by(asc(Stop.is_block), asc(Stop.name))

	stops_result = {'stops' : {
		'block' : {'count' : 0, 'elements' : []},
		'non_block' :
			{'check' : { 'count' : 0, 'elements' : [] },
			 'non_check' : { 'count' : 0, 'elements' : [] }
			}
	}}
	for stop in stops_from_db:
		stop_entity = {'id' : stop[0].id , 'name' : stop[0].name, 'lon' : stop[1], 'lat' : stop[2] }
		if stop[0].is_block:
			stops_result['stops']['block']['elements'].append(stop_entity)
			stops_result['stops']['block']['count'] += 1
		else:
			if stop[0].is_bench is None \
				and stop[0].is_shelter is None \
				and len(stop[0].stop_types) == 0 \
				and stop[0].panorama_link is None:
				stops_result['stops']['non_block']['non_check']['elements'].append(stop_entity)
				stops_result['stops']['non_block']['non_check']['count'] += 1
			else:
				stops_result['stops']['non_block']['check']['elements'].append(stop_entity)
				stops_result['stops']['non_block']['check']['count'] += 1

	return Response(json.dumps(stops_result))

@view_config(route_name='stop', request_method='GET')
def get_stop(context, request):
	id = request.matchdict.get('id', None)
	session = DBSession()
	stop_from_db = session.query(Stop, Stop.geom.x, Stop.geom.y).options(joinedload(Stop.stop_types), joinedload(Stop.routes), joinedload(Stop.user_block)).filter(Stop.id == id).one()

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

	stops_result['stop']['user_block'] = ''
	if stop_from_db[0].is_block:
		stops_result['stop']['user_block'] = stop_from_db[0].user_block.display_name

	return Response(json.dumps(stops_result))

@view_config(route_name='stop_block', request_method='GET')
@authorized()
def stop_block(context, request):
	id = request.matchdict.get('id', None)
	session = DBSession()
	session.query(Stop).filter(Stop.id == id).update({
		Stop.is_block: True,
		Stop.user_block_id: request.session['u_id']
	})
	return Response()

@view_config(route_name='stop_unblock', request_method='GET')
@authorized()
def stop_unblock(context, request):
	id = request.matchdict.get('id', None)
	session = DBSession()
	session.query(Stop).filter(Stop.id == id).update({
		Stop.is_block: False,
		Stop.user_block_id: None
	})
	return Response()

@view_config(route_name='stop', request_method='POST')
def update_stop(context, request):
	stop = json.loads(request.POST['stop'])
	session = DBSession()
	session.query(Stop).filter(Stop.id == stop['id']).update({
		Stop.name : stop['name'].encode('UTF-8'),
		Stop.is_bench : None if stop['is_bench'] == 'None' else stop['is_bench'],
		Stop.is_shelter : None if  stop['is_shelter'] == 'None' else stop['is_shelter'],
		Stop.comment : stop['comment'].encode('UTF-8'),
		Stop.panorama_link : stop['panorama_link'],
		Stop.check_status : stop['is_check'],
	    Stop.is_help : str_to_boolean(stop['is_help'])
	}, synchronize_session=False);
	# raw sql about https://groups.google.com/forum/?fromgroups=#!topic/geoalchemy/vSAlsuhwWfo
	sql = 'UPDATE stops SET geom=GeomFromText(:wkt, 4326) WHERE id = :stop_id'
	session.execute(sql, {
		'wkt' : 'POINT(%s %s)' % (stop['lon'], stop['lat']),
		'stop_id' : stop['id']
	})

	sql_routes = sql_generate_for_many_to_many(session, stop['routes'], ['stop_id', 'route_id'], {'col' : 'stop_id', 'id' : stop['id']} , 'stops_routes', ['stop_id', 'route_id'])
	if sql_routes:
		session.execute(sql_routes)

	transaction.commit()
	# return Response(json.dumps(stop))
	return Response(sql_routes)