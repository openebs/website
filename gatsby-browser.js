/* eslint-disable */
/**
 * Trust All Scripts
 *
 * This is a dirty little script for iterating over script tags
 * of your Ghost posts and adding them to the document head.
 *
 * This works for any script that then injects content into the page
 * via ids/classnames etc.
 *
 */

require('slick-carousel/slick/slick.css')
require('slick-carousel/slick/slick-theme.css')
require('typeface-lato')
require('./src/assets/fonts/fonts.css')
require('./src/styles/custom.css')

var trustAllScripts = function() {
  var scriptNodes = document.querySelectorAll('.load-external-scripts script')

  for (var i = 0; i < scriptNodes.length; i += 1) {
    var node = scriptNodes[i]
    var s = document.createElement('script')
    s.type = node.type || 'text/javascript'

    if (node.attributes.src) {
      s.src = node.attributes.src.value
    } else {
      s.innerHTML = node.innerHTML
    }

    document.getElementsByTagName('head')[0].appendChild(s)
  }
}

exports.onRouteUpdate = function() {
  trustAllScripts()
}
