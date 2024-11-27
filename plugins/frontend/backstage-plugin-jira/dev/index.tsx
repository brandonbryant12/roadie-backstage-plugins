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
import { Grid } from '@material-ui/core';

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
          </Grid>
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'Jira Overview',
    path: '/jira-overview',
  })
  .render();
