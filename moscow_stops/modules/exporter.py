# -*- coding: utf-8 -*-

import os
from cStringIO import StringIO
import zipfile

from time import gmtime, strftime
import uuid

import xml.etree.ElementTree as ET
from pyramid.path import AssetResolver


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

    file_dir = AssetResolver('moscow_stops').resolve('static/export/').abspath()
    file_name = 'yma_' + strftime("%Y_%m_%d_%H_%M_%S_", gmtime()) + str(uuid.uuid1()).replace('-', '_')
    file = open(file_dir + file_name + '.xml', 'w+')
    file.write(file_str.getvalue())
    file.close()

    zip = zipfile.ZipFile(file_dir + file_name + '.zip', 'w', zipfile.ZIP_DEFLATED)
    zip.write(file_dir + file_name + '.xml')
    os.remove(file_dir + file_name + '.xml')

    return file_name + '.zip'


def _export_to_csv(stops):
    return True


_formats = {
    'yma': _export_to_yandex_maps_for_Android,
    'csv': _export_to_csv
}


def export_stops(format, stops):
    return _formats.get(format)(stops)