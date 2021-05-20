'use strict';

togglbutton.render('.pane_header:not(.toggl)', { observe: true }, function (
  elem
) {
  let description;
  const projectName = $('title').textContent;

  const titleFunc = function () {
    const titleElem = $('.editable .ember-view input', elem);
    const ticketNum = location.href.match(/tickets\/(\d+)/);

    if (titleElem !== null) {
      description = titleElem.value.trim();
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

const getDescription = () => {
  const ticketNum = location.href.match(/tickets\/(\d+)/);

  if (!ticketNum) return null;
  const id = ticketNum[1].trim();
  const titleElem = document.querySelector(`[data-side-conversations-anchor-id="${id}"] input[aria-label="Subject"]`);
  if (!titleElem) return null;

  return '#' + id + ' ' + titleElem.value.trim();
};

togglbutton.render('[data-test-id="customer-context-tab-navigation"]', { observe: true }, function (
  elem
) {
  // Manual check for existence in this SPA.
  if (elem.querySelector('.toggl-button')) return;
  // If we can't get the description on this pass, let's skip and wait for the next one
  if (!getDescription()) return;

  const link = togglbutton.createTimerLink({
    className: 'zendesk-agent-ws',
    description: getDescription
  });

  elem.prepend(link);
});
