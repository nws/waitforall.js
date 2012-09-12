window.waitforall = (function($) {
	return function() {
		var idseq = 0,
			ran_handlers = {},
			finally_handlers = [];

		function wrap(handler, id) {
			id = id || ++idseq;

			var wrapped = function() {
				var rv = handler.apply(this, arguments); // this?
				done_with(id);
				return rv;
			};

			ran_handlers[id] = ran_handlers[id] || false;

			wrapped.id = id; // whee js is niiiice
			return wrapped;
		}

		function wait(and_then_handler) {
			finally_handlers.push({
				ran: false,
				handler: and_then_handler,
			});
		}

		function check_if_all_done() {
			var all_done = true;

			for (var i in ran_handlers) {
				if (!ran_handlers[i]) {
					all_done = false;
					break;
				}
			}

			if (all_done) {
				// so we run later than the last handler's return
				setTimeout(function() {
					for (var i = 0, l = finally_handlers.length; i < l; ++i) {
						var h = finally_handlers[i];
						if (!h.ran) {
							h.handler.apply(this); // this?
							h.ran = true;
						}
					}
				}, 0);
			}
		}
		
		function done_with(id) {
			ran_handlers[id] = true;
			check_if_all_done();
		}

		return {
			wrap: wrap,
			wait: wait,
			done_with: done_with,
		};
	};
})(jQuery);
