import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Timeline from '@material-ui/lab/Timeline';
import TimelineItem from '@material-ui/lab/TimelineItem';
import TimelineSeparator from '@material-ui/lab/TimelineSeparator';
import TimelineConnector from '@material-ui/lab/TimelineConnector';
import TimelineContent from '@material-ui/lab/TimelineContent';
import TimelineOppositeContent from '@material-ui/lab/TimelineOppositeContent';
import TimelineDot from '@material-ui/lab/TimelineDot';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { Incident, IncidentTimelineEntry } from '../../types';
import { opsgenieApiRef } from '../../api';
import { useApi } from '@backstage/core-plugin-api';
import { Progress } from '@backstage/core-components';
import { Alert } from '@material-ui/lab';
import { useAsync } from 'react-use';
import { NiceDate } from '../UI/NiceDate';
import NewReleasesIcon from '@material-ui/icons/NewReleases';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import UserAddIcon from '@material-ui/icons/PersonAdd';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import PhoneIcon from '@material-ui/icons/Phone';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: '6px 16px',
  },
  secondaryTail: {
    backgroundColor: theme.palette.secondary.main,
  },
}));

const getIcon = (type: string) => {
  switch(type){
    case "IncidentPriorityChanged":
      return <NewReleasesIcon />;
    case "ResponderAlertPriorityChanged":
      return <NewReleasesIcon />;
    case "ResponderAlertAcked":
      return <PhoneIcon />;
    case "IncidentResponderTeamAdded":
      return <GroupAddIcon />;
    case "IncidentResponderUserAdded":
      return <UserAddIcon />;
    case "IncidentOpened":
      return <AddCircleIcon />;
  }

  return 
}

export const IncidentTimeline = ({ incident }: { incident: Incident }) => {

  const classes = useStyles();
  const opsgenieApi = useApi(opsgenieApiRef);


  const { value, loading, error } = useAsync(async () => await opsgenieApi.getIncidentTimeline(incident));

  if (loading) {
      return <Progress />;
  } else if (error) {
      return (
          <Alert data-testid="error-message" severity="error">
              {error.message}
          </Alert>
      );
  }

  console.log(value)

  let entries = []
  for (const entry of value as IncidentTimelineEntry[]) {
    entries.push(
      <TimelineItem>
        <TimelineOppositeContent>
          <Typography variant="body2" color="textSecondary">
            <NiceDate datetime={entry.eventTime} />
          </Typography>
        </TimelineOppositeContent>
        <TimelineSeparator>
          <TimelineDot>
            { getIcon(entry.type) }
          </TimelineDot>
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <Paper elevation={3} className={classes.paper}>
            <Typography variant="h6" component="h1">
              { entry.title.content }
            </Typography>
            <Typography></Typography>
          </Paper>
        </TimelineContent>
      </TimelineItem>
    )
  }

  return (
    <Timeline align="alternate">
      { entries }
    </Timeline>
  );
}