import { TestApiRegistry, renderInTestApp } from '@backstage/test-utils';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { JiraAPI, jiraApiRef } from '../../api';
import { JiraOverviewCard } from './JiraOverviewCard';
import { screen, fireEvent, waitFor } from '@testing-library/react';

const setupTest = () => {
  const discoveryApi = {
    getBaseUrl: () => Promise.resolve('http://exampleapi.com/jira/api'),
  };

  const mockProject = {
    project: {
      name: 'Test Project',
      iconUrl: 'http://example.com/icon.svg',
      type: 'software',
      url: 'http://example.com',
    },
    issues: [
      { name: 'Story', iconUrl: 'http://example.com/story.svg', total: 5 },
      { name: 'Epic', iconUrl: 'http://example.com/epic.svg', total: 3 },
      { name: 'Work Intake', iconUrl: 'http://example.com/task.svg', total: 0 },
    ],
  };

  const mockEntity = {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'mock-component',
      annotations: { 'jira/project-key': 'TEST' },
    },
  };

  const mockStatuses = ['To Do', 'In Progress', 'Done'];
  const apis = TestApiRegistry.from([[jiraApiRef, new JiraAPI({ discoveryApi })]]);
  
  const server = setupServer(
    rest.get('http://exampleapi.com/jira/api/project/TEST', (_, res, ctx) => 
      res(ctx.json(mockProject))),
    rest.get('http://exampleapi.com/jira/api/statuses/TEST', (_, res, ctx) => 
      res(ctx.json(mockStatuses)))
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  return {
    render: (props = {}) => renderInTestApp(
      <TestApiRegistry apis={apis}>
        <EntityProvider entity={mockEntity}>
          <JiraOverviewCard {...props} />
        </EntityProvider>
      </TestApiRegistry>
    ),
    server,
    mockEntity,
    mockProject,
    mockStatuses,
  };
};

describe('JiraCard', () => {
  const { server, render, mockEntity } = setupTest();

  it('displays project name', async () => {
    const { getByText } = await render();
    expect(getByText('Test Project')).toBeInTheDocument();
  });

  it('displays project type', async () => {
    const { getByText } = await render();
    expect(getByText('software')).toBeInTheDocument();
  });

  it('displays Story count', async () => {
    const { getByText } = await render();
    expect(getByText('5')).toBeInTheDocument();
  });

  it('filters zero count issues', async () => {
    const { queryByText } = await render();
    expect(queryByText('Work Intake')).not.toBeInTheDocument();
  });

  it('displays status filter', async () => {
    const { getByText } = await render();
    expect(getByText('Filter issue status')).toBeInTheDocument();
  });

  it('shows To Do status when filter opened', async () => {
    await render();
    fireEvent.mouseDown(screen.getByLabelText('Filter issue status'));
    await waitFor(() => expect(screen.getByText('To Do')).toBeInTheDocument());
  });

  it('shows error for missing project key', async () => {
    const entityWithoutKey = {
      ...mockEntity,
      metadata: { name: 'test', annotations: {} },
    };

    const { getByText } = await renderInTestApp(
      <TestApiRegistry apis={TestApiRegistry.from([[jiraApiRef, new JiraAPI({ discoveryApi: {} })]])}>
        <EntityProvider entity={entityWithoutKey}>
          <JiraOverviewCard />
        </EntityProvider>
      </TestApiRegistry>
    );

    expect(getByText(/Missing Jira project key annotation/)).toBeInTheDocument();
  });

  it('displays API error message', async () => {
    server.use(
      rest.get('http://exampleapi.com/jira/api/project/TEST', (_, res, ctx) =>
        res(ctx.status(500, 'Internal Server Error'))
      )
    );

    const { getByText } = await render();
    await waitFor(() => expect(getByText(/Internal Server Error/)).toBeInTheDocument());
  });

  it('hides filter when hideIssueFilter is true', async () => {
    const { queryByText } = await render({ hideIssueFilter: true });
    expect(queryByText('Filter issue status')).not.toBeInTheDocument();
  });
});