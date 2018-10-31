using System.Linq;
using System.Threading.Tasks;
using PowerBIApp.Data;
using PowerBIApp.Model;
using System.Web.Http;
using System.Web.Http.Controllers;
using PowerBIApp.Web.Filters;
using SecurityActions = PowerBIApp.Common.Security.Actions;

namespace PowerBIApp.Web.Controllers.WebApi.Admin
{
    [System.Web.Mvc.Route("{tenant}/webapi/admin/[controller]")]
    [ValidateModel]
    //[Authorize(Roles =
    //    Roles.SYSTEM_ADMIN + "," + Roles.SUPER_TENANT_ADMIN + "," + Roles.DATA_ADMIN + "," + Roles.REPORT_ADMIN)]
    public class ConfigAdminController : MultiTenantWebApiController
    {
        private IAdminRepository _adminRepo;

        protected override void Initialize(HttpControllerContext controllerContext)
        {
            base.Initialize(controllerContext);
            _adminRepo = new AdminRepository(PowerBiAppContext, Tenant);
        }

        [System.Web.Http.HttpPost]
        public async Task<IHttpActionResult> AddEntityType([FromUri] string name)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ConfigureEntityStuff, async () =>
            {
                _adminRepo.AddEntityType(name, Tenant.Id);
                return Ok();
            });
        }

        [System.Web.Http.HttpPost]
        public async Task<IHttpActionResult> AddEntityTypeProperty([FromBody] Model.EntityTypeProperty entity)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ConfigureEntityStuff, async () =>
            {
                _adminRepo.AddEntityTypeProperty(entity);
                return Ok();
            });
        }

        [System.Web.Http.HttpPost]
        public async Task<IHttpActionResult> UpdateEntityTypeProperty([FromBody] Model.EntityTypeProperty entity)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ConfigureEntityStuff, async () =>
            {
                _adminRepo.UpdateEntityTypeProperty(entity);
                return Ok();
            });
        }

        [System.Web.Http.HttpPost]
        public async Task<IHttpActionResult> DeleteEntityTypeProperty([FromBody] Model.EntityTypeProperty entity)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ConfigureEntityStuff, async () =>
            {
                _adminRepo.DeleteEntityTypeProperty(entity);
                return Ok();
            });
        }

        [System.Web.Http.HttpGet]
        public async Task<IHttpActionResult> GetEntityTypeProperties()
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ManageReports, async () =>
            {
                var entityProperties = _adminRepo.GetEntityTypeProperties();
                var PropertyType = _adminRepo.PropertyTypes();
                foreach (var p in entityProperties)
                {
                    p.PropertyType = PropertyType.FirstOrDefault(t => t.Id == p.PropertyTypeId);
                }

                return Json(entityProperties);
            });
        }

        [System.Web.Http.HttpPost]
        public async Task<IHttpActionResult> UpdateTooltip([FromBody] Tooltip entity)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ConfigureToolTip, async () =>
            {
                _adminRepo.UpdateTooltip(entity);
                return Ok();
            });
        }

        [System.Web.Http.HttpGet]
        public async Task<IHttpActionResult> GetBusinessAreas()
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ConfigureEntityStuff, async () =>
            {
                var areas = _adminRepo.GetBusinessAreas();
                return Json(areas);
            });
        }

        [System.Web.Http.HttpPost]
        public async Task<IHttpActionResult> AddBusinessArea([FromBody] BusinessArea ba)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.SuperTenantAdmin, async () =>
            {
                _adminRepo.AddBusinessAreas(ba);
                return Ok();
            });
        }

        [System.Web.Http.HttpPost]
        public async Task<IHttpActionResult> UpdateBusinessArea([FromBody] BusinessArea ba)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.SuperTenantAdmin, async () =>
            {
                _adminRepo.UpdateBusinessArea(ba);
                return Ok();
            });
        }

        [System.Web.Http.HttpPost]
        public async Task<IHttpActionResult> DeleteBusinessArea([FromBody] BusinessArea ba)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.SuperTenantAdmin, async () =>
            {
                _adminRepo.DeleteBusinessArea(ba);
                return Ok();
            });
        }

        [System.Web.Http.HttpPost]
        public async Task<IHttpActionResult> UpdateFooterInfo([FromBody] FooterConfig footer)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.ConfigureEntityStuff, async () =>
            {
                var returnedFooter = _adminRepo.UpdateFooterInfo(footer);
                return Json(returnedFooter);
            });
        }

        [System.Web.Http.HttpGet]
        public async Task<IHttpActionResult> GetFooter()
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.AllowAll, async () =>
            {
                var footer = _adminRepo.GetFooter();
                return Json(footer);
            });
        }

        [System.Web.Http.HttpGet]
        public async Task<IHttpActionResult> GetPageFooter()
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.AllowAll, async () =>
            {
                var privateFooter = _adminRepo.GetFooter().First();
                var defaultFooter = _adminRepo.GetDefaultFooter();
                if (privateFooter == null)
                {
                    return Json(defaultFooter);
                }
                else
                {
                    var footer = new FooterConfig();
                    footer.ContactEmail = string.IsNullOrEmpty(privateFooter.ContactEmail)
                        ? defaultFooter.ContactEmail
                        : privateFooter.ContactEmail;
                    footer.CopyRight = string.IsNullOrEmpty(privateFooter.CopyRight)
                        ? defaultFooter.CopyRight
                        : privateFooter.CopyRight;
                    footer.FootHeader = string.IsNullOrEmpty(privateFooter.FootHeader)
                        ? defaultFooter.FootHeader
                        : privateFooter.FootHeader;
                    footer.TenantInfo = string.IsNullOrEmpty(privateFooter.TenantInfo)
                        ? defaultFooter.TenantInfo
                        : privateFooter.TenantInfo;
                    footer.TenantInfoURL = string.IsNullOrEmpty(privateFooter.TenantInfoURL)
                        ? defaultFooter.TenantInfoURL
                        : privateFooter.TenantInfoURL;
                    return Json(footer);
                }
            });
        }
    }
}