(function (global, factory) {
    if ( typeof module === "object" && typeof module.exports === "object" ) {
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "countDown requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}
})(typeof window !== "undefined" ? window : this, function (window, noGlobal) {
    var countDown = function ({time = 0, change, finish, millisecond = false, autoStart = true}) {
        var SECOND = 1000;
        var MINUTE = 60 * SECOND;
        var HOUR = 60 * MINUTE;
        var DAY = 24 * HOUR;
    
        var conf = {
            time,
            change,
            finish,
            millisecond,
            autoStart
        }
    
        var prop = {
            mytime: null,
            remain: null,
            rafId: null,
            endTime: null,
            autoStart: true,
            counting: false
        }
        var newRemain;
        var prev = Date.now();
          
        var iRaf = window.requestAnimationFrame || fallback
        var iCancel = window.cancelAnimationFrame || window.clearTimeout
    
        function fallback(fn) {
            var curr = Date.now();
            var ms = Math.max(0, 16 - (curr - prev));
            var id = setTimeout(fn, ms);
            prev = curr + ms;
            return id;
          }
    
        function reset() {
            pause();
            newRemain = +prop.mytime;
            if (conf.autoStart) {
                start();
            }
        }
    
        function start() {
            if (prop.counting) {
                return;
            }
        
            prop.counting = true;
            prop.endTime = Date.now() + prop.remain;
            if (conf.millisecond) {
                microTick();
            } else {
                macroTick();
            }
        }
    
        function pause() {
            prop.counting = false;
            cancelRaf(prop.rafId);
        }
    
        function raf(fn) {
            return iRaf.call(window, fn);
        }
    
        function cancelRaf(id) {
            iCancel.call(window, id);
        }
    
        function microTick() {
      
            prop.rafId = raf(function () {
                /* istanbul ignore if */
                // in case of call reset immediately after finish
                if (!prop.counting) {
                    return;
                }
      
                setRemain(getRemain());
    
                if (prop.remain > 0) {
                    microTick();
                }
            });
        }
    
        function macroTick() {
      
            prop.rafId = raf(function () {
                /* istanbul ignore if */
                // in case of call reset immediately after finish
                if (!prop.counting) {
                    return;
                }
                var remain = getRemain();
        
                if (!isSameSecond(remain, prop.remain) || remain === 0) {
                    setRemain(remain);
                }
      
                if (prop.remain > 0) {
                    macroTick();
                }
            });
        }
    
        function getRemain() {
            return Math.max(prop.endTime - Date.now(), 0);
        }
        function isSameSecond(time1, time2) {
            return Math.floor(time1 / 1000) === Math.floor(time2 / 1000);
        }
        function setRemain(remain) {
            prop.remain = remain;
      
            if (remain === 0) {
                pause();
                if (finish && typeof finish === 'function') finish()
            }
        }
        function parseTimeData(time) {
            var days = Math.floor(time / DAY);
            var hours = Math.floor(time % DAY / HOUR);
            var minutes = Math.floor(time % HOUR / MINUTE);
            var seconds = Math.floor(time % MINUTE / SECOND);
            var milliseconds = Math.floor(time % SECOND);
            return {
              days: days,
              hours: hours,
              minutes: minutes,
              seconds: seconds,
              milliseconds: milliseconds
            };
        }
    
        function init (time, change) {
            if (!time || typeof time !== 'number') {
                return new Error('time is not a number')
            }
            if (!change || typeof change !== 'function') {
                return new Error('change is not a function')
            }
            prop.mytime = time
            Object.defineProperty(prop, 'remain', {
                get: () => {
                    return newRemain
                },
                set: (val) => {
                    change(parseTimeData(val))
                    newRemain = val
                }
            })
            reset()
            return {
                start,
                reset,
                pause
            }
        }
        return init(time, change)
    }
    if ( typeof noGlobal === "undefined" ) {
        window.countDown = countDown;
    }
    return countDown
})
