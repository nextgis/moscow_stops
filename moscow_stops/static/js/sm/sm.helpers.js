(function ($) {
	$.sm.helpers = {};
	$.extend($.sm.helpers, {
		getIcon: function (cssClass, iconSize) {
			return L.divIcon({
				className: cssClass,
				iconSize: [iconSize, iconSize],
				iconAnchor: [iconSize / 2, iconSize / 2],
				popupAnchor: [0, 2 - (iconSize / 2)]
			});
		},

		hashToArrayKeyValues: function (hash) {
			var res = [];
			if (Object.prototype.toString.call(hash) === '[object Array]') {
				return hash;
			}
			for (var prop in hash) {
				if (!hash.hasOwnProperty(prop)) continue;
				res.push({ 'key' : prop, 'val' : hash[prop]});
			}
			return res;
		},

		boolToString: function (bool) {
			switch (bool) {
				case null:
					return '';
					break;
				case 'True':
					return 'Да'
					break;
				case 'False':
					return 'Нет'
					break;
			}
			throw 'The bool value is not convertible to string'
		},

		valueNullToString: function (val) {
			if (val === null) { return ''; }
			return val;
		},

		valueCheckToString: function (val) {
			switch (val) {
				case 0:
					return 'Не нужна';
					break;
				case 1:
					return 'Нужна'
					break;
				case 2:
					return 'Проверена'
					break;
			}
		}
	});
})(jQuery);