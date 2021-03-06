from pyramid.config import Configurator
from sqlalchemy import engine_from_config
from pyramid_beaker import session_factory_from_settings
from pyramid_beaker import set_cache_regions_from_settings

from .models import (
DBSession,
Base,
)


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    engine = engine_from_config(settings, 'sqlalchemy.')
    DBSession.configure(bind=engine)
    Base.metadata.bind = engine
    session_factory = session_factory_from_settings(settings)
    set_cache_regions_from_settings(settings)
    config = Configurator(settings=settings)
    config.set_session_factory(session_factory)
    config.add_static_view('static', 'static', cache_max_age=3600)
    config.add_route('home', '/')
    config.add_route('signout', '/signout')
    config.add_route('stops', '/stops')
    config.add_route('stop', '/stop/{id}')
    config.add_route('stop_block', '/stop/block/{id}')
    config.add_route('stop_unblock', '/stop/unblock/{id}')
    config.add_route('logs', '/logs')
    config.add_route('export', '/export')
    config.add_route('status_export', '/status-export/{id}')
    config.scan()
    return config.make_wsgi_app()
