# -*- coding: utf-8 -*-

import json

from pyramid.view import view_config
from pyramid.response import Response

from moscow_stops.models import DBSession
import moscow_stops.models
from moscow_stops.decorators import authorized


@view_config(route_name='login', request_method='POST')
def login(context, request):
	email = request.POST.get('em');
	password = request.POST.get('p');

	session = DBSession()
	user = session.query(moscow_stops.models.User)\
		.filter(moscow_stops.models.User.email == email, moscow_stops.models.User.password == password)\
		.first()

	if user:
		request.session['sk'] = generate_session_id()
		request.session['u_name'] = user.display_name
		request.session['u_id'] = user.id
		response = Response(json.dumps({'name' : request.session['u_name'] }))
		response.set_cookie('sk', value=request.session['sk'], max_age=86400)
		return response
	else:
		return Response(status = 401)

@view_config(route_name='logout', request_method='POST')
def logout(context, request):
	request.session.invalidate()
	return Response()

def generate_session_id():
	import random
	import string
	return ''.join(random.choice(string.ascii_uppercase + string.digits) for x in range(10))