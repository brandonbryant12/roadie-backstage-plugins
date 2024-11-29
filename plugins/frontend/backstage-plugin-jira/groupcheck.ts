import { identityApiRef, useApi } from '@backstage/core-plugin-api';

export const useGroupMembership = () => {
  const identityApi = useApi(identityApiRef);
  
  const checkGroupMembership = async (groupName: string) => {
    const { groups = [] } = await identityApi.getProfileInfo();
    return groups.includes(groupName);
  };
  
  return { checkGroupMembership };
};