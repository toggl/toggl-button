import * as React from 'react';
import styled from '@emotion/styled';
import { format, subSeconds } from 'date-fns';

import BillableIcon from './BillableIcon';
import TagsIcon from './TagsIcon';

import { ProjectLargeDot } from '../@toggl/ui/icons';
import { Button } from '../@toggl/ui/buttons';

import * as color from '../@toggl/style/lib/color';
import * as text from '../@toggl/style/lib/text';
import { borderRadius } from '../@toggl/style/lib/variables';
import { formatDuration } from '../@toggl/time-format-utils/format-duration';

import play from '../icons/play.svg';
import playGreen from '../icons/play-green.svg';

const NO_DESCRIPTION = '(no description)';
const NO_PROJECT = '(no project)';

const secondsToHhmmss = (seconds: number) => {
  return new Date(seconds * 1000).toISOString().substr(11, 8)
};

const getTimeEntryDayGroups = (timeEntries: Array<Array<Toggl.TimeEntry>>): {[date: string]: Array<Array<Toggl.TimeEntry>>} => {
  return [...timeEntries]
    .sort((a, b) => {
      // Most recent entries first.
      if (a[0].start > b[0].start) return -1;
      if (b[0].start > a[0].start) return 1;
      return 0;
    })
    .filter((timeEntries) => timeEntries.some((te) => te.duration >= 0))
    .reduce((groups: { [date: string]: Array<Array<Toggl.TimeEntry>> }, entries) => {
      const date = format(entries[0].start, 'YYYY-MM-DD');
      groups[date] = groups[date] || [];
      groups[date].push(entries);

      return groups;
    }, {})
};

const TimeEntriesFooter = () => (
  <Footer>
    <a target="_blank" href="https://toggl.com/app/timer?utm_source=toggl-button&utm_medium=referral">
      <Button>
        See more on <strong>toggl.com</strong>
      </Button>
    </a>
  </Footer>);

interface TimeEntriesListProps {
  timeEntries: Toggl.TimeEntry[][];
  projects: IdMap<Toggl.Project>;
};
export default function TimeEntriesList (props: TimeEntriesListProps) {
  const { timeEntries = [], projects = {} } = props;

  if (timeEntries.length === 0) {
    return (
      <Container>
        <div />
        <NoEntries>
          <img src="../../images/stopwatch.png" width="177px" height="179px" />
          <Description>
            Get ready to track time and boost your productivity!
          </Description>
        </NoEntries>
        <TimeEntriesFooter/>
      </Container>);
  }

  const dayGroups = getTimeEntryDayGroups(timeEntries);
  const sumDuration = entries => {
    const total = entries.flat().reduce((sum, {duration}) => sum + duration, 0);
    return total;
  }

  return (
    <Container>
      <EntryList>
        {Object.entries(dayGroups).map(([date, groupEntries], idx) => {
          return (
            <EntryDayGroup key={idx}>
              <EntryHeading key={`tegroup-${idx}`}>
                <span>
                {format(date, 'ddd, D MMM')}</span>
                <span>
                {secondsToHhmmss(sumDuration(groupEntries))}</span>
              </EntryHeading>
              {groupEntries.map((timeEntries, i) => {
                const project = timeEntries[0].pid && projects[timeEntries[0].pid] || null;
                return <TimeEntriesListItem key={`te-${idx}-${i}`} timeEntries={timeEntries} project={project} />;
              })}
            </EntryDayGroup>
          );
        })}
      </EntryList>
      <TimeEntriesFooter/>
    </Container>
  );
}

type TimeEntriesListItemProps = {
  timeEntries: Array<Toggl.TimeEntry>;
  project: Toggl.Project | null;
};
function TimeEntriesListItem ({ timeEntries, project }: TimeEntriesListItemProps) {
  const [isGroupCollapsed, setGroupCollapsed] = React.useState(true)
  const timeEntry = timeEntries[0];

  const totalDuration = timeEntries.reduce((sum, entry) => {
    if (entry.duration > 0) sum += entry.duration;
    return sum;
  }, 0);
  const entriesCount = timeEntries.length;
  const earliestStartTime = format(timeEntries[timeEntries.length - 1].start, 'HH:mm');
  const isGrouped = entriesCount > 1 && isGroupCollapsed;
  const toggleGrouping = React.useCallback(
    () => setGroupCollapsed(val => !val),
    [setGroupCollapsed]
  );

  const content = [
    entriesCount > 1 && (
      <TimeEntryRow
        renderHeader
        key={`grouped-${timeEntry.id}`}
        timeEntry={timeEntry}
        onRowClick={toggleGrouping}
        project={project}
        entriesCount={entriesCount}
        earliestStartTime={earliestStartTime}
        totalDuration={totalDuration}
      />
    )
  ].concat(
    (!isGrouped ? timeEntries : []).map(timeEntry => (
      <TimeEntryRow
        renderHeader={false}
        key={timeEntry.id}
        timeEntry={timeEntry}
        onRowClick={editEntry(timeEntry)}
        project={project}
        indent={entriesCount > 1}
      />
    ))
  );

  return (
    <React.Fragment>
      {content}
    </React.Fragment>
  );
}

