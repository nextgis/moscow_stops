# -*- coding: utf-8 -*-

from sqlalchemy.orm.exc import NoResultFound

from pyramid.view import view_config
from pyramid.response import Response
from pyramid.view import view_defaults

from .models import (
	DBSession,
	User,
	)

class User(object):
	@view_config(route_name='login', request_method='POST')
	def login(self):
		email = self.request.POST.get('email', '');
		password = self.request.POST.get('password', '');

		user = DBSession.query(User) \
			.filter_by(email=email, password=password) \
			.first()

		if user:
			self.request.session['key'] = generate_session_id()
			return Response(self.request.session['key'])
		else:
			self.request.response.status = 401
			return {}

	@view_config(route_name='logout', request_method='POST')
	def logout(self):
		self.request.session.invalidate()

def generate_session_id():
	import random
	import string
	return ''.join(random.choice(string.ascii_uppercase + string.digits) for x in range(10))

# def includeme(config):
# 	config.add_route('auth.login', '/login')
# 	config.add_view(auth_login, route_name='auth.login')
# 	config.add_route('auth.logout', '/logout')
# 	config.add_view(auth_logout, route_name='auth.logout')
# 	config.set_request_property(session_key, 'session_key', reify=True)
#
#
#
# def session_key(request):
# 	if (request.session and request.session['session_key']):
# 		session = environ['beaker.session']
# 		if (session.Session.get_by_id(id))
#
# def property_user_id(request):
# 	# return authenticated_userid(request)
# 	if 'user_id' in request.session:
# 	# user signed in
# 	else:
# 	# user not signed in or session is expired
#
#
# def property_user(request):
# 	if request.user_id:
# 		return DBSession.query(User).filter_by(id=request.user_id).one()
# 	else:
# 		return None
#
#
# @forbidden_view_config()
# def forbidden_view(request):
# 	if not request.user_id and request.accept.accept_html():
# 		return HTTPFound(location=request.route_url('auth.login', _query=(('next', request.path),)))
#
# 	return HTTPForbidden()
#
# def auth_login(request):
# 	next = request.params.get('next', request.application_url)
#
# 	if request.method == 'POST':
# 		try:
# 			email = request.POST.get('email', '');
# 			password = request.POST.get('password', '');
#
# 			user = DBSession.query(User) \
# 				.filter_by(email=email,
# 			               password=User.password_hash(password, request.registry.settings['auth.salt'])) \
# 				.one()
#
# 			headers = remember(request, user.id)
#
# 			return HTTPFound(location=next, headers=headers)
#
# 		except NoResultFound:
# 			return dict(next=next, email=email, message=u"Неверный пароль или адрес электронной почты!")
#
# 	return dict(next=next)
#
#
# def auth_logout(request):
# 	headers = forget(request)
# 	return HTTPFound(location=request.application_url, headers=headers)
#
