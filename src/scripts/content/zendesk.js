'use strict';

togglbutton.render('.pane_header:not(.toggl)', { observe: true }, function (
  elem
) {
  let description;
  const projectName = $('title').textContent;

  const titleFunc = function () {
    const titleElem = $('.selected .tab_text .title');
    const ticketNum = location.href.match(/tickets\/(\d+)/);

    if (titleElem !== null) {
      description = titleElem.textContent.trim();
    }

    if (ticketNum) {
      description = '#' + ticketNum[1].trim() + ' ' + description;
    }
    return description;
  };

  const link = togglbutton.createTimerLink({
    className: 'zendesk',
    description: titleFunc,
    projectName: projectName && projectName.split(' - ').shift()
  });

  // Check for strange duplicate buttons. Don't know why this happens in Zendesk.
  if (elem.querySelector('.toggl-button')) {
    elem.removeChild(elem.querySelector('.toggl-button'));
  }

  elem.insertBefore(link, elem.querySelector('.btn-group'));
});
