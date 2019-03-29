import * as React from 'react';
import styled from '@emotion/styled';
import { format } from 'date-fns';

import BillableIcon from './BillableIcon.jsx';
import TagsIcon from './TagsIcon.jsx';
import { ProjectLargeDot } from '../@toggl/ui/icons/index';
import * as color from '../@toggl/style/lib/color';
import * as text from '../@toggl/style/lib/text';
import { secToDecimalHours } from '../@toggl/time-format-utils';
import play from './play.svg';

const NO_DESCRIPTION = '(no description)';

const getTimeEntryDayGroups = (timeEntries: Array<TimeEntry>): {[date: string]: Array<TimeEntry>} => {
  return [...timeEntries]
    .sort((a, b) => {
      // Most recent entries first.
      if (a.start > b.start) return -1;
      if (b.start > a.start) return 1;
      return 0;
    })
    .filter((timeEntry) => timeEntry.duration >= 0)
    .reduce((groups: { [date: string]: Array<TimeEntry> }, entry) => {
      const date = format(entry.start, 'YYYY-MM-DD');
      console.log(date);
      groups[date] = groups[date] || [];
      groups[date].push(entry);

      return groups;
    }, {})
};

type TimeEntriesListProps = {
  timeEntries: Array<TimeEntry>;
  projects: IdMap<Project>;
};
export default function TimeEntriesList (props: TimeEntriesListProps) {
  const { timeEntries = [], projects = {} } = props;
  const dayGroups = getTimeEntryDayGroups(timeEntries);
  // let renderedEntriesCount = 0;
  console.log(dayGroups);
  return (
    <EntryList>
      {Object.keys(dayGroups).map((date, i) => {
        const groupEntries = dayGroups[date];
        return [
          <EntryHeading key={`tegroup-${i}`}>{format(date, 'ddd, D MMM')}</EntryHeading>,
          ...groupEntries.map((timeEntry, i) => {
            const project = projects[timeEntry.pid] || null;
            return <TimeEntriesListItem key={`te-${i}`} timeEntry={timeEntry} project={project} dataId={i} />;
          })
        ]
      })}
    </EntryList>
  );
}

type TimeEntriesListItemProps = {
  timeEntry: TimeEntry;
  project: Project;
  dataId: number;
};
function TimeEntriesListItem ({ timeEntry, project, ...props }: TimeEntriesListItemProps) {
  const description = timeEntry.description || NO_DESCRIPTION;
  const isBillable = !!timeEntry.billable;
  const tags = (timeEntry.tags && timeEntry.tags.length > 0)
    ? timeEntry.tags.join(', ')
    : '';

  return (
    <EntryItem data-id={props.dataId}>
      <EntryItemRow>
        <TimeEntryDescription title={description}>{description}</TimeEntryDescription>
        <EntryIcons>
          <BillableIcon active={isBillable} />
          {tags && <TagsIcon title={tags} />}
          <TimeEntryDuration duration={timeEntry.duration} />
        </EntryIcons>
      </EntryItemRow>
      <EntryItemRow>
        <TimeEntryProject project={project} />
        <ContinueButton data-continue-id={timeEntry.id} title='Continue this entry' />
      </EntryItemRow>
    </EntryItem>
  );
}

function TimeEntryDuration ({ duration }: { duration: number }) {
  if (!duration || duration < 0) return null;
  return (
    <div>{secToDecimalHours(duration)}</div>
  );
}

const TimeEntryDescription = styled.div`
  flex: 1;

  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: text;
  line-height: normal;
  overflow: hidden;
  color: #222;
`;

function TimeEntryProject ({ project }: { project: Project }) {
  return (
    <div style={{ flex: 1 }}>
      {project &&
        <ProjectLargeDot color={project.hex_color}>
          <span>{project.name}</span>
        </ProjectLargeDot>
      }
    </div>
  );
}

const ContinueButton = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  background: url(${play}) no-repeat;
  background-position: 55% 50%;
  background-size: 14px;
  border: none;
  cursor: pointer;
  opacity: 0.5;

  &:hover {
    opacity: 1.0;
  }
`;

const EntryList = styled.ul`
  list-style: none;
  white-space: nowrap;
  padding: 0;
  margin: 0;

  background-color: ${color.white};
  font-family: Roboto, Helvetica, Arial, sans-serif;
`;
const itemPadding = '.5rem';
const itemShadow = 'rgb(232, 232, 232) 0px -1px 0px 0px inset';
const EntryItem = styled.li`
  display: flex;
  flex-direction: column;

  padding: ${itemPadding};
  height: 50px;

  color: ${color.grey};
  font-size: 14px;
  box-shadow: ${itemShadow};

  &:hover {
    background-color: ${color.listItemHover};
  }

  &:last-child {
    box-shadow: none;
  }

  & ~ EntryHeading {
    margin-top: 1rem;
  }
`;

const EntryHeading = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  padding: ${itemPadding};
  height: 25px;
  color: ${color.black};
  font-weight: ${text.bold};
  box-shadow: ${itemShadow};
`;

const EntryItemRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  flex: 1;
`;

const EntryIcons = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  > * {
    margin: 0 .25rem;
  }
`;
