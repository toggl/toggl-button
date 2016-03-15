/*jslint indent: 2 */
/*global $: false, document: false, togglbutton: false, createTag:false*/

'use strict';

var includeTeamworkLinks = false;
chrome.runtime.sendMessage({getTogglSetting: "teamworkLinksEnabled"}, function(response) {
  includeTeamworkLinks = response.value;
});

// Tasks listing page in project
togglbutton.render('div.taskRHS:not(.toggl)', {observe: true}, function (elem) {
  var link, spanTag, projectName, desc,
    className = 'huh',
    container = $('.taskIcons', elem);

  if (container === null) {
    return;
  }

  if ($('.taskName', elem) === null) {
    return;
  }

  if ($("#projectName")) {
    projectName = $("#projectName").innerHTML;
  }

  var taskName = $('.taskName', elem);
  desc = taskName.textContent;

  //var taskId = /taskRHS(\d+)/.exec(elem.id)[1];

  var taskLink = taskName.parentNode.href;

  link = togglbutton.createTimerLink({
    className: 'teamworkpm',
    description: desc + (includeTeamworkLinks ? " (" + taskLink + ")" : ""),
    projectName: projectName
  });

  link.classList.add(className);
  link.addEventListener('click', function () {

    // Run through and hide all others
    var i, len, elems = document.querySelectorAll(".toggl-button");
    for (i = 0, len = elems.length; i < len; i += 1) {
      elems[i].classList.add('huh');
    }

    if (link.classList.contains(className)) {
      link.classList.remove(className);
    } else {
      link.classList.add(className);
    }
  });

  spanTag = document.createElement("span");
  spanTag.classList.add("toggl-span");
  link.style.width = 'auto';
  link.style.paddingLeft = '20px';
  link.setAttribute("title", "Toggl Timer");
  spanTag.appendChild(link);
  container.insertBefore(spanTag, container.lastChild);
});

// Tasks View Page
togglbutton.render('div#Task div.titleHolder ul.options:not(.toggl)', {observe: true}, function (elem) {
  var link, liTag, titleEl, projectName, desc;
  liTag = document.createElement("li");
  liTag.classList.add("toggl-li");

  titleEl = document.getElementById("Task");
  desc = titleEl.getAttribute("data-taskname");

  if ($("#projectName")) {
    projectName = $("#projectName").innerHTML;
  }

  link = togglbutton.createTimerLink({
    className: 'teamworkpm',
    description: desc + (includeTeamworkLinks ? ' (' + window.location.href + ')' : ''),
    projectName: projectName
  });

  link.classList.add("btn");
  link.classList.add("btn-default");
  link.setAttribute("title", "Toggl Timer");
  liTag.appendChild(link);
  elem.insertBefore(liTag, elem.firstChild);

});

// Ticket View Page
togglbutton.render('.sections--header ul.rightTicketOptions:not(.toggl)', {observe: true}, function (elem) {
  var link, liTag, titleEl, desc;
  liTag = document.createElement("li");
  liTag.classList.add("toggl-li");
  titleEl = $("#inboxBody .title-label");
  var ticketLink = window.location.href;

  //watch for the title to change (to a real value) before initializing the timer button
  var observer = new MutationObserver(function(mutations, observer) {
    // fired when a title change occurs
    desc = titleEl.textContent.trim();

    link = togglbutton.createTimerLink({
      className: 'teamworkpm',
      description: desc + (includeTeamworkLinks ? " (" + ticketLink + ")" : ""),
      projectName: ''
    });

    //at the moment, teamwork desk btn styles override the background image. Just using margin-top instead
    //link.classList.add("btn");
    //link.classList.add("btn-default");
    link.style.marginTop = '5px';
    link.setAttribute("title", "Toggl Timer");
    liTag.appendChild(link);
    elem.insertBefore(liTag, elem.firstChild);

    //we only want to fire this once, so now, let's disconnect from the observer
    observer.disconnect();
  });

  // Watch for any changes to the title element
  observer.observe(titleEl, { attributes: true, childList: true, characterData: true, subTree: true });
});
