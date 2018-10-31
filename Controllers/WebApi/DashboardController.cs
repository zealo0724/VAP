using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Web.Helpers;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Results;
using System.Web.Mvc;
using AutoMapper;
using Microsoft.AspNet.Identity;
using PowerBIApp.Common.Security;
using PowerBIApp.Data;
using PowerBIApp.Model;
using PowerBIApp.Model.ViewModel;
using PowerBIApp.Web.Filters;
using SecurityActions = PowerBIApp.Common.Security.Actions;
using PowerBIApp.Web.Common;


namespace PowerBIApp.Web.Controllers.WebApi
{
    [System.Web.Mvc.Route("{tenant}/webapi/[controller]")]
    [ValidateModel]
    //[CustomAuthorize(Roles = Security.DATA_READER)]
    public class DashboardController : MultiTenantWebApiController
    {
        private IReportingRepository _reportingRepo;
        private IAdminRepository _adminRepo;
        private VeracityApiHelper _veracityApiHelper;

        protected override void Initialize(HttpControllerContext controllerContext)
        {
            base.Initialize(controllerContext);
            _reportingRepo = new ReportingRepository(PowerBiAppContext, Tenant);
            _adminRepo = new AdminRepository(PowerBiAppContext, Tenant);
            _veracityApiHelper = new VeracityApiHelper();
        }

