'use strict';

togglbutton.render('._nav:not(.toggl)', { observe: true }, function () {
  const getDescription = function () {
    return document.title;
  };

  const link = togglbutton.createTimerLink({
    className: 'devdocs',
    description: getDescription
  });

  const nav = $('nav._nav');

  if (nav) {
    link.classList.add('_nav-link');
    link.style.marginTop = '0.8rem';
    nav.insertBefore(link, nav.firstChild);
  }
});
