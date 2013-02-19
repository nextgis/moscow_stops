from pyramid.response import Response
from pyramid.view import view_config
from sqlalchemy.exc import DBAPIError

from .models import (
	DBSession,
	)


@view_config(route_name='home', renderer='base.mako')
def my_view(request):
	user_name = None
	if 'sk' in request.cookies.keys() and 'sk' in request.session and request.session['sk'] == request.cookies['sk'] and 'u_name' in request.session:
		user_name = request.session['u_name']
	return {'u_name': user_name }