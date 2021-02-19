'use strict';

// Selectors here are madness, it works for as of Dec 4th 2019
// Button renders in popup/dialog view
togglbutton.render(
  '.notion-peek-renderer:not(.toggl)',
  { observe: true },
  function (elem) {
    function getDescription () {
      const descriptionElem = $('.notion-scroller .notion-selectable div[contenteditable="true"]', elem);
      return descriptionElem ? descriptionElem.textContent.trim() : '';
    }

    const link = togglbutton.createTimerLink({
      className: 'notion',
      description: getDescription
    });

    const wrapper = document.createElement('div');
    wrapper.classList.add('toggl-button-notion-wrapper');
    wrapper.appendChild(link);

    const root = $('div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(3)', elem);
    if (root) {
      root.prepend(wrapper);
    }
  }
);

// Button renders left of page title - hidden on popups with css
togglbutton.render(
  '.notion-page-controls + div:not(.toggl)',
  { observe: true },
  function (elem) {
    elem.style.position = 'relative';

    function getDescription () {
      const descriptionElem = elem ? $('div[data-root="true"]', elem) : '';

      return descriptionElem ? descriptionElem.textContent.trim() : '';
    }

    const link = togglbutton.createTimerLink({
      className: 'notion',
      buttonType: 'minimal',
      description: getDescription
    });

    elem.prepend(link);
  }
);
