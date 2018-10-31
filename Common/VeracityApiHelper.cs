//using Microsoft.Identity.Client;

using PowerBIApp.Services.MyDnvglService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Configuration;
using System.Net;
using System.IO;
using System.Text;
using System.Runtime.Serialization.Json;
using PowerBIApp.Web.Models.V3APIS;
using static System.String;

namespace PowerBIApp.Web.Common
{
    public class VeracityApiHelper : IVeracityApiHelperRepository
    {
        private static readonly string MyApiV3Url = ConfigurationManager.AppSettings["api:myApiV3Url"];
        private static readonly string VeracityAdminAuthority = ConfigurationManager.AppSettings["Admin:Authority"];
        private static readonly string VeracityAdminClientId = ConfigurationManager.AppSettings["Admin:ClientId"];
        private static readonly string VeracityAdminClientSecret = ConfigurationManager.AppSettings["Admin:ClientSecret"];
        private static readonly string VeracityAdminResourceUri = ConfigurationManager.AppSettings["Admin:ResourceUri"];

        readonly TokenProvider _tokenProvicer = new TokenProvider();

        public async Task<string> GetTenantAdminAccessToken()
        {
            var authenticationResult =
                await
                    TokenHelper.GetS2SAccessTokenAsync(VeracityAdminAuthority, VeracityAdminClientId,
                        VeracityAdminClientSecret, VeracityAdminResourceUri);
            return authenticationResult.AccessToken;
        }

        private async Task<ApiRequestResult> VeracityUserApiTaskAsync(HttpMethod httpMethod, string urlFragment,
            string accessToken = null)
        {
            var bearerToken = accessToken ?? _tokenProvicer.GetUserAccessToken();
            return await VeracityApiCommonTaskAsync(httpMethod, urlFragment, bearerToken);
        }

        private async Task<ApiRequestResult> VeracityApiTaskAsync(HttpMethod httpMethod, string urlFragment)
        {
            var bearerToken = await GetTenantAdminAccessToken();
            return await VeracityApiCommonTaskAsync(httpMethod, urlFragment, bearerToken);
        }

        private async Task<ApiRequestResult> VeracityApiCommonTaskAsync(HttpMethod httpMethod, string urlFragment, string bearerToken)
        {
            var request = new HttpRequestMessage
            {
                RequestUri = new Uri(MyApiV3Url + urlFragment),
                Method = httpMethod
            };
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", bearerToken);
            var httpClient = new HttpClient();
            var httpResponseMessage = await httpClient.SendAsync(request);

            var result = new ApiRequestResult
            {
                HttpStatusCode = httpResponseMessage.StatusCode,
                IsSuccessCode = httpResponseMessage.IsSuccessStatusCode,
                HttpResponseString = await httpResponseMessage.Content.ReadAsStringAsync()
            };

            if (result.HttpStatusCode == HttpStatusCode.Forbidden)
            {
                result.ErrorMessage = new List<string>{ result.HttpResponseString };
            }
            return result;
        }

        public async Task<ApiRequestResult> GetMessageCountAsync()
        {
            var urlFragment = "my/messages/count";
            var response = await VeracityUserApiTaskAsync(HttpMethod.Get, urlFragment);
            return response;
        }

        public async Task<ApiRequestResult> GetServicesAsync()
        {
            var urlFragment = "my/services";
            var response = await VeracityUserApiTaskAsync(HttpMethod.Get, urlFragment);
            return response;
        }

        public async Task<ApiRequestResult> GetPolicyAsync(string accessToken, string serviceId)
        {
            var urlFragment = $"my/policies/{serviceId}/validate()";
            var response = await VeracityUserApiTaskAsync(HttpMethod.Get, urlFragment, accessToken);
            return response;
        }
        public async Task<ApiRequestResult> GetUserAsync(string email)
        {
            //var adminToken = await GetTenantAdminAccessToken();
            var urlFragment = $"this/user/resolve({email})";
            var response = await VeracityApiTaskAsync(HttpMethod.Get, urlFragment);
            return response;
        }

        public async Task<bool> IsServiceAdmin(string serviceId, string userId)
        {
            var urlFragment = $"directory/services/{serviceId}/administrators/{userId}";
            var response = await VeracityApiTaskAsync(HttpMethod.Get, urlFragment);
            return response.IsSuccessCode && response.HttpResponseString == "true";
        }

        public async Task<ApiRequestResult> GrantUsersOnTenantAsync(HttpMethod method, string serviceId, string userId, bool retryWithCacheReset = false)
        {
            var urlFragment = $"this/services/{serviceId}/subscribers/{userId}";
            var response = await VeracityApiTaskAsync(method, urlFragment);
            if (response.IsSuccessCode || !retryWithCacheReset)
            {
                return response;
            }
           
            await ResetVeracityCache(serviceId);
            response = await VeracityApiTaskAsync(method, urlFragment);
            return response;
        }

        private async Task ResetVeracityCache(string serviceId)
        {
            var urlFragment = $"cache/invalidate/{serviceId}";
            await VeracityApiTaskAsync(HttpMethod.Get, urlFragment);
        }

        public async Task<Policy> GetPolicyModel(string accessToken, string serviceId)
        {
            var apiRequestResult = await GetPolicyAsync(accessToken, serviceId);
            string json = apiRequestResult.HttpResponseString;
            if (IsNullOrEmpty(json))
            {
                 return new Policy
                 {
                     statusCode = apiRequestResult.HttpStatusCode
                 };
            }
            var ms = new MemoryStream(Encoding.Unicode.GetBytes(json));
            DataContractJsonSerializer deseralizer = new DataContractJsonSerializer(typeof(Policy));
            var policy = (Policy)deseralizer.ReadObject(ms);

            policy.statusCode = apiRequestResult.HttpStatusCode;
            return policy;
        }

        public async Task<List<Service>> GetServicesModel()
        {
            try
            {
                var apiRequestResult = await GetServicesAsync();
                string json = apiRequestResult?.HttpResponseString;
                if (IsNullOrEmpty(json))
                {
                    return new List<Service>() { new Service() { id = "Error", description = "No services", name = "No services" } };
                }

                var ms = new MemoryStream(Encoding.Unicode.GetBytes(json));
                DataContractJsonSerializer deseralizer = new DataContractJsonSerializer(typeof(List<Service>));
                var services = (List<Service>) deseralizer.ReadObject(ms);

                return services.OrderBy(s => s.name).ToList();
            }
            catch
            {
                return new List<Service>() {new Service() {id = "Error", description = "Error loading services", name = "Error loading services"}};
            }
        }

        public async Task<List<ApiUserByEmail>> GetUserModel(string email)
        {
            var apiRequestResult = await GetUserAsync(email);
            string json = apiRequestResult.HttpResponseString;
            if (IsNullOrEmpty(json))
            {
                return null;
            }
            var ms = new MemoryStream(Encoding.Unicode.GetBytes(json));
            DataContractJsonSerializer deseralizer = new DataContractJsonSerializer(typeof(List<ApiUserByEmail>));
            var user = (List<ApiUserByEmail>)deseralizer.ReadObject(ms);
            return user;
        }
    }
}