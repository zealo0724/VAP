using PowerBIApp.Web.Models.V3APIS;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace PowerBIApp.Web.Common
{
    public interface IVeracityApiHelperRepository
    {
        Task<string> GetTenantAdminAccessToken();
        Task<ApiRequestResult> GetMessageCountAsync();
        Task<ApiRequestResult> GetServicesAsync();
        Task<ApiRequestResult> GetPolicyAsync(string accessToken, string serviceId);
        Task<ApiRequestResult> GetUserAsync(string userId);
        Task<Policy> GetPolicyModel(string accessToken, string serviceId);
        Task<List<Service>> GetServicesModel();
        Task<List<ApiUserByEmail>> GetUserModel(string userId);
        Task<ApiRequestResult> GrantUsersOnTenantAsync(HttpMethod method, string serviceId, string userId, bool retryWithCacheReset);
        Task<bool> IsServiceAdmin(string serviceId, string userId);

    }
}