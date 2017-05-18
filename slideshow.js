var addClassName = function (object, classname) {
	if (object != null) {
		if (hasClassName(object, classname)) {
			removeClassName(object, classname);
		}
		setClassName(object, getClassName(object)+" "+classname);
	}
};
var removeClassName = function (object, classname) {
	if (object != null) {
		if (hasClassName(object, classname)) {
			var classe = getClassName(object);
			var reg = new RegExp('\\b'+classname+'\\b');
			var classes = classe.split(reg);
			var newClasse = "";
			for (var i = 0; i < classes.length; i++) {
				newClasse += " " + classes[i];
			}
			setClassName(object,newClasse);
		}
	}
};
var hasClassName = function (object, classname) {
	if (object != null) {
		var classe = this.getClassName(object);
		if (classe) {
			return (classe.indexOf(classname) > -1);
		}
	}
	return false;
};
var setClassName = function (object, classname) {
	if (object != null) {
		//if (this.isIE) {
		//	object.setAttribute("className",classname);
		//} else {
			object.className = classname;
		//}
	}
};
var getClassName = function (object) {
	if (object != null) {
		//if (this.isIE) {
		//	return object.getAttribute("className");
		//} else {
			return object.className;
		//}
	}
};

var slideShow = (function () {
	var TIMEOUT_SELECT = 1000;
	var _ctx = {},
		playListIndex = [],
		nbPlayImage = 10,
		playStatut = null,
		isEnded = false,
		isSlideBarShowed = false,
		isSlideBarDetailedShowed = false,
		timeout = null,
		timeoutSlide = null,
		timeoutSelect = null,
		odd = false,
		widthMiddle = 0;

	var _setTimeoutSlide = function (/*in seconde*/sec) {
		timeout = sec * 1000;					
		_resetProgressBar();
	};
	var _getPlayStatus = function () {
		return playStatut;
	};
	var _play = function () {
		playStatut = "PLAY";
		_resetProgressBar();
		_select();
		_autoPlay();
		_ctx.onPlay();
	};
	var _autoPlay = function () {
		if (timeoutSlide != null) clearTimeout(timeoutSlide);
		if (playStatut == "PLAY") {
			timeoutSlide = setTimeout(function () {
				if (_ctx["image"+_ctx.indexFocus].loaded) {
					// normal timeout
					
				} else if (_ctx["image"+_ctx.indexFocus].error) {
					// error with image, force go to next
					
				} else {
					// reset timeout until image is loaded or on error
					
				}
				// if ended or next picture is loaded
				//if ((_ctx.indexFocus + 1 == playListIndex.length) || _ctx.indexFocus + 1 < playListIndex.length && (_ctx["image"+(_ctx.indexFocus + 1)].loaded || _ctx["image"+(_ctx.indexFocus + 1)].error)) {
					clearTimeout(timeoutSlide);
					// progress bar
					_resetProgressBar();
					// next picture
					_next();
				//}
			},timeout);
			setTimeout(function () {
				_updateProgressBar(timeout);
			},100); // need delai to reset width
		}
	};
	var _pause = function () {
		playStatut = "PAUSE";
		_resetProgressBar();
		if (timeoutSlide != null) clearTimeout(timeoutSlide);
		_ctx.onPause();
	};
	var _stop = function () {
		playStatut = "STOP";
		_resetProgressBar();
		if (timeoutSlide != null) clearTimeout(timeoutSlide);
		isEnded = false;
		_ctx.current = _ctx.first;
		_select();
		_updateMiddleWidth();
		_ctx.onStop();
	};
	var _next = function (defer) {
		if (defer) {
			// force next
			_resetProgressBar();
		}
		_ctx.current++;
		var end = false;
		if (_ctx.current >= _ctx.urls.length) {
			if (_ctx.cyclic) {
				_ctx.current -= _ctx.urls.length;		
			} else {
				_ctx.current = _ctx.urls.length - 1;
				end = true;
			}
		}
		if (!end && _ctx.current < _ctx.urls.length) {
			if (_ctx.cyclic) {
				// move first dom picture to last position
				_slideRight();
			}
			_select(defer);
			_updateMiddleWidth();
		}
		if (!isEnded && !defer 
				&& ((_ctx.cyclic && _ctx.current == _ctx.first) || (!_ctx.cyclic && end))) {
			isEnded = true;
			if (_ctx.cyclic && _ctx.autoStop) {
				_stop();
			}
			_ctx.onEnd();
		}
		_ctx.onNext();
	};
	var _previous = function (defer) {
		if (defer) {
			// force previous
			_resetProgressBar();
		}
		_ctx.current--;
		if (_ctx.current < 0) {
			if (_ctx.cyclic) {
				_ctx.current += _ctx.urls.length;		
			} else {
				_ctx.current = 0;
			}
		}
		if (_ctx.current >= 0) {
			isEnded = false;
			if (_ctx.cyclic) {
				// move last dom picture to first position
				_slideLeft();
			}
			_select(defer);
			_updateMiddleWidth();
		}
		_ctx.onPrevious();
	};
	var _reset = function () {
	// FIXME : do not work
		if (timeoutSlide != null) clearTimeout(timeoutSlide);
		isEnded = false;
		_resetProgressBar();
		_ctx.current = _ctx.first;
		_manageCoverflow();
		_select();
		_updateMiddleWidth();
		_autoPlay();
		_ctx.onReset();
	};
	var _toggleBar = function () {
		if (isSlideBarShowed) {
			_hideSlideBar();
		} else {
			_showSlideBar();
		}
		_ctx.onToggleBar();
	};
	var _showSlideBar = function () {
		isSlideBarShowed = true;
		addClassName(_ctx.slideBar,"show");
	};
	var _hideSlideBar = function () {
		isSlideBarShowed = false;
		removeClassName(_ctx.slideBar,"show");
	};
	var _showBarDetailed = function () {
		if (!isSlideBarDetailedShowed) {
			isSlideBarDetailedShowed = true;
			addClassName(_ctx.slideBar,"detailed");
			_updateMiddleWidth();
		}
	};
	var _hideBarDetailed = function () {
		if (isSlideBarDetailedShowed) {
			isSlideBarDetailedShowed = false;
			removeClassName(_ctx.slideBar,"detailed");
			_updateMiddleWidth();
		}
	};
	var _updateMiddleWidth = function () {
		// get middle width
		if (playListIndex.length > 0) {
			widthMiddle = (_ctx.slideshow.offsetWidth - _ctx["liSlide"+(_ctx.orderedDomIndex[nbPlayImage/2])].offsetWidth) / 2;
			var widthToCurrent = 0;
			var i = 0;
			while (i < nbPlayImage/2) {
				widthToCurrent += _ctx["liSlide"+_ctx.orderedDomIndex[i]].offsetWidth;
				i++;
			}
			_ctx.slideshowMiniatureMarginLeft = widthMiddle -  widthToCurrent;
			_ctx.slideshowMiniature.style.marginLeft = _ctx.slideshowMiniatureMarginLeft+"px";
		}
	};
	var _updateProgressBar = function (value) {
		_ctx.cursorbarCurrent.style.width = (100 * value / timeout)+"%";
	};
	var _resetProgressBar = function () {
		_ctx.cursorbarCurrent.style.WebkitTransitionDuration = "1ms";
		_ctx.cursorbarCurrent.style.MozTransitionDuration = "1ms";
		_ctx.cursorbarCurrent.style.MsTransitionDuration = "1ms";
		_ctx.cursorbarCurrent.style.OTransitionDuration = "1ms";
		_ctx.cursorbarCurrent.style.transitionDuration = "1ms";
		removeClassName(_ctx.cursorbarCurrent, "animated");	
		
		_ctx.cursorbarCurrent.style.width = "0px";			
		
		setTimeout(function () {
			addClassName(_ctx.cursorbarCurrent, "animated");
			_ctx.cursorbarCurrent.style.WebkitTransitionDuration = timeout+"ms";
			_ctx.cursorbarCurrent.style.MozTransitionDuration = timeout+"ms";
			_ctx.cursorbarCurrent.style.MsTransitionDuration = timeout+"ms";
			_ctx.cursorbarCurrent.style.OTransitionDuration = timeout+"ms";
			_ctx.cursorbarCurrent.style.transitionDuration = timeout+"ms";
		},100);
	};
	
	var _updateInfoWidth = function () {
		var width = _ctx.cursorbar.offsetWidth;
		for (var i = 0; i < playListIndex.length; i++) {
			_ctx["infoSlide"+i].style.width = (width - 6)+"px";
		}
	};
	var _updateInfoBar = function () {
		_ctx.infobarText.textContent = (_ctx.current + 1) + "|" + _ctx.urls.length;
	};
	var _activeAnimated = function () {
		addClassName(_ctx.imagefull, "animated");
		addClassName(_ctx.imagefullTransition, "animated");
	};
	var _slideRight = function () {
		if (_ctx.coverflow) {
			_ctx.indexStart++;
			_ctx.indexEnd++;
			if (_ctx.indexEnd >= _ctx.urls.length) {
				_ctx.indexEnd = 0;
			}
			if (_ctx.indexStart >= _ctx.urls.length) {
				_ctx.indexStart = 0;
			}
			if (_ctx.indexFocus < nbPlayImage) {
				_ctx.indexFocus++;
			} else {
				_ctx.indexFocus = 0;
			}
			playListIndex.splice(0,1);
			playListIndex.push(_ctx.indexEnd);
			var firstIndex = _ctx.orderedDomIndex.splice(0,1)[0];
			_ctx.orderedDomIndex.push(firstIndex);
			_ctx["imageSlide"+firstIndex].src = _ctx.urls[_ctx.indexEnd].urlData;
			// move dom 
			_ctx.slideshowMiniature.removeChild(_ctx["liSlide"+firstIndex]);
			_ctx.slideshowMiniature.appendChild(_ctx["liSlide"+firstIndex]);
			// text
			_updateTextByIndex(firstIndex,_ctx.indexEnd);
		} else {
			// move index first to last
			var firstIndex = _ctx.orderedDomIndex.splice(0,1)[0];
			_ctx.orderedDomIndex.push(firstIndex);
			// move dom 
			_ctx.slideshowMiniature.removeChild(_ctx["liSlide"+firstIndex]);
			_ctx.slideshowMiniature.appendChild(_ctx["liSlide"+firstIndex]);
		}
	};
	var _slideLeft = function () {
		if (_ctx.coverflow) {
			_ctx.indexStart--;
			_ctx.indexEnd--;
			if (_ctx.indexEnd < 0) {
				_ctx.indexEnd = _ctx.urls.length - 1;
			}
			if (_ctx.indexStart < 0) {
				_ctx.indexStart = _ctx.urls.length - 1;
			}
			if (_ctx.indexFocus > 0) {
				_ctx.indexFocus--;
			} else {
				_ctx.indexFocus = nbPlayImage;
			}
			playListIndex.splice(playListIndex.length - 1,1);
			playListIndex.splice(0,0,_ctx.indexStart);
			var lastIndex = _ctx.orderedDomIndex.splice(_ctx.orderedDomIndex.length - 1, 1)[0];
			_ctx.orderedDomIndex.splice(0,0,lastIndex);
			_ctx["imageSlide"+lastIndex].src = _ctx.urls[_ctx.indexStart].urlData;
			// move dom 
			_ctx.slideshowMiniature.removeChild(_ctx["liSlide"+lastIndex]);
			_ctx.slideshowMiniature.insertBefore(_ctx["liSlide"+lastIndex], _ctx.slideshowMiniature.firstChild);
			// text
			_updateTextByIndex(lastIndex,_ctx.indexStart);				
		} else {
			// move index last to first
			var lastIndex = _ctx.orderedDomIndex.splice(_ctx.orderedDomIndex.length - 1, 1)[0];
			_ctx.orderedDomIndex.splice(0,0,lastIndex);
			// move dom 
			_ctx.slideshowMiniature.removeChild(_ctx["liSlide"+lastIndex]);
			_ctx.slideshowMiniature.insertBefore(_ctx["liSlide"+lastIndex], _ctx.slideshowMiniature.firstChild);
		}
	};
	var _getLoadingOrder = function () {
		var orderedLoadingIndex = [_ctx.current];
		if (_ctx.cyclic) {
			var mid = Math.floor(playListIndex.length / 2);
			
			for (var i = 1; i <= mid; i++) {
				var right = _ctx.current + i;
				if (right >= playListIndex.length) {
					right -= playListIndex.length;
				}
				orderedLoadingIndex.push(right);
				var left = _ctx.current - i;
				if (left < 0) {
					left += playListIndex.length;
				}
				if (orderedLoadingIndex.length < playListIndex.length) {
					orderedLoadingIndex.push(left);
				}
			}
		} else {
			var orderedIndexLeft = [];
			var orderedIndexRight = [];
			if (_ctx.current > 0) {
				for (var i = _ctx.current - 1; i >= 0; i--) {
					orderedIndexLeft.push(i);
				}
			}
			for (var i = _ctx.current + 1; i < playListIndex.length; i++) {
				orderedIndexRight.push(i);
			}
			var max = Math.max(orderedIndexLeft.length,orderedIndexRight.length);
			for (var i = 0; i < max; i++) {
				if (i < orderedIndexRight.length) {
					orderedLoadingIndex.push(orderedIndexRight[i]);
				}
				if (i < orderedIndexLeft.length) {
					orderedLoadingIndex.push(orderedIndexLeft[i]);
				}
			}
		}
		if (console) console.debug("orderedLoadingIndex = ",orderedLoadingIndex);
		return orderedLoadingIndex;
	};
	var _select = function (defer) {
		// focus slideBar
		for (var i = 0; i < playListIndex.length; i++) {
			removeClassName(_ctx["liSlide"+i], "focus");
		}
		addClassName(_ctx["liSlide"+_ctx.indexFocus], "focus");
		
		// update info bar
		_updateInfoBar();
		
		// select current image
		if (timeoutSelect != null) clearTimeout(timeoutSelect);
		if (defer) {
			timeoutSelect = setTimeout(function () {
				if (odd) {
					odd = false;
					_ctx.imagefullTransition.src = _ctx.urls[_ctx.current].urlData;
					removeClassName(_ctx.imagefull,"opaque");
					addClassName(_ctx.imagefullTransition, "opaque");
				} else {
					odd = true;
					_ctx.imagefull.src = _ctx.urls[_ctx.current].urlData;
					removeClassName(_ctx.imagefullTransition,"opaque");
					addClassName(_ctx.imagefull, "opaque");
				}
				_autoPlay();
			}, TIMEOUT_SELECT);
		} else {
			if (odd) {
				odd = false;
				_ctx.imagefullTransition.src = _ctx.urls[_ctx.current].urlData;
				removeClassName(_ctx.imagefull,"opaque");
				addClassName(_ctx.imagefullTransition, "opaque");
			} else {
				odd = true;
				_ctx.imagefull.src = _ctx.urls[_ctx.current].urlData;
				removeClassName(_ctx.imagefullTransition,"opaque");
				addClassName(_ctx.imagefull, "opaque");
			}
			_autoPlay();
		}
	};
	var _createNodes = function () {
		// slideshow
		_ctx.slideshow = document.createElement("DIV");
		_ctx.slideshow.className = "slideshow";
		
		// full image
		_ctx.slideshowfull = document.createElement("DIV");
		_ctx.slideshowfull.className = "full";
		// slide
		_ctx.slideshowMiniature = document.createElement("DIV");
		_ctx.slideshowMiniature.className = "slide";
		// append full image to slideshow
		_ctx.slideshow.appendChild(_ctx.slideshowfull);

		// bar
		_ctx.slideBar = document.createElement("DIV");
		_ctx.slideBar.className = "bar";
		
		// bar cursor
		_ctx.cursorbg = document.createElement("DIV");
		_ctx.cursorbg.className = "cursorbg";
		_ctx.cursorbar = document.createElement("DIV");
		_ctx.cursorbar.className = "cursorbar";
		// bar current cursor
		_ctx.cursorbarCurrent = document.createElement("DIV");
		_ctx.cursorbarCurrent.className = "cursorbarCurrent";
		_ctx.cursorbar.appendChild(_ctx.cursorbarCurrent);
		_ctx.cursorbg.appendChild(_ctx.cursorbar);
		// append bar cursor to slideshow
		_ctx.slideBar.appendChild(_ctx.cursorbg);
		
		// append slide to slideshow
		_ctx.slideBar.appendChild(_ctx.slideshowMiniature);
		
		// decor bar
		var decor = document.createElement("DIV");
		decor.className = "decor";
		// append decor bar to slideshow
		_ctx.slideBar.appendChild(decor);
		
		// bar info
		_ctx.infobar = document.createElement("DIV");
		_ctx.infobar.className = "infobar";
		_ctx.infobarText = document.createElement("LABEL");
		_ctx.infobarText.className = "infobarText";
		_ctx.infobar.appendChild(_ctx.infobarText);
		// append bar info to slideshow
		_ctx.slideBar.appendChild(_ctx.infobar);

		// append slide bar to slideshow
		_ctx.slideshow.appendChild(_ctx.slideBar);
		
		// append to body
		document.body.appendChild(_ctx.slideshow);
		
		// controls
		if (_ctx.displayControls) {
			_ctx.controls = document.createElement("DIV");
			_ctx.controls.className = "controls";
			
			_ctx.btnPlay = document.createElement("BUTTON");
			_ctx.btnPlay.onclick = _play;
			_ctx.btnPlay.textContent = "PLAY";
			_ctx.controls.appendChild(_ctx.btnPlay);
			_ctx.btnPause = document.createElement("BUTTON");
			_ctx.btnPause.onclick = _pause;
			_ctx.btnPause.textContent = "PAUSE";
			_ctx.controls.appendChild(_ctx.btnPause);
			_ctx.btnStop = document.createElement("BUTTON");
			_ctx.btnStop.onclick = _stop;
			_ctx.btnStop.textContent = "STOP";
			_ctx.controls.appendChild(_ctx.btnStop);
			_ctx.btnNext = document.createElement("BUTTON");
			_ctx.btnNext.onclick = _next;
			_ctx.btnNext.textContent = "NEXT";
			_ctx.controls.appendChild(_ctx.btnNext);
			_ctx.btnPrevious = document.createElement("BUTTON");
			_ctx.btnPrevious.onclick = _previous;
			_ctx.btnPrevious.textContent = "PREVIOUS";
			_ctx.controls.appendChild(_ctx.btnPrevious);
			_ctx.btnReset = document.createElement("BUTTON");
			_ctx.btnReset.onclick = _reset;
			_ctx.btnReset.textContent = "RESET";
			_ctx.controls.appendChild(_ctx.btnReset);
			_ctx.btnToggleBar = document.createElement("BUTTON");
			_ctx.btnToggleBar.onclick = _toggleBar;
			_ctx.btnToggleBar.textContent = "TOGGLE BAR";
			_ctx.controls.appendChild(_ctx.btnToggleBar);
			
			// append to body
			document.body.appendChild(_ctx.controls);
		}
	};
	var _refreshItemNodes = function () {
		// remove all childs to play another list
		while (_ctx.slideshowfull.firstChild != null) {
			_ctx.slideshowfull.removeChild(_ctx.slideshowfull.firstChild);
		}
		// full image
		_ctx.imagefull = document.createElement("IMG");
		_ctx.imagefull.className = "";
		_ctx.imagefull.src = _ctx.urls[_ctx.current].urlData;
		_ctx.slideshowfull.appendChild(_ctx.imagefull);
		_ctx.imagefullTransition = document.createElement("IMG");
		_ctx.imagefullTransition.className = "";
		_ctx.slideshowfull.appendChild(_ctx.imagefullTransition);
		
		// remove all childs to play another list
		while (_ctx.slideshowMiniature.firstChild != null) {
			_ctx.slideshowMiniature.removeChild(_ctx.slideshowMiniature.firstChild);
		}
		// dom appends
		_ctx.orderedDomIndex = [];
		for (var j = 0; j < playListIndex.length; j++) {
			_ctx.orderedDomIndex.push(j);
			// slide
			_ctx["liSlide"+j] = document.createElement("DIV");
			// image
			_ctx["imageSlide"+j] = document.createElement("IMG");
			_ctx["imageSlide"+j].className = "";
			_ctx["imageSlide"+j].alt = _ctx.urls[playListIndex[j]].urlData.substring(_ctx.urls[playListIndex[j]].urlData.lastIndexOf("/")+1);
			_ctx["liSlide"+j].appendChild(_ctx["imageSlide"+j]);
			// infos
			_ctx["infoSlide"+j] = document.createElement("DIV");
			_ctx["infoSlide"+j].className = "info";
			_ctx["infoDetailSlide"+j] = document.createElement("DIV");
			_ctx["infoDetailSlide"+j].className = "detail";
			var div = document.createElement("DIV");
			_ctx["infoDetailSlide"+j+"-title"] = document.createElement("LABEL");
			_ctx["infoDetailSlide"+j+"-title"].className = "title";
			div.appendChild(_ctx["infoDetailSlide"+j+"-title"]);
			_ctx["infoDetailSlide"+j+"-size"] = document.createElement("LABEL");
			_ctx["infoDetailSlide"+j+"-size"].className = "size";
			div.appendChild(_ctx["infoDetailSlide"+j+"-size"]);
			_ctx["infoDetailSlide"+j+"-resolution"] = document.createElement("LABEL");
			_ctx["infoDetailSlide"+j+"-resolution"].className = "resolution";
			div.appendChild(_ctx["infoDetailSlide"+j+"-resolution"]);
			_ctx["infoDetailSlide"+j+"-date"] = document.createElement("LABEL");
			_ctx["infoDetailSlide"+j+"-date"].className = "date";
			div.appendChild(_ctx["infoDetailSlide"+j+"-date"]);
			_ctx["infoDetailSlide"+j].appendChild(div);
			_ctx["infoSlide"+j].appendChild(_ctx["infoDetailSlide"+j]);
			_ctx["liSlide"+j].appendChild(_ctx["infoSlide"+j]);
			// append
			_ctx.slideshowMiniature.appendChild(_ctx["liSlide"+j]);
		}
		// add special order src by current to improuve src loading
		// var orderedLoadingIndex = _getLoadingOrder();
		for (var i = 0; i < playListIndex.length; i++) {
			// var j = orderedLoadingIndex[i];
			_ctx["imageSlide"+i].src = _ctx.urls[playListIndex[i]].urlData;
		}
	};
	var _addEvent = function () {
		// onload & onerror
		_ctx.imagefull.style.marginLeft = -(_ctx.imagefull.width / 2) + "px";
		_ctx.imagefull.onload = function () {
			this.style.marginLeft = -(this.width / 2) + "px";
		};
		_ctx.imagefull.onerror = function () {};
		_ctx.imagefullTransition.style.marginLeft = -(_ctx.imagefullTransition.width / 2) + "px";
		_ctx.imagefullTransition.onload = function () {
			this.style.marginLeft = -(this.width / 2) + "px";
		};
		_ctx.imagefullTransition.onerror = function () {};
		//	add events
		for (var i = 0; i < playListIndex.length; i++) {
			var j = _ctx.orderedDomIndex[i];
			// onload & onerror
			_ctx["image"+j] = {"loaded":false,"error":false};
			_ctx["imageSlide"+j].name = j; // use of name to resolve j in function
			if (j == _ctx.current) {
				_ctx["imageSlide"+_ctx.current].onload = function () {
					_ctx["image"+this.name].loaded = true;
					_updateMiddleWidth();
				};
				_ctx["imageSlide"+_ctx.current].onerror = function () {
					_ctx["image"+this.name].error = true;
				};
			} else {
				_ctx["imageSlide"+j].onload = function () {
					_ctx["image"+this.name].loaded = true;
				};
				_ctx["imageSlide"+j].onerror = function () {
					_ctx["image"+this.name].error = true;
				};
			}
			// onclick
			if (_ctx.clickImage) {
				_ctx["imageSlide"+j].name = j; // use of name to resolve j in function
				_ctx["imageSlide"+j].style.cursor = "pointer";
				_ctx["imageSlide"+j].onclick = function () {
					_ctx.current = parseInt(this.name,10);
					_select();
					_updateMiddleWidth();
				};
			}
		}
	};
	var _updateText = function () {
		for (var i = 0; i < playListIndex.length; i++) {
			_ctx["infoDetailSlide"+i+"-title"].textContent =  _ctx.urls[playListIndex[i]].urlData.substring(_ctx.urls[playListIndex[i]].urlData.lastIndexOf("/")+1);
			_ctx["infoDetailSlide"+i+"-size"].textContent = "Size : "+(_ctx.urls[playListIndex[i]].size || "???");
			_ctx["infoDetailSlide"+i+"-resolution"].textContent = "Résolution : "+(_ctx.urls[playListIndex[i]].resolution || "???");
			_ctx["infoDetailSlide"+i+"-date"].textContent = "Date de création : "+(_ctx.urls[playListIndex[i]].date || "???");
		}
	};
	var _updateTextByIndex = function (i,j) {
		_ctx["infoDetailSlide"+i+"-title"].textContent =  _ctx.urls[j].urlData.substring(_ctx.urls[j].urlData.lastIndexOf("/")+1);
		_ctx["infoDetailSlide"+i+"-size"].textContent = "Size : "+(_ctx.urls[j].size || "???");
		_ctx["infoDetailSlide"+i+"-resolution"].textContent = "Résolution : "+(_ctx.urls[j].resolution || "???");
		_ctx["infoDetailSlide"+i+"-date"].textContent = "Date de création : "+(_ctx.urls[j].date || "???");
	};
	var _manageCoverflow = function () {
		if (_ctx.urls.length > nbPlayImage) {
			_ctx.coverflow = true;
			// only display nbPlayImage nodes
			if (_ctx.focus == "MIDDLE") {
				_ctx.indexStart = _ctx.current - nbPlayImage / 2;
				_ctx.indexEnd = _ctx.current + nbPlayImage / 2;
				_ctx.indexFocus = nbPlayImage / 2;
			} else if (_ctx.focus == "LEFT") {
				_ctx.indexStart = _ctx.current;
				_ctx.indexEnd = _ctx.current + nbPlayImage;
				_ctx.indexFocus = 0;
			} else {
				_ctx.indexStart = _ctx.current - nbPlayImage;
				_ctx.indexEnd = _ctx.current;
				_ctx.indexFocus = nbPlayImage - 1;
			}
		} else {
			_ctx.coverflow = false;
			_ctx.indexStart = 0;
			_ctx.indexEnd = _ctx.urls.length;
			if (_ctx.focus == "MIDDLE") {
				_ctx.indexFocus = _ctx.urls.length / 2;
			} else if (_ctx.focus == "LEFT") {
				_ctx.indexFocus = 0;
			} else {
				_ctx.indexFocus = _ctx.urls.length - 1;
			}
		}
		for (var i = _ctx.indexStart; i <= _ctx.indexEnd; i++) {
			var index = i < 0 ? i + _ctx.urls.length : i;
			playListIndex.push(index);
		}
		_ctx.indexStart = _ctx.indexStart < 0 ? _ctx.indexStart + _ctx.urls.length : _ctx.indexStart;
	};
	
	return {
		init : function (options) {
			options = options || {};
			_ctx.animated = options.animated || false;
			_ctx.displayControls = options.displayControls || false;
			_ctx.cyclic = options.cyclic || false;
			_ctx.focus = options.focus || "MIDDLE"; // LEFT, RIGHT
			_ctx.autoStop = options.autoStop || false;
			_ctx.clickImage = options.clickImage || false;
			_ctx.onEnd = options.onEnd || function () {};
			_ctx.onPlay = options.onPlay || function () {};
			_ctx.onPause = options.onPause || function () {};
			_ctx.onStop = options.onStop || function () {};
			_ctx.onNext = options.onNext || function () {};
			_ctx.onPrevious = options.onPrevious || function () {};
			_ctx.onReset = options.onReset || function () {};
			_ctx.onToggleBar = options.onToggleBar || function () {};
			_createNodes();
			_setTimeoutSlide(5);
			_resetProgressBar();
		},
		resize : function () {
			_updateInfoWidth();
			_updateMiddleWidth();
		},
		play : function (urls, first) {
			if (urls != null && urls.length > 0) {
				first = first < urls.length ? first : 0;
				_ctx.first = first;
				_ctx.current = first;
				_ctx.urls = urls;
				_manageCoverflow();
				_refreshItemNodes();
				_updateText();
				_updateMiddleWidth();
				_updateInfoWidth();
				_addEvent();
				if (_ctx.animated) _activeAnimated();
				_showSlideBar();
			}
			_play();
		},
		pause : function () {
			_pause();
		},
		stop : function () {
			_stop();
		},
		next : function () {
			_next(true);
		},
		previous : function () {
			_previous(true);
		},
		reset : function () {
			_reset();
		},
		togglePlayPause : function () {
			if (_getPlayStatus() == "PLAY") {
				_pause();
			} else if (_getPlayStatus() == "PAUSE" || _getPlayStatus() == "STOP") {
				_play();
			} 
		},
		showBar : function () {
			_showSlideBar();
		},
		hideBar : function () {
			_hideSlideBar();
		},
		isSlideBarShowed : function () {
			return isSlideBarShowed;
		},
		toggleBarDetailed : function () {
			if (isSlideBarShowed) {
				if (isSlideBarDetailedShowed) {
					_hideBarDetailed();
				} else {
					_showBarDetailed();
				}
			}
		},
		setTimeoutSlide : function (sec) {
			_setTimeoutSlide(sec);
			_play();
		},
		resetProgressBar : function () {
			_resetProgressBar();
		}
	};
})();
