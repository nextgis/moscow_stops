from pyramid.response import Response
from pyramid.view import view_config
from sqlalchemy.exc import DBAPIError
from models import Route
from sqlalchemy.sql.expression import asc
from sqlalchemy.orm import joinedload

from .models import (
	DBSession,
	)


@view_config(route_name='home', renderer='base.mako')
def my_view(request):
	session = DBSession()
	routes_from_db = session.query(Route).options(joinedload(Route.route_type)).order_by(asc(Route.route_type_id), asc(Route.name))
	routes = dict()
	routes_types = dict()
	for route in routes_from_db:
		if not route.route_type_id in routes:
			routes[route.route_type_id] = []
			routes_types[route.route_type_id] = route.route_type
		routes[route.route_type_id].append(route)

	user_name = None
	if 'sk' in request.cookies.keys() and 'sk' in request.session and request.session['sk'] == request.cookies['sk'] and 'u_name' in request.session:
		user_name = request.session['u_name']
	return {'u_name': user_name, 'routes' : routes, 'routes_types' : routes_types }