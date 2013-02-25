from sqlalchemy import (
	Table,
	Column,
	ForeignKey,
	Integer,
	Boolean,
	Unicode,
	DateTime,
	Text,
	Sequence,
	UniqueConstraint
	)

from geoalchemy import (
	GeometryColumn,
	Geometry,
	)

from sqlalchemy.ext.declarative import declarative_base

from sqlalchemy.orm import (
	scoped_session,
	sessionmaker,
	relationship,
	)

from zope.sqlalchemy import ZopeTransactionExtension

DBSession = scoped_session(sessionmaker(extension=ZopeTransactionExtension()))
Base = declarative_base()


class User(Base):
	__tablename__ = 'users'

	id = Column(Integer, primary_key=True)
	email = Column(Unicode(100), unique=True)
	password = Column(Unicode(40), nullable=False)
	display_name = Column(Unicode(100))

	@classmethod
	def password_hash(cls, password, salt):
		return hashlib.sha1(password + salt).hexdigest()

	def as_dict(self, **addon):
		return dict(id=self.id, email=self.email, display_name=self.display_name, **addon)

stopsRoutes = Table('stops_routes', Base.metadata,
                    Column('stop_id', Integer, ForeignKey('stops.id'), nullable=False, primary_key=True),
                    Column('route_id', Integer, ForeignKey('routes.id'), nullable=False, primary_key=True)
)

stopsStopType = Table('stops_stop_types', Base.metadata,
                    Column('stop_id', Integer, ForeignKey('stops.id'), nullable=False, primary_key=True),
                    Column('stop_type_id', Integer, ForeignKey('stop_types.id'), nullable=False, primary_key=True)
)

class Stop(Base):
	__tablename__ = 'stops'

	id = Column(Integer, Sequence('stops_id_seq'), primary_key=True)
	geom = GeometryColumn(Geometry(2, 4326, bounding_box='(xmin=35, ymin=55, xmax=39, ymax=57)'), nullable=False)
	name = Column(Unicode(254), index=True, nullable=False)
	is_bench = Column(Boolean, nullable=True)
	is_shelter = Column(Boolean, nullable=True)
	stop_types = relationship('StopType', secondary=stopsStopType, backref='stops')
	comment = Column(Text, nullable=True)
	panorama_link = Column(Unicode(500))
	check_status = Column(Integer, nullable=True, default=0)
	routes = relationship("Route", secondary=stopsRoutes, backref='stops')
	is_block = Column(Boolean, nullable=True)
	user_block = relationship('User')
	user_block_id = Column(Integer, ForeignKey('users.id'), nullable=True)

class StopType(Base):
	__tablename__ = 'stop_types'

	id = Column(Integer, Sequence('stop_types_seq'), primary_key=True)
	name = Column(Unicode(254))

class Route(Base):
	__tablename__ = 'routes'

	id = Column(Integer, Sequence('routes_id_seq'), primary_key=True)
	name = Column(Unicode(254), index=True, nullable=False)
	route_type = relationship('RouteType')
	route_type_id = Column(Integer, ForeignKey('route_types.id'), nullable=True)
	UniqueConstraint('name', 'route_type')

class RouteType(Base):
	__tablename__ = 'route_types'

	id = Column(Integer, primary_key=True)
	name = Column(Unicode(254), nullable=False)

class LogStops(Base):
	__tablename__ = 'log_stops'

	stop = relationship('Stop')
	stop_id = Column(Integer, ForeignKey('stops.id'), nullable=False, primary_key=True)
	user = relationship('User')
	user_id = Column(Integer, ForeignKey('users.id'), nullable=False, primary_key=True)
	time = Column(DateTime, nullable=False, primary_key=True)