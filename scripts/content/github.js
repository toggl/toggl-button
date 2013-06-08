/*jslint indent: 2 */
/*global window: false, document: false, chrome: false, $: false, createTag: false, createLink: false*/
"use strict";

(function () {

  function createTimerLink(task, moreClass) {
    var link = createLink('toggl-button github '+moreClass);
    link.addEventListener("click", function (e) {
      chrome.extension.sendMessage({
        type: 'timeEntry',
        description: task
      });
      link.innerHTML = "Started...";
    });
    return link;
  }

  function addLinkToDiscussion() {
    var titleElem = $('.discussion-topic-title');
    if (titleElem === null) return;
    
    var numElem = $('.pull-head .pull-number > a, .issue-head .number > strong');
    var title = titleElem.innerHTML;
    if (numElem !== null) title = numElem.innerHTML + " " + title;

    var wrap = createTag('div', 'toggl infobar-widget');
    wrap.appendChild(createTimerLink(title, 'button minibutton'));
    $(".discusion-topic-infobar").appendChild(wrap);
  }

  chrome.extension.sendMessage({type: 'activate'}, function (response) {
    if (response.success) {
      addLinkToDiscussion();
    }
  });

}());
