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

export {
  /**
   * @deprecated since v0.3.0 you should use new name 'jiraPlugin'
   */
  jiraPlugin as plugin,
  jiraPlugin,
  EntityJiraOverviewCard,
  HomePageMyJiraTicketsCard,
  EntityJiraQueryCard,
} from './plugin';
export {
  /**
   * @deprecated since v0.3.0 you should use new composability API
   */
  JiraOverviewCard,
} from './components/JiraOverviewCard';
export * from './components/JiraQueryCard';
export * from './components/IssuesTable';
export {
  /**
   * @deprecated since v0.3.0 you should use new name 'isJiraAvailable'
   */
  isJiraAvailable as isPluginApplicableToEntity,
  isJiraAvailable,
  hasJiraQuery,
} from './components/Router';

export * from './api';
