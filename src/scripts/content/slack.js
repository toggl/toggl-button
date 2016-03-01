/*jslint indent: 2 */
/*global $: false, document: false, togglbutton: false, createTag:false*/
'use strict';

togglbutton.render('.name:not(.toggl)', {observe: true}, function (elem) {
  var link,
    container = createTag('id', '#toggl_button_link'),
    placeholder = $('#channel_actions'),
    description = $('.name').innerText,
    project = $('#team_name').innerText;

  link = togglbutton.createTimerLink({
    className: 'slack',
    description: description,
    projectName: project
  });

  container.appendChild(link);
  placeholder.parentNode.insertBefore(container, placeholder);
});