        [System.Web.Http.HttpGet]
        //public IEnumerable<EntityTreeViewModel> Entities(int id = 0)
        public async Task<IHttpActionResult> Entities(int id = 0)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.DataReader, async () =>
            {
                var tree = _reportingRepo.GetEntityTree(id, UserId);
                var result = Mapper.Map<IEnumerable<EntityTreeViewModel>>(tree);
                return Json(result);
            });
        }

        [System.Web.Http.HttpGet]
        public async Task<IHttpActionResult> Entity(int id)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.DataReader, async () =>
            {
                var entity = _reportingRepo.GetEntity(id);
                if (entity.ReportSequence != null)
                {
                    var sequenceList = entity.ReportSequence.Split(',');
                    var sortedReport = new List<Report>();
                    foreach (var sequence in sequenceList)
                    {
                        var rep = entity.Reports.FirstOrDefault(x => x.Id.ToString().Equals(sequence));
                        if (rep != null)
                        {
                            sortedReport.Add(entity.Reports.FirstOrDefault(x => x.Id.ToString().Equals(sequence)));
                            entity.Reports.Remove(rep);
                        }
                    }

                    if (entity.Reports.Count > 0)
                    {
                        foreach (var rep in entity.Reports)
                        {
                            sortedReport.Add(rep);
                        }
                    }

                    entity.Reports = sortedReport;
                }

                entity = entity.AppUsers.Any(a => a.Id == UserId) ? entity : null;
                if (entity == null)
                    return Json(string.Empty);
                var result = Mapper.Map<EntityTreeViewModel>(entity);
                var entityTypeProperty = _reportingRepo.GetEntityProperties();
                foreach (var rp in result.Reports)
                {
                    var filterValue =
                        entityTypeProperty.FirstOrDefault(f => f.EntityTypePropertyId == rp.EntityTypePropertyId);
                    rp.EntityTypeProperty = filterValue == null ? "" : filterValue.Value;
                }

                return Json(result);
            });
        }

        //[HttpGet]
        //public async Task<PbiReportViewModel> GetPBIReportViewModel(int reportId, string powerBiFilter = null, string powerBiRole = null)
        //{
        //    var report = _reportingRepo.GetReport(reportId);
        //    if (string.IsNullOrEmpty(report?.PowerBiReportId))
        //    {
        //        return null;
        //    }

        //    //Better way to get MyDNVGLUserID?
        //    var myDNVGLUserId = ((ClaimsPrincipal)User).Identity.Name.Replace("UserName", "");
        //    string powerBiReportUsername = string.IsNullOrEmpty(powerBiFilter) ? myDNVGLUserId : powerBiRole;//powerBiFilter
        //    List<string> powerBiReportRoles = string.IsNullOrEmpty(powerBiFilter) ? new List<string>() { "MyDNVGLUser" } : new List<string>() { powerBiFilter };//powerBiRole

        //    var pbiReport = await _reportingRepo.GetPbiReportViewModel(report.PowerBiReportId, powerBiReportUsername, powerBiReportRoles);
        //    return pbiReport;
        //}

        //TODEV: add a overload function for filter key-value
        [System.Web.Http.HttpGet]
        public async Task<IHttpActionResult> GetPBIReportViewModel(int reportId, int entityTreeId = 0)
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.DataReader, async () =>
            {
                bool useRoles = false;

                var report = _reportingRepo.GetReport(reportId);
                var powerbiReport = _adminRepo.GetPowerBiReportById(report.PowerBiReportId);
                if (string.IsNullOrEmpty(report?.PowerBiReportId))
                {
                    return null;
                }

                string powerBiReportUsernameFilter = MyDnvGlUserId;
                string powerBiReportRoleFilter = string.Empty;

                if (!string.IsNullOrEmpty(report.EntityFilter))
                {
                    useRoles = true;
                    powerBiReportRoleFilter = report.EntityFilter;

                    if (entityTreeId > 0)
                    {
                        var entityTree = _adminRepo.GetEntity(entityTreeId);
                        if (entityTree.EntityId == 0)
                        {
                            return null;
                        }

                        var entityProperty = _adminRepo
                            .GetEntityProperties()
                            .FirstOrDefault(
                                a => a.EntityId == entityTree.EntityId &&
                                     a.EntityTypePropertyId == report.EntityTypePropertyId);
                        if (entityProperty != null)
                        {
                            powerBiReportUsernameFilter = entityProperty.Value;
                        }
                    }
                }

                List<string> powerBiReportRoles = useRoles ? new List<string>() { powerBiReportRoleFilter } : null;

                var pbiReport = await _reportingRepo.GetPbiReportViewModel(report.PowerBiReportId,
                    powerBiReportUsernameFilter, powerBiReportRoles, report.IsPremiumReport);
                pbiReport.IsEffectiveIdentityRolesRequired = powerbiReport.IsEffectiveIdentityRolesRequired;
                pbiReport.IsEffectiveIdentityRequired = powerbiReport.IsEffectiveIdentityRequired;
                pbiReport.IsPagesHidden = powerbiReport.IsPagesHidden;
                return Json(pbiReport);
            });
        }

        [System.Web.Http.HttpGet]
        public async Task<IHttpActionResult> MyInfo()
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.AllowAll, async () =>
            {
                var messageCount = await GetMessageCount();
                var services = await _veracityApiHelper.GetServicesModel();

                var result = new
                {
                    Name = Name(),
                    TenantName = Tenant?.Name ?? "unknown",
                    Roles = UserRoles(),
                    MyGNVDLUserId = MyDnvGlUserId,
                    HeadIcon = Tenant?.HeadIcon ?? null,
                    MessageCount = messageCount,
                    Services = services
                };
                return Json(result);
            });
        }

        [System.Web.Http.HttpGet]
        public async Task<IHttpActionResult> ExpireAllCookies()
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.AllowAll, async () =>
            {
                if (HttpContext.Current != null)
                {
                    int cookieCount = HttpContext.Current.Request.Cookies.Count;
                    for (var i = 0; i < cookieCount; i++)
                    {
                        var cookie = HttpContext.Current.Request.Cookies[i];
                        if (cookie != null)
                        {
                            var cookieName = cookie.Name;
                            var expiredCookie = new HttpCookie(cookieName) { Expires = DateTime.Now.AddDays(-1) };
                            HttpContext.Current.Response.Cookies.Add(expiredCookie); // overwrite it
                        }
                    }

                    // clear cookies server side
                    HttpContext.Current.Request.Cookies.Clear();
                }

                return Ok();
            });
        }

        [System.Web.Http.HttpGet]
        public async Task<IHttpActionResult> ValidUserCookie()
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.AllowAll, async () =>
            {
                var validDnvGlUser = _reportingRepo.TenantDnvGlUserMatch(MyDnvGlUserId, Tenant.Id);

                return Json(new { validUser = validDnvGlUser });
            });
        }


        private List<string> UserRoles()
        {
            List<string> roles = _reportingRepo.UserRoles(UserId, Tenant.Id)?.ToList() ?? new List<string>();

            //Hack: To allow batch adding users for USER_ADMIN and SystemAdmin for current tenant
            if (roles.Intersect(SecurityActions.ManageUsers).Any())
            {
                roles.Add("canBatchAddUsers");
                return roles;
            }

            //Hack: To allow batch adding users for SuperTenantAdmin
            var adminTenantId = _adminRepo.GetAdminTenantId();
            if (adminTenantId <= 0) return roles;
            if (_adminRepo.IsSuperTenantAdmin(MyDnvGlUserId, adminTenantId) == true)
            {
                roles.Add("canBatchAddUsers");
            }

            return roles;
        }

        private string Name()
        {
            var name = string.Empty;
            var givenName = ((ClaimsPrincipal)User).Claims.SingleOrDefault(c => c.Type.Contains("givenname"));
            var surName = ((ClaimsPrincipal)User).Claims.SingleOrDefault(c => c.Type.Contains("surname"));
            if (givenName != null && surName != null)
            {
                name = givenName.Value + " " + surName.Value;
            }
            else if (givenName != null)
            {
                name = givenName.Value;
            }
            else if (surName != null)
            {
                name = surName.Value;
            }
            else if (!((ClaimsPrincipal)User).Claims.Any())
            {
                name = "Not authenticated";
            }
            return name;
        }

        private async Task<int> GetMessageCount()
        {
            try
            {
                var response = await _veracityApiHelper.GetMessageCountAsync();
                if (!response.IsSuccessCode)
                {
                    return 0;
                    //throw new Exception(response.ErrorMessage.Aggregate((a, b) => a + ", " + b));
                }

                var count = int.Parse(response.HttpResponseString);
                return count;
            }
            catch
            {
                return 0;
            }
        }

        [System.Web.Http.HttpGet]
        public async Task<IHttpActionResult> GetTooltips()
        {
            return await HttpActionResultWithErrorHandling(SecurityActions.AllowAll, async () =>
            {
                var tooltips = _adminRepo.GetTooltips();
                return Json(tooltips);
            });
        }
    }
}

