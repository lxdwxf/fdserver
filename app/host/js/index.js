(function($) {


var Index = {

	init: function() {
		this.div = $('#doc');
		
		this.lastData = JSON.stringify(this.getHosts());

		this.handleEditName();
		this.handleEditBody();
		this.handleAdd();
		this.handleStatus();
		this.handleRemove();

		this.update(false);
	},

	
	handleEditName: function() {
		var self = this;

		this.div.on('click', '.name .text', function() {
			var text = $(this),
				elm = text.closest('.name'),
				editor = $('input.editor', elm);

			elm.addClass('status-edit');
			editor.val(text.text());
			editor[0].focus();
		});

		this.div.on('focusout', '.name .editor', function() {
			var editor = $(this),
				elm = editor.closest('.name'),
				text = $('.text', elm);

			var value = $.trim(editor.val());
			if (value) {
				text.text(value);
			}

			elm.removeClass('status-edit');

			self.update();
		});
	},


	handleEditBody: function() {
		var self = this;
		var fn = function(time) {
			return function() {
				app.utils.schedule('edit-body', function() {
					self.update();	
				}, time);
			}
		};

		this.div.on('input', '.body textarea', fn(1000));
		this.div.on('focusout', '.body textarea', fn(0));
	},


	handleAdd: function() {
		var self = this;

		this.div.guardOn('click', '.add', function(e) {
			return self.loadItem().pipe(function() {
				return self.update(false);	
			});
		});
	},


	loadItem: function() {
		var hosts = $('ul.hosts', this.div);
		return $.ajax('/host/item', {
			cache: false,
			success: function(html) {
				var li = $(html);
				li.hide().appendTo(hosts).slideDown();
			}
		});
	},

	
	handleStatus: function() {
		var self = this;

		this.div.guardOn('click', '.switch-on,.switch-off', function() {
			var btn = $(this),
				li = btn.closest('.host');

			li.toggleClass('status-enabled', btn.hasClass('switch-on'));
			return self.update();
		});
	},


	handleRemove: function() {
		var self = this;
		this.div.guardOn('click', '.remove', function() {
			if (!confirm('确定删除吗?')) {
				return;
			}

			var li = $(this).closest('.host');
			return li.slideUp().promise().pipe(function() {
				li.remove();
				return self.update();
			});
		});
	},


	getHosts: function() {
		var hosts = this.hosts = [];
		$('li.host', this.div).each(function() {
			var li = $(this),
				host = {};
			host.name = $('.text', li).text();
			host.body = $.trim($('.body textarea', li).val());
			host.enabled = li.hasClass('status-enabled');
			hosts.push(host);
		});
		return hosts;
	},


	update: function(message) {
		var self = this,
			last = this.lastData,
			now = JSON.stringify(this.getHosts());

		if (last === now) {
			var defer = $.Deferred();
			defer.resolve();
			return defer;
		}

		this.lastData = now;
		return $.ajax('/host/update.json', {
			type: 'post',
			dataType: 'json',
			data: {
				hosts: now
			},
			success: function(o) {
				if (o.success) {
					message !== false && self.alert('success', '保存成功');
				} else {
					self.alert('error', o.message || '保存失败');
				}
			}
		});
	},


	alert: function(type, message) {
		var bar = $('div.info-bar', this.div),	
			cn = 'alert-' + type;

		bar.addClass(cn).text(message).stop(true).show().delay(3000).fadeOut({
			duration: 1000,
			complete: function() {
				bar.removeClass(cn);
			}
		});
	}

};


$($.proxy(Index, 'init'));

 
})(jQuery);