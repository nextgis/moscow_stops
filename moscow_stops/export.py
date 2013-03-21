# -*- coding: utf-8 -*-

from pyramid.view import view_config
from pyramid.response import Response

import json

from sqlalchemy.orm import joinedload
from sqlalchemy.sql.expression import asc

from models import DBSession, Stop, CheckStatusType
from modules import exporter


@view_config(route_name='export', renderer='export.mako')
def export_view(request):
    session = DBSession()
    ckeck_types = session.query(CheckStatusType).order_by(asc(CheckStatusType.id))
    return {'check_types': ckeck_types}


@view_config(route_name='export', request_method='POST')
def export(request):
    file_name = None
    if 'format' in request.params:
        clauses = get_clauses(request.params)
        session = DBSession()
        stops = session.query(Stop, Stop.geom.x, Stop.geom.y)\
            .options(joinedload(Stop.stop_types),
                     joinedload(Stop.check_status_type)) \
            .filter(*clauses) \
            .order_by(asc(Stop.name))
        file_name = exporter.export_stops(request.POST['format'], stops)
    return Response(json.dumps({'file' : file_name }))

def get_clauses(params):
    clauses = []
    if 'condition_check_type_1' in params and params['condition_check_type_1'] != 'None':
        clauses.append(Stop.check_status_type_id == params['condition_check_type_1'])
    if 'condition_check_type_2' in params and params['condition_check_type_2'] != 'None':
        clauses.append(Stop.check_status_type_id == params['condition_check_type_2'])
    return clauses