import React from 'react';
import { UrlPatternDiscovery } from '@backstage/core-app-api';
import { AnyApiRef } from '@backstage/core-plugin-api';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { rest } from 'msw';
import {
  MockFetchApi,
  renderInTestApp,
  setupRequestMockHandlers,
  TestApiProvider,
} from '@backstage/test-utils';
import { setupServer } from 'msw/node';
import { JiraAPI, jiraApiRef } from '../../api';
import { JiraOverviewCard } from './JiraOverviewCard';
import { ConfigReader } from '@backstage/config';
import { fireEvent, screen, waitFor } from '@testing-library/react';

const discoveryApi = UrlPatternDiscovery.compile('http://exampleapi.com');
const fetchApi = new MockFetchApi();
const configApi = new ConfigReader({});

const mockEntity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'mock-component',
    annotations: {
      'jira/project-key': 'TEST',
    },
  },
};

const mockProjectResponse = {
  project: {
    name: 'Test Project',
    iconUrl: 'http://example.com/icon.svg',
    type: 'software',
    url: 'http://example.com',
  },
  issues: [
    {
      name: 'Story',
      iconUrl: 'http://example.com/story.svg',
      total: 5,
    },
    {
      name: 'Epic',
      iconUrl: 'http://example.com/epic.svg',
      total: 3,
    },
    {
      name: 'Work Intake',
      iconUrl: 'http://example.com/task.svg',
      total: 0,
    },
  ],
};

const mockStatuses = ['To Do', 'In Progress', 'Done'];

const apis: [AnyApiRef, Partial<unknown>][] = [
  [jiraApiRef, new JiraAPI({ discoveryApi, configApi, fetchApi })],
];

describe('JiraCard', () => {
  const worker = setupServer();
  setupRequestMockHandlers(worker);

  beforeEach(() => {
    worker.resetHandlers();
    worker.use(
      rest.get('http://exampleapi.com/jira/api/project/TEST', (_, res, ctx) =>
        res(ctx.json(mockProjectResponse)),
      ),
      rest.get('http://exampleapi.com/jira/api/statuses/TEST', (_, res, ctx) =>
        res(ctx.json(mockStatuses)),
      ),
    );
  });

  it('should display project name', async () => {
    const { getByText } = await renderInTestApp(
      <TestApiProvider apis={apis}>
        <EntityProvider entity={mockEntity}>
          <JiraOverviewCard />
        </EntityProvider>
      </TestApiProvider>,
    );
    expect(getByText('Test Project')).toBeInTheDocument();
  });

  it('should display project type', async () => {
    const { getByText } = await renderInTestApp(
      <TestApiProvider apis={apis}>
        <EntityProvider entity={mockEntity}>
          <JiraOverviewCard />
        </EntityProvider>
      </TestApiProvider>,
    );
    expect(getByText('software')).toBeInTheDocument();
  });

  it('should display Story count', async () => {
    const { getByText } = await renderInTestApp(
      <TestApiProvider apis={apis}>
        <EntityProvider entity={mockEntity}>
          <JiraOverviewCard />
        </EntityProvider>
      </TestApiProvider>,
    );
    expect(getByText('5')).toBeInTheDocument();
  });

  it('should filter out zero count issues', async () => {
    const { queryByText } = await renderInTestApp(
      <TestApiProvider apis={apis}>
        <EntityProvider entity={mockEntity}>
          <JiraOverviewCard />
        </EntityProvider>
      </TestApiProvider>,
    );
    expect(queryByText('Work Intake')).not.toBeInTheDocument();
  });

  it('should display status filter', async () => {
    const { getByText } = await renderInTestApp(
      <TestApiProvider apis={apis}>
        <EntityProvider entity={mockEntity}>
          <JiraOverviewCard />
        </EntityProvider>
      </TestApiProvider>,
    );
    expect(getByText('Filter issue status')).toBeInTheDocument();
  });

  it('should show To Do status option when filter opened', async () => {
    await renderInTestApp(
      <TestApiProvider apis={apis}>
        <EntityProvider entity={mockEntity}>
          <JiraOverviewCard />
        </EntityProvider>
      </TestApiProvider>,
    );

    fireEvent.mouseDown(screen.getByLabelText('Filter issue status'));
    
    await waitFor(() => {
      expect(screen.getByText('To Do')).toBeInTheDocument();
    });
  });

  it('should display error for missing project key', async () => {
    const entityWithoutKey = {
      ...mockEntity,
      metadata: { name: 'test', annotations: {} },
    };

    const { getByText } = await renderInTestApp(
      <TestApiProvider apis={apis}>
        <EntityProvider entity={entityWithoutKey}>
          <JiraOverviewCard />
        </EntityProvider>
      </TestApiProvider>,
    );

    expect(getByText(/Missing Jira project key annotation/)).toBeInTheDocument();
  });

  it('should display API error message', async () => {
    worker.use(
      rest.get('http://exampleapi.com/jira/api/project/TEST', (_, res, ctx) =>
        res(ctx.status(500, 'Internal Server Error')),
      ),
    );

    const { getByText } = await renderInTestApp(
      <TestApiProvider apis={apis}>
        <EntityProvider entity={mockEntity}>
          <JiraOverviewCard />
        </EntityProvider>
      </TestApiProvider>,
    );

    await waitFor(() => {
      expect(getByText(/Internal Server Error/)).toBeInTheDocument();
    });
  });

  it('should hide filter when hideIssueFilter is true', async () => {
    const { queryByText } = await renderInTestApp(
      <TestApiProvider apis={apis}>
        <EntityProvider entity={mockEntity}>
          <JiraOverviewCard hideIssueFilter />
        </EntityProvider>
      </TestApiProvider>,
    );

    expect(queryByText('Filter issue status')).not.toBeInTheDocument();
  });
});
