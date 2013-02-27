__author__ = 'karavanjo'

def str_to_boolean (s):
	return s.lower() in ("true", "1")

def sql_generate_for_many_to_many(session, entities, columns, filter_for_select, table_name, primary_key = []):
	sql = 'SELECT %s FROM %s WHERE %s = %s' % (', '.join(columns), table_name, filter_for_select['col'], filter_for_select['id'])
	items_source = session.execute(sql)
	items_db = {}
	for item_source in items_source:
		pk = ''.join([str(item_source[pk]) for pk in primary_key])
		items_db[pk] = item_source

	inserted, deleted = False, False
	sql_insert = 'INSERT INTO %s(%s) VALUES ' % (table_name, ', '.join(columns))
	for idx, entity in enumerate(entities):
		pk = ''.join([str(entity[pk]) for pk in primary_key])
		if not items_db.get(pk):

			sql_insert += '(' + ', '.join([str(entity[c]) for c in columns]) + '),'
			if not inserted: inserted = True
		items_db[pk] = None
	sql_insert = sql_insert[:-1] + ';'

	sql_delete = 'DELETE FROM %s WHERE ' % table_name
	for k, v in items_db.items():
		if (v):
			sql_delete += ' (' + ' AND '.join(['='.join([pk, str(v[pk])]) for pk in primary_key]) + ') OR'
			if not deleted: deleted = True
	sql_delete = sql_delete[:-2] + ';'

	sql = ''
	if inserted:
		sql += sql_insert
	if deleted:
		sql += sql_delete

	return sql