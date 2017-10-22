/*jslint indent: 2, unparam: true*/
/*global $: false, document: false, togglbutton: false*/

'use strict';
togglbutton.render('#dokuwiki__content', {observe: false}, function (elem) {
  var link, description,
    numElem = $(".pageId span"),
    pName = numElem.textContent.split(":")[0].trim(),
    target = $(".wrapper.group") || // DokuWiki Template
    $(".pageId");                   // Bootstrap3 Template

  description = numElem.textContent.split(" ").pop().trim();
  link = togglbutton.createTimerLink({
    className: 'wiki',
    description: description,
    projectName: pName
  });

  target.prepend(link);
});
