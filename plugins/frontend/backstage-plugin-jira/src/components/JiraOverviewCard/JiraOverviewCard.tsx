import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Grid,
  Typography,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { Progress } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useProjectInfo } from '../../hooks';
import { Status } from './components/Status';
import { Selectors } from './components/Selectors';
import { CustomInfoCard } from '../CustomInfoCard/CustomInfoCard';

const JIRA_PROJECT_KEY_ANNOTATION = 'jira/project-key';
const JIRA_COMPONENT_ANNOTATION = 'jira/component';
const JIRA_LABEL_ANNOTATION = 'jira/label';

type ProjectDetailsProps = {
  name: string;
  type: string;
  iconUrl: string;
  url: string;
};

type IssueType = {
  name: string;
  iconUrl: string;
  total: number;
};

type JiraCardOptionalProps = {
  hideIssueFilter?: boolean;
};

const CardProjectDetails = ({
  project,
  component,
}: {
  project: ProjectDetailsProps;
  component: string;
}) => (
  <Box display="inline-flex" alignItems="center">
    <Avatar alt="" src={project.iconUrl} />
    <Box ml={1}>
      {project.name} | {project.type}
      {component ? <Box>component: {component}</Box> : null}
    </Box>
  </Box>
);

const IssueTypesGrid = ({ issues }: { issues: IssueType[] | undefined }) => {
  const displayIssues = issues?.filter(issue => issue.total > 0);
  
  return (
    <Grid container spacing={3}>
      {(displayIssues ?? []).map(issueType => (
        <Grid item xs key={issueType.name}>
          <Box
            sx={{
              width: 100,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Status name={issueType.name} iconUrl={issueType.iconUrl} />
            <Typography variant="h4">{issueType.total}</Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};


export const JiraOverviewCard = ({ hideIssueFilter }: JiraCardOptionalProps) => {
  const { entity } = useEntity();
  const [statusesNames, setStatusesNames] = useState<Array<string>>([]);
  
  const projectKey = entity.metadata?.annotations?.[JIRA_PROJECT_KEY_ANNOTATION];
  const component = entity.metadata?.annotations?.[JIRA_COMPONENT_ANNOTATION];
  const label = entity.metadata?.annotations?.[JIRA_LABEL_ANNOTATION];

  const {
    project,
    issues,
    projectLoading,
    projectError,
    fetchProjectInfo,
  } = useProjectInfo(projectKey, component, label, statusesNames);

  if (!projectKey) {
    return (
      <CustomInfoCard title="Jira">
        <Alert severity="error">
          Missing Jira project key annotation: {JIRA_PROJECT_KEY_ANNOTATION}
        </Alert>
      </CustomInfoCard>
    );
  }

  return (
    <CustomInfoCard
      title="Jira"
      subheader={
        project && (
          <Box>
            <CardProjectDetails project={project} component={component ?? ''} />
          </Box>
        )
      }
      dataSources={project ? [{ source: `${project.url}/browse/${projectKey}`, name: 'JIRA' }] : []}
    >
      {projectLoading && !(project && issues) ? <Progress /> : null}
      {projectError ? (
        <Alert severity="error">
          {projectError.message}
        </Alert>
      ) : null}
      {project && issues ? (
        <Box sx={{ 
          flexGrow: 1, 
          fontSize: '0.75rem',
          position: 'relative',
          minHeight: '200px',
        }}>
          {!hideIssueFilter && (
            <Selectors
              projectKey={projectKey}
              statusesNames={statusesNames}
              setStatusesNames={setStatusesNames}
              fetchProjectInfo={fetchProjectInfo}
            />
          )}
          <IssueTypesGrid issues={issues} />
        </Box>
      ) : null}
    </CustomInfoCard>
  );
};