function TimeEntryRow ({
  timeEntry,
  onRowClick,
  project,
  renderHeader,
  entriesCount,
  earliestStartTime,
  totalDuration,
  indent
}: {
  timeEntry: Toggl.TimeEntry,
  onRowClick: (event: React.MouseEvent) => void,
  project: Toggl.Project | null,
  renderHeader: boolean,
  entriesCount?: number,
  earliestStartTime?: string,
  totalDuration?: number,
  indent?: boolean
}) {

  const description = timeEntry.description;
  const isBillable = !!timeEntry.billable;
  const tags = (timeEntry.tags && timeEntry.tags.length > 0)
    ? timeEntry.tags.join(', ')
    : '';

  return (
    <EntryItem onClick={onRowClick} indent={indent}>
      {renderHeader && entriesCount && earliestStartTime &&
        <GroupedEntryIcon>
          <GroupedEntryCounter title={`${entriesCount} entries since ${earliestStartTime}`}>{entriesCount}</GroupedEntryCounter>
        </GroupedEntryIcon>
      }
      <EntryItemText>
        <TimeEntryDescription title={description && description}>
          {description ? description : <Placeholder>{NO_DESCRIPTION}</Placeholder>}
        </TimeEntryDescription>
        <TimeEntryProject project={project} />
      </EntryItemText>
      <EntryItemActions>
        <TimeEntryDuration duration={totalDuration || timeEntry.duration} />
        <EntryIcons className="entry-icons">
          <BillableIcon active={isBillable} />
          {tags && <TagsIcon title={tags} />}
          <ContinueButton data-continue-id={timeEntry.id} title='Continue this entry' />
        </EntryIcons>
      </EntryItemActions>
    </EntryItem>
  )
}

const editEntry = (timeEntry: Toggl.TimeEntry) => (e: React.MouseEvent) => {
  e.preventDefault();
  window.PopUp.renderEditForm(timeEntry);
};

const GroupedEntryIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
`;

const GroupedEntryCounter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex-shrink: 0;

  border-radius: ${borderRadius};

  cursor: pointer;
  transition: background ease-in 0.05s, color ease-in 0.05s;

  border: 1px solid ${color.extraLightGrey};
  background-color: ${color.white};
  color: ${color.grey};

  /* Changes from webapp */
  width: 24px;
  height: 24px;
  font-size: 14px;
`;

function TimeEntryDuration ({ duration }: { duration: number }) {
  if (!duration || duration < 0) return null;
  const since = subSeconds(Date.now(),  duration).toUTCString();
  return (
    <div>{formatDuration(since)}</div>
  );
}

export const TimeEntryDescription = styled.div`
  flex: 1;

  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  color: #222;
`;

export function TimeEntryProject ({ project }: { project: Toggl.Project | null }) {
  return (
    <div style={{ overflow: 'hidden' }}>
      {project ?
        <ProjectLargeDot color={project.hex_color}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {project.name}
          </span>
        </ProjectLargeDot>
        : <Placeholder>{NO_PROJECT}</Placeholder>
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

  &:hover {
    background: url(${playGreen}) no-repeat;
    background-position: 55% 50%;
    background-size: 14px;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 410px;
`;

const NoEntries = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const Description = styled.p`
  color: #a3a3a3;
  margin-top: 25px;
  font-size: 14px;
`;

const Placeholder = styled.span`
  color: ${color.greyish};
`;

const EntryList = styled.div`
  padding: 0 15px;
  margin: 0;
`;

const EntryDayGroup = styled.div`
  margin-top: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.1) 1px 1px 3px 0px;

  &:first-of-type {
    margin-top: 0;
  }
`;

const EntryItem = styled.li`
  box-sizing: border-box;
  display: flex;
  align-items: stretch;
  padding: 10px 15px;
  ${({ indent }: { indent?: boolean }) => indent ? 'padding-left: 53px;' : ''}

  font-size: 14px;
  border-bottom: 1px solid ${color.listItemHover};
  cursor: pointer;

  &:hover {
    background-color: ${color.listItemHover};
  }

  .entry-icons {
    opacity: 0.2;
  }

  &:hover .entry-icons {
    opacity: 1;
  }
`;

const EntryHeading = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  padding: 15px;
  height: 25px;
  color: ${color.black};
  font-weight: ${text.bold};
`;

const EntryItemText = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1 1 auto;
  padding-right: 10px;
  overflow: hidden;

  > * {
    display: flex;
    align-items: center;
    height: 25px;
  }
`;

const EntryItemActions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  > * {
    height: 22px;
  }
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

const Footer = styled(EntryHeading)`
  justify-content: center;
  padding: 30px 0;
`;
