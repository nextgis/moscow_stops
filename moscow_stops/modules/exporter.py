def _export_to_yandex_maps_for_Android (stops):
    return True

def _export_to_csv (stops):
    return True

_formats = {
    'yma': _export_to_yandex_maps_for_Android,
    'csv': _export_to_csv
}

def export_stops (format, stops):
    return _formats.get(format)(stops)