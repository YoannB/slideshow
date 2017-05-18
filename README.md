# slideshow

> Developped for middleware box and display on TV 720p.


Technologie
---

* use of coverflow (only needed image tag is in dom)
* ordering dom loading
* cursor with css transition

Keys navigation 
---

* enter : toggleBarDetailed
* P : togglePlayPause
* R : reset
* RIGHT : next
* LEFT : previous
* UP : showBar
* DOWN : hideBar

Use
---

Initialisation : 

```
var list = [
	{urlData:"images/Collines.jpg",date:"06/01/2013",resolution:"800x600px"},
	// ...
];

slideShow.init({
	"animated":true,
	"displayControls":true,
	"cyclic":true,
	"autoStop":true,
	"clickImage":false,
	"onEnd":function () {
		// slideShow.play(list,0);
		console.debug("end");
	}
});

slideShow.play(list,0);
```

Connect events keyboard :

```
document.onkeydown = function (e) {
	switch (e.keyCode) {
		case 13 : // enter
			slideShow.toggleBarDetailed();
			break;
		case 80 : case 415 : // P
			slideShow.togglePlayPause();
			break;
		case 82 : // R
			slideShow.reset();
			break;
		case 39 : case 417 : // RIGHT
			slideShow.next();
			break;
		case 37 : case 412 : // LEFT
			slideShow.previous();
			break;
		case 38 : // UP
			slideShow.showBar();
			break;
		case 40 : // DOWN
			slideShow.hideBar();
			break;
		default : 
			break;
	};
};
```

Resize event :

```
window.onresize = function () {
	slideShow.resize();
};
```

Change timeout of slide :

```
slideShow.setTimeoutSlide(1); // in sec
```

