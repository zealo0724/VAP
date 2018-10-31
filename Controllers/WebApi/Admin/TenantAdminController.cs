using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Controllers;
//using System.Web.Mvc;
using AutoMapper;
//using Microsoft.AspNetCore.Http;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.Extensions.Logging;
using PowerBIApp.Data;
using PowerBIApp.Model;
using PowerBIApp.Model.ViewModel;
using PowerBIApp.Web.Common;
using PowerBIApp.Web.Filters;
using Security = PowerBIApp.Common.Security.Roles;
using SecurityActions = PowerBIApp.Common.Security.Actions;

namespace PowerBIApp.Web.Controllers.WebApi
{
    [System.Web.Mvc.Route("{tenant}/webapi/admin/[controller]")]
    [ValidateModel]
    //[CustomAuthorize(Roles = Security.SUPER_TENANT_ADMIN + "," + Security.SYSTEM_ADMIN)]
    public class TenantAdminController : MultiTenantWebApiController
    {
        //private ILogger<EntityAdminController> _logger;
        private IAdminRepository _adminRepo;

        private IVeracityApiHelperRepository _apiRepo;

        //private MyDnvGlApi _dnvGlApi;
        private static readonly bool AllowMove = bool.Parse(ConfigurationManager.AppSettings["powerbiV2:AllowMovingWorkspaces"]);
        private readonly string _adminClientId = ConfigurationManager.AppSettings["Admin:ClientId"];

        protected override void Initialize(HttpControllerContext controllerContext)
        {
            base.Initialize(controllerContext);
            _adminRepo = new AdminRepository(PowerBiAppContext, Tenant);
            _apiRepo = new VeracityApiHelper();
            //var claimsPrincipal = ((ClaimsPrincipal) User);
            //_dnvGlApi = new MyDnvGlApi(claimsPrincipal, Tenant);
        }

        //TODO: Remove after PremiumUpgrade
        [HttpPost]
        public async Task<IHttpActionResult> EnsurePremiumWorkspaces()
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.SuperTenantAdmin, async () =>
            {
                if (_needPremiumCheck)
                {
                    await _adminRepo.EnsurePremiumWorkspaces(AllowMove);
                    _needPremiumCheck = false;
                }

                return Ok();
            });
        }

        //TODO: Remove after PremiumUpgrade
        private static bool _needPremiumCheck =
            bool.Parse(ConfigurationManager.AppSettings["powerbiV2:NeedPremiumCheck"]);

        [HttpGet]
        public async Task<IHttpActionResult> Tenants(bool current = false)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ManageEntities, async () =>
            {
                //TODO: Remove after PremiumUpgrade
                if (_needPremiumCheck)
                {
                    await _adminRepo.EnsurePremiumWorkspaces(AllowMove);
                    _needPremiumCheck = false;
                }

                var serviceUrl = ConfigurationManager.AppSettings["ServiceUrl"];

                var data = current ? _adminRepo.GetTenants(Tenant.Id) : _adminRepo.GetTenants(0);
                var tenantsViewModel = Mapper.Map<IEnumerable<TenantViewModel>>(data).ToList().OrderBy(t => t.Name);
                await CheckVeracityAdminStatus(tenantsViewModel);
                var tenantsWithServiceUrlInfo = new {ServiceUrl = serviceUrl, Tenants = tenantsViewModel};
                return Json(tenantsWithServiceUrlInfo);
            });
        }
        
        private async Task CheckVeracityAdminStatus(IEnumerable<TenantViewModel> tenantsViewModel)
        {
            foreach (var viewModel in tenantsViewModel)
            {
                var serviceId = viewModel.MyDNVGLServiceId;
                if (serviceId?.Length != 36) continue;

                string cacheName = $"CachedIsServiceAdmin{serviceId}{_adminClientId}";
                const int cacheTimeOutSeconds = 60;
                var isAdmin = await new TCache<Task<bool>>().Get(cacheName, cacheTimeOutSeconds,
                    async () => await _apiRepo.IsServiceAdmin(serviceId, _adminClientId));
                viewModel.IsAdminOk = isAdmin;
            }
        }

        [HttpPut]
        public async Task<IHttpActionResult> UpdateTenant([FromBody] TenantViewModel tenantViewModel)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ConfigureEntityStuff, async () =>
            {
                var updatedTenant = _adminRepo.UpdateTenant(tenantViewModel);
                //var updatedViewModel = Mapper.Map<EntityTreeViewModel>(updatedEntity);
                return Json(updatedTenant);
            });
        }

        [HttpGet]
        public async Task<IHttpActionResult> TenantAdmins([FromUri] int id)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.SuperTenantAdmin, async () =>
            {
                var data = _adminRepo.TenantAdmins(id);
                var result = Mapper.Map<IEnumerable<UserViewModel>>(data);
                return Json(result);
            });
        }

        [HttpPost]
        public async Task<IHttpActionResult> AddTenantAdmin([FromBody] UserViewModel userModel,
            [FromUri] string serviceId, [FromUri] int tenantId, [FromUri] string domainName)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.SuperTenantAdmin, async () =>
            {
                userModel.Roles.Add(Security.SYSTEM_ADMIN);
                var resultBase = await _apiRepo.GrantUsersOnTenantAsync(HttpMethod.Put,
                    ConfigurationManager.AppSettings["ServiceId"], userModel.MyDnvglUserId, false);
                if (!resultBase.IsSuccessCode)
                {
                    return Json(new {Success = false, Message = string.Join(",", resultBase.ErrorMessage)});
                }

                var resultTenant =
                    await _apiRepo.GrantUsersOnTenantAsync(HttpMethod.Put, serviceId, userModel.MyDnvglUserId, true);
                if (!resultTenant.IsSuccessCode)
                {
                    return Json(new {Success = false, Message = string.Join(",", resultTenant.ErrorMessage)});
                }

                await _adminRepo.AddUser(userModel, tenantId, domainName);

                return Json(new {Success = true, Message = ""});
            });
        }

        [HttpPost]
        public async Task<IHttpActionResult> AddTenant([FromBody] TenantViewModel tenant)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.SuperTenantAdmin, async () =>
            {
                await _adminRepo.AddTenant(tenant);
                return Ok();
            });
        }

        [HttpGet]
        public async Task<IHttpActionResult> PreLocations(int tenantId)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.SuperTenantAdmin, async () =>
            {
                if (tenantId == 0)
                    return BadRequest();
                var preLocations = _adminRepo.GetPreLocations(tenantId);
                return Json(preLocations);
            });
        }

        [HttpPost]
        public async Task<IHttpActionResult> AddPreLocation([FromBody] ReportLocation location)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.SuperTenantAdmin, async () =>
            {
                var preLocations = _adminRepo.AddLocation(location);
                return Json(preLocations);
            });
        }

        [HttpPost]
        public async Task<IHttpActionResult> EditPreLocation([FromBody] ReportLocation location)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.SuperTenantAdmin, async () =>
            {
                var preLocations = _adminRepo.EditLocation(location);
                return Json(preLocations);
            });
        }

        [HttpPost]
        public async Task<IHttpActionResult> DeletePreLocation([FromBody] ReportLocation location)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.SuperTenantAdmin, async () =>
            {
                var preLocations = await _adminRepo.DeleteLocation(location);
                return Json(preLocations);
            });
        }

    }
}
