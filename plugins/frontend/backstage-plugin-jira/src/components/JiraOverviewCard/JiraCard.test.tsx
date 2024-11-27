import React from 'react';
import { TestApiRegistry, renderInTestApp } from '@backstage/test-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import {jiraApiRef } from '../../api';
import { JiraOverviewCard } from './JiraOverviewCard';
import { screen } from '@testing-library/react';
import { ApiProvider } from '@backstage/core-app-api';

const setupTest = (options: { shouldError?: boolean; noProjectKey?: boolean } = {}) => {
  const mockData = {
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
    statuses: ['To Do', 'In Progress', 'Done'],
  };

  const mockJiraClient = {
    getProjectDetails: jest.fn().mockImplementation(() => {
      if (options.shouldError) {
        return Promise.reject(new Error('Internal Server Error'));
      }
      return Promise.resolve({
        project: mockData.project,
        issues: mockData.issues,
        tickets: [],
        ticketIds: [],
      });
    }),
    getStatuses: jest.fn().mockResolvedValue(mockData.statuses),
  };

  const apis = TestApiRegistry.from([
    jiraApiRef,
    mockJiraClient,
  ]);

  const mockEntity = {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'mock-component',
      annotations: { 
        'jira/project-key': options.noProjectKey ? undefined : 'TEST'
      },
    },
  };

  return {
    render: (props = {}) => renderInTestApp(
      <ApiProvider apis={apis}>
        <EntityProvider entity={mockEntity}>
          <JiraOverviewCard {...props} />
        </EntityProvider>
      </ApiProvider>
    ),
    mockEntity,
    mockData,
    mockJiraClient,
    apis,
  };
};

describe('JiraOverviewCard', () => {
  describe('successful scenarios', () => {
    const { render } = setupTest();

    it('displays project name', async () => {
      await render();
      expect(await screen.findByText(/Test Project/)).toBeInTheDocument();
    });

    it('displays project type', async () => {
      await render();
      expect(await screen.findByText(/software/)).toBeInTheDocument();
    });

    it('displays Story count', async () => {
      await render();
      expect(await screen.findByText('5')).toBeInTheDocument();
    });

    it('filters zero count issues', async () => {
      await render();
      expect(screen.queryByText('Work Intake')).not.toBeInTheDocument();
    });

    it('displays status filter', async () => {
      await render();
      expect(await screen.findByText('Filter issue status')).toBeInTheDocument();
    });

    it('hides filter when hideIssueFilter is true', async () => {
      await render({ hideIssueFilter: true });
      expect(screen.queryByText('Filter issue status')).not.toBeInTheDocument();
    });
  });

  describe('error scenarios', () => {
    it('shows error for missing project key', async () => {
      const { render } = setupTest({ noProjectKey: true });
      await render();
      expect(await screen.findByText(/Missing Jira project key annotation/)).toBeInTheDocument();
    });

    it('displays API error message', async () => {
      const { render } = setupTest({ shouldError: true });
      await render();
      expect(await screen.findByText(/Internal Server Error/)).toBeInTheDocument();
    });

    it('handles API errors gracefully', async () => {
      const { render, mockJiraClient } = setupTest();
      
      mockJiraClient.getProjectDetails.mockRejectedValueOnce(
        new Error('Failed to fetch project details')
      );
      
      await render();
      expect(await screen.findByText(/Failed to fetch project details/)).toBeInTheDocument();
    });
  });
});