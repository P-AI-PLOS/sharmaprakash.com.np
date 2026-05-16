---
title: "How I made chitika ads responsive"
date: "2014-03-12T20:07:01+05:45"
category: ["Javascript"]
cover: "/images/blog/generated/covers/2014-03-12-how-i-made-chitika-ads-responsive.png"
thumb: "/images/blog/generated/thumbs/2014-03-12-how-i-made-chitika-ads-responsive.png"
categories:
  - javascript
directory:  javascript
excerpt: Chitika has not officially approved responsive design yet but we can tweak it's script safely to serve responsive ads on our site.
tags:
  - javascript
  - chitika
comments: true
share: true
# date: 2014-03-12T20:07:01+05:45
last_modified_at: "2017-06-10T20:07:01+05:45"
use_featured_image: true
---

Yesterday I implemented <a rel="nofollow" target="_blank" href="http://www.chitika.com/publishers/apply?refid=prakash_arsenal">chitika</a> in my blog only to realise that it does not serve responsive ads yet. Horizontal scrollbar in the mobile view was ugly thing I wanted to fix.

Luckily this is a problem that can be solved by slightly modifiying the chitika's original script.

Their default code looks like this:

```html
<script type="text/javascript">
  ( function() {
    if (window.CHITIKA === undefined) { window.CHITIKA = { 'units' : [] }; };
    var unit = {"calltype":"async[2]","publisher":"XXXXXX","width":300,"height":250,"sid":"Chitika Default"};
    var placement_id = window.CHITIKA.units.length;
    window.CHITIKA.units.push(unit);
    document.write('<div id="chitikaAdBlock-' + placement_id + '"></div>');
}());
</script>
<script type="text/javascript" src="//cdn.chitika.net/getads.js" async></script>
```

Main reason this script is not responsive is it has width and height fixed. We can serve responsive ads by changing this width and height according to screen width.

Hence I modified the js code as below:

```html
  <div id="chitika-ads-1"></div>
  <script type="text/javascript">
    // change this username to your's
    var chitikaPublisherName = "xxx";

    var setAdUnitDimensions = function (unit, width, height) {
      unit.width = width;
      unit.height = height
    };

    /* Calculate the width of available ad space */
    ad = document.getElementById('chitika-ads-1');
    if (ad.getBoundingClientRect().width) {
      adWidth = ad.getBoundingClientRect().width; // for modern browsers
    } else {
      adWidth = ad.offsetWidth; // for old IE
    }
    ( function() {

      var unit = {
        "calltype":"async[2]",
        "publisher": chitikaPublisherName,
        "sid": "Chitika Default"
      };

      if (window.CHITIKA === undefined) { window.CHITIKA = { 'units' : [] }; };
      if ( adWidth >= 728 )
        setAdUnitDimensions(unit, 728, 90);
      else if ( adWidth >= 468 )
        setAdUnitDimensions(unit, 550, 250);
      else if ( adWidth >= 336 )
        setAdUnitDimensions(unit, 336, 280);
      else if ( adWidth >= 300 )
        setAdUnitDimensions(unit, 300, 250);
      else if ( adWidth >= 250 )
        setAdUnitDimensions(unit, 250, 250);
      else if ( adWidth >= 200 )
        setAdUnitDimensions(unit, 200, 200);
      else if ( adWidth >= 180 )
        setAdUnitDimensions(unit, 180, 150);
      else
        setAdUnitDimensions(unit, 125, 125);
      var placement_id = window.CHITIKA.units.length;
      window.CHITIKA.units.push(unit);
      document.write('<div id="chitikaAdBlock-' + placement_id + '"></div>');
    }());
  </script>
```

This simple snippet will work for you too when you change `chitikaPublisherName` with your own chitika publisher name.

This solution is not elegant yet. You will have to copy and paste this snippet on every place you want to show ad and also increase div's id(code in top of snippet) such that they become like  chitika-ads-1, chitika-ads-2 and so on.

To solve this problem I changed the above script as below:

```html
<script type="text/javascript">
  var chitikaPublisherName = "xxx";

  var $chitikaAdHolders = document.getElementsByClassName('chitika-ads-container');
  var chitikaAdholdersCount = $chitikaAdHolders.length;

  var setAdUnitDimensions = function (unit, width, height) {
    unit.width = width;
    unit.height = height;
  };

  var insertChitikaAd = function ($holder) {
    var adWidth = 0;
    if ($holder.getBoundingClientRect().width) {
      adWidth = $holder.getBoundingClientRect().width; // for modern browsers
    } else {
      adWidth = $holder.offsetWidth; // for old IE
    }

    var unit = {
      "calltype":"async[2]",
      "publisher": chitikaPublisherName,
      "sid": "Chitika Default"
    };
    if (window.CHITIKA === undefined) { window.CHITIKA = { 'units' : [] }; };
    if ( adWidth >= 728 )
      setAdUnitDimensions(unit, 728, 90);
    else if ( adWidth >= 468 )
      setAdUnitDimensions(unit, 550, 250);
    else if ( adWidth >= 336 )
      setAdUnitDimensions(unit, 336, 280);
    else if ( adWidth >= 300 )
      setAdUnitDimensions(unit, 300, 250);
    else if ( adWidth >= 250 )
      setAdUnitDimensions(unit, 250, 250);
    else if ( adWidth >= 200 )
      setAdUnitDimensions(unit, 200, 200);
    else if ( adWidth >= 180 )
      setAdUnitDimensions(unit, 180, 150);
    else
      setAdUnitDimensions(unit, 125, 125);
    var placement_id = window.CHITIKA.units.length;
    window.CHITIKA.units.push(unit);
    $holder.innerHTML = '<div id="chitikaAdBlock-' + placement_id + '"></div>';
  };

  for(var i=0; i<chitikaAdholdersCount; i++){
    insertChitikaAd($chitikaAdHolders[i]);
  }
</script>
<script type="text/javascript" src="//cdn.chitika.net/getads.js" async></script>
```

After adding above script once in your page you can just add `<div class="chitika-ads-container"></div>` on any place you want to display ads.

In case you like this script but want to fix ad's width of any particular ad; you can wrap `<div class="chitika-ads-container"></div>` with fixed width `div`. For eg: `<div style="width: 300px;"><div class="chitika-ads-container"></div></div>`

I am planning to develop this into a js plugin so that I can keep it updated anytime something changes. Please let me know your view. Did you find this useful?

References:

1. <a href="http://www.freshknowledgecenter.com/2014/03/how-to-use-chitika-ads-on-responsive.html" rel="nofollow" target="_blank">http://www.freshknowledgecenter.com/2014/03/how-to-use-chitika-ads-on-responsive.html</a>