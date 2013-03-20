# -*- coding: utf-8 -*-

from pyramid.view import view_config
from sqlalchemy.sql.expression import asc

from models import DBSession, CheckStatusType
from modules import exporter

from logging import Logger

@view_config(route_name='export', renderer='export.mako')
def export_view(request):
    session = DBSession()
    ckeck_types = session.query(CheckStatusType).order_by(asc(CheckStatusType.id))
    return {'check_types': ckeck_types}

@view_config(route_name='export', renderer='export.mako', request_method='POST')
def export(request):
    log = logging..getLogger(__name__)

    if 'format' in request.POST.keys():
        exporter.export_stops(request.POST['format'], stops)