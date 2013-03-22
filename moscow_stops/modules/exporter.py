# -*- coding: utf-8 -*-

import os
import codecs
from cStringIO import StringIO
import zipfile

from time import gmtime, strftime
import uuid

from pyramid.path import AssetResolver

def _create_zip(stringIO, prefix, extension = 'xml'):
    file_dir = AssetResolver('moscow_stops').resolve('static/export/').abspath()
    file_name = prefix + '_' + strftime("%Y_%m_%d_%H_%M_%S_", gmtime()) + str(uuid.uuid1()).replace('-', '_')

    output_file = codecs.open(file_dir + file_name + '.' + extension, 'w+', 'utf-8-sig')
    output_file.write(stringIO.getvalue().decode('utf-8-sig'))
    output_file.close()

    zip_file = zipfile.ZipFile(file_dir + file_name + '.zip', 'w', zipfile.ZIP_DEFLATED)
    zip_file.write(file_dir + file_name + '.' + extension, file_name + '.' + extension)
    zip_file.close()
    os.remove(file_dir + file_name + '.' + extension)

    return file_name + '.zip'


def _export_to_yandex_maps_for_Android(stops):
    file_str = StringIO()
    file_str.write(u'<?xml version="1.0" encoding="UTF-8"?>')
    file_str.write(u'<ymaps xmlns="http://maps.yandex.ru/ymaps/1.x" xmlns:gml="http://www.opengis.net/gml" xmlns:repr="http://maps.yandex.ru/representation/1.x" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maps.yandex.ru/schemas/ymaps/1.x/ymaps.xsd"><repr:Representation><repr:View><repr:mapType>MAP</repr:mapType><gml:boundedBy><gml:Envelope><gml:lowerCorner>0 0</gml:lowerCorner><gml:upperCorner>0 0</gml:upperCorner></gml:Envelope></gml:boundedBy></repr:View></repr:Representation><GeoObjectCollection><gml:featureMembers>')

    for stop in stops:
        name = stop[0].name.encode('UTF-8')
        id = ' (%s)' % stop[0].id
        geo_object = '<GeoObject><style>#poi-map-webcam-1</style><gml:description><![CDATA[' + name + id + \
                     ']]></gml:description><gml:Point><gml:pos>' + str(stop[1])+ ' ' + str(stop[2]) + \
                     '</gml:pos></gml:Point><gml:metaDataProperty><AnyMetaData><CameraMetaData><directions><direction>55</direction><direction>235</direction></directions><speed>60</speed><kind>192</kind></CameraMetaData></AnyMetaData></gml:metaDataProperty></GeoObject>'
        file_str.write(geo_object)
    file_str.write(u'</gml:featureMembers></GeoObjectCollection></ymaps>')

    return _create_zip(file_str, 'yma')


def _export_to_csv(stops):
    file_str = StringIO()
    file_str.write(u'ID;Название;Автобусы;Троллейбусы;Трамваи\n'.encode('UTF-8'))

    for stop in stops:
        routes_by_type = {'0': [], '1': [], '2': []}
        routes = stop[0].routes
        for route in routes:
            routes_by_type[str(route.route_type_id)].append(route.name.encode('UTF-8'))

        csv_row = ';'.join([str(stop[0].id),
                            stop[0].name.encode('UTF-8'),
                            ','.join(routes_by_type['0']) if routes_by_type['0'] else '',
                            ','.join(routes_by_type['1']) if routes_by_type['1'] else '',
                            ','.join(routes_by_type['2']) if routes_by_type['2'] else ''])
        file_str.write(csv_row + '\n')

    return _create_zip(file_str, 'csv', 'csv')


def _export_to_cxml(stops):
    file_str = StringIO()
    file_str.write(u'<?xml version="1.0" encoding="UTF-8"?>')
    file_str.write(u'<categories><category name="Остановки">'.encode('UTF-8'))

    for stop in stops:
        name = stop[0].name.encode('UTF-8').replace('"', "'")
        id = ' (%s)' % stop[0].id
        geo_object = '<subcategory name="' + name + id + '"/>'
        file_str.write(geo_object)
    file_str.write(u'</category></categories>')

    return _create_zip(file_str, 'xml_cat')


_formats = {
    'yma': _export_to_yandex_maps_for_Android,
    'csv': _export_to_csv,
    'xml_cat': _export_to_cxml
}


def export_stops(format, stops):
    return _formats.get(format)(stops)