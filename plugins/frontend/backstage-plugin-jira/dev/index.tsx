/*
 * Copyright 2021 Larder Software Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { jiraPlugin } from '../src/plugin';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { TestApiProvider } from '@backstage/test-utils';
import { JiraOverviewCard } from '../src/components/JiraOverviewCard';
import { jiraApiRef } from '../src/api';
import { Grid, Typography, Box } from '@material-ui/core';
import { CustomInfoCard } from '../src/components/CustomInfoCard/CustomInfoCard';

// Mock entity with Jira project info
const mockEntity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'mock-component',
    annotations: {
      'jira/project-key': 'TEST',
    },
  },
  spec: {
    type: 'service',
    lifecycle: 'production',
    owner: 'team-a',
  },
};

// Mock Jira API implementation
const mockJiraApi = {
  getProjectDetails: async () => ({
    project: {
      name: 'Test Project',
      iconUrl: 'https://jira.atlassian.com/images/icons/issuetypes/story.svg',
      type: 'software',
      url: 'https://jira.atlassian.com',
    },
    issues: [
      {
        name: 'Story',
        iconUrl: 'https://jira.atlassian.com/images/icons/issuetypes/story.svg',
        total: 8,
      },
      {
        name: 'Epic',
        iconUrl: 'https://jira.atlassian.com/images/icons/issuetypes/epic.svg',
        total: 3,
      },
      {
        name: 'Work Intake',
        iconUrl: 'https://jira.atlassian.com/images/icons/issuetypes/task.svg',
        total: 5,
      },
    ],
    ticketIds: ['TEST-1', 'TEST-2', 'TEST-3'],
    tickets: [],
  }),
  getProjectStatuses: async () => [
    'To Do',
    'In Progress',
    'In Review',
    'Done',
  ],
  getIssues: async () => ({
    total: 16,
    issues: [
      {
        name: 'Story',
        iconUrl: 'https://jira.atlassian.com/images/icons/issuetypes/story.svg',
        total: 8,
        issues: [
          {
            key: 'TEST-1',
            summary: 'Implement new feature',
            status: 'In Progress',
          },
        ],
      },
      {
        name: 'Epic',
        iconUrl: 'https://jira.atlassian.com/images/icons/issuetypes/epic.svg',
        total: 3,
        issues: [
          {
            key: 'TEST-2',
            summary: 'Q1 Platform Improvements',
            status: 'In Progress',
          },
        ],
      },
      {
        name: 'Work Intake',
        iconUrl: 'https://jira.atlassian.com/images/icons/issuetypes/task.svg',
        total: 5,
        issues: [
          {
            key: 'TEST-3',
            summary: 'New Project Request',
            status: 'To Do',
          },
        ],
      },
    ],
  }),
};

createDevApp()
  .registerPlugin(jiraPlugin)
  .addPage({
    element: (
      <TestApiProvider apis={[[jiraApiRef, mockJiraApi]]}>
        <EntityProvider entity={mockEntity}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <JiraOverviewCard />
            </Grid>

            {/* CustomInfoCard Examples */}
            <Grid item xs={12}>
              <Typography variant="h4" gutterBottom>
                CustomInfoCard Examples
              </Typography>
            </Grid>

            {/* Basic Card */}
            <Grid item xs={12} md={6}>
              <CustomInfoCard title="Basic Card">
                <Box p={2}>
                  <Typography>Basic card with only title and content.</Typography>
                </Box>
              </CustomInfoCard>
            </Grid>

            {/* Card with Subheader */}
            <Grid item xs={12} md={6}>
              <CustomInfoCard 
                title="Card with Subheader"
                subheader="This is a subheader"
              >
                <Box p={2}>
                  <Typography>Card content with a subheader above.</Typography>
                </Box>
              </CustomInfoCard>
            </Grid>

            {/* Card with Single Data Source */}
            <Grid item xs={12} md={6}>
              <CustomInfoCard 
                title="Single Data Source"
                dataSources={[
                  { source: 'https://example.com', name: 'Example' }
                ]}
              >
                <Box p={2}>
                  <Typography>Card with a single data source button.</Typography>
                </Box>
              </CustomInfoCard>
            </Grid>

            {/* Card with Multiple Data Sources */}
            <Grid item xs={12} md={6}>
              <CustomInfoCard 
                title="Multiple Data Sources"
                dataSources={[
                  { source: 'https://example1.com', name: 'Source 1' },
                  { source: 'https://example2.com', name: 'Source 2' },
                  { source: 'https://example3.com', name: 'Source 3' }
                ]}
              >
                <Box p={2}>
                  <Typography>Card showing multiple data sources with separator.</Typography>
                </Box>
              </CustomInfoCard>
            </Grid>

            {/* Card with Menu Actions */}
            <Grid item xs={12} md={6}>
              <CustomInfoCard 
                title="Menu Actions"
                menuActions={[
                  { label: 'Edit', onClick: () => console.log('Edit clicked') },
                  { label: 'Delete', onClick: () => console.log('Delete clicked') }
                ]}
              >
                <Box p={2}>
                  <Typography>Card with menu actions in top-right corner.</Typography>
                </Box>
              </CustomInfoCard>
            </Grid>

            {/* Full Featured Card */}
            <Grid item xs={12} md={6}>
              <CustomInfoCard 
                title="Full Featured Card"
                subheader="Complete example with all features"
                dataSources={[
                  { source: 'https://example1.com', name: 'Primary' },
                  { source: 'https://example2.com', name: 'Secondary' }
                ]}
                menuActions={[
                  { label: 'Edit', onClick: () => console.log('Edit clicked') },
                  { label: 'Share', onClick: () => console.log('Share clicked') },
                  { label: 'Delete', onClick: () => console.log('Delete clicked') }
                ]}
              >
                <Box p={2}>
                  <Typography variant="body1" gutterBottom>
                    This card demonstrates all available features:
                  </Typography>
                  <ul>
                    <li>Title and subheader</li>
                    <li>Multiple data sources with separator</li>
                    <li>Menu actions in dropdown</li>
                    <li>Custom content styling</li>
                  </ul>
                </Box>
              </CustomInfoCard>
            </Grid>
          </Grid>
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'Jira Overview',
    path: '/jira-overview',
  })
  .render();
